import { createHash } from "node:crypto";

export const hash = (input: string) => {
  return createHash("sha256").update(input).digest("hex");
};
