import { ZodError } from "zod";
import { fail, ok } from "../../shared/response.js";
import { createSlotSchema, updateSlotSchema } from "./slot.schema.js";
import { slotService } from "./slot.service.js";
const handleError = (res, error, fallbackMessage) => {
    if (error instanceof ZodError) {
        return fail(res, "Validation failed", 400, error.flatten());
    }
    if (error && typeof error === "object" && "statusCode" in error && "message" in error) {
        const known = error;
        return fail(res, known.message, known.statusCode, known.details);
    }
    return fail(res, fallbackMessage, 500, error instanceof Error ? error.message : error);
};
const readId = (value) => {
    return Array.isArray(value) ? value[0] : (value ?? "");
};
export const getAllSlots = async (_req, res) => {
    try {
        const slots = await slotService.getAll();
        return ok(res, slots);
    }
    catch (error) {
        return handleError(res, error, "Error fetching slots");
    }
};
export const getSlotById = async (req, res) => {
    try {
        const slot = await slotService.getById(readId(req.params.id));
        return ok(res, slot);
    }
    catch (error) {
        return handleError(res, error, "Error fetching slot");
    }
};
export const createSlot = async (req, res) => {
    try {
        const payload = createSlotSchema.parse(req.body);
        const slot = await slotService.create(payload);
        return ok(res, slot, 201);
    }
    catch (error) {
        return handleError(res, error, "Error creating slot");
    }
};
export const updateSlot = async (req, res) => {
    try {
        const payload = updateSlotSchema.parse(req.body);
        const slot = await slotService.update(readId(req.params.id), payload);
        return ok(res, slot);
    }
    catch (error) {
        return handleError(res, error, "Error updating slot");
    }
};
export const deleteSlot = async (req, res) => {
    try {
        const result = await slotService.remove(readId(req.params.id));
        return ok(res, result);
    }
    catch (error) {
        return handleError(res, error, "Error deleting slot");
    }
};
