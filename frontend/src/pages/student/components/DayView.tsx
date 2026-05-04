/**
 * DayView — Full 24-Hour Scrollable Timeline
 *
 * Per DISHA UI Guide §3B:
 * - Scrollable vertical grid spanning 00:00 to 23:59
 * - Red line indicator at current system time with circular "knob"
 * - Updates every 60 seconds
 * - Event blocks click → Class Details Modal
 * - Category-colored event tiles (pastel palette), NO left accent border
 * - Auto-scrolls to current time on mount
 * - examMode: shows only exam blocks (red)
 * - Tasks shown at their due time with complete/category styling
 */

import { useEffect, useRef, useState } from "react";
import { colors, fonts, radius } from "../../../styles/tokens";

const HOUR_HEIGHT = 64;
const START_HOUR = 0;
const END_HOUR = 24;
const GRID_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
const HEADER_HEIGHT = 44;

const getClassColor = (classItem: any) => {
  if (classItem?.isRescheduled)
    return { bg: "rgba(245,158,11,0.10)", text: "#D97706", border: "rgba(217,119,6,0.3)", borderStyle: "dashed" };
  const name = (classItem?.name || "").toLowerCase();
  if (name.includes("math"))
    return { bg: "rgba(139,92,246,0.08)", text: "#7C3AED", border: "rgba(139,92,246,0.2)", borderStyle: "solid" };
  if (name.includes("signal") || name.includes("dsp"))
    return { bg: "rgba(16,185,129,0.08)", text: "#059669", border: "rgba(16,185,129,0.2)", borderStyle: "solid" };
  if (name.includes("circuit") || name.includes("vlsi") || name.includes("digital"))
    return { bg: "rgba(249,115,22,0.08)", text: "#EA580C", border: "rgba(249,115,22,0.2)", borderStyle: "solid" };
  if (name.includes("network") || name.includes("data structure") || name.includes("cs"))
    return { bg: "rgba(59,130,246,0.08)", text: "#2563EB", border: "rgba(59,130,246,0.2)", borderStyle: "solid" };
  return { bg: colors.primary.ghost, text: colors.primary.main, border: colors.primary.border, borderStyle: "solid" };
};

const getTaskColor = (category: string) => {
  if (category === "Academic") return { bg: "rgba(99,102,241,0.12)", text: "#6366f1", border: "rgba(99,102,241,0.3)" };
  if (category === "Personal") return { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "rgba(16,185,129,0.3)" };
  if (category === "Social") return { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" };
  return { bg: "rgba(99,102,241,0.12)", text: "#6366f1", border: "rgba(99,102,241,0.3)" };
};

const EXAM_COLOR = { bg: "rgba(220,38,38,0.10)", text: "#DC2626", border: "rgba(220,38,38,0.3)" };

function timeStrToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function parseDuration(dur: string): number {
  if (!dur) return 60;
  const hrMatch = dur.match(/(\d+)\s*h/i);
  const minMatch = dur.match(/(\d+)\s*m/i);
  const hrs = hrMatch ? parseInt(hrMatch[1]) : 0;
  const mins = minMatch ? parseInt(minMatch[1]) : 0;
  if (hrs === 0 && mins === 0) return 60;
  return hrs * 60 + mins;
}

function extractCourseCode(location: string): string {
  return (location || "").split("·")[0].trim().split(" ")[0].trim();
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
  examMode,
  examData,
  tasks,
  onNoteClick,
}: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      // Default scroll to 8am
      scrollRef.current.scrollTop = 8 * HOUR_HEIGHT;
    }
  }, []);

  const selectedDateSchedule = getScheduleForDate(selectedDate);

  // Class events
  const events: Array<{ classItem: any; top: number; height: number; time: string }> = [];
  selectedDateSchedule.forEach((item: any) => {
    const cls = item.class || item;
    const timeStr = item.time || cls.time || "";
    const startMins = timeStrToMinutes(timeStr);
    const durMins = parseDuration(cls.duration || "1h");
    const top = (startMins / 60) * HOUR_HEIGHT;
    const height = Math.max((durMins / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.75);
    events.push({ classItem: cls, top, height, time: timeStr });
  });

  // Exam events for this day
  const examEvents: Array<{ exam: any; top: number; height: number }> = [];
  if (Array.isArray(examData)) {
    examData.forEach((exam: any) => {
      if (!exam.date) return;
      const examDate = new Date(exam.date);
      if (
        examDate.getDate() === selectedDate &&
        examDate.getMonth() + 1 === selectedMonth &&
        examDate.getFullYear() === selectedYear
      ) {
        const timeStr = exam.time || "09:00";
        const startMins = timeStrToMinutes(timeStr);
        const durMins = parseDuration(exam.duration || "3h");
        const top = (startMins / 60) * HOUR_HEIGHT;
        const height = Math.max((durMins / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.75);
        examEvents.push({ exam, top, height });
      }
    });
  }

  // Task events for this day
  const taskEvents: Array<{ task: any; top: number; height: number }> = [];
  if (Array.isArray(tasks)) {
    tasks.forEach((task: any) => {
      if (!task.dueDate) return;
      const taskDate = new Date(task.dueDate);
      if (
        taskDate.getDate() === selectedDate &&
        taskDate.getMonth() + 1 === selectedMonth &&
        taskDate.getFullYear() === selectedYear
      ) {
        const h = taskDate.getHours();
        const m = taskDate.getMinutes();
        const startMins = h * 60 + m;
        const top = (startMins / 60) * HOUR_HEIGHT;
        const height = HOUR_HEIGHT * 0.65;
        taskEvents.push({ task, top, height });
      }
    });
  }

  const nowTop = (currentMinutes / 60) * HOUR_HEIGHT;
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  const hasAnyEvents = (examMode ? examEvents.length > 0 : events.length > 0) || taskEvents.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Day header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          borderBottom: `1px solid ${colors.border.subtle}`,
          background: colors.bg.base,
          height: `${HEADER_HEIGHT}px`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: fonts.size.xs, color: colors.text.muted, textTransform: "uppercase", letterSpacing: fonts.letterSpacing.wide }}>
            {getShortDayName(selectedDate)}
          </span>
          <span style={{ fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.primary.main, lineHeight: 1.1 }}>
            {selectedDate}
          </span>
        </div>
        <span style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginLeft: "8px" }}>
          {getMonthName(selectedMonth)} {selectedYear}
        </span>
        <span style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginLeft: "auto" }}>
          {examMode ? "Showing exam schedule only." : "A focused single-day timeline for classes, tasks, and exams."}
        </span>
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", position: "relative", background: colors.bg.base }}>
        <div style={{ position: "relative", height: `${GRID_HEIGHT}px` }}>
          {/* Hour rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              style={{
                position: "absolute",
                top: `${hour * HOUR_HEIGHT}px`,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "flex-start",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: "72px",
                  paddingRight: "12px",
                  paddingTop: "4px",
                  textAlign: "right",
                  fontSize: fonts.size.xs,
                  color: colors.text.muted,
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                {hour === 0 ? "" : `${hour < 10 ? "0" : ""}${hour}:00`}
              </div>
              <div style={{ flex: 1, borderTop: `1px solid ${colors.border.subtle}`, marginTop: "9px" }} />
            </div>
          ))}

          {/* Red "Now" indicator */}
          {nowTop >= 0 && nowTop <= GRID_HEIGHT && (
            <div
              style={{
                position: "absolute",
                top: `${nowTop}px`,
                left: "72px",
                right: 0,
                height: "1px",
                background: colors.error.main,
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-5px",
                  top: "-3px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: colors.error.main,
                }}
              />
            </div>
          )}

          {/* Class event blocks (hidden in examMode) */}
          {!examMode && events.map((evt, i) => {
            const cs = getClassColor(evt.classItem);
            const classDate = `${selectedYear}-${String(selectedMonth).padStart(2,"0")}-${String(selectedDate).padStart(2,"0")}`;
            const courseCode = evt.classItem.courseCode || extractCourseCode(evt.classItem.name || "");
            return (
              <div
                key={i}
                onClick={() => handleTimeSlotClick({ ...evt.classItem, time: evt.time, day: getShortDayName(selectedDate), classDate, courseCode })}
                style={{
                  position: "absolute",
                  top: `${evt.top}px`,
                  left: "80px",
                  right: "12px",
                  height: `${evt.height - 3}px`,
                  background: cs.bg,
                  border: `1px ${cs.borderStyle} ${cs.border}`,
                  borderRadius: radius.md,
                  padding: "8px 12px",
                  cursor: "pointer",
                  overflow: "hidden",
                  zIndex: 2,
                  transition: "filter 0.15s ease",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.filter = "brightness(0.94)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.filter = "none")}
              >
                <div style={{ fontWeight: fonts.weight.bold, fontSize: fonts.size.sm, color: cs.text, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {evt.classItem.name}
                </div>
                <div style={{ fontSize: fonts.size.xs, color: cs.text, opacity: 0.8 }}>
                  {evt.time}{evt.classItem.duration ? ` · ${evt.classItem.duration}` : ""}
                </div>
                {!evt.classItem.isRescheduled && evt.classItem.location && (
                  <div style={{ fontSize: fonts.size.xs, color: cs.text, opacity: 0.7, marginTop: "2px" }}>
                    {evt.classItem.location}{evt.classItem.professor ? ` · ${evt.classItem.professor}` : ""}
                  </div>
                )}
                {evt.classItem.isRescheduled && (
                  <div style={{ fontSize: fonts.size.xs, color: cs.text, opacity: 0.8, marginTop: "2px" }}>
                    See notifications
                  </div>
                )}
              </div>
            );
          })}

          {/* Exam blocks (always shown) */}
          {examEvents.map((evt, i) => (
            <div
              key={`exam-${i}`}
              style={{
                position: "absolute",
                top: `${evt.top}px`,
                left: "80px",
                right: "12px",
                height: `${evt.height - 3}px`,
                background: EXAM_COLOR.bg,
                border: `1px solid ${EXAM_COLOR.border}`,
                borderRadius: radius.md,
                padding: "8px 12px",
                overflow: "hidden",
                zIndex: 3,
              }}
            >
              <div style={{ fontWeight: fonts.weight.bold, fontSize: fonts.size.sm, color: EXAM_COLOR.text, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {evt.exam.courseName || evt.exam.courseCode}
              </div>
              <div style={{ fontSize: fonts.size.xs, color: EXAM_COLOR.text, opacity: 0.8 }}>
                Exam · {evt.exam.time || ""}{evt.exam.duration ? ` · ${evt.exam.duration}` : ""}
              </div>
              {evt.exam.hall && (
                <div style={{ fontSize: fonts.size.xs, color: EXAM_COLOR.text, opacity: 0.7, marginTop: "2px" }}>
                  {evt.exam.hall}{evt.exam.seat ? ` · Seat ${evt.exam.seat}` : ""}
                </div>
              )}
            </div>
          ))}

          {/* Task blocks (hidden in examMode) */}
          {!examMode && taskEvents.map((evt, i) => {
            const tc = getTaskColor(evt.task.category);
            return (
              <div
                key={`task-${i}`}
                style={{
                  position: "absolute",
                  top: `${evt.top}px`,
                  left: "80px",
                  right: "12px",
                  height: `${evt.height - 3}px`,
                  background: tc.bg,
                  border: `1px solid ${tc.border}`,
                  borderRadius: radius.md,
                  padding: "6px 12px",
                  overflow: "hidden",
                  zIndex: 2,
                  opacity: evt.task.completed ? 0.5 : 1,
                }}
              >
                <div style={{ fontWeight: fonts.weight.semibold, fontSize: fonts.size.sm, color: tc.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: evt.task.completed ? "line-through" : "none" }}>
                  ✓ {evt.task.title}
                </div>
                <div style={{ fontSize: fonts.size.xs, color: tc.text, opacity: 0.7, marginTop: "1px" }}>
                  Task · {evt.task.category}
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {!hasAnyEvents && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                color: colors.text.muted,
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.text.secondary, marginBottom: "6px" }}>
                {examMode ? "No Exams Scheduled" : "No Classes Scheduled"}
              </div>
              <div style={{ fontSize: fonts.size.sm }}>
                {examMode
                  ? `No exams on ${getDayName(selectedDate)}, ${getMonthName(selectedMonth)} ${selectedDate}`
                  : `You have no classes on ${getDayName(selectedDate)}, ${getMonthName(selectedMonth)} ${selectedDate}`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
