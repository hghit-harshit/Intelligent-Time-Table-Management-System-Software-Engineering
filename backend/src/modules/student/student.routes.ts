import { Router } from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import { getStudentDashboard } from "./student.controller.js";

const studentRouter = Router();

studentRouter.get("/dashboard", requireRole("student"), getStudentDashboard);

export default studentRouter;
