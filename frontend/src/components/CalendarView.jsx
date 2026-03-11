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
    <div style={{
      padding: "20px",
      borderRadius: "8px",
      overflow: "auto",
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "12px",
        fontFamily: '"Inter", sans-serif',
      }}>
        <thead>
          <tr>
            <th style={{
              padding: "10px 8px",
              borderBottom: "1px solid #E5E7EB",
              color: "#9CA3AF",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "11px",
              width: "80px",
            }}>
              Time
            </th>
            {DAYS.map((day) => (
              <th key={day} style={{
                padding: "10px 8px",
                borderBottom: "1px solid #E5E7EB",
                color: "#6B7280",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "11px",
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
                padding: "10px 8px",
                borderBottom: "1px solid #F3F4F6",
                color: "#9CA3AF",
                fontSize: "11px",
                textAlign: "center",
                fontVariantNumeric: "tabular-nums",
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
                      padding: "6px",
                      borderBottom: "1px solid #F3F4F6",
                      borderLeft: "1px solid #F3F4F6",
                      cursor: "pointer",
                      transition: "background 0.1s ease",
                      background: isSelected ? "rgba(0,106,220,0.06)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,106,220,0.04)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected ? "rgba(0,106,220,0.06)" : "transparent"
                    }}
                  >
                    {event ? (
                      <div style={{
                        padding: "6px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "500",
                        background: event.color || "rgba(0,106,220,0.08)",
                        color: event.textColor || "#006ADC",
                        borderLeft: `3px solid ${event.textColor || "#006ADC"}`,
                        transition: "background 0.1s ease",
                      }}>
                        <div style={{ marginBottom: "2px" }}>{event.title}</div>
                        {event.location && (
                          <div style={{
                            fontSize: "9px",
                            fontWeight: "400",
                            opacity: 0.7,
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
                        color: "#D1D5DB",
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
