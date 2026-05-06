import { Router } from "express";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware.js";
import {
  approveRequest,
  createRequest,
  getPendingCount,
  getRequestById,
  getRequests,
  rejectRequest,
  getProfessorCourses,
  getSlotConflicts,
} from "./reschedule.controller.js";

const rescheduleRouter = Router();

rescheduleRouter.get("/", authMiddleware, getRequests);
rescheduleRouter.get("/pending-count", requireRole("admin"), getPendingCount);
rescheduleRouter.get("/professor-courses", requireRole("professor"), getProfessorCourses);
rescheduleRouter.get("/slot-conflicts", requireRole("professor"), getSlotConflicts);
rescheduleRouter.get("/:id", authMiddleware, getRequestById);
rescheduleRouter.post("/", requireRole("professor"), createRequest);
rescheduleRouter.patch("/:id/approve", requireRole("admin"), approveRequest);
rescheduleRouter.patch("/:id/reject", requireRole("admin"), rejectRequest);

export default rescheduleRouter;
