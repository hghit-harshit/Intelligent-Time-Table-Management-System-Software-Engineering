import { z } from "zod";

const slotInfoSchema = z.object({
  day: z.string().trim().min(1),
  time: z.string().trim().min(1),
  room: z.string().trim().optional(),
});

export const createRescheduleRequestSchema = z
  .object({
    professorId: z.string().trim().min(1),
    courseId: z.string().trim().optional().default("000000000000000000000000"),
    currentSlotId: z.string().trim().optional(),
    requestedSlotId: z.string().trim().optional(),
    currentSlot: slotInfoSchema.optional(),
    requestedSlot: slotInfoSchema.optional(),
    reason: z.string().trim().min(1),
    conflictStatus: z.string().trim().optional(),
  })
  .refine(
    (value) =>
      Boolean(value.currentSlotId || value.currentSlot) &&
      Boolean(value.requestedSlotId || value.requestedSlot),
    {
      message:
        "currentSlotId/currentSlot and requestedSlotId/requestedSlot are required",
    },
  );

export const requestQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  professorId: z.string().trim().min(1).optional(),
});

export const reviewRequestSchema = z.object({
  adminId: z.string().trim().optional(),
});
