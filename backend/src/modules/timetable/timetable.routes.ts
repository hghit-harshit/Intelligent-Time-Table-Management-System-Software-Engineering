import { Router } from "express";
import {
  getTimetableByRunId,
  getViolationsByRunId,
} from "./timetable.controller.js";

const timetableRouter = Router();

timetableRouter.get("/:runId", getTimetableByRunId);
timetableRouter.get("/:runId/violations", getViolationsByRunId);

export default timetableRouter;
