// ============================================================
// ADMIN API SERVICE — Mock API layer with simulated latency
// Replace with real axios calls when backend is ready
// ============================================================

import {
  dashboardMetrics,
  systemAlerts,
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
import { getRequests, updateStatus } from "../../../data/rescheduleStore";

// Simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Dashboard ──────────────────────────────────────────────
export async function fetchDashboard() {
  await delay(200);
  const allRequests = getRequests();
  return {
    metrics: dashboardMetrics,
    alerts: systemAlerts,
    recentActivity: activityFeed,
    pendingRequests: allRequests.filter((r) => r.status === "pending"),
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
  return getRequests();
}

export async function updateRequestStatus(requestId, status) {
  await delay(400);
  updateStatus(requestId, status);
  return { success: true, requestId, status };
}

// ─── Timetable Engine ───────────────────────────────────────
export async function fetchTimetableEngine() {
  await delay(300);
  return { ...timetableEngineState };
}

export async function generateTimetable(constraints = {}) {
  const endpoint = "http://localhost:5001/api/scheduler/generate";

  try {
    const startedAt = performance.now();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ constraints }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to generate timetable");
    }

    const durationMs = performance.now() - startedAt;
    return {
      success: true,
      version: `v${new Date().toISOString().slice(0, 10)}`,
      conflicts:
        data.assignments?.filter(
          (item) =>
            item.softViolations?.sc1_unavailable_slot_violated ||
            item.softViolations?.sc2_preferred_day_off_violated,
        ).length || 0,
      duration: `${(durationMs / 1000).toFixed(2)}s`,
      assignments: data.assignments || [],
      stats: data.stats || null,
      constraints: data.constraints || constraints,
    };
  } catch (error) {
    return {
      success: false,
      version: null,
      conflicts: 0,
      duration: null,
      assignments: [],
      stats: null,
      constraints,
      warning: `Timetable generation failed: ${error.message}`,
    };
  }
}

export async function assignClassrooms(slotAssignments = []) {
  const endpoint = "http://localhost:5001/api/scheduler/assign-classrooms";

  try {
    if (!slotAssignments || slotAssignments.length === 0) {
      return {
        success: false,
        message: "No slot assignments provided",
        assignments: [],
      };
    }

    const startedAt = performance.now();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignments: slotAssignments }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to assign classrooms");
    }

    const durationMs = performance.now() - startedAt;
    return {
      success: true,
      duration: `${(durationMs / 1000).toFixed(2)}s`,
      assignments: data.assignments || [],
    };
  } catch (error) {
    return {
      success: false,
      message: `Classroom assignment failed: ${error.message}`,
      assignments: [],
      warning: error.message,
    };
  }
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
