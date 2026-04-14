import type { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/errors/index.js";
import { logger } from "../shared/logger/index.js";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  logger.error(message);
  return res.status(500).json({ message });
};
