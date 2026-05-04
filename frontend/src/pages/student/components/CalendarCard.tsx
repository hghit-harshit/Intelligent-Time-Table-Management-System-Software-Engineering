import { Box, Typography, Button } from "@mui/material"
import { ChevronLeftOutlined, ChevronRightOutlined } from "@mui/icons-material"
import { colors, fonts, radius, shadows } from "../../../styles/tokens"
import WeekView from "./WeekView"
import MonthView from "./MonthView"
import DayView from "./DayView"

export default function CalendarCard({
  selectedView,
  setSelectedView,
  selectedDate,
  selectedMonth,
  selectedYear,
  handlePrev,
  handleNext,
  handleDateClick,
  handleTimeSlotClick,
  headerLabel,
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
  getDayName,
  getShortDayName,
  getScheduleForDate,
  timetableData,
  viewWeekStart,
}) {
  return (
    <Box
      sx={{
        bgcolor: colors.bg.base,
        border: `1px solid ${colors.border.medium}`,
        borderRadius: radius.lg,
        boxShadow: shadows.sm,
        mb: "12px",
        // No overflow:hidden — let the grid expand naturally
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", p: "10px 16px", borderBottom: `1px solid ${colors.border.subtle}` }}>
        <Typography variant="h4" sx={{ fontFamily: fonts.heading, m: 0, fontSize: fonts.size.lg, fontWeight: 700 }}>
          {headerLabel}
        </Typography>

        <Box sx={{ display: "flex", gap: 0.5, ml: 2 }}>
          {[handlePrev, handleNext].map((handler, idx) => (
            <Box
              key={idx}
              component="button"
              onClick={handler}
              sx={{
                background: colors.bg.raised,
                border: `1px solid ${colors.border.medium}`,
                borderRadius: radius.sm,
                width: 28,
                height: 28,
                color: colors.text.primary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": { bgcolor: colors.primary.ghost, borderColor: colors.primary.border },
              }}
            >
              {idx === 0
                ? <ChevronLeftOutlined sx={{ fontSize: 18 }} />
                : <ChevronRightOutlined sx={{ fontSize: 18 }} />}
            </Box>
          ))}
        </Box>

        {/* View switcher */}
        <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
          {["Month", "Week", "Day"].map((view) => (
            <Button
              key={view}
              size="small"
              onClick={() => setSelectedView(view.toLowerCase())}
              sx={{
                px: 1.5, py: 0.75,
                borderRadius: radius.sm,
                border: `1px solid ${colors.border.medium}`,
                bgcolor: selectedView === view.toLowerCase() ? colors.primary.main : colors.bg.raised,
                color: selectedView === view.toLowerCase() ? "#FFFFFF" : colors.text.primary,
                fontSize: fonts.size.xs,
                fontWeight: fonts.weight.medium,
                textTransform: "none",
                minWidth: "auto",
                "&:hover": {
                  bgcolor: selectedView === view.toLowerCase() ? colors.primary.light : colors.bg.deep,
                },
              }}
            >
              {view}
            </Button>
          ))}
        </Box>
      </Box>

      {/* View content — scrollable container */}
      <Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
        {selectedView === "week" && (
          <WeekView
            timetableData={timetableData}
            viewWeekStart={viewWeekStart}
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
    </Box>
  )
}
