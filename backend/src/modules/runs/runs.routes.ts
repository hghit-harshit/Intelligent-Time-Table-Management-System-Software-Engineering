import { Router } from "express";
import {
  getRuns,
  publishRun,
  toggleAssignmentLock,
} from "./runs.controller.js";

const runsRouter = Router();

runsRouter.get("/", getRuns);
runsRouter.post("/:id/publish", publishRun);
runsRouter.patch("/:id/assignments/:assignmentId/lock", toggleAssignmentLock);

export default runsRouter;
