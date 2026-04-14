import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../shared/logger/index.js";

let connected = false;

export const connectDatabase = async () => {
  if (connected) {
    return;
  }

  await mongoose.connect(env.mongodbUri);
  connected = true;
  logger.info("Connected to MongoDB");
};

export const disconnectDatabase = async () => {
  if (!connected) {
    return;
  }

  await mongoose.disconnect();
  connected = false;
};
