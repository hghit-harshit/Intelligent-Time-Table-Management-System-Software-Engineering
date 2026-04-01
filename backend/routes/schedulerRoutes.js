import { Router } from "express";
import { generateSchedule } from "../controllers/schedulerController.js";

const router = Router();

router.post("/generate", generateSchedule);

export default router;
