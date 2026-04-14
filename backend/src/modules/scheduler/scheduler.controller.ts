import type { Request, Response } from "express";
import { ZodError } from "zod";
import { fail, ok } from "../../shared/response.js";
import { assignClassroomsSchema, generateScheduleSchema } from "./scheduler.schema.js";
import { schedulerService } from "./scheduler.service.js";

const handleError = (res: Response, error: unknown, fallbackMessage: string) => {
  if (error instanceof ZodError) {
    return fail(res, "Validation failed", 400, error.flatten());
  }

  if (error && typeof error === "object" && "statusCode" in error && "message" in error) {
    const known = error as { statusCode: number; message: string };
    return fail(res, known.message, known.statusCode);
  }

  return fail(res, fallbackMessage, 500, error instanceof Error ? error.message : error);
};

export const generateSchedule = async (req: Request, res: Response) => {
  try {
    const payload = generateScheduleSchema.parse(req.body ?? {});
    const result = await schedulerService.generateSchedule(payload.constraints ?? {});
    return ok(res, result);
  } catch (error) {
    return handleError(res, error, "Failed to run timetable solver");
  }
};

export const assignClassroomsToSlots = async (req: Request, res: Response) => {
  try {
    const payload = assignClassroomsSchema.parse(req.body ?? {});
    const result = await schedulerService.assignClassrooms(payload.assignments);
    return ok(res, result);
  } catch (error) {
    return handleError(res, error, "Failed to assign classrooms");
  }
};
