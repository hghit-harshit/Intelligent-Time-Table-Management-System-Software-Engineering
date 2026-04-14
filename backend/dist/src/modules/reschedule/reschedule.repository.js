import { RequestModel } from "../../database/models/requestModel.js";
export const rescheduleRepository = {
    create: async (payload) => {
        const request = new RequestModel(payload);
        await request.save();
        return request.toObject();
    },
    findAll: async (filter) => {
        return RequestModel.find(filter)
            .populate("currentSlotId")
            .populate("requestedSlotId")
            .sort({ createdAt: -1 })
            .lean();
    },
    findById: async (id) => {
        return RequestModel.findById(id)
            .populate("currentSlotId")
            .populate("requestedSlotId")
            .lean();
    },
    findByIdRaw: async (id) => {
        return RequestModel.findById(id);
    },
};
