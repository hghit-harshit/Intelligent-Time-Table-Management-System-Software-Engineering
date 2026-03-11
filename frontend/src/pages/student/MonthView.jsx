export default function MonthView({
  selectedMonth,
  selectedYear,
  selectedDate,
  handleDateClick,
  getDaysInMonth,
  getFirstDayOfMonth,
  timetableData,
}) {
  return (
    <div style={{ minHeight: "400px", padding: "16px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "1px",
        marginBottom: "16px",
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            textAlign: "center",
            padding: "12px 4px",
            fontSize: "11px",
            fontWeight: "600",
            color: "rgba(255,255,255,0.6)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            {day}
          </div>
        ))}
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "1px",
        background: "rgba(255,255,255,0.05)",
      }}>
        {(() => {
          const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
          const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
          const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
          return Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - firstDay + 1
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
            const isToday = dayNum === timetableData.currentDate.day && selectedMonth === timetableData.currentDate.month && selectedYear === timetableData.currentDate.year
            const isSelected = dayNum === selectedDate
            const hasClass = timetableData.calendar.monthDaysWithClasses.includes(dayNum)

            return (
              <div key={i}
                onClick={() => isCurrentMonth && handleDateClick(dayNum)}
                style={{
                  minHeight: "60px",
                  padding: "4px",
                  background: isSelected ? "rgba(96,239,255,0.1)" : "rgba(255,255,255,0.02)",
                  border: isSelected ? "1px solid #60efff" : "1px solid rgba(255,255,255,0.05)",
                  position: "relative",
                  cursor: isCurrentMonth ? "pointer" : "default",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (isCurrentMonth) {
                    e.target.style.background = "rgba(96,239,255,0.05)"
                    e.target.style.borderColor = "rgba(96,239,255,0.3)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (isCurrentMonth) {
                    e.target.style.background = isSelected ? "rgba(96,239,255,0.1)" : "rgba(255,255,255,0.02)"
                    e.target.style.borderColor = isSelected ? "#60efff" : "rgba(255,255,255,0.05)"
                  }
                }}>
                {isCurrentMonth && (
                  <>
                    <div style={{
                      fontSize: "12px",
                      fontWeight: (isToday || isSelected) ? "700" : "500",
                      color: (isToday || isSelected) ? "#60efff" : "rgba(255,255,255,0.8)",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: (isToday || isSelected) ? "20px" : "auto",
                      height: (isToday || isSelected) ? "20px" : "auto",
                      borderRadius: (isToday || isSelected) ? "50%" : "0",
                      background: (isToday || isSelected) ? "rgba(96,239,255,0.2)" : "transparent",
                      border: (isToday || isSelected) ? "1px solid #60efff" : "none",
                    }}>
                      {dayNum}
                    </div>
                    {hasClass && (
                      <div style={{
                        position: "absolute",
                        bottom: "4px",
                        left: "4px",
                        right: "4px",
                        height: "3px",
                        background: "linear-gradient(90deg, #60efff, #9333ea)",
                        borderRadius: "2px",
                      }} />
                    )}
                  </>
                )}
              </div>
            )
          })
        })()}
      </div>
    </div>
  )
}
