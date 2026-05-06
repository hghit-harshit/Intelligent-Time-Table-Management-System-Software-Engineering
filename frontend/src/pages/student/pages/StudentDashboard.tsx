/**
 * StudentDashboard — Main Timetable / Dashboard View
 *
 * Per DISHA UI Guide §3:
 * - Full-height layout: CalendarCard (left/main) + RightPane (contextual column)
 * - Right pane states: "classes" (default) / "notifs" (bell) / "exams" (View Exams)
 * - "View Exams" toggles examMode: exam-only calendar + exams pane simultaneously
 * - "View Full Calendar" reverts to normal mode
 * - "+ Add Task" opens AddTaskModal overlay; tasks shown in calendar + right pane
 * - Month → Day navigation on date click
 * - Red line time indicator built into DayView and WeekView
 */

import { useEffect, useState, useCallback, useRef } from "react"
import {
  fetchStudentDashboard,
  fetchTimetablePublishedAt,
  fetchNotificationUnreadCount,
  fetchStudentExams,
  fetchStudentTasks,
  createStudentNote,
  createStudentTask,
  updateStudentTask,
  deleteStudentTask,
} from "../../../services/studentApi"
import CalendarCard from "../components/CalendarCard"
import RightPane from "../components/RightPane"
import ClassDetailsModal from "../components/ClassDetailsModal"
import AddTaskModal from "../components/AddTaskModal"
import NotesViewerModal from "../components/NotesViewerModal"
import { colors, fonts } from "../../../styles/tokens"

type PaneState = "classes" | "notifs" | "exams"

export interface Task {
  id: string
  title: string
  description: string
  category: string
  reminder: boolean
  reminderTime: string
  dueDate: string
  completed: boolean
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]

const calcDuration = (start?: string, end?: string) => {
  if (!start || !end) return ""
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff <= 0) return ""
  return diff % 60 === 0 ? `${diff / 60}h` : `${diff}m`
}

const normalizeExam = (exam: any) => ({
  ...exam,
  date: exam.date ?? exam.examDate,
  time: exam.time ?? exam.startTime,
  duration: exam.duration ?? calcDuration(exam.startTime, exam.endTime),
  hall: exam.hall ?? exam.location ?? exam.room,
  subject: exam.subject ?? exam.courseName ?? exam.courseCode,
})

const getMondayOf = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const buildEmptyDashboard = () => {
  const now = new Date()
  return {
    semester: { name: "Semester", period: "", status: { text: "Loading", type: "info" } },
    currentDate: {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      dayName: DAY_NAMES[now.getDay()],
    },
    stats: [],
    weekDays: [],
    weekDates: [],
    weeklySchedule: [],
    dailySchedules: {},
    todaysClasses: [],
    quickActions: [],
    upcomingEvents: [],
    calendar: { monthDaysWithClasses: [], timeSlots: [] },
  }
}

export default function StudentDashboard() {
  // ── Core dashboard state ──────────────────────────────────────
  const [dashboardData, setDashboardData] = useState(buildEmptyDashboard)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const loadedPublishedAt = useRef<string | null>(null)

  // ── View / navigation state ───────────────────────────────────
  const [selectedView, setSelectedView] = useState("week")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null)
  const [showClassDetails, setShowClassDetails] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)

  const [viewWeekStart, setViewWeekStart] = useState(() => getMondayOf(new Date()))
  const [viewDayDate, setViewDayDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate())
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  // ── DISHA UI state ────────────────────────────────────────────
  const [notificationCount, setNotificationCount] = useState(0)
  const [examMode, setExamMode] = useState(false)
  const [examData, setExamData] = useState<any[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [paneState, setPaneState] = useState<PaneState>("classes")
  const [notesModal, setNotesModal] = useState<{
    webViewLink: string
    googleDocId: string
    title: string
    subtitle?: string
  } | null>(null)
  const [notesError, setNotesError] = useState<
    "drive_api_disabled" | "not_connected" | "generic" | null
  >(null)

  // ── Data loading ──────────────────────────────────────────────
  const loadDashboard = useCallback((weekStart: Date) => {
    setIsLoading(true)
    setLoadError(null)
    setStale(false)
    fetchStudentDashboard(toISO(weekStart))
      .then((data) => {
        setDashboardData(data)
        fetchTimetablePublishedAt()
          .then((v) => { if (v?.publishedAt) loadedPublishedAt.current = v.publishedAt })
          .catch(() => {})
      })
      .catch((err) => setLoadError(err?.message || "Unable to load dashboard data"))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadDashboard(viewWeekStart)
  }, [viewWeekStart, loadDashboard])

  // Poll every 90 s for newly published timetable
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTimetablePublishedAt().then((v) => {
        if (v?.publishedAt && loadedPublishedAt.current && v.publishedAt !== loadedPublishedAt.current) {
          setStale(true)
        }
      }).catch(() => {})
    }, 90_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchNotificationUnreadCount()
      .then((data) => setNotificationCount(data?.unread ?? 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchStudentExams()
      .then((data) => {
        const raw: any[] = Array.isArray(data) ? data : data?.exams || []
        setExamData(raw.map(normalizeExam))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchStudentTasks()
      .then((data) => setTasks(Array.isArray(data) ? data : data?.tasks || []))
      .catch(() => {})
  }, [])

  // ── Navigation ────────────────────────────────────────────────
  const handlePrev = () => {
    if (selectedView === "week") {
      const prev = new Date(viewWeekStart)
      prev.setDate(prev.getDate() - 7)
      setViewWeekStart(prev)
    } else if (selectedView === "day") {
      const prev = new Date(viewDayDate)
      prev.setDate(prev.getDate() - 1)
      setViewDayDate(prev)
      setSelectedDate(prev.getDate())
      setSelectedMonth(prev.getMonth() + 1)
      setSelectedYear(prev.getFullYear())
      const prevMonday = getMondayOf(prev)
      if (prevMonday.getTime() !== viewWeekStart.getTime()) setViewWeekStart(prevMonday)
    } else {
      if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear((y) => y - 1) }
      else { setSelectedMonth((m) => m - 1) }
      setSelectedDate(1)
    }
  }

  const handleNext = () => {
    if (selectedView === "week") {
      const next = new Date(viewWeekStart)
      next.setDate(next.getDate() + 7)
      setViewWeekStart(next)
    } else if (selectedView === "day") {
      const next = new Date(viewDayDate)
      next.setDate(next.getDate() + 1)
      setViewDayDate(next)
      setSelectedDate(next.getDate())
      setSelectedMonth(next.getMonth() + 1)
      setSelectedYear(next.getFullYear())
      const nextMonday = getMondayOf(next)
      if (nextMonday.getTime() !== viewWeekStart.getTime()) setViewWeekStart(nextMonday)
    } else {
      if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear((y) => y + 1) }
      else { setSelectedMonth((m) => m + 1) }
      setSelectedDate(1)
    }
  }

  const handleTimeSlotClick = (timeSlot: any) => {
    setSelectedTimeSlot(timeSlot)
    setShowClassDetails(true)
  }

  const handleDateClick = (day: number) => {
    const clicked = new Date(selectedYear, selectedMonth - 1, day)
    setViewDayDate(clicked)
    setSelectedDate(day)
    setSelectedView("day")
    const clickedMonday = getMondayOf(clicked)
    if (clickedMonday.getTime() !== viewWeekStart.getTime()) setViewWeekStart(clickedMonday)
  }

  // ── DISHA handlers ────────────────────────────────────────────
  const handleToggleExamMode = () => {
    const next = !examMode
    setExamMode(next)
    setPaneState(next ? "exams" : "classes")
  }

  const handleBell = () => {
    setPaneState((prev) => (prev === "notifs" ? "classes" : "notifs"))
  }

  const handleAddTask = async (task: {
    title: string
    description: string
    category: string
    reminder: boolean
    reminderTime: string
    dueDate: string
  }) => {
    const newTask: Task = { ...task, id: Date.now().toString(), completed: false }
    setTasks((prev) => [...prev, newTask])
    try {
      await createStudentTask({
        title: task.title,
        description: task.description,
        category: task.category,
        dueDate: task.dueDate || undefined,
        reminder: task.reminder,
        reminderMinutes: task.reminder ? parseInt(task.reminderTime) : undefined,
      })
    } catch {
      // Silently fail — task shown locally
    }
  }

  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    if (task) updateStudentTask(id, { completed: !task.completed }).catch(() => {})
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    deleteStudentTask(id).catch(() => {})
  }

  const handleNoteClick = async (courseCode: string, classDate: string) => {
    if (!courseCode || !classDate) return
    setNotesError(null)
    try {
      const data: any = await createStudentNote(courseCode, classDate)
      const googleDocId = data?.googleDocId
      const webViewLink = data?.webViewLink || (googleDocId ? `https://docs.google.com/document/d/${googleDocId}/edit` : null)
      if (webViewLink && googleDocId) {
        const [y, m, d] = classDate.split("-").map(Number)
        const formattedDate = new Date(y, m - 1, d).toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", year: "numeric",
        })
        const courseName = selectedTimeSlot?.name || courseCode
        setNotesModal({ webViewLink, googleDocId, title: courseName, subtitle: `${courseCode} · ${formattedDate}` })
        setShowClassDetails(false)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || ""
      if (msg.includes("drive.googleapis") || msg.includes("Drive API") || msg.includes("has not been used") || msg.includes("disabled")) {
        setNotesError("drive_api_disabled")
      } else if (msg.includes("authenticated") || msg.includes("Not authenticated")) {
        setNotesError("not_connected")
      } else {
        setNotesError("generic")
      }
      setTimeout(() => setNotesError(null), 6000)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  const getMonthName = (monthNum: number) => MONTH_NAMES[monthNum - 1]
  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate()
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month - 1, 1).getDay()
  const getDayName = (date: number) => DAY_NAMES[new Date(selectedYear, selectedMonth - 1, date).getDay()]
  const getShortDayName = (date: number) => {
    const shorts = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    return shorts[new Date(selectedYear, selectedMonth - 1, date).getDay()]
  }

  const isDateInLoadedWeek = (date: Date) => {
    const start = new Date(viewWeekStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(viewWeekStart)
    end.setDate(end.getDate() + 4)
    end.setHours(23, 59, 59, 999)
    return date >= start && date <= end
  }

  const getScheduleForExactDate = (date: Date) => {
    if (isDateInLoadedWeek(date)) {
      const fromCache = dashboardData.dailySchedules?.[date.getDate().toString()]
      if (Array.isArray(fromCache) && fromCache.length > 0) return fromCache
    }
    const jsDay = date.getDay()
    if (jsDay === 0 || jsDay === 6) return []
    const weekDayIdx = jsDay - 1
    const baseSchedule = (dashboardData as any).baseWeeklySchedule ?? dashboardData.weeklySchedule ?? []
    const result: any[] = []
    for (const slot of baseSchedule) {
      const classItem = slot.classes?.[weekDayIdx]
      if (classItem) {
        result.push({
          time: slot.time,
          class: {
            ...classItem,
            duration: classItem.duration || slot.duration || "",
          },
        })
      }
    }
    return result
  }

  const buildRightPaneClasses = (date: Date) => {
    const schedule = getScheduleForExactDate(date)
    return schedule.map((slot) => {
      const classItem = slot.class || {}
      return {
        subject: classItem.name || classItem.subject || "Class",
        time: slot.time || "",
        duration: classItem.duration || "",
        location: classItem.location || classItem.room || classItem.hall || "TBA",
        status: "Scheduled",
        statusColor: colors.primary.main,
        isLive: false,
        dotColor: colors.primary.main,
        notes: classItem.notes,
      }
    })
  }

  const rightPaneDate = selectedView === "day" ? viewDayDate : new Date()
  const rightPaneCurrentDate = {
    day: rightPaneDate.getDate(),
    month: rightPaneDate.getMonth() + 1,
    year: rightPaneDate.getFullYear(),
    dayName: DAY_NAMES[rightPaneDate.getDay()],
  }
  const rightPaneClasses = buildRightPaneClasses(rightPaneDate)

  const getScheduleForDate = (date: number) => {
    const fromCache = dashboardData.dailySchedules[date.toString()]
    if (fromCache && fromCache.length > 0) return fromCache
    const d = new Date(selectedYear, selectedMonth - 1, date)
    const jsDay = d.getDay()
    if (jsDay === 0 || jsDay === 6) return []
    const weekDayIdx = jsDay - 1
    const baseSchedule = (dashboardData as any).baseWeeklySchedule ?? dashboardData.weeklySchedule ?? []
    const result: any[] = []
    for (const slot of baseSchedule) {
      const classItem = slot.classes?.[weekDayIdx]
      if (classItem) result.push({ time: slot.time, class: { ...classItem, duration: "" } })
    }
    return result
  }

  const getHeaderLabel = () => {
    if (selectedView === "week") {
      const friday = new Date(viewWeekStart)
      friday.setDate(friday.getDate() + 4)
      const startLabel = viewWeekStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      const endLabel = friday.toLocaleDateString("en-IN", { day: "numeric" })
      return `${startLabel} – ${endLabel}, ${viewWeekStart.getFullYear()}`
    }
    if (selectedView === "day") {
      return viewDayDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    }
    return `${getMonthName(selectedMonth)} ${selectedYear}`
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: colors.bg.deep,
      }}
    >
      {/* Loading banner */}
      {isLoading && (
        <div style={{ margin: "8px 16px 0", padding: "8px 14px", borderRadius: 8, background: "rgba(37,99,235,0.08)", color: "#2563EB", fontSize: fonts.size.sm }}>
          Loading dashboard data...
        </div>
      )}

      {/* Error banner */}
      {loadError && (
        <div style={{ margin: "8px 16px 0", padding: "8px 14px", borderRadius: 8, background: "rgba(220,38,38,0.08)", color: colors.error.main, fontSize: fonts.size.sm }}>
          {loadError}
        </div>
      )}

      {/* Notes error banner */}
      {notesError && (
        <div style={{ margin: "8px 16px 0", padding: "8px 14px", borderRadius: 8, background: "rgba(245,158,11,0.10)", color: "#D97706", fontSize: fonts.size.sm, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>
            {notesError === "drive_api_disabled"
              ? "Google Drive API is not enabled for this project."
              : notesError === "not_connected"
              ? "Google account not connected."
              : "Could not open notes. Please try again."}
          </span>
          {notesError === "drive_api_disabled" ? (
            <a
              href="https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=347302664202"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563EB", fontWeight: 600, fontSize: fonts.size.xs, marginLeft: "12px", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Enable Drive API →
            </a>
          ) : notesError === "not_connected" ? (
            <a
              href="/StudentPage/google-classroom"
              style={{ color: "#2563EB", fontWeight: 600, fontSize: fonts.size.xs, marginLeft: "12px", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Connect Google →
            </a>
          ) : null}
        </div>
      )}

      {/* Stale timetable banner */}
      {stale && (
        <div style={{ margin: "8px 16px 0", padding: "10px 16px", borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: "#1d4ed8", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span>📅 A new timetable has been published. Your schedule may have changed.</span>
          <button
            onClick={() => loadDashboard(viewWeekStart)}
            style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Refresh Now
          </button>
        </div>
      )}

      {/* Main layout: Calendar + Right Pane */}
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
        {/* Calendar (main area) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
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
            examMode={examMode}
            examData={examData}
            tasks={tasks}
            onToggleExamMode={handleToggleExamMode}
            onAddTask={() => setShowAddTask(true)}
            onBell={handleBell}
            onNoteClick={handleNoteClick}
            notificationCount={notificationCount}
            viewWeekStart={viewWeekStart}
          />
        </div>

        {/* Contextual Right Pane */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <RightPane
            paneState={paneState}
            setPaneState={setPaneState}
            todaysClasses={rightPaneClasses}
            examsData={examData}
            currentDate={rightPaneCurrentDate}
            onViewFullDay={() => setSelectedView("day")}
            onAddNotes={() => { window.location.href = "/StudentPage/notes" }}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>

      {/* Class Details Modal */}
      {showClassDetails && selectedTimeSlot && (
        <ClassDetailsModal
          selectedTimeSlot={selectedTimeSlot}
          onClose={() => setShowClassDetails(false)}
          onNoteClick={handleNoteClick}
        />
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onSave={handleAddTask}
        />
      )}

      {/* Notes Viewer Modal */}
      {notesModal && (
        <NotesViewerModal
          webViewLink={notesModal.webViewLink}
          googleDocId={notesModal.googleDocId}
          title={notesModal.title}
          subtitle={notesModal.subtitle}
          onClose={() => setNotesModal(null)}
        />
      )}
    </div>
  )
}
