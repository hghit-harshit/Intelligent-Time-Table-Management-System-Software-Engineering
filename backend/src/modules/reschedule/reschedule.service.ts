import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import type {
  RequestStatus,
  RescheduleQuery,
  RescheduleRequestInput,
} from "./reschedule.types.js";
import { rescheduleRepository } from "./reschedule.repository.js";
import { TimetableResultModel } from "../../database/models/timetableResultModel.js";
import { ProfessorModel } from "../../database/models/professorModel.js";
import { StudentEnrollmentModel } from "../../database/models/studentEnrollmentModel.js";
import { NotificationModel } from "../../database/models/notificationModel.js";

type Assignment = Record<string, unknown>;

const detectRequestConflicts = async (
  assignments: Assignment[],
  requestedDay: string,
  requestedTime: string,
  selfCourseCode: string,
  professorName?: string,
  requestedRoom?: string,
): Promise<string> => {
  const [requestedStart] = requestedTime.split("-").map((t) => t.trim());
  const conflicts: string[] = [];

  const profClash = assignments.find(
    (a) =>
      a.professorName === professorName &&
      a.day === requestedDay &&
      a.startTime === requestedStart &&
      a.courseCode !== selfCourseCode,
  );
  if (profClash) {
    conflicts.push(`Professor conflict: ${profClash.professorName} already teaching ${profClash.courseCode}`);
  }

  if (requestedRoom && requestedRoom !== "—" && requestedRoom !== "") {
    const roomClash = assignments.find(
      (a) =>
        a.roomName === requestedRoom &&
        a.day === requestedDay &&
        a.startTime === requestedStart &&
        a.courseCode !== selfCourseCode,
    );
    if (roomClash) {
      conflicts.push(`Room conflict: ${requestedRoom} occupied by ${roomClash.courseCode}`);
    }
  }

  if (conflicts.length === 0) return "No conflicts";
  return conflicts.join("; ");
};

// Reschedules are date-specific one-time overrides; the base weekly timetable
// is never mutated. The student dashboard applies approved requests as overlays
// for the week they fall in. This function just validates the request is coherent.
const validateRescheduleRequest = (
  request: any,
): { courseCode: string; assignmentsChanged: number } => {
  const course = request.courseId && typeof request.courseId === "object"
    ? request.courseId
    : null;
  const courseCode = course?.code || request.courseCode || "—";
  return { courseCode, assignmentsChanged: 1 };
};

const updateRequestStatus = async (
  requestId: string,
  status: RequestStatus,
  adminId?: string,
) => {
  const request = await rescheduleRepository.findByIdRaw(requestId);

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (request.status !== "pending") {
    throw new AppError(`Request already ${request.status}`, 400);
  }

  request.status = status;
  request.reviewedBy = adminId ?? null;
  request.reviewedAt = new Date();
  await request.save();

  return request.toObject();
};

const getProfessorCourses = async (userId: string) => {
  const professor = await ProfessorModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (!professor) {
    throw new AppError("Professor profile not found for current user", 404);
  }

  const timetable = await TimetableResultModel.findOne({ isLatest: true })
    .sort({ generatedAt: -1 })
    .lean();

  if (!timetable) return [];

  const assignments = (timetable as any).assignments as Assignment[];
  const profIdStr = (professor as any)._id.toString();
  const profName = (professor as any).name as string | undefined;

  const profAssignments = assignments.filter(
    (a) =>
      (a.professorId && String(a.professorId) === profIdStr) ||
      (profName && a.professorName === profName),
  );

  const courseMap = new Map<string, { courseId: string; courseCode: string; courseName: string; slots: { day: string; startTime: string; endTime: string; room: string }[] }>();

  for (const a of profAssignments) {
    const key = a.courseId ? String(a.courseId) : String(a.courseCode);
    if (!courseMap.has(key)) {
      courseMap.set(key, {
        courseId: key,
        courseCode: String(a.courseCode || ""),
        courseName: String(a.courseName || ""),
        slots: [],
      });
    }
    courseMap.get(key)!.slots.push({
      day: String(a.day || ""),
      startTime: String(a.startTime || ""),
      endTime: String(a.endTime || ""),
      room: String(a.roomName || "—"),
    });
  }

  return Array.from(courseMap.values());
};

const getSlotConflicts = async (
  courseId: string,
  currentDay: string,
  currentStartTime: string,
) => {
  const [timetable, enrollments] = await Promise.all([
    TimetableResultModel.findOne({ isLatest: true }).sort({ generatedAt: -1 }).lean(),
    StudentEnrollmentModel.find({
      enrolledCourseIds: new mongoose.Types.ObjectId(courseId),
    }).lean(),
  ]);

  if (!timetable) return [];

  const assignments = (timetable as any).assignments as Assignment[];

  // Collect all unique candidate target slots (exclude the being-rescheduled slot)
  const slotMap = new Map<string, { day: string; startTime: string; endTime: string }>();
  for (const a of assignments) {
    if (a.day === currentDay && a.startTime === currentStartTime) continue;
    const key = `${a.day}|${a.startTime}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, {
        day: String(a.day || ""),
        startTime: String(a.startTime || ""),
        endTime: String(a.endTime || ""),
      });
    }
  }

  if (enrollments.length === 0) {
    return Array.from(slotMap.values()).map((s) => ({ ...s, conflictCount: 0 }));
  }

  // Build conflict map: "day|startTime" → Set<studentId> of students who have class then
  const conflictMap = new Map<string, Set<string>>();

  for (const enrollment of enrollments) {
    const studentId = String(enrollment.studentId);
    const otherCourseIds = new Set(
      (enrollment.enrolledCourseIds as any[])
        .map((id) => String(id))
        .filter((id) => id !== courseId),
    );

    for (const a of assignments) {
      if (!a.courseId) continue;
      if (!otherCourseIds.has(String(a.courseId))) continue;
      const key = `${a.day}|${a.startTime}`;
      if (!conflictMap.has(key)) conflictMap.set(key, new Set());
      conflictMap.get(key)!.add(studentId);
    }
  }

  return Array.from(slotMap.values()).map((slot) => ({
    ...slot,
    conflictCount: conflictMap.get(`${slot.day}|${slot.startTime}`)?.size ?? 0,
  }));
};

export const rescheduleService = {
  create: async (payload: RescheduleRequestInput) => {
    // Resolve the incoming professorId: the faculty sends their User._id,
    // but the request model references the Professor collection.
    // Look up the Professor by userId so populate() works on the admin side.
    let resolvedProfessorId = payload.professorId;
    try {
      const professor = await ProfessorModel.findOne({
        userId: new mongoose.Types.ObjectId(payload.professorId),
      }).lean();
      if (professor) {
        resolvedProfessorId = String((professor as any)._id);
      }
    } catch {
      // Not a valid ObjectId or no professor found — use the value as-is
    }

    const latestTimetable = await TimetableResultModel.findOne({ isLatest: true })
      .sort({ generatedAt: -1 })
      .lean();

    let conflictStatus = "No timetable found";
    if (latestTimetable && latestTimetable.assignments) {
      const assignments = latestTimetable.assignments as unknown as Assignment[];
      const course = assignments.find(
        (a) => String(a.courseId) === payload.courseId || String(a.courseCode) === payload.courseId,
      );

      if (course && payload.requestedSlot) {
        const requestedStart = payload.requestedSlot.time.split("-")[0]?.trim();
        const conflict = await detectRequestConflicts(
          assignments,
          payload.requestedSlot.day,
          requestedStart,
          String(course.courseCode || ""),
          String(course.professorName || ""),
          payload.requestedSlot.room,
        );
        conflictStatus = conflict;
      }
    }

    const requestPayload = {
      ...payload,
      professorId: resolvedProfessorId,
      conflictStatus,
    };

    return rescheduleRepository.create(
      requestPayload as unknown as Record<string, unknown>,
    );
  },

  getAll: async (query: RescheduleQuery) => {
    const filter: Record<string, unknown> = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.professorId) {
      // The faculty sends their User._id; resolve to Professor._id for the filter.
      let resolvedId = query.professorId;
      try {
        const professor = await ProfessorModel.findOne({
          userId: new mongoose.Types.ObjectId(query.professorId),
        }).lean();
        if (professor) resolvedId = String((professor as any)._id);
      } catch {
        // Not a valid ObjectId — use as-is
      }
      filter.professorId = resolvedId;
    }

    return rescheduleRepository.findAll(filter);
  },

  getById: async (id: string) => {
    const request = await rescheduleRepository.findById(id);
    if (!request) {
      throw new AppError("Request not found", 404);
    }
    return request;
  },

  approve: async (id: string, adminId?: string) => {
    const request = await rescheduleRepository.findById(id);
    if (!request) {
      throw new AppError("Request not found", 404);
    }

    if (request.status !== "pending") {
      throw new AppError(`Request already ${request.status}`, 400);
    }

    const { courseCode: resolvedCode, assignmentsChanged } = validateRescheduleRequest(request);

    const saved = await rescheduleRepository.findByIdRaw(id);
    if (saved) {
      saved.status = "approved";
      saved.reviewedBy = adminId ?? null;
      saved.reviewedAt = new Date();
      await saved.save();
    }

    // Notify every student enrolled in this course
    try {
      const courseRef = (request as any).courseId;
      const courseIdStr = courseRef && typeof courseRef === "object"
        ? String(courseRef._id)
        : String(courseRef ?? "");
      const courseCode = (courseRef as any)?.code || (request as any).courseCode || resolvedCode;
      const courseName = (courseRef as any)?.name || "";

      if (courseIdStr && courseIdStr.length === 24) {
        const enrollments = await StudentEnrollmentModel.find({
          enrolledCourseIds: new mongoose.Types.ObjectId(courseIdStr),
        }).lean();

        if (enrollments.length > 0) {
          const currentDate = (request as any).currentDate;
          const requestedDate = (request as any).requestedDate;
          const from = currentDate
            ? `${currentDate} (${(request as any).currentSlot?.day} ${(request as any).currentSlot?.time})`
            : `${(request as any).currentSlot?.day} ${(request as any).currentSlot?.time}`;
          const to = requestedDate
            ? `${requestedDate} (${(request as any).requestedSlot?.day} ${(request as any).requestedSlot?.time})`
            : `${(request as any).requestedSlot?.day} ${(request as any).requestedSlot?.time}`;
          const courseLabel = [courseCode, courseName].filter(Boolean).join(" — ");

          await NotificationModel.insertMany(
            enrollments.map((e) => ({
              studentId: e.studentId,
              type: "schedule_change",
              title: `Class Rescheduled: ${courseLabel}`,
              message: `${courseLabel} has been moved from ${from} to ${to}.`,
              details: "Your professor's reschedule request was approved by the admin. Please update your schedule.",
              priority: "high",
              isRead: false,
            })),
          );
        }
      }
    } catch (notifErr) {
      // Never fail the approval because of notification errors
      console.error("Reschedule notification error:", notifErr);
    }

    return {
      ...request,
      status: "approved",
      reviewedBy: adminId ?? null,
      reviewedAt: new Date(),
      timetableVersion: "live-override",
      assignmentsChanged,
    };
  },

  reject: async (id: string, adminId?: string) => {
    return updateRequestStatus(id, "rejected", adminId);
  },

  getPendingCount: async () => {
    return rescheduleRepository.countByStatus("pending");
  },

  getProfessorCourses,
  getSlotConflicts,
};
