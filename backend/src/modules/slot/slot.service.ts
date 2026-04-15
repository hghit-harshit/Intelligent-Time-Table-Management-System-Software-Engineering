import { AppError } from "../../shared/errors/index.js";
import { slotRepository } from "./slot.repository.js";
import type { SlotConflict, SlotEntity, SlotOccurrence } from "./slot.types.js";

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const hasTimeOverlap = (
  leftStart: string,
  leftEnd: string,
  rightStart: string,
  rightEnd: string,
) => {
  const leftStartMinutes = timeToMinutes(leftStart);
  const leftEndMinutes = timeToMinutes(leftEnd);
  const rightStartMinutes = timeToMinutes(rightStart);
  const rightEndMinutes = timeToMinutes(rightEnd);

  return (
    leftStartMinutes < rightEndMinutes && rightStartMinutes < leftEndMinutes
  );
};

const findOccurrenceConflict = async (
  occurrences: SlotOccurrence[],
  excludeSlotId?: string,
): Promise<SlotConflict | null> => {
  const query = excludeSlotId ? { _id: { $ne: excludeSlotId } } : {};
  const existingSlots = await slotRepository.findAllLean(query);

  for (const incoming of occurrences) {
    for (const existingSlot of existingSlots) {
      for (const existingOccurrence of existingSlot.occurrences || []) {
        if (incoming.day !== existingOccurrence.day) {
          continue;
        }

        if (
          hasTimeOverlap(
            incoming.startTime,
            incoming.endTime,
            existingOccurrence.startTime,
            existingOccurrence.endTime,
          )
        ) {
          return {
            slotId: String(existingSlot._id),
            label: existingSlot.label,
            occurrenceId: String(existingOccurrence._id ?? ""),
            day: existingOccurrence.day,
            startTime: existingOccurrence.startTime,
            endTime: existingOccurrence.endTime,
          };
        }
      }
    }
  }

  return null;
};

const validateSlotBusinessRules = async (
  payload: SlotEntity,
  excludeId?: string,
) => {
  const normalizedLabel = payload.label.trim();
  if (!normalizedLabel) {
    throw new AppError("Label is required", 400);
  }

  if (!Array.isArray(payload.occurrences) || payload.occurrences.length === 0) {
    throw new AppError("At least one occurrence is required", 400);
  }

  const duplicate = await slotRepository.findByLabel(
    normalizedLabel,
    excludeId,
  );
  if (duplicate) {
    throw new AppError("A slot with this label already exists", 409);
  }

  const conflict = await findOccurrenceConflict(payload.occurrences, excludeId);
  if (conflict) {
    const err = new AppError(
      "Occurrence conflicts with an existing slot",
      409,
    ) as AppError & {
      details?: unknown;
    };
    err.details = conflict;
    throw err;
  }

  return { ...payload, label: normalizedLabel };
};

export const slotService = {
  getAll: async () => slotRepository.findAll(),

  getById: async (id: string) => {
    const slot = await slotRepository.findById(id);
    if (!slot) {
      throw new AppError("Slot not found", 404);
    }
    return slot;
  },

  create: async (payload: SlotEntity) => {
    const validated = await validateSlotBusinessRules(payload);
    return slotRepository.create(validated);
  },

  update: async (id: string, payload: SlotEntity) => {
    const validated = await validateSlotBusinessRules(payload, id);
    const updated = await slotRepository.updateById(id, validated);

    if (!updated) {
      throw new AppError("Slot not found", 404);
    }

    return updated;
  },

  remove: async (id: string) => {
    const deleted = await slotRepository.deleteById(id);
    if (!deleted) {
      throw new AppError("Slot not found", 404);
    }
    return { message: "Slot deleted successfully" };
  },
};
