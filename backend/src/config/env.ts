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
  ortoolsPythonBin: process.env.ORTOOLS_PYTHON_BIN ?? "python3",
  apiAuthToken: process.env.API_AUTH_TOKEN ?? "disha-dev-token",
  authDisabled: parseBoolean(process.env.AUTH_DISABLED, false),
};
