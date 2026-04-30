import { Router } from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import {
  getExamDateWindow,
  saveExamDateWindow,
  getExamRequests,
  approveExamRequest,
  rejectExamRequest,
  getExamSchedule,
  deleteScheduledExam,
  getAvailableSlots,
  submitExamRequest,
  getMyExamRequests,
  getFacultyCourses,
  getMyScheduledExams,
  cleanupPastExams,
} from "./exam.controller.js";

const examRouter = Router();

// ─── Admin: Date Window ─────────────────────────────────────
examRouter.get(
  "/date-window",
  requireRole("admin", "professor"),
  getExamDateWindow,
);
examRouter.post(
  "/date-window",
  requireRole("admin"),
  saveExamDateWindow,
);

// ─── Admin: Exam Requests ───────────────────────────────────
examRouter.get(
  "/requests",
  requireRole("admin"),
  getExamRequests,
);
examRouter.post(
  "/requests/:id/approve",
  requireRole("admin"),
  approveExamRequest,
);
examRouter.post(
  "/requests/:id/reject",
  requireRole("admin"),
  rejectExamRequest,
);

// ─── Shared: Exam Schedule ──────────────────────────────────
examRouter.get("/schedule", getExamSchedule);
examRouter.delete(
  "/schedule/:id",
  requireRole("admin"),
  deleteScheduledExam,
);

// ─── Faculty: Available Slots ───────────────────────────────
examRouter.get(
  "/available-slots",
  requireRole("professor"),
  getAvailableSlots,
);

// ─── Faculty: Submit / View Requests ────────────────────────
examRouter.post(
  "/request",
  requireRole("professor"),
  submitExamRequest,
);
examRouter.get(
  "/my-requests",
  requireRole("professor"),
  getMyExamRequests,
);

// ─── Faculty: My Courses ────────────────────────────────────
examRouter.get(
  "/faculty-courses",
  requireRole("professor"),
  getFacultyCourses,
);

// ─── Faculty: My Scheduled Exams ────────────────────────────
examRouter.get(
  "/my-schedule",
  requireRole("professor"),
  getMyScheduledExams,
);

// ─── Admin: Cleanup ─────────────────────────────────────────
examRouter.delete(
  "/cleanup",
  requireRole("admin"),
  cleanupPastExams,
);

export default examRouter;
