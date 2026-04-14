import { z } from "zod";

export const createRescheduleRequestSchema = z.object({
  facultyId: z.string().trim().min(1),
  facultyName: z.string().trim().min(1),
  currentSlotId: z.string().trim().min(1),
  requestedSlotId: z.string().trim().min(1),
  reason: z.string().trim().min(1),
});

export const requestQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  facultyId: z.string().trim().min(1).optional(),
});

export const reviewRequestSchema = z.object({
  adminId: z.string().trim().optional(),
});
