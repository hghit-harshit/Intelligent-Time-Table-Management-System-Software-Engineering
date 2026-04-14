import { z } from "zod";
const occurrenceSchema = z.object({
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});
export const createSlotSchema = z.object({
    label: z.string().trim().min(1),
    occurrences: z.array(occurrenceSchema).min(1),
});
export const updateSlotSchema = createSlotSchema;
//# sourceMappingURL=slot.schema.js.map