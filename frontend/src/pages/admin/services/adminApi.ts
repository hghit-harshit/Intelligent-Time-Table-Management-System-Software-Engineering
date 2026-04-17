// @ts-nocheck
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
import { getRequests, updateStatus } from "../../../stores/reschedule.store";
import { API_BASE_URL } from "../../../config/constants";
import {
  SchedulerGenerateEP,
  SchedulerAssignClassroomsEP,
  TimetableSaveDraftEP,
  TimetablePublishEP,
  TimetableLatestEP,
  TimetableVersionsEP,
} from "../../../constants/Api_constants";
import { withAuthHeaders } from "../../../services/authInterceptor";

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
  try {
    // First try to get latest timetable (published)
    const latestResponse = await fetch(TimetableLatestEP + "?t=" + Date.now(), {
      headers: withAuthHeaders(),
      cache: "no-store",
    });
    
    if (latestResponse.ok) {
      const data = await latestResponse.json();
      const latest = data.result || data.data;
      
      if (latest && latest.assignments?.length > 0) {
        return {
          currentVersion: latest.version || "v1.0",
          status: latest.status || "draft",
          lastGenerated: latest.generatedAt,
          lastPublished: latest.publishedAt,
          constraintViolations: 0,
          totalSlotsFilled: latest.assignments.length,
          totalSlotsAvailable: 30,
          solverDuration: latest.stats?.solverDuration || null,
          generatedSchedule: [],
          latestAssignments: latest.assignments,
          latestStats: latest.stats,
          latestConstraints: latest.constraints,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching timetable engine:", error);
  }
  
  // Fallback to mock data if API fails
  await delay(300);
  return { ...timetableEngineState };
}

export async function generateTimetable(constraints = {}) {
  const endpoint = SchedulerGenerateEP;

  try {
    const startedAt = performance.now();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
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
  const endpoint = SchedulerAssignClassroomsEP;

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
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
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

export async function saveTimetableDraft(assignments, stats, constraints, version) {
  try {
    const response = await fetch(TimetableSaveDraftEP, {
      method: "POST",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ version, assignments, stats, constraints }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to save draft");
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function publishTimetable(versionId, assignments = []) {
  try {
    const response = await fetch(TimetablePublishEP, {
      method: "POST",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ version: versionId }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to publish timetable");
    }
    return { success: true, versionId, publishedAt: new Date().toISOString() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchLatestTimetable() {
  try {
    const response = await fetch(TimetableLatestEP + "?t=" + Date.now(), {
      headers: withAuthHeaders(),
      cache: "no-store",
    });

    const data = await response.json();
    console.log("Latest timetable response:", data);
    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch latest timetable");
    }
    // Handle different response formats: { result: {...}}, { data: {...}}, or direct object
    if (data.result) return data.result;
    if (data.data) return data.data;
    // Also check if the response itself IS the timetable (has version/assignments)
    if (data.version && data.assignments) return data;
    return null;
  } catch (error) {
    console.error("fetchLatestTimetable error:", error);
    return null;
  }
}

export async function fetchTimetableVersions() {
  try {
    const response = await fetch(TimetableVersionsEP, {
      headers: withAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch versions");
    }
    return data.data || [];
  } catch (error) {
    return [];
  }
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

// ─── Analytics ──────────────────────────────────────────────
export async function fetchAnalytics() {
  await delay(300);
  return { ...analyticsData };
}
