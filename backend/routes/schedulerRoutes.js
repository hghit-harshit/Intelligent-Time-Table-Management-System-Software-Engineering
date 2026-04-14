import { Router } from "express";
import { generateSchedule, assignClassroomsToSlots } from "../controllers/schedulerController.js";

const router = Router();

router.post("/generate", generateSchedule);
router.post("/assign-classrooms", assignClassroomsToSlots);

export default router;
