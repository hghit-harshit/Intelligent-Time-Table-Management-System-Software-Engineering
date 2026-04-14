import { Router } from "express";
import {
  approveRequest,
  createRequest,
  getRequestById,
  getRequests,
  rejectRequest,
} from "./reschedule.controller.js";

const rescheduleRouter = Router();

rescheduleRouter.get("/", getRequests);
rescheduleRouter.get("/:id", getRequestById);
rescheduleRouter.post("/", createRequest);
rescheduleRouter.patch("/:id/approve", approveRequest);
rescheduleRouter.patch("/:id/reject", rejectRequest);

export default rescheduleRouter;
