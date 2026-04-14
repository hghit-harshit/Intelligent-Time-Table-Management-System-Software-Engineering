import { createHash } from "node:crypto";
export const hash = (input) => {
    return createHash("sha256").update(input).digest("hex");
};
