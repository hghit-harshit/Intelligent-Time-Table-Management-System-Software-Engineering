import WeekView from "./WeekView"
import MonthView from "./MonthView"
import DayView from "./DayView"

export default function CalendarCard({
  selectedView,
  setSelectedView,
  selectedDate,
  selectedMonth,
  selectedYear,
  handlePrevMonth,
  handleNextMonth,
  handleDateClick,
  handleTimeSlotClick,
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
  getDayName,
  getShortDayName,
  getScheduleForDate,
  timetableData,
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      marginBottom: "20px",
      overflow: "hidden",
    }}>
      {/* Calendar Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <h3 style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#fff",
          margin: 0,
          fontFamily: "'Playfair Display', serif",
        }}>
          {getMonthName(selectedMonth)} {selectedYear}
        </h3>
        <div style={{
          display: "flex",
          gap: "4px",
          marginLeft: "16px",
        }}>
          <button style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "6px",
            width: "28px", height: "28px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "12px",
            transition: "all 0.2s ease",
          }} onClick={handlePrevMonth}
             onMouseEnter={(e) => e.target.style.background = "rgba(96,239,255,0.2)"}
             onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}>‹</button>
          <button style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "6px",
            width: "28px", height: "28px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "12px",
            transition: "all 0.2s ease",
          }} onClick={handleNextMonth}
             onMouseEnter={(e) => e.target.style.background = "rgba(96,239,255,0.2)"}
             onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}>›</button>
        </div>
        <div style={{
          marginLeft: "auto",
          display: "flex",
          gap: "4px",
        }}>
          {['Month', 'Week', 'Day'].map((view) => (
            <button key={view} onClick={() => setSelectedView(view.toLowerCase())} style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: selectedView === view.toLowerCase() ? "#60efff" : "rgba(255,255,255,0.1)",
              color: selectedView === view.toLowerCase() ? "#0a0a12" : "#fff",
              fontSize: "11px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}>
              {view}
            </button>
          ))}
        </div>
      </div>

      {selectedView === 'week' && (
        <WeekView
          timetableData={timetableData}
          handleTimeSlotClick={handleTimeSlotClick}
        />
      )}

      {selectedView === 'month' && (
        <MonthView
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedDate={selectedDate}
          handleDateClick={handleDateClick}
          getDaysInMonth={getDaysInMonth}
          getFirstDayOfMonth={getFirstDayOfMonth}
          timetableData={timetableData}
        />
      )}

      {selectedView === 'day' && (
        <DayView
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          getDayName={getDayName}
          getMonthName={getMonthName}
          getShortDayName={getShortDayName}
          getScheduleForDate={getScheduleForDate}
          handleTimeSlotClick={handleTimeSlotClick}
          timetableData={timetableData}
        />
      )}
    </div>
  )
}
