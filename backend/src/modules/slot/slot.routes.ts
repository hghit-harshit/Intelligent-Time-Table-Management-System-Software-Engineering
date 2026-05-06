import { Router } from "express";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware.js";
import {
  createSlot,
  deleteSlot,
  getAllSlots,
  getSlotById,
  updateSlot,
} from "./slot.controller.js";

const slotRouter = Router();

slotRouter.get("/", authMiddleware, getAllSlots);
slotRouter.get("/:id", authMiddleware, getSlotById);
slotRouter.post("/", requireRole("admin"), createSlot);
slotRouter.put("/:id", requireRole("admin"), updateSlot);
slotRouter.delete("/:id", requireRole("admin"), deleteSlot);

export default slotRouter;
