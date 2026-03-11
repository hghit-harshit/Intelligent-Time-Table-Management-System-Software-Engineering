export default function WeekView({ timetableData, handleTimeSlotClick }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "60px repeat(5, 1fr)",
      minHeight: "400px",
    }}>
      {/* Day Headers */}
      <div></div>
      {timetableData.weekDays.map((day, i) => (
        <div key={day} style={{
          textAlign: "center",
          padding: "12px 4px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          fontSize: "11px",
        }}>
          <div style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "4px",
          }}>
            {day}
          </div>
          <div style={{
            fontSize: "18px",
            fontWeight: "700",
            color: timetableData.weekDates[i] === timetableData.currentDate.day ? "#60efff" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: timetableData.weekDates[i] === timetableData.currentDate.day ? "32px" : "auto",
            height: timetableData.weekDates[i] === timetableData.currentDate.day ? "32px" : "auto",
            borderRadius: timetableData.weekDates[i] === timetableData.currentDate.day ? "50%" : "0",
            background: timetableData.weekDates[i] === timetableData.currentDate.day ? "rgba(96,239,255,0.2)" : "transparent",
            margin: timetableData.weekDates[i] === timetableData.currentDate.day ? "0 auto" : 0,
            border: timetableData.weekDates[i] === timetableData.currentDate.day ? "1px solid #60efff" : "none",
          }}>
            {timetableData.weekDates[i]}
          </div>
        </div>
      ))}

      {/* Interactive Time Slots */}
      {timetableData.weeklySchedule.map((slot, slotIndex) => (
        <>
          <div key={`time-${slotIndex}`} style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            padding: "8px 12px 0 0",
            fontSize: "10px",
            color: "rgba(255,255,255,0.4)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            height: "60px",
          }}>
            {slot.time}
          </div>
          {slot.classes.map((classItem, dayIndex) => (
            <div key={`class-${slotIndex}-${dayIndex}`} style={{
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              height: "60px",
              padding: "4px",
              position: "relative",
              cursor: classItem ? "pointer" : "default",
            }}>
              {classItem && (
                <div
                  onClick={() => handleTimeSlotClick({ ...classItem, time: slot.time, day: timetableData.weekDays[dayIndex] })}
                  style={{
                    borderRadius: "6px",
                    padding: "6px 8px",
                    fontSize: "10px",
                    fontWeight: "600",
                    height: "100%",
                    background: classItem.isRescheduled
                      ? "rgba(251,146,60,0.2)"
                      : classItem.name?.includes('Data')
                      ? "rgba(96,239,255,0.2)"
                      : classItem.name?.includes('Networks')
                      ? "rgba(59,130,246,0.2)"
                      : classItem.name?.includes('Digital')
                      ? "rgba(251,146,60,0.2)"
                      : classItem.name?.includes('Signals')
                      ? "rgba(34,197,94,0.2)"
                      : classItem.name?.includes('Math')
                      ? "rgba(167,139,250,0.2)"
                      : "rgba(236,72,153,0.2)",
                    color: classItem.isRescheduled
                      ? "#fb923c"
                      : classItem.name?.includes('Data')
                      ? "#60efff"
                      : classItem.name?.includes('Networks')
                      ? "#3b82f6"
                      : classItem.name?.includes('Digital')
                      ? "#fb923c"
                      : classItem.name?.includes('Signals')
                      ? "#22c55e"
                      : classItem.name?.includes('Math')
                      ? "#a78bfa"
                      : "#ec4899",
                    border: classItem.isRescheduled ? "1px dashed #fb923c" : "1px solid rgba(255,255,255,0.1)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.02)"
                    e.target.style.filter = "brightness(1.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)"
                    e.target.style.filter = "brightness(1)"
                  }}
                >
                  <div style={{ fontWeight: "700", fontSize: "11px" }}>
                    {classItem.name}
                  </div>
                  {!classItem.isRescheduled && (
                    <div style={{
                      fontWeight: "400",
                      marginTop: "2px",
                      opacity: 0.8,
                      fontSize: "9px",
                    }}>
                      {classItem.location} · {classItem.professor}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      ))}
    </div>
  )
}
