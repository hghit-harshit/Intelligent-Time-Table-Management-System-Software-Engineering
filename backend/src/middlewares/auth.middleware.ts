import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../shared/errors/index.js";
import { verifyAccessToken, type TokenPayload } from "../utils/token.js";
import { UserModel } from "../database/models/userModel.js";
import { logger } from "../shared/logger/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { _id?: string };
    }
  }
}

const getBearerToken = (value: string | undefined) => {
  if (!value) return null;
  const [scheme, token] = value.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (env.authDisabled) {
    next();
    return;
  }

  if (req.method === "OPTIONS") {
    next();
    return;
  }

  const token = getBearerToken(req.header("authorization"));
  if (!token) {
    throw new AppError("Missing bearer token", 401);
  }

  // const staticTokenMatch = token === env.apiAuthToken;
  const signedTokenPayload = verifyAccessToken(token);
  // if (!staticTokenMatch && !signedTokenPayload) {
  //   throw new AppError("Invalid or expired token", 401);
  // }
  if (!signedTokenPayload) {
    throw new AppError("Invalid or expired token", 401);
  }

  // if (staticTokenMatch) {
  //   const user = await UserModel.findOne({ role: "admin" })
  //     .select("-password")
  //     .lean();
  //   if (user) {
  //     req.user = {
  //       sub: "static-token",
  //       userId: user._id.toString(),
  //       role: "admin",
  //       email: "system@admin.local",
  //       _id: user._id.toString(),
  //     };
  //   }
  // }

  logger.info("value ", signedTokenPayload);
  if (signedTokenPayload) {
    req.user = {
      sub: signedTokenPayload.sub,
      userId: signedTokenPayload.userId,
      role: signedTokenPayload.role,
      email: signedTokenPayload.email,
      _id: signedTokenPayload.userId,
    };
  }

  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError("Insufficient permissions", 403);
    }
    next();
  };
};
