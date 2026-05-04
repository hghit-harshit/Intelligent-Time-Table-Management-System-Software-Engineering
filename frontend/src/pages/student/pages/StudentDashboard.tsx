import { useEffect, useState, useCallback, useRef } from "react"
import { fetchStudentDashboard, fetchTimetablePublishedAt } from "../../../services/studentApi"
import TopBar from "../components/TopBar"
import StatsCards from "../components/StatsCards"
import CalendarCard from "../components/CalendarCard"
import TodaysClasses from "../components/TodaysClasses"
import QuickActions from "../components/QuickActions"
import UpcomingEvents from "../components/UpcomingEvents"
import ClassDetailsModal from "../components/ClassDetailsModal"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]

const getMondayOf = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

// Use local date parts to avoid UTC offset shifting the date (e.g. IST midnight = prev day in UTC)
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
  const [dashboardData, setDashboardData] = useState(buildEmptyDashboard)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [stale, setStale] = useState(false)
  const loadedPublishedAt = useRef<string | null>(null)

  const [selectedView, setSelectedView] = useState("week")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [showClassDetails, setShowClassDetails] = useState(false)

  // Week navigation: track the Monday of the displayed week
  const [viewWeekStart, setViewWeekStart] = useState(() => getMondayOf(new Date()))

  // Day navigation: track the selected day as a full Date
  const [viewDayDate, setViewDayDate] = useState(() => new Date())

  // Month navigation (only for month view)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate())

  const loadDashboard = useCallback((weekStart: Date) => {
    setIsLoading(true)
    setLoadError(null)
    setStale(false)
    fetchStudentDashboard(toISO(weekStart))
      .then((data) => {
        setDashboardData(data)
        // Record the publishedAt of the timetable we just loaded
        fetchTimetablePublishedAt().then((v) => {
          if (v?.publishedAt) loadedPublishedAt.current = v.publishedAt
        }).catch(() => {})
      })
      .catch((err) => setLoadError(err?.message || "Unable to load dashboard data"))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadDashboard(viewWeekStart)
  }, [viewWeekStart, loadDashboard])

  // Poll every 90 seconds for a new timetable publish
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
      // Cross-week: update week anchor so it refetches
      const prevMonday = getMondayOf(prev)
      if (prevMonday.getTime() !== viewWeekStart.getTime()) {
        setViewWeekStart(prevMonday)
      }
    } else {
      if (selectedMonth === 1) {
        setSelectedMonth(12)
        setSelectedYear((y) => y - 1)
      } else {
        setSelectedMonth((m) => m - 1)
      }
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
      if (nextMonday.getTime() !== viewWeekStart.getTime()) {
        setViewWeekStart(nextMonday)
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1)
        setSelectedYear((y) => y + 1)
      } else {
        setSelectedMonth((m) => m + 1)
      }
      setSelectedDate(1)
    }
  }

  const handleTimeSlotClick = (timeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setShowClassDetails(true)
  }

  const handleDateClick = (day) => {
    const clicked = new Date(selectedYear, selectedMonth - 1, day)
    setViewDayDate(clicked)
    setSelectedDate(day)
    setSelectedView("day")
    const clickedMonday = getMondayOf(clicked)
    if (clickedMonday.getTime() !== viewWeekStart.getTime()) {
      setViewWeekStart(clickedMonday)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  const getMonthName = (monthNum) => MONTH_NAMES[monthNum - 1]
  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate()
  const getFirstDayOfMonth = (month, year) => new Date(year, month - 1, 1).getDay()
  const getDayName = (date) => DAY_NAMES[new Date(selectedYear, selectedMonth - 1, date).getDay()]
  const getShortDayName = (date) => {
    const shorts = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    return shorts[new Date(selectedYear, selectedMonth - 1, date).getDay()]
  }

  const getScheduleForDate = (date) => {
    // Exact match — works for any date in the currently fetched week
    const fromCache = dashboardData.dailySchedules[date.toString()]
    if (fromCache && fromCache.length > 0) return fromCache

    // Fall back to the repeating weekly pattern for any other weekday
    // (same courses repeat every week — rescheduled-specific dates just won't show for other weeks)
    const d = new Date(selectedYear, selectedMonth - 1, date)
    const jsDay = d.getDay() // 0=Sun, 1=Mon … 6=Sat
    if (jsDay === 0 || jsDay === 6) return [] // weekend
    const weekDayIdx = jsDay - 1 // Mon→0, Tue→1, … Fri→4

    // Use baseWeeklySchedule (pre-overlay) so dates in other weeks see the original
    // timetable, not the modified version for the week that had a reschedule.
    const baseSchedule = (dashboardData as any).baseWeeklySchedule ?? dashboardData.weeklySchedule ?? []
    const result: any[] = []
    for (const slot of baseSchedule) {
      const classItem = slot.classes?.[weekDayIdx]
      if (classItem) {
        result.push({ time: slot.time, class: { ...classItem, duration: "" } })
      }
    }
    return result
  }

  const handleQuickAction = (action) => {
    if (action.onClick.startsWith("/")) window.location.href = action.onClick
  }

  // ── Header label (passed to CalendarCard) ─────────────────────
  const getHeaderLabel = () => {
    if (selectedView === "week") {
      const friday = new Date(viewWeekStart)
      friday.setDate(friday.getDate() + 4)
      const startLabel = viewWeekStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      const endLabel = friday.toLocaleDateString("en-IN", { day: "numeric" })
      const yearLabel = viewWeekStart.getFullYear()
      return `${startLabel} – ${endLabel}, ${yearLabel}`
    }
    if (selectedView === "day") {
      return viewDayDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    }
    return `${getMonthName(selectedMonth)} ${selectedYear}`
  }

  return (
    <>
      <TopBar semester={dashboardData.semester} />

      {isLoading && (
        <div style={{ margin: "0 12px", padding: "8px 12px", borderRadius: 8, background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: "12px" }}>
          Loading dashboard data…
        </div>
      )}
      {loadError && (
        <div style={{ margin: "0 12px", padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px" }}>
          {loadError}
        </div>
      )}

      {stale && (
        <div style={{
          margin: "0 12px 8px",
          padding: "10px 16px",
          borderRadius: 8,
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.3)",
          color: "#1d4ed8",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}>
          <span>📅 A new timetable has been published. Your schedule may have changed.</span>
          <button
            onClick={() => loadDashboard(viewWeekStart)}
            style={{
              background: "#1d4ed8",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Refresh Now
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", margin: "12px", gap: "12px", overflow: "hidden" }}>
        {/* Main Panel */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
          <StatsCards stats={dashboardData.stats} />

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
          />

          <TodaysClasses
            todaysClasses={dashboardData.todaysClasses}
            currentDate={dashboardData.currentDate}
            handleTimeSlotClick={handleTimeSlotClick}
            setSelectedView={setSelectedView}
          />
        </div>

        {/* Right Panel */}
        <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <QuickActions quickActions={dashboardData.quickActions} handleQuickAction={handleQuickAction} />
          <UpcomingEvents upcomingEvents={dashboardData.upcomingEvents} />
        </div>
      </div>

      {showClassDetails && selectedTimeSlot && (
        <ClassDetailsModal selectedTimeSlot={selectedTimeSlot} onClose={() => setShowClassDetails(false)} />
      )}
    </>
  )
}
