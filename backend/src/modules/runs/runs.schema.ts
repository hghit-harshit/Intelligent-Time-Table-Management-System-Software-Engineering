import { z } from "zod";

export const lockAssignmentSchema = z.object({
  locked: z.boolean(),
});
