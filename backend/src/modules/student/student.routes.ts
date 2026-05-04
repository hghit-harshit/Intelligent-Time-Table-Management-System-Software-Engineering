import { Router } from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import {
	deleteNotification,
	getNotificationUnreadCount,
	getStudentCourses,
	getStudentDashboard,
	getStudentExams,
	getStudentNotifications,
	markNotificationRead,
} from "./student.controller.js";

const studentRouter = Router();

studentRouter.get("/dashboard", requireRole("student"), getStudentDashboard);
studentRouter.get("/courses", requireRole("student"), getStudentCourses);
studentRouter.get("/exams", requireRole("student"), getStudentExams);
studentRouter.get("/notifications", requireRole("student"), getStudentNotifications);
studentRouter.get("/notifications/unread-count", requireRole("student"), getNotificationUnreadCount);
studentRouter.patch(
	"/notifications/:id/read",
	requireRole("student"),
	markNotificationRead,
);
studentRouter.delete(
	"/notifications/:id",
	requireRole("student"),
	deleteNotification,
);

export default studentRouter;
