export type RequestStatus = "pending" | "approved" | "rejected";

export interface RescheduleRequestInput {
  facultyId: string;
  facultyName: string;
  currentSlotId: string;
  requestedSlotId: string;
  reason: string;
}

export interface RescheduleQuery {
  status?: RequestStatus;
  facultyId?: string;
}
