import { Router } from "express";
import { createSlot, deleteSlot, getAllSlots, getSlotById, updateSlot, } from "./slot.controller.js";
const slotRouter = Router();
slotRouter.get("/", getAllSlots);
slotRouter.get("/:id", getSlotById);
slotRouter.post("/", createSlot);
slotRouter.put("/:id", updateSlot);
slotRouter.delete("/:id", deleteSlot);
export default slotRouter;
