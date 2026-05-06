import { Router } from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import {
  deleteNotification,
  getBatchEnrollments,
  getNotificationUnreadCount,
  getStudentCourses,
  getStudentDashboard,
  getStudentExams,
  getStudentNotifications,
  markNotificationRead,
} from "./student.controller.js";
import { createNote, getNotesByCourse, checkNote } from "./note.controller.js";
import { getTasks, createTask, updateTask, deleteTask } from "./task.controller.js";

const studentRouter = Router();

// ── Dashboard / Courses / Exams ───────────────────────────────────────
studentRouter.get("/dashboard", requireRole("student"), getStudentDashboard);
studentRouter.get("/courses", requireRole("student"), getStudentCourses);
studentRouter.get("/exams", requireRole("student"), getStudentExams);

// ── Notifications ─────────────────────────────────────────────────────
studentRouter.get("/notifications", requireRole("student"), getStudentNotifications);
studentRouter.get("/notifications/unread-count", requireRole("student"), getNotificationUnreadCount);
studentRouter.patch("/notifications/:id/read", requireRole("student"), markNotificationRead);
studentRouter.delete("/notifications/:id", requireRole("student"), deleteNotification);

// ── Notes (Google Docs bridge) ────────────────────────────────────────
studentRouter.post("/notes/create", requireRole("student"), createNote);
studentRouter.get("/notes/check", requireRole("student"), checkNote);
studentRouter.get("/notes/:courseCode", requireRole("student"), getNotesByCourse);

// ── Tasks ─────────────────────────────────────────────────────────────
studentRouter.get("/tasks", requireRole("student"), getTasks);
studentRouter.post("/tasks", requireRole("student"), createTask);
studentRouter.patch("/tasks/:id", requireRole("student"), updateTask);
studentRouter.delete("/tasks/:id", requireRole("student"), deleteTask);

// ── Enrollments ───────────────────────────────────────────────────────
studentRouter.get("/enrollments", requireRole("student"), getBatchEnrollments);

export default studentRouter;
