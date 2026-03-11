/**
 * WeekView.jsx — Weekly Timetable Grid
 *
 * PURPOSE: Displays a Mon–Fri time grid showing all classes for the
 * current week. Color-coded by subject. Clicking a class opens the
 * details modal.
 */

import { Fragment } from "react"
import { Box, Typography } from "@mui/material"
import { colors, fonts, radius } from "../../styles/tokens"

// Maps subject names to token colors for consistent color coding
const getClassColor = (classItem) => {
  if (classItem.isRescheduled) return { bg: colors.warning.ghost, text: colors.warning.main }
  const name = classItem.name || ""
  if (name.includes("Data"))     return { bg: colors.primary.ghost,  text: colors.primary.main }
  if (name.includes("Networks")) return { bg: colors.info.ghost,        text: colors.info.main }
  if (name.includes("Digital"))  return { bg: colors.warning.ghost,     text: colors.warning.main }
  if (name.includes("Signals"))  return { bg: colors.success.ghost,     text: colors.success.main }
  if (name.includes("Math"))     return { bg: colors.secondary.ghost,   text: colors.secondary.main }
  return { bg: "rgba(236,72,153,0.08)", text: "#ec4899" }
}

export default function WeekView({ timetableData, handleTimeSlotClick }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "60px repeat(5, 1fr)",
        minHeight: 400,
      }}
    >
      {/* Day Headers */}
      <Box />
      {timetableData.weekDays.map((day, i) => {
        const isToday = timetableData.weekDates[i] === timetableData.currentDate.day
        return (
          <Box
            key={day}
            sx={{
              textAlign: "center",
              p: "8px 4px",
              borderBottom: `1px solid ${colors.border.subtle}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: fonts.letterSpacing.wide,
                display: "block",
                mb: 0.5,
              }}
            >
              {day}
            </Typography>
            <Box
              sx={{
                fontSize: fonts.size.lg,
                fontWeight: fonts.weight.bold,
                color: isToday ? colors.primary.main : colors.text.primary,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: isToday ? 32 : "auto",
                height: isToday ? 32 : "auto",
                borderRadius: isToday ? "50%" : 0,
                bgcolor: isToday ? colors.primary.ghost : "transparent",
                border: isToday ? `1px solid ${colors.primary.main}` : "none",
              }}
            >
              {timetableData.weekDates[i]}
            </Box>
          </Box>
        )
      })}

      {/* Time Slot Rows */}
      {timetableData.weeklySchedule.map((slot, slotIndex) => (
        <Fragment key={slotIndex}>
          {/* Time label */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              p: "8px 12px 0 0",
              fontSize: fonts.size.xs,
              color: colors.text.muted,
              borderTop: `1px solid ${colors.border.subtle}`,
              height: 60,
            }}
          >
            {slot.time}
          </Box>

          {/* Class cells for each day */}
          {slot.classes.map((classItem, dayIndex) => {
            const classColor = classItem ? getClassColor(classItem) : null
            return (
              <Box
                key={`${slotIndex}-${dayIndex}`}
                sx={{
                  borderLeft: `1px solid ${colors.border.subtle}`,
                  borderTop: `1px solid ${colors.border.subtle}`,
                  height: 60,
                  p: 0.5,
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
                      fontSize: fonts.size.xs,
                      fontWeight: fonts.weight.bold,
                      height: "100%",
                      bgcolor: classColor.bg,
                      color: classColor.text,
                      border: classItem.isRescheduled
                        ? `1px dashed ${colors.warning.main}`
                        : `1px solid ${colors.border.subtle}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                        filter: "brightness(1.15)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: fonts.weight.bold,
                        fontSize: fonts.size.xs,
                        color: "inherit",
                      }}
                    >
                      {classItem.name}
                    </Typography>
                    {!classItem.isRescheduled && (
                      <Typography
                        sx={{
                          fontSize: "9px",
                          mt: 0.25,
                          opacity: 0.8,
                          color: "inherit",
                        }}
                      >
                        {classItem.location} · {classItem.professor}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )
          })}
        </Fragment>
      ))}
    </Box>
  )
}
