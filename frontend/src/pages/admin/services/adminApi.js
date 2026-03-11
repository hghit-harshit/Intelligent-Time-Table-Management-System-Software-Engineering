// ============================================================
// ADMIN API SERVICE — Mock API layer with simulated latency
// Replace with real axios calls when backend is ready
// ============================================================

import {
  dashboardMetrics,
  systemAlerts,
  rescheduleRequests,
  activityFeed,
  conflicts,
  courses,
  faculty,
  rooms,
  timeSlots,
  timetableEngineState,
  examSchedule,
  timetableVersions,
  analyticsData,
} from "../../../data/adminMockData";

// Simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Dashboard ──────────────────────────────────────────────
export async function fetchDashboard() {
  await delay(200);
  return {
    metrics: dashboardMetrics,
    alerts: systemAlerts,
    recentActivity: activityFeed,
    pendingRequests: rescheduleRequests.filter((r) => r.status === "pending"),
  };
}

// ─── Conflicts ──────────────────────────────────────────────
export async function fetchConflicts() {
  await delay(250);
  return [...conflicts];
}

export async function resolveConflict(conflictId, action) {
  await delay(400);
  return { success: true, conflictId, action };
}

// ─── Reschedule Requests ────────────────────────────────────
export async function fetchRescheduleRequests() {
  await delay(200);
  return [...rescheduleRequests];
}

export async function updateRequestStatus(requestId, status) {
  await delay(400);
  return { success: true, requestId, status };
}

// ─── Timetable Engine ───────────────────────────────────────
export async function fetchTimetableEngine() {
  await delay(300);
  return { ...timetableEngineState };
}

export async function generateTimetable() {
  await delay(2000); // Simulate solver time
  return {
    success: true,
    version: "v2.6",
    conflicts: 2,
    duration: "2.1s",
  };
}

export async function publishTimetable(versionId) {
  await delay(800);
  return { success: true, versionId, publishedAt: new Date().toISOString() };
}

// ─── Academic Structure ─────────────────────────────────────
export async function fetchCourses() {
  await delay(200);
  return [...courses];
}

export async function fetchFaculty() {
  await delay(200);
  return [...faculty];
}

export async function fetchRooms() {
  await delay(200);
  return [...rooms];
}

export async function fetchTimeSlots() {
  await delay(200);
  return [...timeSlots];
}

// ─── Exams ──────────────────────────────────────────────────
export async function fetchExamSchedule() {
  await delay(250);
  return [...examSchedule];
}

// ─── Versions ───────────────────────────────────────────────
export async function fetchTimetableVersions() {
  await delay(200);
  return [...timetableVersions];
}

// ─── Analytics ──────────────────────────────────────────────
export async function fetchAnalytics() {
  await delay(300);
  return { ...analyticsData };
}
