/**
 * MonthView — Monthly Calendar Grid
 *
 * Per DISHA UI Guide §3A:
 * - Sun–Sat grid
 * - Clicking a date → switches to Day View
 * - Shows mini class chips (colored) for each day with classes
 * - Exam chips shown in red on exam dates
 * - Task chips shown in category color
 * - examMode: shows only exam chips
 * - Today highlighted with filled primary circle
 * - "+X more" truncation for overflow events
 */

import { Box, Typography } from "@mui/material";
import { colors, fonts, radius } from "../../../styles/tokens";

const getChipColor = (name: string) => {
  const n = (name || "").toLowerCase();
  if (n.includes("math")) return { bg: "rgba(139,92,246,0.12)", text: "#7C3AED" };
  if (n.includes("signal") || n.includes("dsp")) return { bg: "rgba(16,185,129,0.12)", text: "#059669" };
  if (n.includes("circuit") || n.includes("vlsi") || n.includes("digital")) return { bg: "rgba(249,115,22,0.12)", text: "#EA580C" };
  if (n.includes("network")) return { bg: "rgba(20,184,166,0.12)", text: "#0D9488" };
  return { bg: colors.primary.ghost, text: colors.primary.main };
};

const getTaskChipColor = (category: string) => {
  if (category === "Academic") return { bg: "rgba(99,102,241,0.12)", text: "#6366f1" };
  if (category === "Personal") return { bg: "rgba(16,185,129,0.12)", text: "#10b981" };
  if (category === "Social") return { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" };
  return { bg: "rgba(99,102,241,0.12)", text: "#6366f1" };
};

export default function MonthView({
  selectedMonth,
  selectedYear,
  selectedDate,
  handleDateClick,
  getDaysInMonth,
  getFirstDayOfMonth,
  timetableData,
  examMode,
  examData,
  tasks,
}: any) {
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  // Build class map for the FULL selected month: dayNum → class names
  const dayClassMap: Record<number, string[]> = {};
  if (timetableData?.weeklySchedule) {
    const jsToWeekIdx: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const jsDay = new Date(selectedYear, selectedMonth - 1, dayNum).getDay(); // 0=Sun
      const weekIdx = jsToWeekIdx[jsDay];
      if (weekIdx == null) continue; // skip weekends
      for (const slot of timetableData.weeklySchedule) {
        const cls = slot?.classes?.[weekIdx];
        if (!cls) continue;
        if (!dayClassMap[dayNum]) dayClassMap[dayNum] = [];
        dayClassMap[dayNum].push(cls.name);
      }
    }
  }

  // Build exam map: dayNum → exam names
  const dayExamMap: Record<number, string[]> = {};
  if (Array.isArray(examData)) {
    examData.forEach((exam: any) => {
      if (!exam.date) return;
      const examDate = new Date(exam.date);
      if (
        examDate.getMonth() + 1 === selectedMonth &&
        examDate.getFullYear() === selectedYear
      ) {
        const d = examDate.getDate();
        if (!dayExamMap[d]) dayExamMap[d] = [];
        dayExamMap[d].push(exam.courseName || exam.courseCode || "Exam");
      }
    });
  }

  // Build task map: dayNum → tasks
  const dayTaskMap: Record<number, any[]> = {};
  if (Array.isArray(tasks)) {
    tasks.forEach((task: any) => {
      if (!task.dueDate) return;
      const taskDate = new Date(task.dueDate);
      if (
        taskDate.getMonth() + 1 === selectedMonth &&
        taskDate.getFullYear() === selectedYear
      ) {
        const d = taskDate.getDate();
        if (!dayTaskMap[d]) dayTaskMap[d] = [];
        dayTaskMap[d].push(task);
      }
    });
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Day-of-week headers */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Typography
            key={day}
            sx={{
              textAlign: "center",
              p: "8px 4px",
              fontWeight: fonts.weight.bold,
              color: colors.text.muted,
              textTransform: "uppercase",
              letterSpacing: fonts.letterSpacing.wide,
              fontSize: fonts.size.xs,
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - firstDay + 1;
          const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
          const isToday =
            dayNum === timetableData?.currentDate?.day &&
            selectedMonth === timetableData?.currentDate?.month &&
            selectedYear === timetableData?.currentDate?.year;
          const isSelected = dayNum === selectedDate && isCurrentMonth;
          const dayClasses = dayClassMap[dayNum] || [];
          const dayExams = dayExamMap[dayNum] || [];
          const dayTasks = dayTaskMap[dayNum] || [];

          // Collect chips based on mode
          type Chip = { label: string; bg: string; text: string; completed?: boolean };
          const chips: Chip[] = [];
          if (!examMode) {
            dayClasses.forEach((name) => {
              const c = getChipColor(name);
              chips.push({ label: name, bg: c.bg, text: c.text });
            });
            dayTasks.forEach((task) => {
              const c = getTaskChipColor(task.category);
              chips.push({ label: `✓ ${task.title}`, bg: c.bg, text: c.text, completed: task.status === "completed" });
            });
          }
          dayExams.forEach((name) => {
            chips.push({ label: name, bg: "rgba(220,38,38,0.12)", text: "#DC2626" });
          });

          const visibleChips = chips;

          return (
            <Box
              key={i}
              onClick={() => isCurrentMonth && handleDateClick(dayNum)}
              sx={{
                minHeight: 108,
                p: "6px 4px 4px",
                bgcolor: isSelected ? colors.primary.ghost : colors.bg.base,
                border: isToday
                  ? `1.5px solid ${colors.primary.main}`
                  : isSelected
                  ? `1px solid ${colors.primary.border}`
                  : `1px solid ${colors.border.subtle}`,
                borderRadius: radius.md,
                position: "relative",
                cursor: isCurrentMonth ? "pointer" : "default",
                transition: "all 0.15s ease",
                opacity: isCurrentMonth ? 1 : 0.3,
                "&:hover": isCurrentMonth
                  ? { bgcolor: colors.primary.ghost, borderColor: colors.primary.border }
                  : {},
              }}
            >
              {isCurrentMonth && (
                <>
                  {/* Day number */}
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: isToday ? "24px" : "auto",
                      height: isToday ? "24px" : "auto",
                      borderRadius: isToday ? "50%" : 0,
                      bgcolor: isToday ? colors.primary.main : "transparent",
                      color: isToday ? "#fff" : isSelected ? colors.primary.main : colors.text.primary,
                      fontSize: fonts.size.sm,
                      fontWeight: isToday || isSelected ? fonts.weight.bold : fonts.weight.medium,
                      mb: "4px",
                    }}
                  >
                    {dayNum}
                  </Box>

                  {/* Event chips */}
                  {visibleChips.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: 74, overflowY: "auto", pr: "2px" }}>
                      {visibleChips.map((chip, ci) => (
                        <Box
                          key={ci}
                          sx={{
                            background: chip.bg,
                            color: chip.text,
                            fontSize: "9px",
                            fontWeight: fonts.weight.semibold,
                            padding: "1px 5px",
                            borderRadius: "3px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            opacity: chip.completed ? 0.55 : 1,
                            textDecoration: chip.completed ? "line-through" : "none",
                          }}
                        >
                          {chip.label}
                        </Box>
                      ))}
                    </Box>
                  ) : null}
                </>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
