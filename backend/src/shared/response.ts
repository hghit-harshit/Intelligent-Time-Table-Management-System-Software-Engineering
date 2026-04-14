import type { Response } from "express";

export const ok = <T>(res: Response, data: T, statusCode = 200) => {
  return res.status(statusCode).json(data);
};

export const fail = (res: Response, message: string, statusCode = 400, details?: unknown) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};
