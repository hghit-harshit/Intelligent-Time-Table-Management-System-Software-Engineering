/**
 * MonthView.jsx — Monthly Calendar Grid
 *
 * PURPOSE: Renders a traditional month calendar grid (Sun–Sat).
 * Days with classes get a gradient bar at the bottom. Clicking
 * a date switches to the day view for that date.
 */

import { Box, Typography } from "@mui/material"
import { colors, fonts, radius } from "../../styles/tokens"

export default function MonthView({
  selectedMonth,
  selectedYear,
  selectedDate,
  handleDateClick,
  getDaysInMonth,
  getFirstDayOfMonth,
  timetableData,
}) {
  // Calculate grid cells needed for the month
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  return (
    <Box sx={{ minHeight: 400, p: 2 }}>
      {/* Day-of-week headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "1px",
          mb: 2,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Typography
            key={day}
            variant="caption"
            sx={{
              textAlign: "center",
              p: "12px 4px",
              fontWeight: fonts.weight.bold,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: fonts.letterSpacing.wide,
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "1px",
          bgcolor: colors.bg.raised,
        }}
      >
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - firstDay + 1
          const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
          const isToday =
            dayNum === timetableData.currentDate.day &&
            selectedMonth === timetableData.currentDate.month &&
            selectedYear === timetableData.currentDate.year
          const isSelected = dayNum === selectedDate
          const hasClass = timetableData.calendar.monthDaysWithClasses.includes(dayNum)
          const isHighlighted = isToday || isSelected

          return (
            <Box
              key={i}
              onClick={() => isCurrentMonth && handleDateClick(dayNum)}
              sx={{
                minHeight: 60,
                p: 0.5,
                bgcolor: isSelected ? colors.primary.ghost : colors.bg.base,
                border: isSelected
                  ? `1px solid ${colors.primary.main}`
                  : `1px solid ${colors.border.subtle}`,
                position: "relative",
                cursor: isCurrentMonth ? "pointer" : "default",
                transition: "all 0.2s ease",
                "&:hover": isCurrentMonth
                  ? {
                      bgcolor: colors.primary.ghost,
                      borderColor: colors.primary.border,
                    }
                  : {},
              }}
            >
              {isCurrentMonth && (
                <>
                  {/* Day number */}
                  <Box
                    sx={{
                      fontSize: fonts.size.sm,
                      fontWeight: isHighlighted ? fonts.weight.bold : fonts.weight.medium,
                      color: isHighlighted ? colors.primary.main : colors.text.secondary,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: isHighlighted ? 20 : "auto",
                      height: isHighlighted ? 20 : "auto",
                      borderRadius: isHighlighted ? "50%" : 0,
                      bgcolor: isHighlighted ? colors.primary.ghost : "transparent",
                      border: isHighlighted ? `1px solid ${colors.primary.main}` : "none",
                    }}
                  >
                    {dayNum}
                  </Box>

                  {/* Class indicator bar */}
                  {hasClass && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        right: 4,
                        height: 3,
                        background: colors.primary.main,
                        borderRadius: "2px",
                      }}
                    />
                  )}
                </>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
