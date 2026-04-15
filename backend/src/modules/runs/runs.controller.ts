import type { Request, Response } from "express";
import { ZodError } from "zod";
import { fail, ok } from "../../shared/response.js";
import { lockAssignmentSchema } from "./runs.schema.js";
import { runsService } from "./runs.service.js";

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

const readId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : (value ?? "");

export const getRuns = async (_req: Request, res: Response) => {
  try {
    const runs = await runsService.getRuns();
    return ok(res, runs);
  } catch (error) {
    return handleError(res, error, "Error fetching runs");
  }
};

export const publishRun = async (req: Request, res: Response) => {
  try {
    const runId = readId(req.params.id as string | string[] | undefined);
    const result = await runsService.publishRun(runId);
    return ok(res, result);
  } catch (error) {
    return handleError(res, error, "Error publishing run");
  }
};

export const toggleAssignmentLock = async (req: Request, res: Response) => {
  try {
    const runId = readId(req.params.id as string | string[] | undefined);
    const assignmentId = readId(
      req.params.assignmentId as string | string[] | undefined,
    );
    const payload = lockAssignmentSchema.parse(req.body ?? {});

    const result = await runsService.setAssignmentLock(
      runId,
      assignmentId,
      payload.locked,
    );

    return ok(res, result);
  } catch (error) {
    return handleError(res, error, "Error updating assignment lock state");
  }
};
