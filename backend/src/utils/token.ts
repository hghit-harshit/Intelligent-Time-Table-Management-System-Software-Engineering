import { createHmac } from "node:crypto";

const SECRET = process.env.TOKEN_SECRET ?? "disha-local-secret";

export interface AccessTokenPayload {
  sub: string;
  role: string;
  exp: number;
}

const toBase64Url = (value: string) =>
  Buffer.from(value, "utf8").toString("base64url");

const fromBase64Url = (value: string) =>
  Buffer.from(value, "base64url").toString("utf8");

const createSignature = (value: string) => {
  return createHmac("sha256", SECRET).update(value).digest("hex");
};

export const signToken = (payload: string) => {
  return createSignature(payload);
};

export const issueAccessToken = (
  subject: string,
  role = "service",
  ttlSeconds = 60 * 60,
) => {
  const payload: AccessTokenPayload = {
    sub: subject,
    role,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = createSignature(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = createSignature(encodedPayload);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(encodedPayload),
    ) as AccessTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }

    if (!payload.sub || !payload.role) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
