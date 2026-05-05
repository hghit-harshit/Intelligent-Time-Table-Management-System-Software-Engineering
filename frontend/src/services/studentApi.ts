import { httpClient } from "./httpClient";

export const fetchStudentDashboard = (weekDate?: string) => {
  const url = weekDate ? `/student/dashboard?weekDate=${weekDate}` : "/student/dashboard";
  return httpClient.get(url);
};

export const fetchStudentCourses = () => {
  return httpClient.get("/student/courses");
};

export const fetchStudentExams = () => {
  return httpClient.get("/student/exams");
};

export const fetchStudentNotifications = () => {
  return httpClient.get("/student/notifications");
};

export const markStudentNotificationRead = (id) => {
  return httpClient.request(`/student/notifications/${id}/read`, {
    method: "PATCH",
  });
};

export const deleteStudentNotification = (id) => {
  return httpClient.request(`/student/notifications/${id}`, {
    method: "DELETE",
  });
};

export const fetchNotificationUnreadCount = () => {
  return httpClient.get("/student/notifications/unread-count");
};

// ── Notes (Google Docs) ───────────────────────────────────────────────

export const createStudentNote = (courseCode: string, classDate: string, sessionId = "") => {
  return httpClient.request("/student/notes/create", {
    method: "POST",
    data: { courseCode, classDate, sessionId },
  });
};

export const fetchNotesByCourse = (courseCode: string) => {
  return httpClient.get(`/student/notes/${encodeURIComponent(courseCode)}`);
};

export const checkStudentNote = (courseCode: string, classDate: string) => {
  return httpClient.get(
    `/student/notes/check?courseCode=${encodeURIComponent(courseCode)}&classDate=${encodeURIComponent(classDate)}`
  );
};

// ── Tasks ─────────────────────────────────────────────────────────────

export const fetchStudentTasks = () => {
  return httpClient.get("/student/tasks");
};

export const createStudentTask = (task: {
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  reminder?: boolean;
  reminderMinutes?: number;
}) => {
  return httpClient.request("/student/tasks", { method: "POST", data: task });
};

export const updateStudentTask = (id: string, patch: Record<string, unknown>) => {
  return httpClient.request(`/student/tasks/${id}`, { method: "PATCH", data: patch });
};

export const deleteStudentTask = (id: string) => {
  return httpClient.request(`/student/tasks/${id}`, { method: "DELETE" });
};

// ── Timetable Metadata ────────────────────────────────────────────────

export const fetchTimetablePublishedAt = () => {
  return httpClient.get("/timetable/published-at");
};

export const fetchProfessorClassReferences = (courseCode: string, day: string, startTime: string) => {
  const params = new URLSearchParams({ courseCode, day, startTime });
  return httpClient.get(`/references?${params.toString()}`);
};

export const fetchCourseSyllabusReference = (courseCode: string) => {
  const params = new URLSearchParams({ courseCode, kind: "syllabus" });
  return httpClient.get(`/references?${params.toString()}`);
};
