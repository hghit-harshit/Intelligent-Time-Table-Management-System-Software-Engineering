import type { Request, Response } from "express";
import { CourseModel } from "../../database/models/courseModel.js";
import { ExamDateWindowModel } from "../../database/models/examDateWindowModel.js";
import { ExamRequestModel } from "../../database/models/examRequestModel.js";
import { ExamScheduleModel } from "../../database/models/examScheduleModel.js";
import { NotificationModel } from "../../database/models/notificationModel.js";
import { ProfessorModel } from "../../database/models/professorModel.js";
import { RoomModel } from "../../database/models/roomModel.js";
import { StudentEnrollmentModel } from "../../database/models/studentEnrollmentModel.js";
import { fail, ok } from "../../shared/response.js";
import { logger } from "../../shared/logger/index.js";

// ─── Helpers ────────────────────────────────────────────────

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/**
 * Validates that a time string is on a 30-minute boundary (HH:00, HH:30).
 */
const isValid30MinBoundary = (time: string): boolean => {
  const mins = timeToMinutes(time);
  return mins % 30 === 0;
};

/**
 * Checks whether two time ranges overlap.
 * Range A: [startA, endA), Range B: [startB, endB)
 */
const timesOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean => {
  const a0 = timeToMinutes(startA);
  const a1 = timeToMinutes(endA);
  const b0 = timeToMinutes(startB);
  const b1 = timeToMinutes(endB);
  return a0 < b1 && b0 < a1;
};

/**
 * Normalises a Date to midnight UTC for date-only comparisons.
 */
const toDateOnly = (d: Date): string => d.toISOString().slice(0, 10);

// ═══════════════════════════════════════════════════════════════
// ADMIN — Exam Date Window
// ═══════════════════════════════════════════════════════════════

export const getExamDateWindow = async (req: Request, res: Response) => {
  try {
    const window = await ExamDateWindowModel.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    return ok(res, window);
  } catch (error) {
    return fail(res, "Failed to fetch exam date window", 500, error instanceof Error ? error.message : error);
  }
};

export const saveExamDateWindow = async (req: Request, res: Response) => {
  try {
    const { dates, startTime, endTime, semester, academicYear } = req.body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return fail(res, "At least one exam date is required");
    }
    if (!startTime || !endTime) {
      return fail(res, "Start time and end time are required");
    }
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return fail(res, "End time must be after start time");
    }

    // Deactivate any existing active windows
    await ExamDateWindowModel.updateMany({ isActive: true }, { $set: { isActive: false } });

    const parsedDates = dates.map((d: string) => new Date(d)).sort((a: Date, b: Date) => a.getTime() - b.getTime());

    const window = await ExamDateWindowModel.create({
      dates: parsedDates,
      startTime,
      endTime,
      semester: semester || 1,
      academicYear: academicYear || "2025-2026",
      isActive: true,
      createdBy: req.user?._id,
    });

    return ok(res, window, 201);
  } catch (error) {
    return fail(res, "Failed to save exam date window", 500, error instanceof Error ? error.message : error);
  }
};

// ═══════════════════════════════════════════════════════════════
// ADMIN — Exam Requests Management
// ═══════════════════════════════════════════════════════════════

export const getExamRequests = async (req: Request, res: Response) => {
  try {
    const statusFilter = typeof req.query.status === "string" ? req.query.status : undefined;
    const query: Record<string, any> = {};
    if (statusFilter) {
      query.status = statusFilter;
    }

    const requests = await ExamRequestModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return ok(res, requests);
  } catch (error) {
    return fail(res, "Failed to fetch exam requests", 500, error instanceof Error ? error.message : error);
  }
};

export const approveExamRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await ExamRequestModel.findById(id);

    if (!request) {
      return fail(res, "Exam request not found", 404);
    }
    if (request.status !== "pending") {
      return fail(res, `Request is already ${request.status}`);
    }

    // Create the exam schedule entry
    const examDoc = await ExamScheduleModel.create({
      courseId: request.courseId,
      courseCode: request.courseCode,
      courseName: request.courseName,
      examName: request.examName,
      professorId: request.professorId,
      examDate: request.examDate,
      startTime: request.startTime,
      endTime: request.endTime,
      location: request.venue,
      room: request.venue,
      invigilator: request.professorName,
      status: "scheduled",
      semester: 1,
      academicYear: "2025-2026",
      students: request.students,
    });

    // Create notifications for all enrolled students
    const enrollments = await StudentEnrollmentModel.find({
      enrolledCourseIds: request.courseId,
    }).lean();

    if (enrollments.length > 0) {
      const dateStr = new Date(request.examDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const notifications = enrollments.map((enrollment) => ({
        studentId: enrollment.studentId,
        type: "exam",
        title: `Exam Scheduled: ${request.courseName}`,
        message: `${request.examName} for ${request.courseCode} — ${request.courseName} has been scheduled on ${dateStr} from ${request.startTime} to ${request.endTime} at ${request.venue}.`,
        details: `Date: ${dateStr}\nTime: ${request.startTime} – ${request.endTime}\nVenue: ${request.venue}`,
        priority: "high",
        isRead: false,
        metadata: { examScheduleId: examDoc._id.toString(), source: "exam-approval" },
      }));

      await NotificationModel.insertMany(notifications);
    }

    // Mark request as approved (keep it so faculty can see the outcome)
    request.status = "approved";
    request.reviewedAt = new Date();
    request.reviewedBy = req.user?._id ? (req.user._id as any) : null;
    (request as any).examScheduleId = examDoc._id;
    await request.save();

    return ok(res, {
      message: "Exam request approved and scheduled",
      examSchedule: examDoc,
      notifiedStudents: enrollments.length,
    });
  } catch (error) {
    return fail(res, "Failed to approve exam request", 500, error instanceof Error ? error.message : error);
  }
};

export const rejectExamRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await ExamRequestModel.findById(id);
    if (!request) {
      return fail(res, "Exam request not found", 404);
    }
    if (request.status !== "pending") {
      return fail(res, `Request is already ${request.status}`);
    }

    request.status = "rejected";
    request.rejectionReason = reason || "No reason provided";
    request.reviewedAt = new Date();
    request.reviewedBy = req.user?._id ? (req.user._id as any) : null;
    await request.save();

    return ok(res, { message: "Exam request rejected", request });
  } catch (error) {
    return fail(res, "Failed to reject exam request", 500, error instanceof Error ? error.message : error);
  }
};

// ═══════════════════════════════════════════════════════════════
// SHARED — Exam Schedule (approved exams)
// ═══════════════════════════════════════════════════════════════

export const getExamSchedule = async (_req: Request, res: Response) => {
  try {
    const exams = await ExamScheduleModel.find()
      .sort({ examDate: 1, startTime: 1 })
      .lean();

    return ok(res, exams);
  } catch (error) {
    return fail(res, "Failed to fetch exam schedule", 500, error instanceof Error ? error.message : error);
  }
};

export const deleteScheduledExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exam = await ExamScheduleModel.findByIdAndDelete(id).lean();

    if (!exam) {
      return fail(res, "Scheduled exam not found", 404);
    }

    // Remove related notifications
    await NotificationModel.deleteMany({
      "metadata.examScheduleId": id,
    });

    return ok(res, { message: "Exam deleted", id });
  } catch (error) {
    return fail(res, "Failed to delete scheduled exam", 500, error instanceof Error ? error.message : error);
  }
};

// ═══════════════════════════════════════════════════════════════
// FACULTY — Find Available Slots
// ═══════════════════════════════════════════════════════════════

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const courseId = typeof req.query.courseId === "string" ? req.query.courseId : "";
    if (!courseId) {
      return fail(res, "courseId query parameter is required");
    }

    const window = await ExamDateWindowModel.findOne({ isActive: true }).lean();
    if (!window) {
      return fail(res, "No active exam date window configured by admin. Please contact your administrator.", 404);
    }

    const course = await CourseModel.findById(courseId).lean();
    if (!course) {
      return fail(res, "Course not found", 404);
    }

    const classStrength = (course as any).students || 0;

    const enrollments = await StudentEnrollmentModel.find({
      enrolledCourseIds: courseId,
    }).lean();

    const allStudentCourseIds = new Set<string>();
    for (const enrollment of enrollments) {
      for (const cid of enrollment.enrolledCourseIds) {
        allStudentCourseIds.add(cid.toString());
      }
    }

    const existingExams = await ExamScheduleModel.find({
      $or: [
        { courseId: { $in: Array.from(allStudentCourseIds) } },
        { courseCode: { $in: Array.from(allStudentCourseIds) } },
      ],
    }).lean();

    const suitableRooms = await RoomModel.find({
      capacity: { $gte: classStrength },
    }).lean();

    const windowStart = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);
    const cellSize = 30;

    // Build time labels
    const timeLabels: string[] = [];
    for (let m = windowStart; m < windowEnd; m += cellSize) {
      timeLabels.push(minutesToTime(m));
    }

    // Build grid: { "2026-05-01": { "08:00": { available, venues }, ... }, ... }
    const grid: Record<string, Record<string, { available: boolean; venues: string[] }>> = {};
    const dates: Array<{ date: string; formatted: string }> = [];

    for (const examDate of window.dates) {
      const dateStr = toDateOnly(new Date(examDate));
      dates.push({
        date: dateStr,
        formatted: new Date(examDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });

      const examsOnDate = existingExams.filter(
        (e) => toDateOnly(new Date(e.examDate)) === dateStr,
      );

      const studentBusyIntervals: Array<{ start: number; end: number }> = [];
      for (const exam of examsOnDate) {
        studentBusyIntervals.push({
          start: timeToMinutes(exam.startTime || "00:00"),
          end: timeToMinutes(exam.endTime || "00:00"),
        });
      }

      const allExamsOnDate = await ExamScheduleModel.find({
        examDate: {
          $gte: new Date(dateStr + "T00:00:00.000Z"),
          $lt: new Date(dateStr + "T23:59:59.999Z"),
        },
      }).lean();

      // Also get pending/approved exam requests (they block venues too)
      const pendingRequestsOnDate = await ExamRequestModel.find({
        examDate: {
          $gte: new Date(dateStr + "T00:00:00.000Z"),
          $lt: new Date(dateStr + "T23:59:59.999Z"),
        },
        status: { $in: ["pending", "approved"] },
      }).lean();

      const venueBusyMap = new Map<string, Array<{ start: number; end: number }>>();

      // Add scheduled exams to venue busy map
      for (const exam of allExamsOnDate) {
        const venue = exam.room || exam.location || "";
        if (!venue) continue;
        if (!venueBusyMap.has(venue)) venueBusyMap.set(venue, []);
        venueBusyMap.get(venue)!.push({
          start: timeToMinutes(exam.startTime || "00:00"),
          end: timeToMinutes(exam.endTime || "00:00"),
        });
      }

      // Add pending/approved requests to venue busy map
      for (const req of pendingRequestsOnDate) {
        const venue = (req as any).venue || "";
        if (!venue) continue;
        if (!venueBusyMap.has(venue)) venueBusyMap.set(venue, []);
        venueBusyMap.get(venue)!.push({
          start: timeToMinutes(req.startTime || "00:00"),
          end: timeToMinutes(req.endTime || "00:00"),
        });
        // Also block student time for pending requests (other courses' students may conflict)
        studentBusyIntervals.push({
          start: timeToMinutes(req.startTime || "00:00"),
          end: timeToMinutes(req.endTime || "00:00"),
        });
      }

      grid[dateStr] = {};

      for (let cellStart = windowStart; cellStart < windowEnd; cellStart += cellSize) {
        const cellEnd = cellStart + cellSize;
        const timeKey = minutesToTime(cellStart);

        const studentsFree = !studentBusyIntervals.some(
          (busy) => cellStart < busy.end && busy.start < cellEnd,
        );

        if (!studentsFree) {
          grid[dateStr][timeKey] = { available: false, venues: [] };
          continue;
        }

        const freeVenues = suitableRooms
          .filter((room) => {
            const busy = venueBusyMap.get(room.name) || [];
            return !busy.some((b) => cellStart < b.end && b.start < cellEnd);
          })
          .map((room) => room.name);

        grid[dateStr][timeKey] = {
          available: freeVenues.length > 0,
          venues: freeVenues,
        };
      }
    }

    return ok(res, {
      courseCode: (course as any).code,
      courseName: (course as any).name,
      classStrength,
      enrolledStudents: enrollments.length,
      dates,
      timeLabels,
      grid,
    });
  } catch (error) {
    return fail(res, "Failed to find available slots", 500, error instanceof Error ? error.message : error);
  }
};

// ═══════════════════════════════════════════════════════════════
// FACULTY — Submit Exam Request
// ═══════════════════════════════════════════════════════════════

export const submitExamRequest = async (req: Request, res: Response) => {
  try {
    const { courseId, examName, examDate, startTime, endTime, venue } = req.body;

    if (!courseId || !examName || !examDate || !startTime || !endTime || !venue) {
      return fail(res, "All fields are required: courseId, examName, examDate, startTime, endTime, venue");
    }

    // Validate time format (30-min boundaries)
    if (!isValid30MinBoundary(startTime) || !isValid30MinBoundary(endTime)) {
      return fail(res, "Start and end times must be on 30-minute boundaries (e.g. 09:00, 09:30, 10:00)");
    }

    // Validate minimum 30 min duration
    const durationMin = timeToMinutes(endTime) - timeToMinutes(startTime);
    if (durationMin < 30) {
      return fail(res, "Exam duration must be at least 30 minutes");
    }

    // Get the course
    const course = await CourseModel.findById(courseId).lean();
    if (!course) {
      return fail(res, "Course not found", 404);
    }

    // Find the professor for this user
    const userEmail = req.user?.email;
    const userId = req.user?._id;
    let professor: any = null;

    if (userEmail) {
      professor = await ProfessorModel.findOne({ email: userEmail }).lean();
    }

    if (!professor && userId) {
      professor = await ProfessorModel.findOne({ userId }).lean();
    }

    if (!professor) {
      // Try matching by courseMappings
      professor = await ProfessorModel.findOne({
        courseMappings: courseId,
      }).lean();
    }

    if (!professor) {
      return fail(res, "Could not find professor profile. Please ensure your account is linked to a professor record.", 404);
    }

    // Check that this professor actually teaches this course
    const profCourseIds = (professor.courseMappings || []).map((id: any) => id.toString());
    if (!profCourseIds.includes(courseId)) {
      return fail(res, "You are not assigned to teach this course", 403);
    }

    // Check for duplicate pending request
    const existingRequest = await ExamRequestModel.findOne({
      courseId,
      status: "pending",
    }).lean();
    if (existingRequest) {
      return fail(res, "A pending exam request already exists for this course. Wait for admin review or contact admin to reject the existing one.");
    }

    // Check if exam is already scheduled for this course
    const existingExam = await ExamScheduleModel.findOne({
      courseId,
    }).lean();
    if (existingExam) {
      return fail(res, "An exam is already scheduled for this course.");
    }

    const request = await ExamRequestModel.create({
      courseId,
      courseCode: (course as any).code || "",
      courseName: (course as any).name || "",
      professorId: professor._id,
      professorUserId: req.user?._id,
      professorName: professor.name || "Unknown Professor",
      examName,
      examDate: new Date(examDate),
      startTime,
      endTime,
      venue,
      students: (course as any).students || 0,
      status: "pending",
    });

    return ok(res, { message: "Exam request submitted successfully", request }, 201);
  } catch (error) {
    return fail(res, "Failed to submit exam request", 500, error instanceof Error ? error.message : error);
  }
};

// ═══════════════════════════════════════════════════════════════
// FACULTY — My Requests
// ═══════════════════════════════════════════════════════════════

export const getMyExamRequests = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const userId = req.user?._id;
    let professor: any = null;

    if (userEmail) {
      professor = await ProfessorModel.findOne({ email: userEmail }).lean();
    }

    if (!professor && userId) {
      professor = await ProfessorModel.findOne({ userId }).lean();
    }

    if (!professor) {
      // Return empty if no professor profile found
      return ok(res, []);
    }

    const requests = await ExamRequestModel.find({
      professorId: professor._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return ok(res, requests);
  } catch (error) {
    return fail(res, "Failed to fetch your exam requests", 500, error instanceof Error ? error.message : error);
  }
};

// ═══════════════════════════════════════════════════════════════
// FACULTY — My Courses (courses this professor teaches)
// ═══════════════════════════════════════════════════════════════

export const getFacultyCourses = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const userId = req.user?._id;
    let professor: any = null;

    if (userEmail) {
      professor = await ProfessorModel.findOne({ email: userEmail }).lean();
    }

    if (!professor && userId) {
      professor = await ProfessorModel.findOne({ userId }).lean();
    }

    if (!professor) {
      return ok(res, []);
    }

    const courseIds = (professor.courseMappings || []).map((id: any) => id.toString());
    if (courseIds.length === 0) {
      return ok(res, []);
    }

    const courses = await CourseModel.find({ _id: { $in: courseIds } }).lean();

    return ok(
      res,
      courses.map((c: any) => ({
        id: c._id.toString(),
        code: c.code || "",
        name: c.name || "",
        students: c.students || 0,
        department: c.department || "",
      })),
    );
  } catch (error) {
    return fail(res, "Failed to fetch faculty courses", 500, error instanceof Error ? error.message : error);
  }
};

// ═══════════════════════════════════════════════════════════════
// FACULTY — My Scheduled Exams (approved exams for this professor)
// ═══════════════════════════════════════════════════════════════

export const getMyScheduledExams = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const userId = req.user?._id;
    let professor: any = null;

    if (userEmail) {
      professor = await ProfessorModel.findOne({ email: userEmail }).lean();
    }
    if (!professor && userId) {
      professor = await ProfessorModel.findOne({ userId }).lean();
    }
    if (!professor) {
      return ok(res, []);
    }

    const exams = await ExamScheduleModel.find({
      professorId: professor._id,
    })
      .sort({ examDate: 1, startTime: 1 })
      .lean();

    return ok(res, exams);
  } catch (error) {
    return fail(res, "Failed to fetch your scheduled exams", 500, error instanceof Error ? error.message : error);
  }
};

// ═══════════════════════════════════════════════════════════════
// CLEANUP — Remove past exams
// ═══════════════════════════════════════════════════════════════

export const cleanupPastExams = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const pastExams = await ExamScheduleModel.find({
      examDate: { $lt: now },
    }).lean();

    if (pastExams.length === 0) {
      return ok(res, { message: "No past exams to clean up", deleted: 0 });
    }

    const pastIds = pastExams.map((e) => e._id.toString());

    // Delete the exams
    await ExamScheduleModel.deleteMany({ _id: { $in: pastIds } });

    // Delete related notifications
    await NotificationModel.deleteMany({
      "metadata.examScheduleId": { $in: pastIds },
    });

    return ok(res, {
      message: `Cleaned up ${pastExams.length} past exam(s)`,
      deleted: pastExams.length,
    });
  } catch (error) {
    return fail(res, "Failed to clean up past exams", 500, error instanceof Error ? error.message : error);
  }
};

/**
 * Auto-cleanup on server startup — called once when the server boots.
 */
export const autoCleanupPastExams = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const result = await ExamScheduleModel.deleteMany({
      examDate: { $lt: now },
    });

    if (result.deletedCount > 0) {
      logger.info(`Auto-cleanup: removed ${result.deletedCount} past exam(s)`);
    }
  } catch (error) {
    logger.error("Auto-cleanup of past exams failed", error);
  }
};
