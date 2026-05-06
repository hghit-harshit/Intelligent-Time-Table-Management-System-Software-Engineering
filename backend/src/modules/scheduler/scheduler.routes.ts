import { Router } from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import {
  assignClassroomsToSlots,
  generateSchedule,
} from "./scheduler.controller.js";

const schedulerRouter = Router();

schedulerRouter.post("/generate", requireRole("admin"), generateSchedule);
schedulerRouter.post("/assign-classrooms", requireRole("admin"), assignClassroomsToSlots);

export default schedulerRouter;
