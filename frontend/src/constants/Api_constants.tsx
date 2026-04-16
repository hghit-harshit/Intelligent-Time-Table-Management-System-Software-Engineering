import { API_BASE_URL } from "../config/constants";

// Auth (Public)
export const AUTH_REGISTER_EP = API_BASE_URL + "/auth/register";
export const AUTH_LOGIN_EP = API_BASE_URL + "/auth/login";
export const AUTH_REFRESH_EP = API_BASE_URL + "/auth/refresh";
export const AUTH_PROFILE_EP = API_BASE_URL + "/auth/profile";
export const AUTH_PROFILE_UPDATE_EP = API_BASE_URL + "/auth/profile";

// Slots
export const SlotsEP = API_BASE_URL + "/slots";
export const SlotByIdEP = (id: string) => API_BASE_URL + `/slots/${id}`;

export const SchedulerRunEP = API_BASE_URL + "/scheduler/run";
export const SchedulerVersionsEP = API_BASE_URL + "/scheduler/versions";
export const SchedulerVersionByIdEP = (id: string) =>
  API_BASE_URL + `/scheduler/versions/${id}`;

export const RescheduleRequestsEP = API_BASE_URL + "/reschedule/requests";
export const RescheduleRequestByIdEP = (id: string) =>
  API_BASE_URL + `/reschedule/requests/${id}`;
export const RescheduleApproveEP = (id: string) =>
  API_BASE_URL + `/reschedule/requests/${id}/approve`;
export const RescheduleRejectEP = (id: string) =>
  API_BASE_URL + `/reschedule/requests/${id}/reject`;

export const COURSE_DRAFTS_UPLOAD = API_BASE_URL + "/course/drafts/upload";
export const COURSE_DRAFTS_FILES_LIST = API_BASE_URL + "/course/drafts/files/list";

export const SchedulerGenerateEP = API_BASE_URL + "/scheduler/generate";
export const SchedulerAssignClassroomsEP = API_BASE_URL + "/scheduler/assign-classrooms";

export const GOOGLE_CLASSROOM_API_URL = "http://localhost:4000/api";
export const GC_AUTH_URL_EP = GOOGLE_CLASSROOM_API_URL + "/auth/url";
export const GC_AUTH_STATUS_EP = GOOGLE_CLASSROOM_API_URL + "/auth/status";
export const GC_AUTH_LOGOUT_EP = GOOGLE_CLASSROOM_API_URL + "/auth/logout";
export const GC_ASSIGNMENTS_EP = GOOGLE_CLASSROOM_API_URL + "/assignments";
export const GC_CLASSROOM_LINK_EP = GOOGLE_CLASSROOM_API_URL + "/classroom-link";