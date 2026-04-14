import { z } from "zod";

export const generateScheduleSchema = z.object({
  constraints: z
    .object({
      hc1_enabled: z.boolean().optional(),
      sc1_enabled: z.boolean().optional(),
      sc2_enabled: z.boolean().optional(),
    })
    .optional(),
});

export const assignClassroomsSchema = z.object({
  assignments: z.array(z.record(z.string(), z.any())).min(1),
});
