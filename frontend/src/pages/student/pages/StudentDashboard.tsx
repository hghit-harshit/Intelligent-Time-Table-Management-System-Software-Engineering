import { useEffect, useState } from "react"
import { fetchStudentDashboard } from "../../../services/studentApi"
import TopBar from "../components/TopBar"
import StatsCards from "../components/StatsCards"
import CalendarCard from "../components/CalendarCard"
import TodaysClasses from "../components/TodaysClasses"
import QuickActions from "../components/QuickActions"
import UpcomingEvents from "../components/UpcomingEvents"
import ClassDetailsModal from "../components/ClassDetailsModal"

const buildEmptyDashboard = () => {
  const now = new Date()
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return {
    semester: {
      name: "Semester",
      period: "",
      status: { text: "Loading", type: "info" },
    },
    currentDate: {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      dayName: dayNames[now.getDay()],
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
  const initialDashboard = buildEmptyDashboard()
  const [dashboardData, setDashboardData] = useState(initialDashboard)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [selectedView, setSelectedView] = useState('week')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [showClassDetails, setShowClassDetails] = useState(false)
  const [selectedDate, setSelectedDate] = useState(initialDashboard.currentDate.day)
  const [selectedMonth, setSelectedMonth] = useState(initialDashboard.currentDate.month)
  const [selectedYear, setSelectedYear] = useState(initialDashboard.currentDate.year)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setLoadError(null)

    fetchStudentDashboard()
      .then((data) => {
        if (!isMounted) return
        setDashboardData(data)
        setSelectedDate(data.currentDate.day)
        setSelectedMonth(data.currentDate.month)
        setSelectedYear(data.currentDate.year)
      })
      .catch((error) => {
        if (!isMounted) return
        setLoadError(error?.message || "Unable to load dashboard data")
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleTimeSlotClick = (timeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setShowClassDetails(true)
  }

  const handleDateClick = (day) => {
    setSelectedDate(day)
    setSelectedView('day')
  }

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
    setSelectedDate(1)
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
    setSelectedDate(1)
  }

  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate()
  const getFirstDayOfMonth = (month, year) => new Date(year, month - 1, 1).getDay()

  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date(selectedYear, selectedMonth - 1, date).getDay()]
  }

  const getShortDayName = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    return days[new Date(selectedYear, selectedMonth - 1, date).getDay()]
  }

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[monthNum - 1]
  }

  const getScheduleForDate = (date) => dashboardData.dailySchedules[date.toString()] || []

  const handleQuickAction = (action) => {
    if (action.onClick.startsWith('/')) {
      window.location.href = action.onClick
    } else if (action.onClick === 'modal:addEvent') {
      alert('Add Event functionality coming soon!')
    } else if (action.onClick === 'modal:stats') {
      alert('Stats: 92% Attendance, 6 Courses, 24 Classes this week')
    }
  }

  return (
    <>
      <TopBar semester={dashboardData.semester} />

      {isLoading && (
        <div
          style={{
            margin: "0 12px",
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(59, 130, 246, 0.1)",
            color: "#3b82f6",
            fontSize: "12px",
          }}
        >
          Loading dashboard data...
        </div>
      )}

      {loadError && (
        <div
          style={{
            margin: "0 12px",
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            fontSize: "12px",
          }}
        >
          {loadError}
        </div>
      )}

      <div style={{
        flex: 1,
        display: "flex",
        margin: "12px",
        gap: "12px",
        overflow: "hidden",
      }}>
        {/* Main Panel */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "8px",
        }}>
          <StatsCards stats={dashboardData.stats} />

          <CalendarCard
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            handleDateClick={handleDateClick}
            handleTimeSlotClick={handleTimeSlotClick}
            getMonthName={getMonthName}
            getDaysInMonth={getDaysInMonth}
            getFirstDayOfMonth={getFirstDayOfMonth}
            getDayName={getDayName}
            getShortDayName={getShortDayName}
            getScheduleForDate={getScheduleForDate}
            timetableData={dashboardData}
          />

          <TodaysClasses
            todaysClasses={dashboardData.todaysClasses}
            currentDate={dashboardData.currentDate}
            handleTimeSlotClick={handleTimeSlotClick}
            setSelectedView={setSelectedView}
          />
        </div>

        {/* Right Panel */}
        <div style={{
          width: "260px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          <QuickActions
            quickActions={dashboardData.quickActions}
            handleQuickAction={handleQuickAction}
          />
          <UpcomingEvents upcomingEvents={dashboardData.upcomingEvents} />
        </div>
      </div>

      {showClassDetails && selectedTimeSlot && (
        <ClassDetailsModal
          selectedTimeSlot={selectedTimeSlot}
          onClose={() => setShowClassDetails(false)}
        />
      )}
    </>
  )
}
