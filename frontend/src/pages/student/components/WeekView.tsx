/**
 * WeekView — Weekly Timetable Grid (Mon–Fri)
 *
 * Per DISHA UI Guide §3B:
 * - Scrollable 24-hour time axis
 * - Red line indicator at current time
 * - Category pastel color coding, NO left accent border
 * - Clicking a class tile opens Class Details Modal
 * - examMode: shows only exam blocks (red)
 * - Tasks shown as small colored blocks at their due time
 */

import { useEffect, useRef, useState } from "react";
import { colors, fonts, radius } from "../../../styles/tokens";

const HOUR_HEIGHT = 64;
const START_HOUR = 5;
const END_HOUR = 22;
const GRID_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
const HEADER_HEIGHT = 44;

// Category pastel palette
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
  if (name.includes("network"))
    return { bg: "rgba(20,184,166,0.08)", text: "#0D9488", border: "rgba(20,184,166,0.2)", borderStyle: "solid" };
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

export default function WeekView({ timetableData, handleTimeSlotClick, examMode, examData, tasks }: any) {
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
      scrollRef.current.scrollTop = Math.max(0, (7 - START_HOUR) * HOUR_HEIGHT);
    }
  }, []);

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const days = timetableData.weekDays || [];
  const dates = timetableData.weekDates || [];
  const weeklySchedule = timetableData.weeklySchedule || [];
  const todayDay = timetableData.currentDate?.day;
  const currentMonth = timetableData?.currentDate?.month;
  const currentYear = timetableData?.currentDate?.year;

  // Build per-column class events
  const dayEvents: Array<Array<{ classItem: any; top: number; height: number; time: string }>> = days.map(() => []);
  weeklySchedule.forEach((slot: any) => {
    const slotMins = timeStrToMinutes(slot.time);
    slot.classes?.forEach((classItem: any, dayIdx: number) => {
      if (!classItem) return;
      const durMins = parseDuration(classItem.duration || "1h");
      const top = ((slotMins - START_HOUR * 60) / 60) * HOUR_HEIGHT;
      const height = Math.max((durMins / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.7);
      dayEvents[dayIdx].push({ classItem, top, height, time: slot.time });
    });
  });

  // Build exam events per day column
  const examEvents: Array<Array<{ exam: any; top: number; height: number }>> = days.map(() => []);
  if (Array.isArray(examData)) {
    examData.forEach((exam: any) => {
      if (!exam.date) return;
      const examDate = new Date(exam.date);
      dates.forEach((dateNum: number, dayIdx: number) => {
        if (
          examDate.getDate() === dateNum &&
          examDate.getMonth() + 1 === currentMonth &&
          examDate.getFullYear() === currentYear
        ) {
          const timeStr = exam.time || "09:00";
          const slotMins = timeStrToMinutes(timeStr);
          const durMins = parseDuration(exam.duration || "3h");
          const top = ((slotMins - START_HOUR * 60) / 60) * HOUR_HEIGHT;
          const height = Math.max((durMins / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.7);
          examEvents[dayIdx].push({ exam, top, height });
        }
      });
    });
  }

  // Build task events per day column
  const taskEvents: Array<Array<{ task: any; top: number; height: number }>> = days.map(() => []);
  if (Array.isArray(tasks)) {
    tasks.forEach((task: any) => {
      if (!task.dueDate) return;
      const taskDate = new Date(task.dueDate);
      dates.forEach((dateNum: number, dayIdx: number) => {
        if (
          taskDate.getDate() === dateNum &&
          taskDate.getMonth() + 1 === currentMonth &&
          taskDate.getFullYear() === currentYear
        ) {
          const h = taskDate.getHours();
          const m = taskDate.getMinutes();
          const startMins = h * 60 + m;
          const top = ((startMins - START_HOUR * 60) / 60) * HOUR_HEIGHT;
          const height = HOUR_HEIGHT * 0.6;
          taskEvents[dayIdx].push({ task, top, height });
        }
      });
    });
  }

  const nowTop = ((currentMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const showNowLine = nowTop >= 0 && nowTop <= GRID_HEIGHT;

  const TIME_COL_WIDTH = 56;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Subtitle */}
      <div style={{ padding: "8px 16px 0", color: colors.text.muted, fontSize: fonts.size.xs }}>
        {examMode ? "Showing exam schedule only." : "Classes, tasks, and exams share the same weekly timeline."}
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${days.length}, 1fr)`,
          borderBottom: `1px solid ${colors.border.subtle}`,
          flexShrink: 0,
          height: `${HEADER_HEIGHT}px`,
        }}
      >
        <div />
        {days.map((day: string, i: number) => {
          const isToday = dates[i] === todayDay;
          return (
            <div
              key={day}
              style={{
                textAlign: "center",
                padding: "6px 4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: fonts.size.xs,
                  color: colors.text.muted,
                  textTransform: "uppercase",
                  letterSpacing: fonts.letterSpacing.wide,
                  display: "block",
                }}
              >
                {day}
              </span>
              <span
                style={{
                  fontSize: fonts.size.md,
                  fontWeight: fonts.weight.bold,
                  color: isToday ? "#fff" : colors.text.primary,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isToday ? "28px" : "auto",
                  height: isToday ? "28px" : "auto",
                  borderRadius: isToday ? "50%" : 0,
                  background: isToday ? colors.primary.main : "transparent",
                  marginTop: "2px",
                }}
              >
                {dates[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${days.length}, 1fr)`,
            position: "relative",
            height: `${GRID_HEIGHT}px`,
          }}
        >
          {/* Time axis */}
          <div style={{ position: "relative" }}>
            {hours.map((hour) => (
              <div
                key={hour}
                style={{
                  position: "absolute",
                  top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                  right: "8px",
                  fontSize: fonts.size.xs,
                  color: colors.text.muted,
                  userSelect: "none",
                  paddingTop: "4px",
                }}
              >
                {`${hour < 10 ? "0" : ""}${hour}:00`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((_: string, dayIdx: number) => (
            <div
              key={dayIdx}
              style={{ position: "relative", borderLeft: `1px solid ${colors.border.subtle}` }}
            >
              {/* Hour grid lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    position: "absolute",
                    top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                    left: 0,
                    right: 0,
                    borderTop: `1px solid ${colors.border.subtle}`,
                    height: `${HOUR_HEIGHT}px`,
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* Class event blocks (hidden in examMode) */}
              {!examMode && dayEvents[dayIdx]?.map((evt, evtIdx) => {
                const cs = getClassColor(evt.classItem);
                return (
                  <div
                    key={evtIdx}
                    onClick={() =>
                      handleTimeSlotClick({ ...evt.classItem, time: evt.time, day: days[dayIdx] })
                    }
                    style={{
                      position: "absolute",
                      top: `${evt.top + 2}px`,
                      left: "3px",
                      right: "3px",
                      height: `${evt.height - 4}px`,
                      background: cs.bg,
                      border: `1px ${cs.borderStyle} ${cs.border}`,
                      borderRadius: radius.sm,
                      padding: "5px 6px",
                      cursor: "pointer",
                      overflow: "hidden",
                      zIndex: 2,
                      transition: "filter 0.15s ease",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.filter = "brightness(0.94)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.filter = "none")}
                  >
                    <div style={{ fontWeight: fonts.weight.bold, fontSize: "11px", color: cs.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {evt.classItem.name}
                    </div>
                    <div style={{ fontSize: "10px", color: cs.text, opacity: 0.8, marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden" }}>
                      {evt.time}
                    </div>
                    {!evt.classItem.isRescheduled && evt.classItem.location && (
                      <div style={{ fontSize: "9px", color: cs.text, opacity: 0.7, marginTop: "1px" }}>
                        {evt.classItem.location}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Exam blocks (always shown) */}
              {examEvents[dayIdx]?.map((evt, evtIdx) => (
                <div
                  key={`exam-${evtIdx}`}
                  style={{
                    position: "absolute",
                    top: `${evt.top + 2}px`,
                    left: "3px",
                    right: "3px",
                    height: `${evt.height - 4}px`,
                    background: EXAM_COLOR.bg,
                    border: `1px solid ${EXAM_COLOR.border}`,
                    borderRadius: radius.sm,
                    padding: "5px 6px",
                    overflow: "hidden",
                    zIndex: 3,
                  }}
                >
                  <div style={{ fontWeight: fonts.weight.bold, fontSize: "11px", color: EXAM_COLOR.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {evt.exam.courseName || evt.exam.courseCode}
                  </div>
                  <div style={{ fontSize: "10px", color: EXAM_COLOR.text, opacity: 0.8, marginTop: "1px" }}>
                    Exam · {evt.exam.time || ""}
                  </div>
                  {evt.exam.hall && (
                    <div style={{ fontSize: "9px", color: EXAM_COLOR.text, opacity: 0.7, marginTop: "1px" }}>
                      {evt.exam.hall}
                    </div>
                  )}
                </div>
              ))}

              {/* Task blocks (hidden in examMode) */}
              {!examMode && taskEvents[dayIdx]?.map((evt, evtIdx) => {
                const tc = getTaskColor(evt.task.category);
                return (
                  <div
                    key={`task-${evtIdx}`}
                    style={{
                      position: "absolute",
                      top: `${evt.top + 2}px`,
                      left: "3px",
                      right: "3px",
                      height: `${evt.height - 4}px`,
                      background: tc.bg,
                      border: `1px solid ${tc.border}`,
                      borderRadius: radius.sm,
                      padding: "4px 6px",
                      overflow: "hidden",
                      zIndex: 2,
                      opacity: evt.task.completed ? 0.5 : 1,
                    }}
                  >
                    <div style={{ fontWeight: fonts.weight.semibold, fontSize: "11px", color: tc.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: evt.task.completed ? "line-through" : "none" }}>
                      ✓ {evt.task.title}
                    </div>
                    <div style={{ fontSize: "9px", color: tc.text, opacity: 0.7, marginTop: "1px" }}>
                      {evt.task.category}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Red "Now" line */}
          {showNowLine && (
            <div
              style={{
                position: "absolute",
                top: `${nowTop}px`,
                left: `${TIME_COL_WIDTH}px`,
                right: 0,
                height: "1px",
                background: colors.error.main,
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-4px",
                  top: "-3px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: colors.error.main,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
