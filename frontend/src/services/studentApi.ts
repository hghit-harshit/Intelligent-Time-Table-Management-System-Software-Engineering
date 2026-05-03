import { httpClient } from "./httpClient";

export const fetchStudentDashboard = () => {
  return httpClient.get("/student/dashboard");
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
  return httpClient.request(`/student/notifications/${id}`,
    {
      method: "DELETE",
    });
};

export const fetchNotificationUnreadCount = () => {
  return httpClient.get("/student/notifications/unread-count");
};
