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
  if (classItem?.isRescheduleSource)
    return { bg: "rgba(148,163,184,0.10)", text: "#475569", border: "rgba(100,116,139,0.55)", borderStyle: "dashed" };
  if (classItem?.isRescheduled)
    return { bg: "rgba(245,158,11,0.14)", text: "#92400E", border: "rgba(217,119,6,0.55)", borderStyle: "solid" };
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

const EXAM_COLOR = { bg: "rgba(220,38,38,0.18)", text: "#B91C1C", border: "rgba(220,38,38,0.45)" };

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
  type TimelineEvent = {
    kind: "class" | "task" | "exam";
    top: number;
    height: number;
    time?: string;
    classItem?: any;
    task?: any;
    exam?: any;
    lane?: number;
  };

  const assignLanes = (events: TimelineEvent[]) => {
    const sorted = [...events].sort((a, b) => (a.top - b.top) || (a.height - b.height));
    const laneEnds: number[] = [];
    let maxLanes = 1;

    for (const evt of sorted) {
      const start = evt.top;
      const end = evt.top + evt.height;
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start + 1);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(end);
      } else {
        laneEnds[lane] = end;
      }
      evt.lane = lane;
      if (lane + 1 > maxLanes) maxLanes = lane + 1;
    }

    return { events: sorted, laneCount: maxLanes };
  };
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
      const raf = requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 8 * HOUR_HEIGHT;
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [selectedDate, selectedMonth, selectedYear]);

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
  const classTimeline: TimelineEvent[] = !examMode
    ? events.map((evt) => ({
        kind: "class",
        top: evt.top,
        height: evt.height - 3,
        time: evt.time,
        classItem: evt.classItem,
      }))
    : [];
  const examTimeline: TimelineEvent[] = examEvents.map((evt) => ({
    kind: "exam",
    top: evt.top,
    height: evt.height - 3,
    exam: evt.exam,
  }));
  const taskTimeline: TimelineEvent[] = !examMode
    ? taskEvents.map((evt) => ({
        kind: "task",
        top: evt.top,
        height: evt.height - 3,
        task: evt.task,
      }))
    : [];
  const { events: laidOutEvents, laneCount } = assignLanes([
    ...classTimeline,
    ...examTimeline,
    ...taskTimeline,
  ]);

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

          <div style={{ position: "absolute", top: 0, bottom: 0, left: "80px", right: "12px" }}>
          {laidOutEvents.map((evt, i) => {
            const lane = evt.lane || 0;
            const laneGap = laneCount > 1 ? 6 : 0;
            const laneWidthPct = 100 / laneCount;
            const left = `calc(${lane * laneWidthPct}% + ${lane * laneGap}px)`;
            const width = `calc(${laneWidthPct}% - ${((laneCount - 1) * laneGap) / laneCount}px)`;

            if (evt.kind === "class" && evt.classItem) {
              const cs = getClassColor(evt.classItem);
              const classDate = `${selectedYear}-${String(selectedMonth).padStart(2,"0")}-${String(selectedDate).padStart(2,"0")}`;
              const courseCode = evt.classItem.courseCode || extractCourseCode(evt.classItem.name || "");
              return (
                <div
                  key={`class-${i}`}
                  onClick={() => handleTimeSlotClick({ ...evt.classItem, time: evt.time, day: getShortDayName(selectedDate), classDate, courseCode })}
                  style={{
                    position: "absolute",
                    top: `${evt.top}px`,
                    left,
                    width,
                    height: `${evt.height}px`,
                    background: cs.bg,
                    border: `1px ${cs.borderStyle} ${cs.border}`,
                    borderLeft: evt.classItem.isRescheduleSource
                      ? "4px solid #64748B"
                      : evt.classItem.isRescheduled
                        ? "4px solid #D97706"
                        : `1px ${cs.borderStyle} ${cs.border}`,
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
                  {evt.classItem.isRescheduled && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      background: "#D97706", color: "#fff",
                      borderRadius: "4px", padding: "2px 7px",
                      fontSize: fonts.size.xs, fontWeight: 700, marginBottom: "6px",
                      letterSpacing: "0.03em",
                    }}>
                      ↺ Rescheduled
                    </div>
                  )}
                  {evt.classItem.isRescheduleSource && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      background: "#64748B", color: "#fff",
                      borderRadius: "4px", padding: "2px 7px",
                      fontSize: fonts.size.xs, fontWeight: 700, marginBottom: "6px",
                      letterSpacing: "0.03em",
                    }}>
                      CHANGED
                    </div>
                  )}
                  <div style={{ fontWeight: fonts.weight.bold, fontSize: fonts.size.sm, color: cs.text, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {evt.classItem.name}
                  </div>
                  <div style={{ fontSize: fonts.size.xs, color: cs.text, opacity: 0.8 }}>
                    {evt.time}{evt.classItem.duration ? ` · ${evt.classItem.duration}` : ""}
                  </div>
                  {evt.classItem.location && (
                    <div style={{ fontSize: fonts.size.xs, color: cs.text, opacity: 0.7, marginTop: "2px" }}>
                      {evt.classItem.location}{evt.classItem.professor ? ` · ${evt.classItem.professor}` : ""}
                    </div>
                  )}
                </div>
              );
            }

            if (evt.kind === "exam" && evt.exam) {
              return (
                <div
                  key={`exam-${i}`}
                  style={{
                    position: "absolute",
                    top: `${evt.top}px`,
                    left,
                    width,
                    height: `${evt.height}px`,
                    background: EXAM_COLOR.bg,
                    border: `1px solid ${EXAM_COLOR.border}`,
                    borderLeft: "4px solid #DC2626",
                    borderRadius: radius.md,
                    overflow: "hidden",
                    zIndex: 3,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{
                    background: "#DC2626",
                    color: "#fff",
                    fontSize: fonts.size.xs,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    padding: "3px 10px",
                    flexShrink: 0,
                  }}>
                    📝 EXAM
                  </div>
                  <div style={{ padding: "6px 10px", overflow: "hidden", flex: 1 }}>
                    <div style={{ fontWeight: fonts.weight.bold, fontSize: fonts.size.sm, color: EXAM_COLOR.text, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {evt.exam.courseName || evt.exam.courseCode}
                    </div>
                    <div style={{ fontSize: fonts.size.xs, color: EXAM_COLOR.text, opacity: 0.8 }}>
                      {evt.exam.time || ""}{evt.exam.duration ? ` · ${evt.exam.duration}` : ""}
                    </div>
                    {evt.exam.location && (
                      <div style={{ fontSize: fonts.size.xs, color: EXAM_COLOR.text, opacity: 0.7, marginTop: "2px" }}>
                        {evt.exam.location}{evt.exam.seat ? ` · Seat ${evt.exam.seat}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            const tc = getTaskColor(evt.task?.category);
            return (
              <div
                key={`task-${i}`}
                style={{
                  position: "absolute",
                  top: `${evt.top}px`,
                  left,
                  width,
                  height: `${evt.height}px`,
                  background: tc.bg,
                  border: `1px solid ${tc.border}`,
                  borderRadius: radius.md,
                  padding: "6px 12px",
                  overflow: "hidden",
                  zIndex: 2,
                  opacity: evt.task?.completed ? 0.5 : 1,
                }}
              >
                <div style={{ fontWeight: fonts.weight.semibold, fontSize: fonts.size.sm, color: tc.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: evt.task?.completed ? "line-through" : "none" }}>
                  ✓ {evt.task?.title}
                </div>
                <div style={{ fontSize: fonts.size.xs, color: tc.text, opacity: 0.7, marginTop: "1px" }}>
                  Task · {evt.task?.category}
                </div>
              </div>
            );
          })}
          </div>

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
