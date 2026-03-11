/**
 * DayView.jsx — Single Day Schedule View
 *
 * PURPOSE: Shows a full-day timeline for a selected date. Each time
 * slot shows any scheduled class with color coding and details.
 * Shows an empty state illustration when no classes are scheduled.
 */

import { Box, Typography } from "@mui/material"
import { colors, fonts, radius } from "../../styles/tokens"

// Maps subject names to token colors — same logic as WeekView
const getClassColor = (classItem) => {
  if (classItem.isRescheduled) return { bg: colors.warning.ghost, text: colors.warning.main }
  const name = classItem.name || ""
  if (name.includes("Data"))     return { bg: colors.primary.ghost,  text: colors.primary.main }
  if (name.includes("Math"))     return { bg: colors.secondary.ghost,   text: colors.secondary.main }
  if (name.includes("Signals"))  return { bg: colors.success.ghost,     text: colors.success.main }
  return { bg: colors.primary.ghost, text: colors.primary.main }
}

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
  // Fetch the schedule array for the selected date
  const selectedDateSchedule = getScheduleForDate(selectedDate)

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        minHeight: 400,
      }}
    >
      {/* Left date indicator */}
      <Box
        sx={{
          borderRight: `1px solid ${colors.border.subtle}`,
          p: "16px 12px",
          textAlign: "center",
        }}
      >
        <Typography variant="caption" sx={{ color: colors.text.muted, textTransform: "uppercase", letterSpacing: fonts.letterSpacing.wide, mb: 1, display: "block" }}>
          {getDayName(selectedDate)}
        </Typography>
        <Typography sx={{ fontSize: fonts.size.xl, fontWeight: fonts.weight.bold, color: colors.primary.main, mb: 0.5 }}>
          {selectedDate}
        </Typography>
        <Typography variant="caption" sx={{ color: colors.text.muted }}>
          {getMonthName(selectedMonth)} {selectedYear}
        </Typography>
      </Box>

      {/* Timeline */}
      <Box>
        {selectedDateSchedule.length === 0 ? (
          /* Empty state */
          <Box
            className="flex flex-col items-center justify-center text-center"
            sx={{ minHeight: 300, color: colors.text.muted, p: 4 }}
          >
            <Box sx={{ fontSize: "48px", mb: 2 }}>📅</Box>
            <Typography sx={{ fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, mb: 1, fontFamily: fonts.heading, color: colors.text.secondary }}>
              No Classes Scheduled
            </Typography>
            <Typography variant="body2">
              You have no classes on {getDayName(selectedDate)}, {getMonthName(selectedMonth)} {selectedDate}
            </Typography>
          </Box>
        ) : (
          /* Render each time slot */
          timetableData.calendar.timeSlots.map((time, i) => {
            const classForTime = selectedDateSchedule.find((item) => item.time === time)
            const slot = { time, class: classForTime?.class || null }
            const classColor = slot.class ? getClassColor(slot.class) : null

            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  minHeight: 60,
                }}
              >
                {/* Time label */}
                <Box
                  sx={{
                    width: 80,
                    p: "12px 16px",
                    fontSize: fonts.size.xs,
                    color: colors.text.muted,
                    borderRight: `1px solid ${colors.border.subtle}`,
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  {slot.time}
                </Box>

                {/* Class card (if scheduled) */}
                <Box
                  sx={{
                    flex: 1,
                    p: "8px 16px",
                    cursor: slot.class ? "pointer" : "default",
                  }}
                >
                  {slot.class && (
                    <Box
                      onClick={() =>
                        handleTimeSlotClick({
                          ...slot.class,
                          time: slot.time,
                          day: getShortDayName(selectedDate),
                        })
                      }
                      sx={{
                        borderRadius: radius.md,
                        p: "12px 16px",
                        bgcolor: classColor.bg,
                        color: classColor.text,
                        border: slot.class.isRescheduled
                          ? `1px dashed ${colors.warning.main}`
                          : `1px solid ${colors.border.subtle}`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.01)",
                          filter: "brightness(1.15)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 0.5,
                        }}
                      >
                        <Typography sx={{ fontWeight: fonts.weight.bold, fontSize: fonts.size.md, color: "inherit" }}>
                          {slot.class.name}
                        </Typography>
                        {!slot.class.isRescheduled && (
                          <Typography sx={{ fontSize: fonts.size.xs, opacity: 0.7, color: "inherit" }}>
                            {slot.class.duration}
                          </Typography>
                        )}
                      </Box>
                      {!slot.class.isRescheduled && (
                        <Typography sx={{ fontSize: fonts.size.xs, opacity: 0.8, color: "inherit" }}>
                          📍 {slot.class.location} • 👨‍🏫 {slot.class.professor}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            )
          })
        )}
      </Box>
    </Box>
  )
}
