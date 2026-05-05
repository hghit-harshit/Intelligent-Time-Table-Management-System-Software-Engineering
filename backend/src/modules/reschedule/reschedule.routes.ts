import { Router } from "express";
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

rescheduleRouter.get("/", getRequests);
rescheduleRouter.get("/pending-count", getPendingCount);
rescheduleRouter.get("/professor-courses", getProfessorCourses);
rescheduleRouter.get("/slot-conflicts", getSlotConflicts);
rescheduleRouter.get("/:id", getRequestById);
rescheduleRouter.post("/", createRequest);
rescheduleRouter.patch("/:id/approve", approveRequest);
rescheduleRouter.patch("/:id/reject", rejectRequest);

export default rescheduleRouter;
