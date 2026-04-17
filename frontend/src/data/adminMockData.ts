// ============================================================
// MOCK DATA — Simulates backend responses for the Admin Dashboard
// Replace with real API calls when backend is ready
// ============================================================

// ─── Dashboard Metrics ──────────────────────────────────────
export const dashboardMetrics = {
  activeCourses: { value: 42, trend: "+3 this semester", trendDirection: "up" },
  roomsAvailable: { value: 18, trend: "of 24 total", trendDirection: "neutral" },
  pendingRequests: { value: 7, trend: "+2 today", trendDirection: "up" },
  detectedConflicts: { value: 3, trend: "−1 from yesterday", trendDirection: "down" },
  timetableStatus: { value: "Draft", trend: "Last published: Mar 2", trendDirection: "neutral" },
};

// ─── System Alerts ──────────────────────────────────────────
export const systemAlerts = [
  {
    id: "a1",
    severity: "critical",
    title: "Room Conflict: LHC-2",
    description: "Double booking on Wed 10:00 AM — Data Structures & Mathematics III",
    timestamp: "2 min ago",
  },
  {
    id: "a2",
    severity: "critical",
    title: "Faculty Overload: Dr. Kumar",
    description: "6 consecutive slots on Thursday — exceeds 4-slot limit",
    timestamp: "15 min ago",
  },
  {
    id: "a3",
    severity: "warning",
    title: "Exam Conflict Detected",
    description: "Digital Circuits & Signals exams overlap for ECE Section A",
    timestamp: "1 hr ago",
  },
  {
    id: "a4",
    severity: "warning",
    title: "Room Capacity Warning",
    description: "F-102 assigned 65 students but capacity is 50",
    timestamp: "2 hrs ago",
  },
  {
    id: "a5",
    severity: "healthy",
    title: "Backup Completed",
    description: "Timetable snapshot v2.4 saved successfully",
    timestamp: "3 hrs ago",
  },
];

// ─── Reschedule Requests ────────────────────────────────────
export const rescheduleRequests = [
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
    facultyName: "Dr. Rajan",
    facultyDept: "CSE",
    course: "Computer Networks Lab",
    courseCode: "CS305",
    currentSlot: { day: "Monday", time: "9:00 AM", room: "Lab-3" },
    requestedSlot: { day: "Friday", time: "10:00 AM", room: "Lab-3" },
    reason: "Research deadline overlap",
    status: "pending",
    conflictStatus: "No conflicts",
    createdAt: "2025-03-09T14:00:00Z",
  },
  {
    id: "r4",
    facultyName: "Dr. Rao",
    facultyDept: "MATH",
    course: "Mathematics III",
    courseCode: "MA201",
    currentSlot: { day: "Wednesday", time: "10:00 AM", room: "LHC-1" },
    requestedSlot: { day: "Wednesday", time: "2:00 PM", room: "LHC-1" },
    reason: "Medical appointment in the morning",
    status: "pending",
    conflictStatus: "No conflicts",
    createdAt: "2025-03-09T09:45:00Z",
  },
  {
    id: "r5",
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
  {
    id: "r6",
    facultyName: "Dr. Kumar",
    facultyDept: "ECE",
    course: "Signals & Systems",
    courseCode: "EC201",
    currentSlot: { day: "Thursday", time: "11:00 AM", room: "A-301" },
    requestedSlot: { day: "Monday", time: "11:00 AM", room: "A-301" },
    reason: "Personal emergency",
    status: "rejected",
    conflictStatus: "Faculty conflict",
    createdAt: "2025-03-07T16:20:00Z",
  },
  {
    id: "r7",
    facultyName: "Dr. Gupta",
    facultyDept: "ME",
    course: "Thermodynamics",
    courseCode: "ME201",
    currentSlot: { day: "Friday", time: "9:00 AM", room: "LHC-3" },
    requestedSlot: { day: "Friday", time: "11:00 AM", room: "LHC-3" },
    reason: "Lab session rescheduled by department",
    status: "pending",
    conflictStatus: "No conflicts",
    createdAt: "2025-03-10T12:00:00Z",
  },
];

// ─── Activity Feed ──────────────────────────────────────────
export const activityFeed = [
  {
    id: "act1",
    type: "request",
    message: "Dr. Mehta submitted a reschedule request for Data Structures",
    timestamp: "5 min ago",
    icon: "📝",
  },
  {
    id: "act2",
    type: "system",
    message: "Timetable draft v2.5 auto-saved",
    timestamp: "12 min ago",
    icon: "💾",
  },
  {
    id: "act3",
    type: "admin",
    message: "Admin updated room capacity for F-102 (50 → 65)",
    timestamp: "1 hr ago",
    icon: "🏫",
  },
  {
    id: "act4",
    type: "solver",
    message: "Constraint solver completed — 3 conflicts found",
    timestamp: "2 hrs ago",
    icon: "⚙️",
  },
  {
    id: "act5",
    type: "publish",
    message: "Timetable v2.3 published for ECE Section A",
    timestamp: "1 day ago",
    icon: "🚀",
  },
  {
    id: "act6",
    type: "request",
    message: "Dr. Singh requested slot change for Digital Circuits",
    timestamp: "1 day ago",
    icon: "📝",
  },
  {
    id: "act7",
    type: "admin",
    message: "New course added: Machine Learning (CS501)",
    timestamp: "2 days ago",
    icon: "📚",
  },
];

// ─── Conflicts ──────────────────────────────────────────────
export const conflicts = [
  {
    id: "c1",
    type: "Room Conflict",
    severity: "critical",
    course1: "Data Structures (CS201)",
    course2: "Mathematics III (MA201)",
    room: "LHC-2",
    slot: "Wed 10:00 AM",
    suggestedFix: "Move MA201 to LHC-1 (available)",
    status: "unresolved",
  },
  {
    id: "c2",
    type: "Faculty Overload",
    severity: "critical",
    course1: "Signals & Systems (EC201)",
    course2: "—",
    room: "A-301",
    slot: "Thu 8:00–3:00 PM",
    suggestedFix: "Split Dr. Kumar's Thursday load across Mon/Thu",
    status: "unresolved",
  },
  {
    id: "c3",
    type: "Student Overlap",
    severity: "warning",
    course1: "Digital Circuits (EC301)",
    course2: "VLSI Design (EC401)",
    room: "LHC-5 / F-102",
    slot: "Tue 2:00 PM",
    suggestedFix: "Move EC401 to Tue 3:00 PM",
    status: "unresolved",
  },
  {
    id: "c4",
    type: "Room Capacity",
    severity: "warning",
    course1: "VLSI Design (EC401)",
    course2: "—",
    room: "F-102",
    slot: "Multiple",
    suggestedFix: "Reassign to LHC-3 (capacity: 80)",
    status: "unresolved",
  },
  {
    id: "c5",
    type: "Exam Overlap",
    severity: "critical",
    course1: "Digital Circuits Exam",
    course2: "Signals & Systems Exam",
    room: "Exam Hall-1",
    slot: "Mar 27, 9:00 AM",
    suggestedFix: "Move S&S exam to Mar 28",
    status: "unresolved",
  },
];

// ─── Courses ────────────────────────────────────────────────
export const courses = [
  { id: "CS201", name: "Data Structures & Algorithms", department: "CSE", credits: 4, faculty: "Dr. Mehta", semester: 3, students: 45, status: "active" },
  { id: "EC301", name: "Digital Circuits", department: "ECE", credits: 3, faculty: "Dr. Singh", semester: 5, students: 38, status: "active" },
  { id: "CS305", name: "Computer Networks Lab", department: "CSE", credits: 2, faculty: "Dr. Rajan", semester: 5, students: 30, status: "active" },
  { id: "MA201", name: "Mathematics III", department: "MATH", credits: 4, faculty: "Dr. Rao", semester: 3, students: 60, status: "active" },
  { id: "EC201", name: "Signals & Systems", department: "ECE", credits: 3, faculty: "Dr. Kumar", semester: 3, students: 42, status: "active" },
  { id: "EC401", name: "VLSI Design", department: "ECE", credits: 3, faculty: "Dr. Patel", semester: 7, students: 35, status: "active" },
  { id: "ME201", name: "Thermodynamics", department: "ME", credits: 4, faculty: "Dr. Gupta", semester: 3, students: 55, status: "active" },
  { id: "CS501", name: "Machine Learning", department: "CSE", credits: 3, faculty: "Dr. Iyer", semester: 7, students: 40, status: "draft" },
  { id: "PH101", name: "Physics I", department: "PHY", credits: 3, faculty: "Dr. Sharma", semester: 1, students: 120, status: "active" },
  { id: "HS201", name: "Economics", department: "HSS", credits: 2, faculty: "Dr. Verma", semester: 3, students: 90, status: "active" },
];

// ─── Faculty ────────────────────────────────────────────────
export const faculty = [
  { id: "F001", name: "Dr. Mehta", department: "CSE", designation: "Associate Professor", courses: ["CS201"], email: "mehta@iith.ac.in", maxSlots: 5, currentSlots: 4, status: "active" },
  { id: "F002", name: "Dr. Singh", department: "ECE", designation: "Professor", courses: ["EC301"], email: "singh@iith.ac.in", maxSlots: 4, currentSlots: 3, status: "active" },
  { id: "F003", name: "Dr. Rajan", department: "CSE", designation: "Assistant Professor", courses: ["CS305"], email: "rajan@iith.ac.in", maxSlots: 5, currentSlots: 2, status: "active" },
  { id: "F004", name: "Dr. Rao", department: "MATH", designation: "Professor", courses: ["MA201"], email: "rao@iith.ac.in", maxSlots: 5, currentSlots: 4, status: "active" },
  { id: "F005", name: "Dr. Kumar", department: "ECE", designation: "Associate Professor", courses: ["EC201"], email: "kumar@iith.ac.in", maxSlots: 4, currentSlots: 6, status: "overloaded" },
  { id: "F006", name: "Dr. Patel", department: "ECE", designation: "Assistant Professor", courses: ["EC401"], email: "patel@iith.ac.in", maxSlots: 4, currentSlots: 3, status: "active" },
  { id: "F007", name: "Dr. Gupta", department: "ME", designation: "Professor", courses: ["ME201"], email: "gupta@iith.ac.in", maxSlots: 5, currentSlots: 4, status: "active" },
  { id: "F008", name: "Dr. Iyer", department: "CSE", designation: "Assistant Professor", courses: ["CS501"], email: "iyer@iith.ac.in", maxSlots: 5, currentSlots: 1, status: "active" },
];

// ─── Rooms ──────────────────────────────────────────────────
export const rooms = [
  { id: "R001", name: "LHC-1", capacity: 80, type: "Lecture Hall", building: "LHC", floor: 1, equipment: ["Projector", "AC", "Mic"], status: "available" },
  { id: "R002", name: "LHC-2", capacity: 60, type: "Lecture Hall", building: "LHC", floor: 1, equipment: ["Projector", "AC"], status: "occupied" },
  { id: "R003", name: "LHC-3", capacity: 80, type: "Lecture Hall", building: "LHC", floor: 1, equipment: ["Projector", "AC", "Mic"], status: "available" },
  { id: "R004", name: "LHC-5", capacity: 50, type: "Lecture Hall", building: "LHC", floor: 2, equipment: ["Projector", "AC"], status: "occupied" },
  { id: "R005", name: "A-301", capacity: 45, type: "Classroom", building: "Academic Block A", floor: 3, equipment: ["Projector"], status: "available" },
  { id: "R006", name: "F-102", capacity: 50, type: "Classroom", building: "Academic Block F", floor: 1, equipment: ["Projector", "AC"], status: "maintenance" },
  { id: "R007", name: "Lab-3", capacity: 30, type: "Computer Lab", building: "Lab Complex", floor: 1, equipment: ["Computers", "Projector", "AC"], status: "occupied" },
  { id: "R008", name: "Lab-5", capacity: 25, type: "Computer Lab", building: "Lab Complex", floor: 2, equipment: ["Computers", "Projector"], status: "available" },
  { id: "R009", name: "Exam Hall-1", capacity: 200, type: "Exam Hall", building: "Exam Block", floor: 1, equipment: ["CCTV", "AC", "Mic"], status: "available" },
  { id: "R010", name: "Exam Hall-2", capacity: 150, type: "Exam Hall", building: "Exam Block", floor: 1, equipment: ["CCTV", "AC"], status: "available" },
];

// ─── Time Slots ─────────────────────────────────────────────
export const timeSlots = [
  { id: "TS01", label: "Slot A", startTime: "8:00 AM", endTime: "8:55 AM", day: "Mon–Fri", type: "Lecture" },
  { id: "TS02", label: "Slot B", startTime: "9:00 AM", endTime: "9:55 AM", day: "Mon–Fri", type: "Lecture" },
  { id: "TS03", label: "Slot C", startTime: "10:00 AM", endTime: "10:55 AM", day: "Mon–Fri", type: "Lecture" },
  { id: "TS04", label: "Slot D", startTime: "11:00 AM", endTime: "11:55 AM", day: "Mon–Fri", type: "Lecture" },
  { id: "TS05", label: "Lunch", startTime: "12:00 PM", endTime: "1:00 PM", day: "Mon–Fri", type: "Break" },
  { id: "TS06", label: "Slot E", startTime: "1:00 PM", endTime: "1:55 PM", day: "Mon–Fri", type: "Lecture" },
  { id: "TS07", label: "Slot F", startTime: "2:00 PM", endTime: "2:55 PM", day: "Mon–Fri", type: "Lecture" },
  { id: "TS08", label: "Slot G", startTime: "3:00 PM", endTime: "3:55 PM", day: "Mon–Fri", type: "Lecture" },
  { id: "TS09", label: "Lab-1", startTime: "9:00 AM", endTime: "10:55 AM", day: "Mon/Wed", type: "Lab" },
  { id: "TS10", label: "Lab-2", startTime: "2:00 PM", endTime: "3:55 PM", day: "Tue/Thu", type: "Lab" },
];

// ─── Timetable Engine State ─────────────────────────────────
export const timetableEngineState = {
  currentVersion: "v1.0",
  status: "draft",
  lastGenerated: null,
  lastPublished: null,
  constraintViolations: 0,
  totalSlotsFilled: 0,
  totalSlotsAvailable: 30,
  solverDuration: null,
  generatedSchedule: [], // Empty initially - real data loaded after running solver
  latestAssignments: [], // Populated after slot assignment
  latestStats: null,
  latestConstraints: null,
};

// ─── Exam Schedule ──────────────────────────────────────────
export const examSchedule = [
  { id: "E001", course: "CS201", courseName: "Data Structures", date: "2025-03-27", time: "9:00 AM", duration: "3 hrs", room: "Exam Hall-1", students: 45, status: "scheduled" },
  { id: "E002", course: "EC301", courseName: "Digital Circuits", date: "2025-03-27", time: "9:00 AM", duration: "3 hrs", room: "Exam Hall-1", students: 38, status: "conflict" },
  { id: "E003", course: "MA201", courseName: "Mathematics III", date: "2025-03-28", time: "9:00 AM", duration: "3 hrs", room: "Exam Hall-1", students: 60, status: "scheduled" },
  { id: "E004", course: "EC201", courseName: "Signals & Systems", date: "2025-03-27", time: "2:00 PM", duration: "3 hrs", room: "Exam Hall-2", students: 42, status: "scheduled" },
  { id: "E005", course: "EC401", courseName: "VLSI Design", date: "2025-03-29", time: "9:00 AM", duration: "3 hrs", room: "Exam Hall-2", students: 35, status: "scheduled" },
  { id: "E006", course: "ME201", courseName: "Thermodynamics", date: "2025-03-29", time: "2:00 PM", duration: "3 hrs", room: "Exam Hall-1", students: 55, status: "scheduled" },
  { id: "E007", course: "CS305", courseName: "Computer Networks", date: "2025-03-30", time: "9:00 AM", duration: "2 hrs", room: "Lab-3", students: 30, status: "draft" },
];

// ─── Timetable Versions ─────────────────────────────────────
export const timetableVersions = [
  { id: "v2.5", label: "v2.5 — Draft", createdAt: "2025-03-10T14:30:00Z", status: "draft", conflicts: 3, author: "Admin" },
  { id: "v2.4", label: "v2.4 — Backup", createdAt: "2025-03-08T10:00:00Z", status: "archived", conflicts: 0, author: "System" },
  { id: "v2.3", label: "v2.3 — Published", createdAt: "2025-03-02T09:00:00Z", status: "published", conflicts: 0, author: "Admin" },
  { id: "v2.2", label: "v2.2 — Archived", createdAt: "2025-02-20T11:00:00Z", status: "archived", conflicts: 1, author: "Admin" },
];

// ─── Analytics ──────────────────────────────────────────────
export const analyticsData = {
  roomUtilization: [
    { room: "LHC-1", utilization: 72 },
    { room: "LHC-2", utilization: 88 },
    { room: "LHC-3", utilization: 45 },
    { room: "LHC-5", utilization: 65 },
    { room: "A-301", utilization: 55 },
    { room: "F-102", utilization: 80 },
    { room: "Lab-3", utilization: 60 },
    { room: "Lab-5", utilization: 20 },
  ],
  facultyLoad: [
    { name: "Dr. Mehta", load: 80 },
    { name: "Dr. Singh", load: 75 },
    { name: "Dr. Rajan", load: 40 },
    { name: "Dr. Rao", load: 80 },
    { name: "Dr. Kumar", load: 150 },
    { name: "Dr. Patel", load: 75 },
    { name: "Dr. Gupta", load: 80 },
    { name: "Dr. Iyer", load: 20 },
  ],
  weeklyRequestTrend: [
    { week: "W1", count: 3 },
    { week: "W2", count: 5 },
    { week: "W3", count: 2 },
    { week: "W4", count: 7 },
    { week: "W5", count: 4 },
    { week: "W6", count: 8 },
  ],
  conflictsByType: [
    { type: "Room", count: 2 },
    { type: "Faculty", count: 1 },
    { type: "Student", count: 1 },
    { type: "Exam", count: 1 },
  ],
};
