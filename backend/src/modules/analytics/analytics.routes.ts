import { Router } from "express";
import { getAnalytics } from "./analytics.controller.js";

const router = Router();

router.get("/", getAnalytics);

export default router;
