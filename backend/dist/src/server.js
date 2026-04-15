import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/index.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import apiRouter from "./routes/index.js";
import { logger } from "./shared/logger/index.js";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/ping", (_req, res) => {
    res.json({ message: "pong" });
});
app.use("/api", authMiddleware, apiRouter);
app.use(errorMiddleware);
const startServer = async () => {
    await connectDatabase();
    app.listen(env.port, () => {
        logger.info(`Server is running on port ${env.port}`);
    });
};
startServer().catch((error) => {
    logger.error("Unable to start server", error);
    process.exit(1);
});
