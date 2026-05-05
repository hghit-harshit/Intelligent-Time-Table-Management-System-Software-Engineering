import { httpClient } from "./httpClient";

export const fetchTimetableLatest = async () => {
  const latest = await httpClient.get("/timetable/latest");
  if (latest) return latest;
  return httpClient.get("/timetable/latest-draft");
};

export const fetchRescheduleRequests = (facultyId) => {
  const query = facultyId ? `?professorId=${encodeURIComponent(facultyId)}` : "";
  return httpClient.get(`/requests${query}`);
};

export const createRescheduleRequest = (payload) => {
  return httpClient.request("/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const fetchProfessorCourses = () => {
  return httpClient.get("/requests/professor-courses");
};

export const fetchSlotConflicts = (courseId: string, currentDay: string, currentStartTime: string) => {
  const params = new URLSearchParams({ courseId, currentDay, currentStartTime });
  return httpClient.get(`/requests/slot-conflicts?${params}`);
};

export const fetchCatalogCourses = async () => {
  const response = await httpClient.get("/catalog/courses");
  return response?.data ?? response ?? [];
};

export const fetchCatalogProfessors = async () => {
  const response = await httpClient.get("/catalog/professors");
  return response?.data ?? response ?? [];
};

export const fetchClassReferences = (courseCode: string, day: string, startTime: string) => {
  const params = new URLSearchParams({ courseCode, day, startTime });
  return httpClient.get(`/references?${params.toString()}`);
};

export const fetchCourseSyllabus = (courseCode: string) => {
  const params = new URLSearchParams({ courseCode, kind: "syllabus" });
  return httpClient.get(`/references?${params.toString()}`);
};

export const createClassReference = (payload: {
  courseCode: string;
  day: string;
  startTime: string;
  title: string;
  url: string;
  kind?: string;
}) => {
  return httpClient.request("/references", {
    method: "POST",
    data: payload,
  });
};
