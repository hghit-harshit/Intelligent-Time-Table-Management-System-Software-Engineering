import { AppError } from "../shared/errors/index.js";
import { logger } from "../shared/logger/index.js";
export const errorMiddleware = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    logger.error(message);
    return res.status(500).json({ message });
};
