import { UserModel } from "../../database/models/userModel.js";
import { AppError } from "../../shared/errors/index.js";
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyRefreshToken,
  type AuthTokens,
} from "../../utils/token.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

export const registerUser = async (input: RegisterInput): Promise<AuthTokens> => {
  const existingUser = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await UserModel.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.toLowerCase(),
    password: hashedPassword,
    role: input.role,
  });

  const tokens = generateTokens({
    sub: user.email,
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  return tokens;
};

export const loginUser = async (input: LoginInput): Promise<AuthTokens> => {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is disabled", 403);
  }

  const isValid = await verifyPassword(input.password, user.password);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  user.lastLogin = new Date();
  await user.save();

  const tokens = generateTokens({
    sub: user.email,
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  return tokens;
};

export const refreshToken = async (
  refreshTokenInput: string,
): Promise<AuthTokens | null> => {
  const payload = verifyRefreshToken(refreshTokenInput);
  if (!payload) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await UserModel.findOne({ email: payload.sub }).lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return generateTokens({
    sub: user.email,
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });
};

export const getProfile = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-password").lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const updateProfile = async (userId: string, data: { firstName?: string; lastName?: string; email?: string }) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (data.email && data.email !== user.email) {
    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new AppError("Email already in use", 409);
    }
    user.email = data.email.toLowerCase();
  }

  if (data.firstName) user.firstName = data.firstName;
  if (data.lastName) user.lastName = data.lastName;

  await user.save();
  return user.toObject();
};