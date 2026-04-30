export type RequestStatus = "pending" | "approved" | "rejected";

export interface RescheduleRequestInput {
  professorId: string;
  courseId: string;
  currentSlotId?: string;
  requestedSlotId?: string;
  currentSlot?: {
    day: string;
    time: string;
    room?: string;
  };
  requestedSlot?: {
    day: string;
    time: string;
    room?: string;
  };
  reason: string;
  conflictStatus?: string;
}

export interface RescheduleQuery {
  status?: RequestStatus;
  professorId?: string;
}
