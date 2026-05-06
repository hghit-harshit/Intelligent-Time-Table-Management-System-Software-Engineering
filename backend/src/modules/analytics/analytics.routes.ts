import { Router } from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import { getAnalytics } from "./analytics.controller.js";

const router = Router();

router.get("/", requireRole("admin"), getAnalytics);

export default router;
