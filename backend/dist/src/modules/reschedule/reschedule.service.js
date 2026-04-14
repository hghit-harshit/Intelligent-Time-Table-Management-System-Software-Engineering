import { AppError } from "../../shared/errors/index.js";
import { rescheduleRepository } from "./reschedule.repository.js";
const updateRequestStatus = async (requestId, status, adminId) => {
    const request = await rescheduleRepository.findByIdRaw(requestId);
    if (!request) {
        throw new AppError("Request not found", 404);
    }
    if (request.status !== "pending") {
        throw new AppError(`Request already ${request.status}`, 400);
    }
    request.status = status;
    request.reviewedBy = adminId ?? null;
    request.reviewedAt = new Date();
    await request.save();
    return request.toObject();
};
export const rescheduleService = {
    create: async (payload) => {
        return rescheduleRepository.create(payload);
    },
    getAll: async (query) => {
        const filter = {};
        if (query.status) {
            filter.status = query.status;
        }
        if (query.facultyId) {
            filter.facultyId = query.facultyId;
        }
        return rescheduleRepository.findAll(filter);
    },
    getById: async (id) => {
        const request = await rescheduleRepository.findById(id);
        if (!request) {
            throw new AppError("Request not found", 404);
        }
        return request;
    },
    approve: async (id, adminId) => {
        return updateRequestStatus(id, "approved", adminId);
    },
    reject: async (id, adminId) => {
        return updateRequestStatus(id, "rejected", adminId);
    },
};
//# sourceMappingURL=reschedule.service.js.map