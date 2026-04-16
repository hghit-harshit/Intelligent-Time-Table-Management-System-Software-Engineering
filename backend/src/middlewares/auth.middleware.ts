import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../shared/errors/index.js";
import { verifyAccessToken, type TokenPayload } from "../utils/token.js";
import { UserModel } from "../database/models/userModel.js";

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

  const staticTokenMatch = token === env.apiAuthToken;
  const signedTokenPayload = verifyAccessToken(token);
  if (!staticTokenMatch && !signedTokenPayload) {
    throw new AppError("Invalid or expired token", 401);
  }

  if (signedTokenPayload) {
    const user = await UserModel.findById(signedTokenPayload.userId).select("-password").lean();
    if (user) {
      req.user = {
        sub: signedTokenPayload.sub,
        userId: signedTokenPayload.userId,
        role: signedTokenPayload.role,
        email: signedTokenPayload.email,
        _id: user._id.toString(),
      };
    }
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