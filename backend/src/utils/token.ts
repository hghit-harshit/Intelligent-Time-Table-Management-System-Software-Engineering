import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export interface TokenPayload {
  sub: string;
  userId: string;
  role: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const ACCESS_EXPIRES_IN = env.jwtAccessExpiresIn || "15m";
const REFRESH_EXPIRES_IN = env.jwtRefreshExpiresIn || "7d";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateTokens = (payload: TokenPayload): AuthTokens => {
  const expiresIn = parseInt(ACCESS_EXPIRES_IN.replace(/\D/g, "")) * 60 * 1000;

  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(
    { sub: payload.sub, type: "refresh" },
    env.jwtSecret,
    { expiresIn: REFRESH_EXPIRES_IN },
  );

  return { accessToken, refreshToken, expiresIn };
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload & {
      type: string;
    };
    if (decoded.type !== "refresh") return null;
    return decoded;
  } catch {
    return null;
  }
};

export const refreshAccessToken = (refreshToken: string): AuthTokens | null => {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return null;

  const { sub, userId, role, email } = payload;
  return generateTokens({ sub, userId, role, email });
};