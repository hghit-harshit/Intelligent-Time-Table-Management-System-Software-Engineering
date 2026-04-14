import { useState } from "react"
import { colors, fonts, radius, shadows } from "../styles/tokens"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
]

export default function CalendarView({ events = [], onSlotClick }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  const getEventForSlot = (day, time) => events.find((event) => event.day === day && event.time === time)

  const handleSlotClick = (day, time) => {
    setSelectedDay(day)
    setSelectedTime(time)
    if (onSlotClick) onSlotClick({ day, time })
  }

  return (
    <div style={{
      padding: "20px",
      borderRadius: radius.lg,
      overflow: "auto",
      background: colors.bg.base,
      border: `1px solid ${colors.border.medium}`,
      boxShadow: shadows.sm,
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: fonts.size.sm,
        fontFamily: fonts.body,
      }}>
        <thead>
          <tr>
            <th style={{
              padding: "10px 8px",
              borderBottom: `1px solid ${colors.border.medium}`,
              color: colors.text.muted,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: fonts.size.xs,
              width: "80px",
            }}>
              Time
            </th>
            {DAYS.map((day) => (
              <th key={day} style={{
                padding: "10px 8px",
                borderBottom: `1px solid ${colors.border.medium}`,
                color: colors.text.secondary,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: fonts.size.xs,
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
                borderBottom: `1px solid ${colors.border.subtle}`,
                color: colors.text.muted,
                fontSize: fonts.size.xs,
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
                      borderBottom: `1px solid ${colors.border.subtle}`,
                      borderLeft: `1px solid ${colors.border.subtle}`,
                      cursor: "pointer",
                      transition: "background 0.1s ease",
                      background: isSelected ? colors.primary.ghost : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.primary.ghost
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected ? colors.primary.ghost : "transparent"
                    }}
                  >
                    {event ? (
                      <div style={{
                        padding: "6px 8px",
                        borderRadius: radius.md,
                        fontSize: fonts.size.xs,
                        fontWeight: 500,
                        background: event.color || colors.primary.ghost,
                        color: event.textColor || colors.primary.main,
                        borderLeft: `3px solid ${event.textColor || colors.primary.main}`,
                        transition: "background 0.1s ease",
                      }}>
                        <div style={{ marginBottom: "2px" }}>{event.title}</div>
                        {event.location && (
                          <div style={{
                            fontSize: "9px",
                            fontWeight: 400,
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
                        color: colors.border.strong,
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
