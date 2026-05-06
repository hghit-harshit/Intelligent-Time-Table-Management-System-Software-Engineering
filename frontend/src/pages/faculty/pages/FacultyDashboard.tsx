import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarCard from "../../student/components/CalendarCard";
import AddTaskModal from "../../student/components/AddTaskModal";
import FacultyRightPane from "../components/FacultyRightPane";
import { colors, fonts } from "../../../styles/tokens";
import { useUser } from "../../../contexts/UserContext";
import {
  fetchRescheduleRequests,
  fetchTimetableLatest,
  createClassReference,
  fetchClassReferences,
} from "../../../services/facultyApi";
import { fetchExamDateWindow, fetchMyScheduledExams } from "../../../services/examApi";
import { fetchTimetablePublishedAt } from "../../../services/studentApi";
import { Clock, MapPin } from "lucide-react";

type PaneState = "classes" | "notifs";

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  reminder: boolean;
  reminderTime: string;
  dueDate: string;
  completed: boolean;
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEK_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEK_DAYS_SHORT = ["MON", "TUE", "WED", "THU", "FRI"];
const SHORT_TO_FULL_DAY: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

const parseStartTime24 = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const firstPart = raw.split("·")[0].trim();
  const rangeStart = firstPart.split("–")[0].split("-")[0].trim();
  const m = rangeStart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return "";
  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const ampm = (m[3] || "").toUpperCase();
  if (ampm === "PM" && hh !== 12) hh += 12;
  if (ampm === "AM" && hh === 12) hh = 0;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const normalizeDayLabel = (value: string) => {
  const key = String(value || "").trim().toLowerCase();
  const map: Record<string, string> = {
    mon: "Monday", monday: "Monday",
    tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
    wed: "Wednesday", wednesday: "Wednesday",
    thu: "Thursday", thur: "Thursday", thurs: "Thursday", thursday: "Thursday",
    fri: "Friday", friday: "Friday",
    sat: "Saturday", saturday: "Saturday",
    sun: "Sunday", sunday: "Sunday",
  };
  return map[key] || value;
};

const getMondayOf = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
};

const normalizeName = (value: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/^dr\.?\s+/, "")
    .trim();

const normalizeDay = (value: string) => {
  const map: Record<string, string> = {
    mon: "Monday", monday: "Monday",
    tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
    wed: "Wednesday", weds: "Wednesday", wednesday: "Wednesday",
    thu: "Thursday", thur: "Thursday", thurs: "Thursday", thursday: "Thursday",
    fri: "Friday", friday: "Friday",
    sat: "Saturday", saturday: "Saturday",
    sun: "Sunday", sunday: "Sunday",
  };
  return map[String(value || "").toLowerCase()] ?? value;
};

const normalizeStartTime = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const m24 = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m24) {
    return `${String(Number(m24[1])).padStart(2, "0")}:${m24[2]}`;
  }
  const m12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let hh = Number(m12[1]);
    const mm = m12[2];
    const ampm = m12[3].toUpperCase();
    if (ampm === "PM" && hh !== 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }
  return raw;
};

const formatTime12 = (value: string) => {
  if (!value) return "";
  if (/am|pm/i.test(value)) return value;
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const timeToMinutes = (value: string) => {
  if (!value) return 0;
  const [hours, minutes] = String(value).split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const formatDuration = (start?: string, end?: string) => {
  if (!start || !end) return "";
  const diff = timeToMinutes(end) - timeToMinutes(start);
  if (diff <= 0) return "";
  if (diff % 60 === 0) return `${diff / 60} hr`;
  return `${diff} min`;
};

function buildFacultyDashboard(assignments: any[], weekStart: Date) {
  const now = new Date();
  const weekActualDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekDates = weekActualDates.map((d) => d.getDate());

  const byDay = new Map(WEEK_DAY_NAMES.map((d) => [d, [] as any[]]));
  for (const assignment of assignments) {
    const day = normalizeDay(assignment.day);
    if (byDay.has(day)) byDay.get(day)?.push(assignment);
  }

  const timeSlots = [...new Set(assignments.map((a) => a.startTime || a.time))]
    .filter(Boolean)
    .sort((a: string, b: string) => timeToMinutes(a) - timeToMinutes(b));

  const pickCellAssignment = (day: string, time: string) => {
    const matches = (byDay.get(day) || []).filter((a) => (a.startTime || a.time) === time);
    if (matches.length === 0) return null;
    return matches.sort((a, b) => {
      const score = (x: any) => (x.isRescheduled ? 3 : (x.isRescheduleSource ? 1 : 2));
      return score(b) - score(a);
    })[0];
  };

  const weeklySchedule = timeSlots.map((time) => ({
    time: formatTime12(time),
    classes: WEEK_DAY_NAMES.map((day) => {
      const match = pickCellAssignment(day, time);
      if (!match) return null;
      return {
        name: match.courseName || match.courseCode || "Untitled",
        location: match.isRescheduleSource
          ? "Course moved from this slot"
          : ([match.courseCode, match.roomName].filter(Boolean).join(" · ") || "TBD"),
        professor: "",
        duration: formatDuration(match.startTime, match.endTime),
        courseCode: match.courseCode || "",
        courseId: match.courseId || "",
        courseName: match.courseName || match.courseCode || "Untitled",
        startTime: match.startTime || match.time || "",
        endTime: match.endTime || "",
        day: day,
        room: match.roomName || "TBD",
        isRescheduled: Boolean(match.isRescheduled),
        isRescheduleSource: Boolean(match.isRescheduleSource),
      };
    }),
  }));

  const dailySchedules: Record<string, any[]> = {};
  weekActualDates.forEach((date, index) => {
    const dayName = WEEK_DAY_NAMES[index];
    const items = [...(byDay.get(dayName) || [])].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    dailySchedules[String(date.getDate())] = items.map((item) => ({
      time: formatTime12(item.startTime || item.time),
      class: {
        name: item.courseName || item.courseCode || "Untitled",
        location: item.isRescheduleSource
          ? "Course moved from this slot"
          : ([item.courseCode, item.roomName].filter(Boolean).join(" · ") || "TBD"),
        professor: "",
        duration: formatDuration(item.startTime, item.endTime),
        courseCode: item.courseCode || "",
        courseId: item.courseId || "",
        courseName: item.courseName || item.courseCode || "Untitled",
        startTime: item.startTime || item.time || "",
        endTime: item.endTime || "",
        day: dayName,
        room: item.roomName || "TBD",
        isRescheduled: Boolean(item.isRescheduled),
        isRescheduleSource: Boolean(item.isRescheduleSource),
      },
    }));
  });

  const todayName = DAY_NAMES[now.getDay()];
  const todaysClasses = [...(byDay.get(todayName) || [])]
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    .map((item) => ({
      subject: item.courseName || item.courseCode || "Untitled",
      time: formatTime12(item.startTime || item.time),
      duration: formatDuration(item.startTime, item.endTime) || "1 hr",
      location: [item.courseCode, item.roomName].filter(Boolean).join(" · ") || "TBD",
      status: "Scheduled",
      statusColor: colors.primary.main,
      isLive: false,
      dotColor: colors.primary.main,
    }));

  return {
    currentDate: {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      dayName: DAY_NAMES[now.getDay()],
    },
    weekDays: WEEK_DAYS_SHORT,
    weekDates,
    weeklySchedule,
    baseWeeklySchedule: weeklySchedule,
    dailySchedules,
    todaysClasses,
    calendar: {
      monthDaysWithClasses: [],
      timeSlots: timeSlots.map(formatTime12),
    },
  };
}

function filterAssignmentsOnExamDates(assignments: any[], examDates: string[], weekStart: Date): any[] {
  if (!examDates.length) return assignments;
  const ws = new Date(weekStart);
  ws.setHours(0, 0, 0, 0);
  const blockedDays = new Set<string>();
  for (const dateStr of examDates) {
    const ed = new Date(dateStr);
    ed.setHours(0, 0, 0, 0);
    for (let i = 0; i < 5; i++) {
      const wd = new Date(ws);
      wd.setDate(ws.getDate() + i);
      if (wd.getTime() === ed.getTime()) {
        blockedDays.add(WEEK_DAY_NAMES[i]);
      }
    }
  }
  return blockedDays.size ? assignments.filter((a) => !blockedDays.has(normalizeDay(a.day))) : assignments;
}

function applyFacultyRescheduleOverlays(
  assignments: any[],
  approvedReschedules: any[],
  weekStart: Date,
): any[] {
  if (!approvedReschedules.length) return assignments;

  const ws = new Date(weekStart);
  ws.setHours(0, 0, 0, 0);
  const we = new Date(weekStart);
  we.setDate(we.getDate() + 4);
  we.setHours(23, 59, 59, 999);

  let result = [...assignments];

  for (const req of approvedReschedules) {
    const fromDateStr: string | undefined = req.currentDate;
    const toDateStr: string | undefined = req.requestedDate;
    if (!fromDateStr && !toDateStr) continue;

    const fromDate = fromDateStr ? new Date(fromDateStr + "T00:00:00") : null;
    const toDate = toDateStr ? new Date(toDateStr + "T00:00:00") : null;

    const courseRef = req.courseId;
    const courseIdStr =
      courseRef && typeof courseRef === "object"
        ? String((courseRef as any)._id)
        : String(courseRef ?? "");
    const courseCode = (courseRef as any)?.code || req.courseCode || "";

    const curSlot = req.currentSlot;
    const reqSlot = req.requestedSlot;
    const curStart = normalizeStartTime(curSlot?.time?.split("-")[0]?.trim());
    const reqStart = normalizeStartTime(reqSlot?.time?.split("-")[0]?.trim());
    const reqEnd = reqSlot?.time?.split("-")[1]?.trim();

    const matchesCourse = (a: any) =>
      (courseIdStr && String(a.courseId) === courseIdStr) ||
      (courseCode && String(a.courseCode) === courseCode);

    if (fromDate && fromDate >= ws && fromDate <= we && curStart && curSlot?.day) {
      result = result.map((a) => {
        const isOriginalSlot =
          matchesCourse(a) &&
          normalizeStartTime(a.startTime || a.time) === curStart &&
          normalizeDay(a.day) === normalizeDay(curSlot.day);
        if (!isOriginalSlot) return a;
        return {
          ...a,
          isRescheduleSource: true,
          isRescheduled: false,
        };
      });
    }

    if (toDate && toDate >= ws && toDate <= we && reqStart && reqSlot?.day) {
      const original = assignments.find(matchesCourse);
      if (original) {
        result.push({
          ...original,
          day: normalizeDay(reqSlot.day),
          startTime: reqStart,
          endTime: reqEnd || original.endTime,
          isRescheduleSource: false,
          isRescheduled: true,
        });
      }
    }
  }

  return result;
}

const mapFacultyNotifications = (requests: any[]) => {
  const statusText: Record<string, string> = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
  };

  return requests
    .map((request, index) => {
      const courseRef = request.courseId;
      const courseCode = (courseRef as any)?.code || request.courseCode || "Course";
      const courseName = (courseRef as any)?.name || request.course || "";
      const courseLabel = [courseCode, courseName].filter(Boolean).join(" — ");
      const cur = request.currentSlot || {};
      const reqSlot = request.requestedSlot || {};
      const from = request.currentDate
        ? `${request.currentDate} (${cur.day || "—"} ${cur.time || "—"})`
        : `${cur.day || "—"} ${cur.time || "—"}`.trim();
      const to = request.requestedDate
        ? `${request.requestedDate} (${reqSlot.day || "—"} ${reqSlot.time || "—"})`
        : `${reqSlot.day || "—"} ${reqSlot.time || "—"}`.trim();
      const status = String(request.status || "pending").toLowerCase();
      const isApproved = status === "approved";
      const detailsLines = [
        `From: ${from}`,
        `To: ${to}`,
      ];
      if (status === "approved") {
        detailsLines.push("Your reschedule request was approved by the admin. Please update your schedule.");
      } else if (status === "rejected") {
        detailsLines.push("Your reschedule request was rejected by the admin.");
      } else {
        detailsLines.push("Your request is pending admin review.");
      }
      return {
        id: String(request._id || request.id || index),
        title: isApproved
          ? `Class Rescheduled: ${courseLabel}`
          : `${statusText[status] || "Update"}: Reschedule Request`,
        message: isApproved
          ? `${courseLabel} has been moved from ${from} to ${to}.`
          : `Requested move from ${from} to ${to}.`,
        details: detailsLines.join("\n"),
        createdAt: request.createdAt || new Date().toISOString(),
        read: status !== "pending",
        type: isApproved ? "schedule_change" : status,
      };
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
};

export default function FacultyDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [selectedView, setSelectedView] = useState("week");
  const [viewWeekStart, setViewWeekStart] = useState(() => getMondayOf(new Date()));
  const [viewDayDate, setViewDayDate] = useState(() => new Date());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate());

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [rawAssignments, setRawAssignments] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [paneState, setPaneState] = useState<PaneState>("classes");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [classReferences, setClassReferences] = useState<any[]>([]);
  const [refsLoading, setRefsLoading] = useState(false);

  const [approvedReschedules, setApprovedReschedules] = useState<any[]>([]);
  const [examWindowDates, setExamWindowDates] = useState<string[]>([]);
  const [examData, setExamData] = useState<any[]>([]);
  const [examMode, setExamMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const loadedPublishedAt = useRef<string | null>(null);

  const taskStorageKey = useMemo(() => `faculty_tasks_${user?._id || "anon"}`, [user?._id]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(taskStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setTasks(parsed);
    } catch {
      setTasks([]);
    }
  }, [taskStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
    } catch {
      // ignore storage errors
    }
  }, [taskStorageKey, tasks]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setStale(false);

    try {
      const [timetable, requestData, examWindowData, myExams] = await Promise.all([
        fetchTimetableLatest(),
        user?._id ? fetchRescheduleRequests(user._id) : Promise.resolve([]),
        fetchExamDateWindow().catch(() => null),
        fetchMyScheduledExams().catch(() => []),
      ]);

      const assignments = Array.isArray(timetable?.assignments) ? timetable.assignments : [];
      const facultyName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
      let filtered = assignments;

      if (facultyName) {
        const target = normalizeName(facultyName);
        const byName = assignments.filter((assignment) => {
          const value = normalizeName(assignment.professorName || "");
          return value && (value.includes(target) || target.includes(value));
        });
        if (byName.length > 0) filtered = byName;
      }

      const requests = Array.isArray(requestData) ? requestData : [];
      const approved = requests.filter((r) => String(r.status || "").toLowerCase() === "approved");
      const examDates: string[] = Array.isArray(examWindowData?.dates)
        ? (examWindowData.dates as string[]).map((d: string) => d.split("T")[0])
        : [];
      setApprovedReschedules(approved);
      setExamWindowDates(examDates);
      setRawAssignments(filtered);
      const rawExams: any[] = Array.isArray(myExams) ? myExams : [];
      setExamData(rawExams.map((e: any) => ({
        ...e,
        date: e.date ?? e.examDate,
        time: e.time ?? e.startTime,
        duration: e.duration ?? (() => {
          const [sh, sm] = (e.startTime || "0:0").split(":").map(Number);
          const [eh, em] = (e.endTime || "0:0").split(":").map(Number);
          const diff = (eh * 60 + em) - (sh * 60 + sm);
          return diff > 0 ? (diff % 60 === 0 ? `${diff / 60}h` : `${diff}m`) : "";
        })(),
        hall: e.hall ?? e.location ?? e.room,
        subject: e.subject ?? e.courseName ?? e.courseCode,
      })));
      const overlaid = filterAssignmentsOnExamDates(
        applyFacultyRescheduleOverlays(filtered, approved, viewWeekStart),
        examDates,
        viewWeekStart,
      );
      setDashboardData(buildFacultyDashboard(overlaid, viewWeekStart));
      const mappedNotifications = mapFacultyNotifications(requests);
      setNotifications(mappedNotifications);
      setNotificationCount(requests.filter((req) => String(req.status || "").toLowerCase() === "pending").length);

      fetchTimetablePublishedAt()
        .then((version) => {
          if (version?.publishedAt) loadedPublishedAt.current = version.publishedAt;
        })
        .catch(() => {});
    } catch (error: any) {
      setLoadError(error?.message || "Unable to load faculty dashboard");
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.firstName, user?.lastName, viewWeekStart]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTimetablePublishedAt()
        .then((version) => {
          if (version?.publishedAt && loadedPublishedAt.current && version.publishedAt !== loadedPublishedAt.current) {
            setStale(true);
          }
        })
        .catch(() => {});
    }, 90_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!rawAssignments.length) return;
    const overlaid = filterAssignmentsOnExamDates(
      applyFacultyRescheduleOverlays(rawAssignments, approvedReschedules, viewWeekStart),
      examWindowDates,
      viewWeekStart,
    );
    setDashboardData(buildFacultyDashboard(overlaid, viewWeekStart));
  }, [rawAssignments, approvedReschedules, examWindowDates, viewWeekStart]);

  const handlePrev = () => {
    if (selectedView === "week") {
      const prev = new Date(viewWeekStart);
      prev.setDate(prev.getDate() - 7);
      setViewWeekStart(prev);
      return;
    }

    if (selectedView === "day") {
      const prev = new Date(viewDayDate);
      prev.setDate(prev.getDate() - 1);
      setViewDayDate(prev);
      setSelectedDate(prev.getDate());
      setSelectedMonth(prev.getMonth() + 1);
      setSelectedYear(prev.getFullYear());
      const monday = getMondayOf(prev);
      if (monday.getTime() !== viewWeekStart.getTime()) setViewWeekStart(monday);
      return;
    }

    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
    setSelectedDate(1);
  };

  const handleNext = () => {
    if (selectedView === "week") {
      const next = new Date(viewWeekStart);
      next.setDate(next.getDate() + 7);
      setViewWeekStart(next);
      return;
    }

    if (selectedView === "day") {
      const next = new Date(viewDayDate);
      next.setDate(next.getDate() + 1);
      setViewDayDate(next);
      setSelectedDate(next.getDate());
      setSelectedMonth(next.getMonth() + 1);
      setSelectedYear(next.getFullYear());
      const monday = getMondayOf(next);
      if (monday.getTime() !== viewWeekStart.getTime()) setViewWeekStart(monday);
      return;
    }

    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
    setSelectedDate(1);
  };

  const getMonthName = (monthNum: number) => MONTH_NAMES[monthNum - 1];
  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month - 1, 1).getDay();
  const getDayName = (date: number) => DAY_NAMES[new Date(selectedYear, selectedMonth - 1, date).getDay()];
  const getShortDayName = (date: number) => {
    const names = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return names[new Date(selectedYear, selectedMonth - 1, date).getDay()];
  };

  const getScheduleForDate = (date: number) => {
    if (!dashboardData) return [];
    const fromCache = dashboardData.dailySchedules?.[date.toString()];
    if (fromCache && fromCache.length > 0) return fromCache;

    const d = new Date(selectedYear, selectedMonth - 1, date);
    const jsDay = d.getDay();
    if (jsDay === 0 || jsDay === 6) return [];

    const weekDayIdx = jsDay - 1;
    const schedule = dashboardData.baseWeeklySchedule ?? dashboardData.weeklySchedule ?? [];
    const result: any[] = [];

    for (const slot of schedule) {
      const classItem = slot.classes?.[weekDayIdx];
      if (classItem) result.push({ time: slot.time, class: { ...classItem, duration: classItem.duration || "" } });
    }

    return result;
  };

  const getHeaderLabel = () => {
    if (selectedView === "week") {
      const friday = new Date(viewWeekStart);
      friday.setDate(friday.getDate() + 4);
      const startLabel = viewWeekStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const endLabel = friday.toLocaleDateString("en-IN", { day: "numeric" });
      return `${startLabel} – ${endLabel}, ${viewWeekStart.getFullYear()}`;
    }

    if (selectedView === "day") {
      return viewDayDate.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    return `${getMonthName(selectedMonth)} ${selectedYear}`;
  };

  const handleDateClick = (day: number) => {
    const clicked = new Date(selectedYear, selectedMonth - 1, day);
    setViewDayDate(clicked);
    setSelectedDate(day);
    setSelectedView("day");
    const monday = getMondayOf(clicked);
    if (monday.getTime() !== viewWeekStart.getTime()) setViewWeekStart(monday);
  };

  const handleTimeSlotClick = (slot: any) => {
    if (!slot || slot.type === "exam") return;
    setSelectedTimeSlot(slot);
    setShowClassDetails(true);
  };

  const loadReferencesForSlot = useCallback(async (slot: any) => {
    if (!slot?.courseCode) { setClassReferences([]); return; }
    const day = normalizeDayLabel(slot.day || "");
    const startTime = slot.startTime || parseStartTime24(slot.time || "");
    if (!day || !startTime) { setClassReferences([]); return; }
    setRefsLoading(true);
    try {
      const data = await fetchClassReferences(slot.courseCode, day, startTime);
      const list = Array.isArray(data) ? data : (data?.references || data?.data?.references || []);
      setClassReferences(list);
    } catch {
      setClassReferences([]);
    } finally {
      setRefsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showClassDetails || !selectedTimeSlot) return;
    loadReferencesForSlot(selectedTimeSlot);
  }, [showClassDetails, selectedTimeSlot, loadReferencesForSlot]);

  const handleRequestRescheduleFromModal = () => {
    if (!selectedTimeSlot) return;
    const rawDay = String(selectedTimeSlot.day || "").toUpperCase();
    const startTime =
      selectedTimeSlot.startTime ||
      parseStartTime24(selectedTimeSlot.time || "");
    const payload = {
      courseCode: selectedTimeSlot.courseCode || "",
      courseName: selectedTimeSlot.courseName || selectedTimeSlot.name || "",
      courseId: selectedTimeSlot.courseId || "",
      day: SHORT_TO_FULL_DAY[rawDay] || selectedTimeSlot.day || "",
      startTime,
      endTime: selectedTimeSlot.endTime || "",
      room: selectedTimeSlot.room || "",
    };
    setShowClassDetails(false);
    navigate("/FacultyPage/requests", { state: { prefill: payload } });
  };

  const handleAddReference = async () => {
    if (!selectedTimeSlot?.courseCode) return;
    const title = window.prompt("Reference title (e.g., Week 4 Notes):", "");
    if (!title || !title.trim()) return;
    const url = window.prompt("Reference URL:", "https://");
    if (!url || !url.trim()) return;
    const day = normalizeDayLabel(selectedTimeSlot.day || "");
    const startTime = selectedTimeSlot.startTime || parseStartTime24(selectedTimeSlot.time || "");
    if (!day || !startTime) return;
    try {
      await createClassReference({
        courseCode: selectedTimeSlot.courseCode,
        day,
        startTime,
        title: title.trim(),
        url: url.trim(),
      });
      await loadReferencesForSlot(selectedTimeSlot);
    } catch (err: any) {
      alert(err?.message || "Failed to add reference");
    }
  };

  const handleBell = () => {
    setPaneState((prev) => (prev === "notifs" ? "classes" : "notifs"));
  };

  const handleAddTask = (task: {
    title: string;
    description: string;
    category: string;
    reminder: boolean;
    reminderTime: string;
    dueDate: string;
  }) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleDeleteNotifications = (ids: string[]) => {
    const idSet = new Set(ids);
    setNotifications((prev) => {
      const next = prev.filter((notification) => !idSet.has(notification.id));
      setNotificationCount(next.filter((notification) => !notification.read).length);
      return next;
    });
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    setNotificationCount(0);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: colors.bg.deep,
        overflow: "hidden",
      }}
    >
      {loading && (
        <div style={{ margin: "8px 16px 0", padding: "8px 14px", borderRadius: 8, background: "rgba(37,99,235,0.08)", color: "#2563EB", fontSize: fonts.size.sm }}>
          Loading dashboard data...
        </div>
      )}

      {loadError && (
        <div style={{ margin: "8px 16px 0", padding: "8px 14px", borderRadius: 8, background: "rgba(220,38,38,0.08)", color: colors.error.main, fontSize: fonts.size.sm }}>
          {loadError}
        </div>
      )}

      {stale && (
        <div style={{ margin: "8px 16px 0", padding: "10px 16px", borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: "#1d4ed8", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span>📅 A new timetable has been published. Your schedule may have changed.</span>
          <button
            onClick={loadDashboard}
            style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Refresh Now
          </button>
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "14px",
          padding: "14px 16px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {dashboardData ? (
            <CalendarCard
              selectedView={selectedView}
              setSelectedView={setSelectedView}
              selectedDate={selectedDate}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              handlePrev={handlePrev}
              handleNext={handleNext}
              handleDateClick={handleDateClick}
              handleTimeSlotClick={handleTimeSlotClick}
              headerLabel={getHeaderLabel()}
              getMonthName={getMonthName}
              getDaysInMonth={getDaysInMonth}
              getFirstDayOfMonth={getFirstDayOfMonth}
              getDayName={getDayName}
              getShortDayName={getShortDayName}
              getScheduleForDate={getScheduleForDate}
              timetableData={dashboardData}
              viewWeekStart={viewWeekStart}
              tasks={tasks}
              onAddTask={() => setShowAddTask(true)}
              onBell={handleBell}
              notificationCount={notificationCount}
              examMode={examMode}
              examData={examData}
              onToggleExamMode={() => setExamMode((v) => !v)}
            />
          ) : (
            <div style={{ background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: "14px", padding: "24px", textAlign: "center", color: colors.text.muted, fontSize: fonts.size.sm }}>
              {loading ? "Loading schedule..." : "No timetable published yet."}
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <FacultyRightPane
            paneState={paneState}
            setPaneState={setPaneState}
            todaysClasses={dashboardData?.todaysClasses || []}
            currentDate={dashboardData?.currentDate || { dayName: "", day: 0, month: 0, year: 0 }}
            onViewFullDay={() => setSelectedView("day")}
            notifications={notifications}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onDeleteNotifications={handleDeleteNotifications}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>

      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onSave={handleAddTask}
        />
      )}

      {showClassDetails && selectedTimeSlot && (
        <div
          onClick={() => setShowClassDetails(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.bg.base,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: "16px",
              padding: "22px",
              width: "100%",
              maxWidth: "460px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: fonts.size.xl, fontWeight: 700, color: colors.text.primary }}>
                  {selectedTimeSlot.name || selectedTimeSlot.courseName || selectedTimeSlot.courseCode}
                </h2>
                <p style={{ margin: 0, fontSize: fonts.size.sm, color: colors.text.muted }}>
                  {selectedTimeSlot.day}{selectedTimeSlot.time ? ` · ${selectedTimeSlot.time}` : ""}
                </p>
              </div>
              <button
                onClick={() => setShowClassDetails(false)}
                style={{ background: "none", border: "none", color: colors.text.muted, cursor: "pointer", fontSize: fonts.size.sm }}
              >
                Close
              </button>
            </div>

            <div style={{ background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, borderRadius: 10, padding: "12px 14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: fonts.size.sm, color: colors.text.primary, marginBottom: "6px" }}>
                <Clock size={14} /> {selectedTimeSlot.time || "See timetable"}
              </div>
              {!!selectedTimeSlot.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: fonts.size.xs, color: colors.text.muted }}>
                  <MapPin size={12} /> {selectedTimeSlot.location}
                </div>
              )}
            </div>

            <div style={{ background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, borderRadius: 10, padding: "12px 14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: fonts.size.xs, fontWeight: 700, color: colors.text.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  References
                </span>
                <button
                  onClick={handleAddReference}
                  style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${colors.primary.border}`, background: colors.primary.ghost, color: colors.primary.main, cursor: "pointer", fontSize: fonts.size.xs, fontWeight: 600 }}
                >
                  Add Reference
                </button>
              </div>
              {refsLoading ? (
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>Loading references…</div>
              ) : classReferences.length === 0 ? (
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>No references attached yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {classReferences.map((ref) => (
                    <a
                      key={ref._id || ref.id}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: fonts.size.xs, color: colors.primary.main, textDecoration: "none" }}
                    >
                      {ref.title}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowClassDetails(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: `1px solid ${colors.border.medium}`,
                  background: colors.bg.raised,
                  color: colors.text.primary,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRescheduleFromModal}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: colors.primary.main,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Request Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
