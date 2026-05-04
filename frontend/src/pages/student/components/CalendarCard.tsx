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

import { Box, Typography } from "@mui/material";
import {
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from "@mui/icons-material";
import { Bell } from "lucide-react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import DayView from "./DayView";

interface CalendarCardProps {
  selectedView: string;
  setSelectedView: (v: string) => void;
  selectedDate: number;
  selectedMonth: number;
  selectedYear: number;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleDateClick: (day: number) => void;
  handleTimeSlotClick: (slot: any) => void;
  getMonthName: (m: number) => string;
  getDaysInMonth: (m: number, y: number) => number;
  getFirstDayOfMonth: (m: number, y: number) => number;
  getDayName: (d: number) => string;
  getShortDayName: (d: number) => string;
  getScheduleForDate: (d: number) => any[];
  timetableData: any;
  examMode?: boolean;
  examData?: any[];
  tasks?: any[];
  onToggleExamMode?: () => void;
  onAddTask?: () => void;
  onBell?: () => void;
  onNoteClick?: (courseCode: string, classDate: string) => void;
  notificationCount?: number;
}

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
        borderRadius: radius.xl,
        boxShadow: shadows.sm,
        mb: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Calendar Header ───────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: "12px 16px",
          borderBottom: `1px solid ${colors.border.subtle}`,
          flexShrink: 0,
          flexWrap: "wrap",
          rowGap: "8px",
        }}
      >
        {/* Month + Year Title */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: fonts.heading,
            m: 0,
            fontSize: fonts.size.xl,
            fontWeight: fonts.weight.bold,
            color: colors.text.primary,
          }}
        >
          {getMonthName(selectedMonth)} {selectedYear}
        </Typography>

        {/* Month navigation arrows */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Box
            component="button"
            onClick={handlePrevMonth}
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
              "&:hover": {
                bgcolor: colors.primary.ghost,
                borderColor: colors.primary.border,
              },
            }}
          >
            <ChevronLeftOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Box
            component="button"
            onClick={handleNextMonth}
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
              "&:hover": {
                bgcolor: colors.primary.ghost,
                borderColor: colors.primary.border,
              },
            }}
          >
            <ChevronRightOutlined sx={{ fontSize: 18 }} />
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Day / Week / Month segmented control */}
        <Box
          sx={{
            display: "flex",
            background: colors.bg.raised,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: radius.md,
            overflow: "hidden",
          }}
        >
          {["Day", "Week", "Month"].map((view) => {
            const active = selectedView === view.toLowerCase();
            return (
              <button
                key={view}
                onClick={() => setSelectedView(view.toLowerCase())}
                style={{
                  padding: "6px 14px",
                  border: "none",
                  background: active ? colors.primary.main : "transparent",
                  color: active ? "#fff" : colors.text.secondary,
                  fontSize: fonts.size.sm,
                  fontWeight: active ? fonts.weight.semibold : fonts.weight.regular,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                  transition: "all 0.15s ease",
                  borderRight: `1px solid ${colors.border.medium}`,
                }}
              >
                {view}
              </button>
            );
          })}
        </Box>

        {/* "View Exams" / "View Full Calendar" toggle */}
        <button
          onClick={onToggleExamMode}
          style={{
            padding: "6px 14px",
            background: examMode ? "rgba(220,38,38,0.08)" : colors.bg.raised,
            border: `1px solid ${examMode ? "rgba(220,38,38,0.3)" : colors.border.medium}`,
            borderRadius: radius.md,
            color: examMode ? "#DC2626" : colors.text.secondary,
            fontSize: fonts.size.sm,
            fontWeight: examMode ? fonts.weight.semibold : fonts.weight.medium,
            cursor: "pointer",
            fontFamily: fonts.body,
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!examMode) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border.strong;
              (e.currentTarget as HTMLButtonElement).style.color = colors.text.primary;
            }
          }}
          onMouseLeave={(e) => {
            if (!examMode) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border.medium;
              (e.currentTarget as HTMLButtonElement).style.color = colors.text.secondary;
            }
          }}
        >
          {examMode ? "View Full Calendar" : "View Exams"}
        </button>

        {/* "+ Add Task" primary blue button */}
        <button
          onClick={onAddTask}
          style={{
            padding: "6px 14px",
            background: colors.info.main,
            border: "none",
            borderRadius: radius.md,
            color: "#fff",
            fontSize: fonts.size.sm,
            fontWeight: fonts.weight.semibold,
            cursor: "pointer",
            fontFamily: fonts.body,
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = colors.info.main)}
        >
          + Add Task
        </button>

        {/* Bell notification icon */}
        <button
          onClick={onBell}
          style={{
            position: "relative",
            background: colors.bg.raised,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: radius.md,
            padding: "6px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bell size={16} style={{ color: colors.text.secondary }} />
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: colors.error.main,
                color: "#fff",
                fontSize: fonts.size.xs,
                fontWeight: fonts.weight.bold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {notificationCount}
            </span>
          )}
        </button>
      </Box>

      {/* ── View Content ─────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: "hidden", minHeight: "520px" }}>
        {selectedView === "week" && (
          <WeekView
            timetableData={timetableData}
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
            examMode={examMode}
            examData={examData}
            tasks={tasks}
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
  );
}
