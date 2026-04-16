import type { Request, Response, NextFunction } from "express";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";
import { AppError } from "../../shared/errors/index.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = registerSchema.parse(req.body);
    const tokens = await authService.registerUser(input);
    res.status(201).json({ success: true, ...tokens });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = loginSchema.parse(req.body);
    const tokens = await authService.loginUser(input);
    res.json({ success: true, ...tokens });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = refreshSchema.parse(req.body);
    const tokens = await authService.refreshToken(input.refreshToken);
    if (!tokens) {
      throw new AppError("Invalid refresh token", 401);
    }
    res.json({ success: true, ...tokens });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profile = await authService.getProfile(req.user!.userId);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { firstName, lastName, email } = req.body;
    const profile = await authService.updateProfile(req.user!.userId, { firstName, lastName, email });
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};