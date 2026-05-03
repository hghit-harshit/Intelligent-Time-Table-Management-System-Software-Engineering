import { AppError } from "../../shared/errors/index.js";
import type {
  RequestStatus,
  RescheduleQuery,
  RescheduleRequestInput,
} from "./reschedule.types.js";
import { rescheduleRepository } from "./reschedule.repository.js";
import { TimetableResultModel } from "../../database/models/timetableResultModel.js";

type Assignment = Record<string, unknown>;

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

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

const applyRescheduleToTimetable = async (
  request: any,
  adminId?: string,
): Promise<{ newVersion: string; assignmentsChanged: number }> => {
  const sourceDoc = await TimetableResultModel.findOne({ isLatest: true })
    .sort({ generatedAt: -1 });

  if (!sourceDoc) {
    throw new AppError("No published timetable found to modify", 400);
  }

  const course = request.courseId && typeof request.courseId === "object"
    ? request.courseId
    : null;
  const professor = request.professorId && typeof request.professorId === "object"
    ? request.professorId
    : null;

  const courseCode = course?.code || request.courseCode;
  const currentDay = request.currentSlot?.day;
  const currentTime = request.currentSlot?.time;
  const requestedDay = request.requestedSlot?.day;
  const requestedTime = request.requestedSlot?.time;

  if (!courseCode || !currentDay || !currentTime || !requestedDay || !requestedTime) {
    throw new AppError("Request is missing required slot/course information", 400);
  }

  const [currentStart, currentEnd] = currentTime.split("-").map((t: string) => t.trim());
  const [requestedStart, requestedEnd] = requestedTime.split("-").map((t: string) => t.trim());

  let assignments: Assignment[] = sourceDoc.assignments.map((a: any) =>
    a.toObject ? a.toObject() : { ...a },
  );

  let changesCount = 0;
  const affected = assignments.filter(
    (a) =>
      a.courseCode === courseCode &&
      a.day === currentDay &&
      a.startTime === currentStart &&
      (a.endTime === currentEnd || !currentEnd),
  );

  for (const slot of affected) {
    slot.day = requestedDay;
    slot.startTime = requestedStart;
    if (requestedEnd) slot.endTime = requestedEnd;
    slot.slotLabel = undefined;
    changesCount++;
  }

  if (changesCount === 0) {
    throw new AppError("No matching assignments found in current timetable for this request", 400);
  }

  const newVersion = `reschedule-${Date.now()}`;
  await TimetableResultModel.create({
    version: newVersion,
    status: "draft",
    isLatest: false,
    assignments,
    stats: sourceDoc.stats,
    constraints: sourceDoc.constraints,
    academicYear: sourceDoc.academicYear,
    semester: sourceDoc.semester,
    generatedAt: new Date(),
    commitMessage: `Reschedule request approved: ${courseCode} moved from ${currentDay} ${currentTime} to ${requestedDay} ${requestedTime}. ${request.reason || ""}`,
    generatedBy: adminId || undefined,
  });

  return { newVersion, assignmentsChanged: changesCount };
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

export const rescheduleService = {
  create: async (payload: RescheduleRequestInput) => {
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
      filter.professorId = query.professorId;
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

    const timetableResult = await applyRescheduleToTimetable(request, adminId);

    const saved = await rescheduleRepository.findByIdRaw(id);
    if (saved) {
      saved.status = "approved";
      saved.reviewedBy = adminId ?? null;
      saved.reviewedAt = new Date();
      await saved.save();
    }

    return {
      ...request,
      status: "approved",
      reviewedBy: adminId ?? null,
      reviewedAt: new Date(),
      timetableVersion: timetableResult.newVersion,
      assignmentsChanged: timetableResult.assignmentsChanged,
    };
  },

  reject: async (id: string, adminId?: string) => {
    return updateRequestStatus(id, "rejected", adminId);
  },

  getPendingCount: async () => {
    return rescheduleRepository.countByStatus("pending");
  },
};
