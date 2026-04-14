import { createHmac } from "node:crypto";
const SECRET = process.env.TOKEN_SECRET ?? "disha-local-secret";
export const signToken = (payload) => {
    return createHmac("sha256", SECRET).update(payload).digest("hex");
};
//# sourceMappingURL=token.js.map