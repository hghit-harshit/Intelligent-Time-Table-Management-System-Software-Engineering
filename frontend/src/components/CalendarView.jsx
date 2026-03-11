import { useState } from "react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
]

export default function CalendarView({ events = [], onSlotClick }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  const getEventForSlot = (day, time) => {
    return events.find(
      (event) => event.day === day && event.time === time
    )
  }

  const handleSlotClick = (day, time) => {
    setSelectedDay(day)
    setSelectedTime(time)
    if (onSlotClick) {
      onSlotClick({ day, time })
    }
  }

  return (
    <div className="glass-card" style={{
      padding: "20px",
      borderRadius: "16px",
      overflow: "auto",
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "12px",
      }}>
        <thead>
          <tr>
            <th style={{
              padding: "12px 8px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              width: "80px",
            }}>
              Time
            </th>
            {DAYS.map((day) => (
              <th key={day} style={{
                padding: "12px 8px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((time) => (
            <tr key={time}>
              <td style={{
                padding: "12px 8px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                textAlign: "center",
              }}>
                {time}
              </td>
              {DAYS.map((day) => {
                const event = getEventForSlot(day, time)
                const isSelected = selectedDay === day && selectedTime === time

                return (
                  <td
                    key={`${day}-${time}`}
                    onClick={() => handleSlotClick(day, time)}
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      borderLeft: "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: isSelected ? "rgba(96,239,255,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(96,239,255,0.05)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected ? "rgba(96,239,255,0.1)" : "transparent"
                    }}
                  >
                    {event ? (
                      <div style={{
                        padding: "8px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: event.color || "rgba(96,239,255,0.2)",
                        color: event.textColor || "#60efff",
                        border: `1px solid ${event.color?.replace("0.2", "0.3") || "rgba(96,239,255,0.3)"}`,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.02)"
                        e.target.style.filter = "brightness(1.1)"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)"
                        e.target.style.filter = "brightness(1)"
                      }}>
                        <div style={{ marginBottom: "2px" }}>{event.title}</div>
                        {event.location && (
                          <div style={{
                            fontSize: "9px",
                            fontWeight: "400",
                            opacity: 0.8,
                          }}>
                            {event.location}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.2)",
                        fontSize: "10px",
                      }}>
                        +
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
