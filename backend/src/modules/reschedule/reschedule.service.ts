import { AppError } from "../../shared/errors/index.js";
import type {
  RequestStatus,
  RescheduleQuery,
  RescheduleRequestInput,
} from "./reschedule.types.js";
import { rescheduleRepository } from "./reschedule.repository.js";

const updateRequestStatus = async (
  requestId: string,
  status: RequestStatus,
  adminId?: string,
) => {
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
  create: async (payload: RescheduleRequestInput) => {
    return rescheduleRepository.create(
      payload as unknown as Record<string, unknown>,
    );
  },

  getAll: async (query: RescheduleQuery) => {
    const filter: Record<string, unknown> = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.facultyId) {
      filter.facultyId = query.facultyId;
    }

    return rescheduleRepository.findAll(filter);
  },

  getById: async (id: string) => {
    const request = await rescheduleRepository.findById(id);
    if (!request) {
      throw new AppError("Request not found", 404);
    }
    return request;
  },

  approve: async (id: string, adminId?: string) => {
    return updateRequestStatus(id, "approved", adminId);
  },

  reject: async (id: string, adminId?: string) => {
    return updateRequestStatus(id, "rejected", adminId);
  },
};
