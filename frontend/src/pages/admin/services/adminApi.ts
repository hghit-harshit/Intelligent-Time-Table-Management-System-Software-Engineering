// @ts-nocheck
// ============================================================
// ADMIN API SERVICE — Connected to MongoDB backend
// ============================================================

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
import { httpClient } from "../../../services/httpClient";

// ─── Helpers ────────────────────────────────────────────────

/**
 * Normalize a reschedule request from the MongoDB schema
 * into the shape the admin UI components expect.
 * professorId / courseId are populated by the backend repository.
 */
function normalizeRequest(raw) {
  const currentSlot = raw.currentSlot || {};
  const requestedSlot = raw.requestedSlot || {};

  const professor =
    raw.professorId && typeof raw.professorId === "object"
      ? raw.professorId
      : null;
  const course =
    raw.courseId && typeof raw.courseId === "object" ? raw.courseId : null;

  return {
    id: raw._id || raw.id,
    facultyName: professor?.name || "Faculty Member",
    facultyDept: professor?.department || "—",
    course: course?.name || "—",
    courseCode: course?.code || "—",
    currentSlot: {
      day: currentSlot.day || "—",
      time: currentSlot.time || "—",
      room: currentSlot.room || "—",
    },
    requestedSlot: {
      day: requestedSlot.day || "—",
      time: requestedSlot.time || "—",
      room: requestedSlot.room || "—",
    },
    reason: raw.reason || "",
    status: raw.status || "pending",
    conflictStatus: raw.conflictStatus || "No conflicts",
    createdAt: raw.createdAt,
  };
}

// ─── Dashboard ──────────────────────────────────────────────
export async function fetchDashboard() {
  // Fetch real data from multiple endpoints in parallel
  const [coursesData, roomsData, requestsRaw, timetable] = await Promise.all([
    httpClient.get("/catalog/courses").catch(() => ({ data: [] })),
    httpClient.get("/catalog/rooms").catch(() => ({ data: [] })),
    httpClient.get("/requests").catch(() => []),
    httpClient.get("/timetable/latest").catch(() => null),
  ]);

  const coursesList = coursesData?.data ?? coursesData ?? [];
  const roomsList = roomsData?.data ?? roomsData ?? [];
  const allRequests = (Array.isArray(requestsRaw) ? requestsRaw : []).map(
    normalizeRequest
  );
  const pendingRequests = allRequests.filter((r) => r.status === "pending");

  const timetableStatus = timetable?.status || "No timetable";
  const publishedAt = timetable?.publishedAt
    ? new Date(timetable.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Never";

  return {
    metrics: {
      activeCourses: {
        value: Array.isArray(coursesList) ? coursesList.length : 0,
        trend: "from database",
        trendDirection: "neutral",
      },
      roomsAvailable: {
        value: Array.isArray(roomsList) ? roomsList.length : 0,
        trend: "total rooms",
        trendDirection: "neutral",
      },
      pendingRequests: {
        value: pendingRequests.length,
        trend: `${allRequests.length} total`,
        trendDirection: pendingRequests.length > 0 ? "up" : "neutral",
      },
      detectedConflicts: {
        value: 0,
        trend: "—",
        trendDirection: "neutral",
      },
      timetableStatus: {
        value: timetableStatus.charAt(0).toUpperCase() + timetableStatus.slice(1),
        trend: `Last published: ${publishedAt}`,
        trendDirection: "neutral",
      },
    },
    alerts: [],
    recentActivity: [],
    pendingRequests,
  };
}

// ─── Conflicts ──────────────────────────────────────────────
// NOTE: No dedicated conflict backend exists yet.
// Return empty array so the page doesn't break; this can be wired up later.
export async function fetchConflicts() {
  return [];
}

export async function resolveConflict(conflictId, action) {
  return { success: true, conflictId, action };
}

// ─── Reschedule Requests ────────────────────────────────────
export async function fetchRescheduleRequests() {
  const data = await httpClient.get("/requests");
  const items = Array.isArray(data) ? data : [];
  return items.map(normalizeRequest);
}

export async function updateRequestStatus(requestId, status) {
  const action = status === "approved" ? "approve" : "reject";
  await httpClient.request(`/requests/${requestId}/${action}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
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

const emptyEngineState = {
  currentVersion: "v1.0",
  status: "draft",
  lastGenerated: null,
  lastPublished: null,
  constraintViolations: 0,
  totalSlotsFilled: 0,
  totalSlotsAvailable: 30,
  solverDuration: null,
  generatedSchedule: [],
  latestAssignments: [],
  latestStats: null,
  latestConstraints: null,
};

export async function fetchTimetableEngine() {
  try {
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
    const draftResponse = await fetch(TimetableLatestDraftEP + "?t=" + Date.now(), {
      headers: withAuthHeaders(),
      cache: "no-store",
    });
    if (draftResponse.ok) {
      const doc = await draftResponse.json();
      if (doc && doc.version && doc.assignments?.length > 0) return buildEngineState(doc);
    }
  } catch (_) {}

  return { ...emptyEngineState };
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

// ─── Academic Structure (now from MongoDB) ──────────────────
export async function fetchCourses() {
  const response = await httpClient.get("/catalog/courses");
  const items = response?.data ?? response ?? [];
  // Adapt MongoDB course shape → admin table shape
  return (Array.isArray(items) ? items : []).map((c) => ({
    id: c.code || c._id,
    name: c.name || "—",
    department: c.department || "—",
    credits: c.credits ?? 0,
    faculty: c.professorIds?.length
      ? `${c.professorIds.length} assigned`
      : "—",
    semester: c.segmentName || "—",
    students: c.students ?? 0,
    status: "active",
  }));
}

export async function fetchFaculty() {
  const response = await httpClient.get("/catalog/professors");
  const items = response?.data ?? response ?? [];
  return (Array.isArray(items) ? items : []).map((p) => ({
    id: p._id,
    name: p.name || "—",
    department: p.department || "—",
    designation: p.designation || "Professor",
    courses: p.courseMappings || [],
    email: p.email || "—",
    maxSlots: p.maxSlots ?? 5,
    currentSlots: p.courseMappings?.length ?? 0,
    status: "active",
  }));
}

export async function fetchRooms() {
  const response = await httpClient.get("/catalog/rooms");
  const items = response?.data ?? response ?? [];
  return (Array.isArray(items) ? items : []).map((r) => ({
    id: r._id,
    name: r.name || "—",
    capacity: r.capacity ?? 0,
    type: r.type || "Classroom",
    building: r.building || "—",
    floor: r.floor ?? 1,
    equipment: r.equipment || [],
    status: r.status || "available",
  }));
}

export async function fetchTimeSlots() {
  // Time slots are loaded from the Slot collection via the dedicated service
  // (timeSlots.service.ts). Return empty so the shared page can fall through
  // to fetchTimeSlotsFromApi().
  return [];
}

// ─── Exams ──────────────────────────────────────────────────
// NOTE: No dedicated exam schedule backend exists yet. Return empty.
export async function fetchExamSchedule() {
  return [];
}

// ─── Analytics ──────────────────────────────────────────────
// Compute basic analytics from real data rather than hardcoded mock
export async function fetchAnalytics() {
  const [roomsData, professorsData, requestsRaw] = await Promise.all([
    httpClient.get("/catalog/rooms").catch(() => ({ data: [] })),
    httpClient.get("/catalog/professors").catch(() => ({ data: [] })),
    httpClient.get("/requests").catch(() => []),
  ]);

  const rooms = roomsData?.data ?? roomsData ?? [];
  const professors = professorsData?.data ?? professorsData ?? [];
  const requests = Array.isArray(requestsRaw) ? requestsRaw : [];

  return {
    roomUtilization: (Array.isArray(rooms) ? rooms : []).map((r) => ({
      room: r.name || "—",
      utilization: Math.floor(Math.random() * 60 + 20), // placeholder until real usage data
    })),
    facultyLoad: (Array.isArray(professors) ? professors : []).map((p) => ({
      name: p.name || "—",
      load: Math.floor(
        ((p.courseMappings?.length ?? 0) / (p.maxSlots ?? 5)) * 100
      ),
    })),
    weeklyRequestTrend: buildWeeklyTrend(requests),
    conflictsByType: [
      { type: "Room", count: 0 },
      { type: "Faculty", count: 0 },
      { type: "Student", count: 0 },
      { type: "Exam", count: 0 },
    ],
  };
}

function buildWeeklyTrend(requests) {
  // Group requests by ISO week for the last 6 weeks
  const now = new Date();
  const weeks = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const count = requests.filter((r) => {
      const d = new Date(r.createdAt);
      return d >= start && d < end;
    }).length;
    weeks.push({ week: `W${6 - i}`, count });
  }
  return weeks;
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
