import { SlotModel } from "../../database/models/slotModel.js";
import type { SlotEntity } from "./slot.types.js";

const normalize = (slot: unknown): SlotEntity => {
  const s = slot as any;
  if (typeof s?.toObject === "function") {
    return s.toObject();
  }
  return s;
};

export const slotRepository = {
  findAll: async () => {
    const docs = await SlotModel.find().sort({ label: 1 });
    return docs.map(normalize);
  },

  findAllLean: async (query: Record<string, unknown> = {}) => {
    const docs = await SlotModel.find(query).lean();
    return docs as unknown as SlotEntity[];
  },

  findById: async (id: string) => {
    const doc = await SlotModel.findById(id);
    return doc ? normalize(doc) : null;
  },

  findByLabel: async (label: string, excludeId?: string) => {
    const query: Record<string, unknown> = { label };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const doc = await SlotModel.findOne(query).lean();
    return doc as unknown as SlotEntity | null;
  },

  create: async (payload: SlotEntity) => {
    const created = await SlotModel.create(payload);
    return normalize(created);
  },

  updateById: async (id: string, payload: SlotEntity) => {
    const updated = await SlotModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    return updated ? normalize(updated) : null;
  },

  deleteById: async (id: string) => {
    const deleted = await SlotModel.findByIdAndDelete(id);
    return deleted ? normalize(deleted) : null;
  },
};
