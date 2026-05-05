import { Router } from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import { createProfessorReference, getClassReferences } from "./reference.controller.js";

const referenceRouter = Router();

referenceRouter.get("/", requireRole("student", "professor", "admin"), getClassReferences);
referenceRouter.post("/", requireRole("professor", "admin"), createProfessorReference);

export default referenceRouter;
