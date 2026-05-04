import { Fragment } from "react"
import { Box, Typography } from "@mui/material"
import { colors, fonts, radius } from "../../../styles/tokens"

const getClassColor = (classItem) => {
  if (classItem.isRescheduled) return { bg: colors.warning.ghost, text: colors.warning.main }
  const name = classItem.name || ""
  if (name.includes("Data"))     return { bg: colors.primary.ghost,    text: colors.primary.main }
  if (name.includes("Networks")) return { bg: colors.info.ghost,        text: colors.info.main }
  if (name.includes("Digital"))  return { bg: colors.warning.ghost,     text: colors.warning.main }
  if (name.includes("Signals"))  return { bg: colors.success.ghost,     text: colors.success.main }
  if (name.includes("Math"))     return { bg: colors.secondary.ghost,   text: colors.secondary.main }
  return { bg: "rgba(236,72,153,0.08)", text: "#ec4899" }
}

export default function WeekView({ timetableData, viewWeekStart, handleTimeSlotClick }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build the 5 actual dates for the displayed week (Mon–Fri)
  const weekActualDates: Date[] = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(viewWeekStart)
    d.setDate(viewWeekStart.getDate() + i)
    return d
  })

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "64px repeat(5, 1fr)" }}>
      {/* Day Headers */}
      <Box sx={{ borderBottom: `1px solid ${colors.border.subtle}` }} />
      {timetableData.weekDays.map((day, i) => {
        const actualDate = weekActualDates[i]
        const isToday = actualDate?.toDateString() === today.toDateString()
        // Use client-computed date so header updates instantly on nav click
        const dateNum = actualDate ? actualDate.getDate() : timetableData.weekDates[i]
        return (
          <Box
            key={day}
            sx={{
              textAlign: "center",
              p: "10px 4px",
              borderBottom: `1px solid ${colors.border.subtle}`,
              borderLeft: `1px solid ${colors.border.subtle}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: isToday ? colors.primary.main : colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: fonts.letterSpacing.wide,
                display: "block",
                mb: 0.5,
                fontWeight: isToday ? fonts.weight.semibold : fonts.weight.regular,
              }}
            >
              {day}
            </Typography>
            <Box
              sx={{
                fontSize: fonts.size.lg,
                fontWeight: fonts.weight.bold,
                color: isToday ? "#fff" : colors.text.primary,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: isToday ? colors.primary.main : "transparent",
              }}
            >
              {dateNum}
            </Box>
          </Box>
        )
      })}

      {/* Time rows */}
      {timetableData.weeklySchedule.map((slot, slotIndex) => (
        <Fragment key={slotIndex}>
          {/* Time label */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              p: "10px 10px 0 0",
              fontSize: "11px",
              color: colors.text.muted,
              borderTop: `1px solid ${colors.border.subtle}`,
              minHeight: 80,
            }}
          >
            {slot.time}
          </Box>

          {/* Cells */}
          {slot.classes.map((classItem, dayIndex) => {
            const classColor = classItem ? getClassColor(classItem) : null
            return (
              <Box
                key={`${slotIndex}-${dayIndex}`}
                sx={{
                  borderLeft: `1px solid ${colors.border.subtle}`,
                  borderTop: `1px solid ${colors.border.subtle}`,
                  minHeight: 80,
                  p: "4px",
                  cursor: classItem ? "pointer" : "default",
                }}
              >
                {classItem && (
                  <Box
                    onClick={() =>
                      handleTimeSlotClick({
                        ...classItem,
                        time: slot.time,
                        day: timetableData.weekDays[dayIndex],
                      })
                    }
                    sx={{
                      borderRadius: radius.sm,
                      p: "6px 8px",
                      height: "calc(100% - 2px)",
                      bgcolor: classColor.bg,
                      color: classColor.text,
                      border: classItem.isRescheduled
                        ? `1px dashed ${colors.warning.main}`
                        : `1px solid transparent`,
                      transition: "filter 0.15s",
                      "&:hover": { filter: "brightness(0.95)" },
                    }}
                  >
                    <Typography sx={{ fontWeight: fonts.weight.bold, fontSize: "11px", color: "inherit", lineHeight: 1.3 }}>
                      {classItem.name}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", mt: 0.5, opacity: 0.75, color: "inherit", lineHeight: 1.3 }}>
                      {classItem.location}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", opacity: 0.65, color: "inherit", lineHeight: 1.3 }}>
                      {classItem.professor}
                    </Typography>
                  </Box>
                )}
              </Box>
            )
          })}
        </Fragment>
      ))}

      {/* Empty state */}
      {timetableData.weeklySchedule.length === 0 && (
        <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 6, color: colors.text.muted }}>
          <Typography sx={{ fontSize: fonts.size.sm }}>No classes scheduled for this week</Typography>
        </Box>
      )}
    </Box>
  )
}
