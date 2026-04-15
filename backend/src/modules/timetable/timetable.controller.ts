import type { Request, Response } from "express";
import { fail, ok } from "../../shared/response.js";
import { timetableService } from "./timetable.service.js";

const handleError = (res: Response, error: unknown, fallbackMessage: string) => {
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

export const getTimetableByRunId = async (req: Request, res: Response) => {
  try {
    const runId = readId(req.params.runId as string | string[] | undefined);
    const result = await timetableService.getRunTimetable(runId);
    return ok(res, result);
  } catch (error) {
    return handleError(res, error, "Error fetching timetable");
  }
};

export const getViolationsByRunId = async (req: Request, res: Response) => {
  try {
    const runId = readId(req.params.runId as string | string[] | undefined);
    const result = await timetableService.getRunViolations(runId);
    return ok(res, result);
  } catch (error) {
    return handleError(res, error, "Error fetching timetable violations");
  }
};
