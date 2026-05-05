/**
 * CalendarCard — Calendar Container with Header Controls
 *
 * Per DISHA UI Guide §3A:
 * - Month/Year title + prev/next arrows
 * - Segmented Day/Week/Month control (right-aligned)
 * - "View Exams" / "View Full Calendar" toggle button
 * - "+ Add Task" primary blue button → opens AddTaskModal
 * - Bell icon for notifications → right pane "notifs" state
 */

import { Box, Typography, Button } from "@mui/material"
import { ChevronLeftOutlined, ChevronRightOutlined } from "@mui/icons-material"
import { Bell } from "lucide-react"
import { colors, fonts, radius, shadows } from "../../../styles/tokens"
import WeekView from "./WeekView"
import MonthView from "./MonthView"
import DayView from "./DayView"

interface CalendarCardProps {
  selectedView: string
  setSelectedView: (v: string) => void
  selectedDate: number
  selectedMonth: number
  selectedYear: number
  handlePrev: () => void
  handleNext: () => void
  handleDateClick: (day: number) => void
  handleTimeSlotClick: (slot: any) => void
  headerLabel: string
  getMonthName: (m: number) => string
  getDaysInMonth: (m: number, y: number) => number
  getFirstDayOfMonth: (m: number, y: number) => number
  getDayName: (d: number) => string
  getShortDayName: (d: number) => string
  getScheduleForDate: (d: number) => any[]
  timetableData: any
  viewWeekStart: Date
  examMode?: boolean
  examData?: any[]
  tasks?: any[]
  onToggleExamMode?: () => void
  onAddTask?: () => void
  onBell?: () => void
  onNoteClick?: (courseCode: string, classDate: string) => void
  notificationCount?: number
}

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
  examMode = false,
  examData = [],
  tasks = [],
  onToggleExamMode,
  onAddTask,
  onBell,
  onNoteClick,
  notificationCount = 0,
}: CalendarCardProps) {
  return (
    <Box
      sx={{
        bgcolor: colors.bg.base,
        border: `1px solid ${colors.border.medium}`,
        borderRadius: radius.lg,
        boxShadow: shadows.sm,
        mb: "12px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: "10px 16px",
          borderBottom: `1px solid ${colors.border.subtle}`,
          gap: 1,
          flexShrink: 0,
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: fonts.heading,
            m: 0,
            fontSize: fonts.size.lg,
            fontWeight: 700,
            mr: 1,
          }}
        >
          {headerLabel}
        </Typography>

        {/* Prev / Next arrows */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
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

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* View switcher: Day / Week / Month */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {["Day", "Week", "Month"].map((view) => (
            <Button
              key={view}
              size="small"
              onClick={() => setSelectedView(view.toLowerCase())}
              sx={{
                px: 1.5,
                py: 0.75,
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

        {/* View Exams / View Full Calendar toggle */}
        {onToggleExamMode && (
          <Button
            size="small"
            onClick={onToggleExamMode}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: radius.sm,
              border: `1px solid ${examMode ? colors.error.main : colors.border.medium}`,
              bgcolor: examMode ? "rgba(220,38,38,0.08)" : colors.bg.raised,
              color: examMode ? colors.error.main : colors.text.primary,
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.medium,
              textTransform: "none",
              minWidth: "auto",
              "&:hover": {
                bgcolor: examMode ? "rgba(220,38,38,0.14)" : colors.bg.deep,
              },
            }}
          >
            {examMode ? "View Full Calendar" : "View Exams"}
          </Button>
        )}

        {/* + Add Task */}
        {onAddTask && (
          <Button
            size="small"
            onClick={onAddTask}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: radius.sm,
              bgcolor: colors.primary.main,
              color: "#FFFFFF",
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.semibold,
              textTransform: "none",
              minWidth: "auto",
              "&:hover": { bgcolor: colors.primary.light },
            }}
          >
            + Add Task
          </Button>
        )}

        {/* Bell icon */}
        {onBell && (
          <Box
            component="button"
            onClick={onBell}
            sx={{
              position: "relative",
              background: colors.bg.raised,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.sm,
              width: 34,
              height: 34,
              color: colors.text.primary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { bgcolor: colors.primary.ghost, borderColor: colors.primary.border },
            }}
          >
            <Bell size={16} />
            {notificationCount > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: colors.error.main,
                }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* View content */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {selectedView === "week" && (
          <WeekView
            timetableData={timetableData}
            viewWeekStart={viewWeekStart}
            handleTimeSlotClick={handleTimeSlotClick}
            examMode={examMode}
            examData={examData}
            tasks={tasks}
            onNoteClick={onNoteClick}
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
            examMode={examMode}
            examData={examData}
            tasks={tasks}
            onNoteClick={onNoteClick}
          />
        )}
      </Box>
    </Box>
  )
}