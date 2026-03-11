// ============================================================
// Reschedule Request Store — localStorage-based shared storage
// Used by both faculty (to submit) and admin (to review)
// ============================================================

const STORAGE_KEY = "disha_reschedule_requests"

/** Seed data so the admin page isn't empty on first load */
const seedRequests = [
  {
    id: "r1",
    facultyName: "Dr. Mehta",
    facultyDept: "CSE",
    course: "Data Structures & Algorithms",
    courseCode: "CS201",
    currentSlot: { day: "Monday", time: "9:00 AM", room: "LHC-2" },
    requestedSlot: { day: "Wednesday", time: "11:00 AM", room: "LHC-2" },
    reason: "Conference travel on Monday",
    status: "pending",
    conflictStatus: "No conflicts",
    createdAt: "2025-03-10T08:30:00Z",
  },
  {
    id: "r2",
    facultyName: "Dr. Singh",
    facultyDept: "ECE",
    course: "Digital Circuits",
    courseCode: "EC301",
    currentSlot: { day: "Tuesday", time: "9:00 AM", room: "LHC-5" },
    requestedSlot: { day: "Thursday", time: "2:00 PM", room: "LHC-5" },
    reason: "Lab equipment maintenance on Tuesday AM",
    status: "pending",
    conflictStatus: "Room conflict",
    createdAt: "2025-03-10T10:15:00Z",
  },
  {
    id: "r3",
    facultyName: "Dr. Patel",
    facultyDept: "ECE",
    course: "VLSI Design",
    courseCode: "EC401",
    currentSlot: { day: "Tuesday", time: "2:00 PM", room: "F-102" },
    requestedSlot: { day: "Thursday", time: "3:00 PM", room: "F-102" },
    reason: "Department committee meeting",
    status: "approved",
    conflictStatus: "No conflicts",
    createdAt: "2025-03-08T11:30:00Z",
  },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupted — reset */ }
  // First visit: seed with demo data
  save(seedRequests)
  return seedRequests
}

function save(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
}

/** Get all requests (optionally filter by status) */
export function getRequests(statusFilter) {
  const all = load()
  if (!statusFilter || statusFilter === "all") return all
  return all.filter((r) => r.status === statusFilter)
}

/** Add a new reschedule request (called by faculty) */
export function addRequest({ facultyName, facultyDept, course, courseCode, currentSlot, requestedSlot, reason }) {
  const all = load()
  const newReq = {
    id: "r" + Date.now(),
    facultyName,
    facultyDept: facultyDept || "ECE",
    course: course || "—",
    courseCode: courseCode || "—",
    currentSlot,
    requestedSlot,
    reason,
    status: "pending",
    conflictStatus: "No conflicts",
    createdAt: new Date().toISOString(),
  }
  all.unshift(newReq)
  save(all)
  return newReq
}

/** Update the status of a request (called by admin) */
export function updateStatus(requestId, newStatus) {
  const all = load()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx === -1) return null
  all[idx].status = newStatus
  save(all)
  return all[idx]
}
