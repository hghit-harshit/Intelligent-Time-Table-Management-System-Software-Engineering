import { ZodError } from "zod";
import { fail, ok } from "../../shared/response.js";
import { createRescheduleRequestSchema, requestQuerySchema, reviewRequestSchema, } from "./reschedule.schema.js";
import { rescheduleService } from "./reschedule.service.js";
const handleError = (res, error, fallbackMessage) => {
    if (error instanceof ZodError) {
        return fail(res, "Validation failed", 400, error.flatten());
    }
    if (error &&
        typeof error === "object" &&
        "statusCode" in error &&
        "message" in error) {
        const known = error;
        return fail(res, known.message, known.statusCode);
    }
    return fail(res, fallbackMessage, 500, error instanceof Error ? error.message : error);
};
const readId = (value) => {
    return Array.isArray(value) ? value[0] : (value ?? "");
};
export const createRequest = async (req, res) => {
    try {
        const payload = createRescheduleRequestSchema.parse(req.body ?? {});
        const request = await rescheduleService.create(payload);
        return ok(res, request, 201);
    }
    catch (error) {
        return handleError(res, error, "Error creating request");
    }
};
export const getRequests = async (req, res) => {
    try {
        const query = requestQuerySchema.parse(req.query ?? {});
        const requests = await rescheduleService.getAll(query);
        return ok(res, requests);
    }
    catch (error) {
        return handleError(res, error, "Error fetching requests");
    }
};
export const getRequestById = async (req, res) => {
    try {
        const request = await rescheduleService.getById(readId(req.params.id));
        return ok(res, request);
    }
    catch (error) {
        return handleError(res, error, "Error fetching request");
    }
};
export const approveRequest = async (req, res) => {
    try {
        const body = reviewRequestSchema.parse(req.body ?? {});
        const request = await rescheduleService.approve(readId(req.params.id), body.adminId);
        return ok(res, request);
    }
    catch (error) {
        return handleError(res, error, "Error approving request");
    }
};
export const rejectRequest = async (req, res) => {
    try {
        const body = reviewRequestSchema.parse(req.body ?? {});
        const request = await rescheduleService.reject(readId(req.params.id), body.adminId);
        return ok(res, request);
    }
    catch (error) {
        return handleError(res, error, "Error rejecting request");
    }
};
