// @ts-nocheck
import { httpClient } from "./httpClient";

// ─── Admin: Date Window ─────────────────────────────────────

export const fetchExamDateWindow = () => {
  return httpClient.get("/exam/date-window");
};

export const saveExamDateWindow = (data: {
  dates: string[];
  startTime: string;
  endTime: string;
  semester?: number;
  academicYear?: string;
}) => {
  return httpClient.request("/exam/date-window", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// ─── Admin: Exam Requests ───────────────────────────────────

export const fetchExamRequests = (status?: string) => {
  const query = status ? `?status=${status}` : "";
  return httpClient.get(`/exam/requests${query}`);
};

export const approveExamRequest = (id: string) => {
  return httpClient.request(`/exam/requests/${id}/approve`, {
    method: "POST",
  });
};

export const rejectExamRequest = (id: string, reason: string) => {
  return httpClient.request(`/exam/requests/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
};

// ─── Shared: Exam Schedule ──────────────────────────────────

export const fetchExamScheduleFromDB = () => {
  return httpClient.get("/exam/schedule");
};

export const deleteScheduledExam = (id: string) => {
  return httpClient.request(`/exam/schedule/${id}`, {
    method: "DELETE",
  });
};

// ─── Faculty: Available Slots ───────────────────────────────

export const fetchAvailableSlots = (courseId: string) => {
  return httpClient.get(`/exam/available-slots?courseId=${courseId}`);
};

// ─── Faculty: Submit / View Requests ────────────────────────

export const submitExamRequest = (data: {
  courseId: string;
  examName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  venue: string;
}) => {
  return httpClient.request("/exam/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const fetchMyExamRequests = () => {
  return httpClient.get("/exam/my-requests");
};

// ─── Faculty: My Courses ────────────────────────────────────

export const fetchFacultyCourses = () => {
  return httpClient.get("/exam/faculty-courses");
};

// ─── Faculty: My Scheduled Exams ────────────────────────────

export const fetchMyScheduledExams = () => {
  return httpClient.get("/exam/my-schedule");
};

// ─── Admin: Cleanup ─────────────────────────────────────────

export const cleanupPastExams = () => {
  return httpClient.request("/exam/cleanup", {
    method: "DELETE",
  });
};
