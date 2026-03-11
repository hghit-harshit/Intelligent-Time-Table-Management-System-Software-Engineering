/**
 * CalendarCard.jsx — Calendar Container with View Switcher
 *
 * PURPOSE: Houses the Month/Week/Day toggle buttons and renders
 * the appropriate view component based on the selected mode.
 */

import { Box, Typography, Button } from "@mui/material"
import { colors, fonts, radius, glass } from "../../styles/tokens"
import WeekView from "./WeekView"
import MonthView from "./MonthView"
import DayView from "./DayView"

export default function CalendarCard({
  selectedView,
  setSelectedView,
  selectedDate,
  selectedMonth,
  selectedYear,
  handlePrevMonth,
  handleNextMonth,
  handleDateClick,
  handleTimeSlotClick,
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
  getDayName,
  getShortDayName,
  getScheduleForDate,
  timetableData,
}) {
  return (
    <Box
      sx={{
        ...glass,
        mb: "20px",
        overflow: "hidden",
      }}
    >
      {/* Calendar Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: "16px 20px",
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontFamily: fonts.heading, m: 0, fontSize: fonts.size.lg }}
        >
          {getMonthName(selectedMonth)} {selectedYear}
        </Typography>

        {/* Month navigation arrows */}
        <Box sx={{ display: "flex", gap: 0.5, ml: 2 }}>
          {[
            { label: "‹", handler: handlePrevMonth },
            { label: "›", handler: handleNextMonth },
          ].map((btn) => (
            <Box
              key={btn.label}
              component="button"
              onClick={btn.handler}
              sx={{
                background: `rgba(255,255,255,0.08)`,
                border: `1px solid ${colors.border.medium}`,
                borderRadius: radius.sm,
                width: 28,
                height: 28,
                color: colors.text.primary,
                cursor: "pointer",
                fontSize: fonts.size.sm,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  bgcolor: colors.primary.ghost,
                  borderColor: colors.primary.border,
                },
              }}
            >
              {btn.label}
            </Box>
          ))}
        </Box>

        {/* View switcher buttons */}
        <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
          {["Month", "Week", "Day"].map((view) => (
            <Button
              key={view}
              size="small"
              onClick={() => setSelectedView(view.toLowerCase())}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: radius.sm,
                border: `1px solid ${colors.border.medium}`,
                bgcolor:
                  selectedView === view.toLowerCase()
                    ? colors.primary.main
                    : "rgba(255,255,255,0.08)",
                color:
                  selectedView === view.toLowerCase()
                    ? colors.bg.deep
                    : colors.text.primary,
                fontSize: fonts.size.xs,
                fontWeight: fonts.weight.medium,
                textTransform: "none",
                minWidth: "auto",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor:
                    selectedView === view.toLowerCase()
                      ? colors.primary.light
                      : "rgba(255,255,255,0.12)",
                },
              }}
            >
              {view}
            </Button>
          ))}
        </Box>
      </Box>

      {/* View content */}
      {selectedView === "week" && (
        <WeekView
          timetableData={timetableData}
          handleTimeSlotClick={handleTimeSlotClick}
        />
      )}
      {selectedView === "month" && (
        <MonthView
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedDate={selectedDate}
          handleDateClick={handleDateClick}
          getDaysInMonth={getDaysInMonth}
          getFirstDayOfMonth={getFirstDayOfMonth}
          timetableData={timetableData}
        />
      )}
      {selectedView === "day" && (
        <DayView
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          getDayName={getDayName}
          getMonthName={getMonthName}
          getShortDayName={getShortDayName}
          getScheduleForDate={getScheduleForDate}
          handleTimeSlotClick={handleTimeSlotClick}
          timetableData={timetableData}
        />
      )}
    </Box>
  )
}
