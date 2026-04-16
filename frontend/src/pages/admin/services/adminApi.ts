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
import { withAuthHeaders } from "../../../services/authInterceptor";

// Simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeNetworkError = (error, fallbackMessage) => {
  if (error instanceof TypeError) {
    return new Error(
      "Cannot reach backend API. Please ensure backend is running on port 5001.",
    );
  }
  return new Error(error?.message || fallbackMessage);
};

const fetchJsonOrThrow = async (url, options, fallbackMessage) => {
  try {
    const response = await fetch(url, options);
    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.message || fallbackMessage);
    }

    return data;
  } catch (error) {
    throw normalizeNetworkError(error, fallbackMessage);
  }
};

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

export async function fetchRuns() {
  const endpoint = `${API_BASE_URL}/runs`;
  const data = await fetchJsonOrThrow(
    endpoint,
    {
      headers: withAuthHeaders(),
    },
    "Failed to fetch runs",
  );

  return Array.isArray(data) ? data : [];
}

export async function fetchTimetableByRun(runId) {
  if (!runId) return { runId: "", slots: [] };
  const endpoint = `${API_BASE_URL}/timetable/${runId}`;
  return fetchJsonOrThrow(
    endpoint,
    {
      headers: withAuthHeaders(),
    },
    "Failed to fetch timetable",
  );
}

export async function fetchRunViolations(runId) {
  if (!runId) return { runId: "", constraints: [], totalViolations: 0 };
  const endpoint = `${API_BASE_URL}/timetable/${runId}/violations`;
  return fetchJsonOrThrow(
    endpoint,
    {
      headers: withAuthHeaders(),
    },
    "Failed to fetch violation summary",
  );
}

export async function toggleAssignmentLock(runId, assignmentId, locked) {
  const endpoint = `${API_BASE_URL}/runs/${runId}/assignments/${assignmentId}/lock`;
  return fetchJsonOrThrow(
    endpoint,
    {
      method: "PATCH",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ locked }),
    },
    "Failed to update lock state",
  );
}

export async function generateTimetable(constraints = {}) {
  const endpoint = `${API_BASE_URL}/scheduler/generate`;

  try {
    const startedAt = performance.now();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ constraints }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = new Error(data?.message || "Failed to generate timetable");
      (error as any).statusCode = response.status;
      throw error;
    }

    const durationMs = performance.now() - startedAt;
    return {
      success: true,
      runId: data.runId || null,
      version: `v${new Date().toISOString().slice(0, 10)}`,
      conflicts: data.totalSoftViolations || 0,
      duration: `${(durationMs / 1000).toFixed(2)}s`,
      assignments: data.assignments || [],
      stats: data.stats || {
        objectiveValue: data.objectiveValue ?? null,
      },
      constraints: data.constraints || constraints,
    };
  } catch (error) {
    const statusCode = error?.statusCode ?? null;
    const normalizedError = normalizeNetworkError(
      error,
      "Failed to generate timetable",
    );
    const isBackendDown = /cannot reach backend api/i.test(
      normalizedError.message,
    );

    const message =
      statusCode === 422
        ? "No feasible solution found. Adjust constraints and retry."
        : isBackendDown
          ? normalizedError.message
          : `Timetable generation failed: ${normalizedError.message}`;

    return {
      success: false,
      runId: null,
      version: null,
      conflicts: 0,
      duration: null,
      assignments: [],
      stats: null,
      statusCode,
      constraints,
      warning: message,
    };
  }
}

export async function assignClassrooms(slotAssignments = []) {
  const endpoint = `${API_BASE_URL}/scheduler/assign-classrooms`;

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

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

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
    const normalizedError = normalizeNetworkError(
      error,
      "Failed to assign classrooms",
    );

    return {
      success: false,
      message: `Classroom assignment failed: ${normalizedError.message}`,
      assignments: [],
      warning: normalizedError.message,
    };
  }
}

export async function publishTimetable(runId) {
  if (!runId) {
    return {
      success: false,
      runId: null,
      warning: "Run id is required to publish",
    };
  }

  const endpoint = `${API_BASE_URL}/runs/${runId}/publish`;
  try {
    const data = await fetchJsonOrThrow(
      endpoint,
      {
        method: "POST",
        headers: withAuthHeaders(),
      },
      "Failed to publish run",
    );

    return {
      success: true,
      runId: data?.runId || runId,
      status: data?.status || "published",
      publishedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      runId,
      warning: error?.message || "Failed to publish run",
    };
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
