import { createHmac } from "node:crypto";
const SECRET = process.env.TOKEN_SECRET ?? "disha-local-secret";
const toBase64Url = (value) => Buffer.from(value, "utf8").toString("base64url");
const fromBase64Url = (value) => Buffer.from(value, "base64url").toString("utf8");
const createSignature = (value) => {
    return createHmac("sha256", SECRET).update(value).digest("hex");
};
export const signToken = (payload) => {
    return createSignature(payload);
};
export const issueAccessToken = (subject, role = "service", ttlSeconds = 60 * 60) => {
    const payload = {
        sub: subject,
        role,
        exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    };
    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const signature = createSignature(encodedPayload);
    return `${encodedPayload}.${signature}`;
};
export const verifyAccessToken = (token) => {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) {
        return null;
    }
    const expectedSignature = createSignature(encodedPayload);
    if (signature !== expectedSignature) {
        return null;
    }
    try {
        const payload = JSON.parse(fromBase64Url(encodedPayload));
        const now = Math.floor(Date.now() / 1000);
        if (!payload.exp || payload.exp < now) {
            return null;
        }
        if (!payload.sub || !payload.role) {
            return null;
        }
        return payload;
    }
    catch {
        return null;
    }
};
