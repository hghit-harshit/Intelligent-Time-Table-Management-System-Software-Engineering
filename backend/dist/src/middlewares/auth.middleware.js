import { env } from "../config/env.js";
import { AppError } from "../shared/errors/index.js";
import { verifyAccessToken } from "../utils/token.js";
const getBearerToken = (value) => {
    if (!value)
        return null;
    const [scheme, token] = value.split(" ");
    if (scheme !== "Bearer" || !token)
        return null;
    return token;
};
export const authMiddleware = (req, _res, next) => {
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
    next();
};
