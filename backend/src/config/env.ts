import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5001),
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/timetable",
  ortoolsPythonBin: process.env.ORTOOLS_PYTHON_BIN ?? "python3",
};
