import { useState } from "react"
import timetableData from "../../../data/timetableData.json"
import TopBar from "../components/TopBar"
import StatsCards from "../components/StatsCards"
import CalendarCard from "../components/CalendarCard"
import TodaysClasses from "../components/TodaysClasses"
import QuickActions from "../components/QuickActions"
import UpcomingEvents from "../components/UpcomingEvents"
import ClassDetailsModal from "../components/ClassDetailsModal"

export default function StudentDashboard() {
  const [selectedView, setSelectedView] = useState('week')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [showClassDetails, setShowClassDetails] = useState(false)
  const [selectedDate, setSelectedDate] = useState(timetableData.currentDate.day)
  const [selectedMonth, setSelectedMonth] = useState(timetableData.currentDate.month)
  const [selectedYear, setSelectedYear] = useState(timetableData.currentDate.year)

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

  const getScheduleForDate = (date) => timetableData.dailySchedules[date.toString()] || []

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
      <TopBar semester={timetableData.semester} />

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
          <StatsCards stats={timetableData.stats} />

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
            timetableData={timetableData}
          />

          <TodaysClasses
            todaysClasses={timetableData.todaysClasses}
            currentDate={timetableData.currentDate}
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
            quickActions={timetableData.quickActions}
            handleQuickAction={handleQuickAction}
          />
          <UpcomingEvents upcomingEvents={timetableData.upcomingEvents} />
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
