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
  TimetableLatestDraftEP,
  TimetableVersionsEP,
  TimetableVersionEP,
  TimetableDeleteVersionEP,
  BulkRescheduleEP,
  BulkRescheduleAvailableRoomsEP,
  BulkRescheduleRoomCoursesEP,
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
function buildEngineState(doc) {
  return {
    currentVersion: doc.version || "v1.0",
    status: doc.status || "draft",
    lastGenerated: doc.generatedAt,
    lastPublished: doc.publishedAt,
    constraintViolations: 0,
    totalSlotsFilled: doc.assignments?.length || 0,
    totalSlotsAvailable: 30,
    solverDuration: doc.stats?.solverDuration || null,
    generatedSchedule: [],
    latestAssignments: doc.assignments || [],
    latestStats: doc.stats,
    latestConstraints: doc.constraints,
  };
}

export async function fetchTimetableEngine() {
  try {
    // Try latest published first (isLatest: true)
    const latestResponse = await fetch(TimetableLatestEP + "?t=" + Date.now(), {
      headers: withAuthHeaders(),
      cache: "no-store",
    });
    if (latestResponse.ok) {
      const doc = await latestResponse.json();
      if (doc && doc.version && doc.assignments?.length > 0) return buildEngineState(doc);
    }
  } catch (_) {}

  try {
    // Fall back to most recently saved doc (draft or published) so page refresh restores data
    const draftResponse = await fetch(TimetableLatestDraftEP + "?t=" + Date.now(), {
      headers: withAuthHeaders(),
      cache: "no-store",
    });
    if (draftResponse.ok) {
      const doc = await draftResponse.json();
      if (doc && doc.version && doc.assignments?.length > 0) return buildEngineState(doc);
    }
  } catch (_) {}

  // Nothing in DB yet — return empty state
  await delay(100);
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
      version: `v${new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-")}`,
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
    // ok() returns the document directly
    if (data && data.version) return data;
    return null;
  } catch (error) {
    console.error("fetchLatestTimetable error:", error);
    return null;
  }
}

export async function deleteTimetableVersion(version: string) {
  try {
    const response = await fetch(TimetableDeleteVersionEP(version), {
      method: "DELETE",
      headers: withAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to delete version");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchTimetableByVersion(version: string) {
  try {
    const response = await fetch(TimetableVersionEP(version), {
      headers: withAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to fetch version");
    return data;
  } catch (error) {
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
    // Backend ok() returns the array directly (no wrapper)
    return Array.isArray(data) ? data : (data.data || data.result || []);
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

// ─── Bulk Rescheduling ──────────────────────────────────────
/**
 * Loads everything the Bulk Rescheduling page needs on mount:
 * - The latest published timetable (source of truth for current assignments)
 * - All rooms from the catalog (for BR-2 room picker)
 */
export async function fetchBulkRescheduleContext() {
  try {
    const [timetableRes, roomsRes] = await Promise.all([
      fetch(TimetableLatestEP + "?t=" + Date.now(), {
        headers: withAuthHeaders(),
        cache: "no-store",
      }),
      fetch(API_BASE_URL + "/catalog/rooms", { headers: withAuthHeaders() }),
    ]);

    const timetable = timetableRes.ok ? await timetableRes.json() : null;
    const roomsData = roomsRes.ok ? await roomsRes.json() : null;

    return {
      timetable: timetable || null,
      assignments: timetable?.assignments || [],
      rooms: roomsData?.data || [],
      sourceVersion: timetable?.version || null,
    };
  } catch (error) {
    console.error("fetchBulkRescheduleContext error:", error);
    return { timetable: null, assignments: [], rooms: [], sourceVersion: null };
  }
}

/**
 * BR-1: Returns rooms that are free at ALL time slots occupied by a course.
 * Backend computes this — frontend just shows the filtered list.
 */
export async function fetchAvailableRoomsForCourse(courseCode: string) {
  try {
    const res = await fetch(BulkRescheduleAvailableRoomsEP(courseCode), {
      headers: withAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to fetch available rooms");
    return data; // { availableRooms: Room[], courseSlots: Assignment[] }
  } catch (error: any) {
    return { availableRooms: [], courseSlots: [], error: error.message };
  }
}

/**
 * BR-2: Returns all assignments currently in a given room.
 */
export async function fetchCoursesInRoom(roomName: string) {
  try {
    const res = await fetch(BulkRescheduleRoomCoursesEP(roomName), {
      headers: withAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to fetch room courses");
    return data; // { assignments: Assignment[] }
  } catch (error: any) {
    return { assignments: [], error: error.message };
  }
}

export type BulkOperationType = "BR-1" | "BR-2" | "BR-4" | "BR-7";

export interface BulkReschedulePayload {
  operationType: BulkOperationType;
  sourceVersion: string;
  dryRun: boolean;
  reason?: string; // required when dryRun: false
  parameters: Record<string, any>;
}

export interface BulkChangeItem {
  courseCode: string;
  courseName: string;
  professorName: string;
  day: string;
  startTime: string;
  endTime: string;
  change: { field: string; from: string | null; to: string | null };
  conflict: { type: "blocking" | "warning"; description: string } | null;
}

export interface BulkPreviewResult {
  success: boolean;
  dryRun: true;
  affectedCount: number;
  changes: BulkChangeItem[];
  hasBlockingConflicts: boolean;
  message?: string;
}

export interface BulkApplyResult {
  success: boolean;
  dryRun: false;
  newVersion: string;
  affectedCount: number;
  message?: string;
}

/**
 * Step 1 — dryRun: true
 * Returns a full preview of what will change, with conflict annotations.
 * Does NOT write anything to the database.
 */
export async function previewBulkReschedule(
  payload: Omit<BulkReschedulePayload, "dryRun">
): Promise<BulkPreviewResult> {
  try {
    const res = await fetch(BulkRescheduleEP, {
      method: "POST",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...payload, dryRun: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Preview failed");
    return data;
  } catch (error: any) {
    return {
      success: false,
      dryRun: true,
      affectedCount: 0,
      changes: [],
      hasBlockingConflicts: true,
      message: error.message,
    };
  }
}

/**
 * Step 2 — dryRun: false
 * Clones the source version, applies the transformation, saves as a new draft.
 * Returns the new version string to display in the success CTA.
 */
export async function applyBulkReschedule(
  payload: BulkReschedulePayload & { dryRun: false; reason: string }
): Promise<BulkApplyResult> {
  try {
    const res = await fetch(BulkRescheduleEP, {
      method: "POST",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Apply failed");
    return data;
  } catch (error: any) {
    return {
      success: false,
      dryRun: false,
      newVersion: "",
      affectedCount: 0,
      message: error.message,
    };
  }
}
