import { SlotModel } from "../../database/models/slotModel.js";
const normalize = (slot) => {
    const s = slot;
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
    findAllLean: async (query = {}) => {
        const docs = await SlotModel.find(query).lean();
        return docs;
    },
    findById: async (id) => {
        const doc = await SlotModel.findById(id);
        return doc ? normalize(doc) : null;
    },
    findByLabel: async (label, excludeId) => {
        const query = { label };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const doc = await SlotModel.findOne(query).lean();
        return doc;
    },
    create: async (payload) => {
        const created = await SlotModel.create(payload);
        return normalize(created);
    },
    updateById: async (id, payload) => {
        const updated = await SlotModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
        });
        return updated ? normalize(updated) : null;
    },
    deleteById: async (id) => {
        const deleted = await SlotModel.findByIdAndDelete(id);
        return deleted ? normalize(deleted) : null;
    },
};
//# sourceMappingURL=slot.repository.js.map