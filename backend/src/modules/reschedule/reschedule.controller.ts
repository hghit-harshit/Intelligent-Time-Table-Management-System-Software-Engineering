import type { Request, Response } from "express";
import { ZodError } from "zod";
import { fail, ok } from "../../shared/response.js";
import {
  createRescheduleRequestSchema,
  requestQuerySchema,
  reviewRequestSchema,
} from "./reschedule.schema.js";
import { rescheduleService } from "./reschedule.service.js";

const handleError = (
  res: Response,
  error: unknown,
  fallbackMessage: string,
) => {
  if (error instanceof ZodError) {
    return fail(res, "Validation failed", 400, error.flatten());
  }

  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    "message" in error
  ) {
    const known = error as { statusCode: number; message: string };
    return fail(res, known.message, known.statusCode);
  }

  return fail(
    res,
    fallbackMessage,
    500,
    error instanceof Error ? error.message : error,
  );
};

const readId = (value: string | string[] | undefined) => {
  return Array.isArray(value) ? value[0] : (value ?? "");
};

export const createRequest = async (req: Request, res: Response) => {
  try {
    const payload = createRescheduleRequestSchema.parse(req.body ?? {});
    const request = await rescheduleService.create(payload);
    return ok(res, request, 201);
  } catch (error) {
    return handleError(res, error, "Error creating request");
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const query = requestQuerySchema.parse(req.query ?? {});
    const requests = await rescheduleService.getAll(query);
    return ok(res, requests);
  } catch (error) {
    return handleError(res, error, "Error fetching requests");
  }
};

export const getRequestById = async (req: Request, res: Response) => {
  try {
    const request = await rescheduleService.getById(
      readId(req.params.id as string | string[] | undefined),
    );
    return ok(res, request);
  } catch (error) {
    return handleError(res, error, "Error fetching request");
  }
};

export const approveRequest = async (req: Request, res: Response) => {
  try {
    const body = reviewRequestSchema.parse(req.body ?? {});
    const request = await rescheduleService.approve(
      readId(req.params.id as string | string[] | undefined),
      body.adminId,
    );
    return ok(res, request);
  } catch (error) {
    return handleError(res, error, "Error approving request");
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const body = reviewRequestSchema.parse(req.body ?? {});
    const request = await rescheduleService.reject(
      readId(req.params.id as string | string[] | undefined),
      body.adminId,
    );
    return ok(res, request);
  } catch (error) {
    return handleError(res, error, "Error rejecting request");
  }
};

export const getPendingCount = async (_req: Request, res: Response) => {
  try {
    const count = await rescheduleService.getPendingCount();
    return ok(res, { pending: count });
  } catch (error) {
    return handleError(res, error, "Error fetching pending count");
  }
};

export const getProfessorCourses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, "Authentication required", 401);
    const courses = await rescheduleService.getProfessorCourses(userId);
    return ok(res, courses);
  } catch (error) {
    return handleError(res, error, "Error fetching professor courses");
  }
};

export const getSlotConflicts = async (req: Request, res: Response) => {
  try {
    const { courseId, currentDay, currentStartTime } = req.query as Record<string, string>;
    if (!courseId || !currentDay || !currentStartTime) {
      return fail(res, "courseId, currentDay, currentStartTime are required", 400);
    }
    const slots = await rescheduleService.getSlotConflicts(courseId, currentDay, currentStartTime);
    return ok(res, slots);
  } catch (error) {
    return handleError(res, error, "Error computing slot conflicts");
  }
};
