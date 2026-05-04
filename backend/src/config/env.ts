import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5001),
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/timetable",
  ortoolsPythonBin: process.env.ORTOOLS_PYTHON_BIN ?? "/home/muqeeth26832/.pyenv/versions/3.10.12/bin/python3",
  authDisabled: parseBoolean(process.env.AUTH_DISABLED, false),
  jwtSecret: process.env.JWT_SECRET ?? "dev-jwt-secret-key-change-in-production",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@timetable.edu",
  adminPassword: process.env.ADMIN_PASSWORD ?? "AdminPass123!",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
