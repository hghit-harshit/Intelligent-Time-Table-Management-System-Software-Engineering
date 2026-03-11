export default function DayView({
  selectedDate,
  selectedMonth,
  selectedYear,
  getDayName,
  getMonthName,
  getShortDayName,
  getScheduleForDate,
  handleTimeSlotClick,
  timetableData,
}) {
  const selectedDateSchedule = getScheduleForDate(selectedDate)

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "80px 1fr",
      minHeight: "400px",
    }}>
      <div style={{
        borderRight: "1px solid rgba(255,255,255,0.1)",
        padding: "16px 12px",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "10px",
          color: "rgba(255,255,255,0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "8px",
        }}>
          {getDayName(selectedDate)}
        </div>
        <div style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#60efff",
          marginBottom: "4px",
        }}>
          {selectedDate}
        </div>
        <div style={{
          fontSize: "10px",
          color: "rgba(255,255,255,0.4)",
        }}>
          {getMonthName(selectedMonth)} {selectedYear}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        {selectedDateSchedule.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
              No Classes Scheduled
            </div>
            <div style={{ fontSize: "12px" }}>
              You have no classes on {getDayName(selectedDate)}, {getMonthName(selectedMonth)} {selectedDate}
            </div>
          </div>
        ) : (
          timetableData.calendar.timeSlots.map((time, i) => {
            const classForTime = selectedDateSchedule.find(item => item.time === time)
            const slot = { time, class: classForTime?.class || null }
            return (
              <div key={i} style={{
                display: "flex",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                minHeight: "60px",
              }}>
                <div style={{
                  width: "80px",
                  padding: "12px 16px",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "flex-start",
                }}>
                  {slot.time}
                </div>
                <div style={{
                  flex: 1,
                  padding: "8px 16px",
                  position: "relative",
                  cursor: slot.class ? "pointer" : "default",
                }}>
                  {slot.class && (
                    <div
                      onClick={() => handleTimeSlotClick({ ...slot.class, time: slot.time, day: getShortDayName(selectedDate) })}
                      style={{
                        borderRadius: "8px",
                        padding: "12px 16px",
                        background: slot.class.isRescheduled
                          ? "rgba(251,146,60,0.15)"
                          : slot.class.name?.includes('Data')
                          ? "rgba(96,239,255,0.15)"
                          : slot.class.name?.includes('Math')
                          ? "rgba(167,139,250,0.15)"
                          : "rgba(34,197,94,0.15)",
                        color: slot.class.isRescheduled
                          ? "#fb923c"
                          : slot.class.name?.includes('Data')
                          ? "#60efff"
                          : slot.class.name?.includes('Math')
                          ? "#a78bfa"
                          : "#22c55e",
                        border: slot.class.isRescheduled ? "1px dashed #fb923c" : "1px solid rgba(255,255,255,0.1)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.01)"
                        e.target.style.filter = "brightness(1.1)"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)"
                        e.target.style.filter = "brightness(1)"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                      }}>
                        <div style={{ fontWeight: "700", fontSize: "14px" }}>
                          {slot.class.name}
                        </div>
                        {!slot.class.isRescheduled && (
                          <div style={{
                            fontSize: "10px",
                            opacity: 0.7,
                          }}>
                            {slot.class.duration}
                          </div>
                        )}
                      </div>
                      {!slot.class.isRescheduled && (
                        <div style={{
                          fontSize: "11px",
                          opacity: 0.8,
                        }}>
                          📍 {slot.class.location} • 👨‍🏫 {slot.class.professor}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
