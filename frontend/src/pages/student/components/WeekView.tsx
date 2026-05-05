import { useEffect, useRef, useState } from "react"
import { Box, Typography } from "@mui/material"
import { colors, fonts, radius } from "../../../styles/tokens"

const HOUR_HEIGHT = 64
const START_HOUR = 0
const END_HOUR = 24
const GRID_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT
const HEADER_HEIGHT = 44
const TIME_COL_WIDTH = 56

const getClassColor = (classItem: any) => {
  if (classItem?.isRescheduled)
    return { bg: "rgba(245,158,11,0.10)", text: "#D97706", border: "rgba(217,119,6,0.3)", borderStyle: "dashed" }
  const name = (classItem?.name || "").toLowerCase()
  if (name.includes("math"))
    return { bg: "rgba(139,92,246,0.08)", text: "#7C3AED", border: "rgba(139,92,246,0.2)", borderStyle: "solid" }
  if (name.includes("signal") || name.includes("dsp"))
    return { bg: "rgba(16,185,129,0.08)", text: "#059669", border: "rgba(16,185,129,0.2)", borderStyle: "solid" }
  if (name.includes("circuit") || name.includes("vlsi") || name.includes("digital"))
    return { bg: "rgba(249,115,22,0.08)", text: "#EA580C", border: "rgba(249,115,22,0.2)", borderStyle: "solid" }
  if (name.includes("network"))
    return { bg: "rgba(20,184,166,0.08)", text: "#0D9488", border: "rgba(20,184,166,0.2)", borderStyle: "solid" }
  return { bg: colors.primary.ghost, text: colors.primary.main, border: colors.primary.border, borderStyle: "solid" }
}

const getTaskColor = (category: string) => {
  if (category === "Academic") return { bg: "rgba(99,102,241,0.12)", text: "#6366f1", border: "rgba(99,102,241,0.3)" }
  if (category === "Personal") return { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "rgba(16,185,129,0.3)" }
  if (category === "Social")   return { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" }
  return { bg: "rgba(99,102,241,0.12)", text: "#6366f1", border: "rgba(99,102,241,0.3)" }
}

const EXAM_COLOR = { bg: "rgba(220,38,38,0.10)", text: "#DC2626", border: "rgba(220,38,38,0.3)" }

function timeStrToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i)
  if (!match) return 0
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const ampm = match[3]?.toUpperCase()
  if (ampm === "PM" && h !== 12) h += 12
  if (ampm === "AM" && h === 12) h = 0
  return h * 60 + m
}

function parseDuration(dur: string): number {
  if (!dur) return 60
  const hMatch = dur.match(/(\d+)\s*h/i)
  const mMatch = dur.match(/(\d+)\s*m/i)
  const hours = hMatch ? parseInt(hMatch[1]) : 0
  const mins  = mMatch ? parseInt(mMatch[1]) : 0
  return (hours * 60 + mins) || 60
}

function extractCourseCode(location: string): string {
  return (location || "").split("·")[0].trim().split(" ")[0].trim()
}

export default function WeekView({
  timetableData,
  viewWeekStart,
  handleTimeSlotClick,
  examMode,
  examData,
  tasks,
  onNoteClick,
}: any) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes())
    }, 60_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - START_HOUR) * HOUR_HEIGHT
    }
  }, [])

  const hours          = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
  const days           = timetableData.weekDays     || []
  const dates          = timetableData.weekDates    || []
  const weeklySchedule = timetableData.weeklySchedule || []
  const currentMonth   = timetableData?.currentDate?.month
  const currentYear    = timetableData?.currentDate?.year

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekActualDates: Date[] = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(viewWeekStart)
    d.setDate(viewWeekStart.getDate() + i)
    return d
  })

  const dayEvents: Array<Array<{ classItem: any; top: number; height: number; time: string }>> =
    days.map(() => [])
  weeklySchedule.forEach((slot: any) => {
    const slotMins = timeStrToMinutes(slot.time)
    slot.classes?.forEach((classItem: any, dayIdx: number) => {
      if (!classItem) return
      const durMins = parseDuration(classItem.duration || "1h")
      const top    = ((slotMins - START_HOUR * 60) / 60) * HOUR_HEIGHT
      const height = Math.max((durMins / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.7)
      dayEvents[dayIdx].push({ classItem, top, height, time: slot.time })
    })
  })

  const examEvents: Array<Array<{ exam: any; top: number; height: number }>> = days.map(() => [])
  if (Array.isArray(examData)) {
    examData.forEach((exam: any) => {
      if (!exam.date) return
      const examDate = new Date(exam.date)
      dates.forEach((dateNum: number, dayIdx: number) => {
        if (examDate.getDate() === dateNum && examDate.getMonth() + 1 === currentMonth && examDate.getFullYear() === currentYear) {
          const slotMins = timeStrToMinutes(exam.time || "09:00")
          const durMins  = parseDuration(exam.duration || "3h")
          const top    = ((slotMins - START_HOUR * 60) / 60) * HOUR_HEIGHT
          const height = Math.max((durMins / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.7)
          examEvents[dayIdx].push({ exam, top, height })
        }
      })
    })
  }

  const taskEvents: Array<Array<{ task: any; top: number; height: number }>> = days.map(() => [])
  if (Array.isArray(tasks)) {
    tasks.forEach((task: any) => {
      if (!task.dueDate) return
      const taskDate = new Date(task.dueDate)
      dates.forEach((dateNum: number, dayIdx: number) => {
        if (taskDate.getDate() === dateNum && taskDate.getMonth() + 1 === currentMonth && taskDate.getFullYear() === currentYear) {
          const startMins = taskDate.getHours() * 60 + taskDate.getMinutes()
          const top    = ((startMins - START_HOUR * 60) / 60) * HOUR_HEIGHT
          const height = HOUR_HEIGHT * 0.6
          taskEvents[dayIdx].push({ task, top, height })
        }
      })
    })
  }

  const nowTop      = ((currentMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const showNowLine = nowTop >= 0 && nowTop <= GRID_HEIGHT

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Day Headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${days.length}, 1fr)`,
          borderBottom: `1px solid ${colors.border.subtle}`,
          height: HEADER_HEIGHT,
          flexShrink: 0,
        }}
      >
        <Box />
        {days.map((day: string, i: number) => {
          const actualDate = weekActualDates[i]
          const isToday    = actualDate?.toDateString() === today.toDateString()
          const dateNum    = actualDate ? actualDate.getDate() : dates[i]
          return (
            <Box
              key={day}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderLeft: `1px solid ${colors.border.subtle}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: isToday ? colors.primary.main : colors.text.muted,
                  textTransform: "uppercase",
                  letterSpacing: fonts.letterSpacing.wide,
                  fontWeight: isToday ? fonts.weight.semibold : fonts.weight.regular,
                  fontSize: "10px",
                }}
              >
                {day}
              </Typography>
              <Box
                sx={{
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
                  mt: "2px",
                }}
              >
                {dateNum}
              </Box>
            </Box>
          )
        })}
      </Box>

      {/* Scrollable Timeline */}
      <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", position: "relative" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${days.length}, 1fr)`,
            position: "relative",
            height: `${GRID_HEIGHT}px`,
          }}
        >
          {/* Time axis */}
          <Box sx={{ position: "relative" }}>
            {hours.map((hour) => (
              <Box
                key={hour}
                sx={{
                  position: "absolute",
                  top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                  right: "8px",
                  fontSize: fonts.size.xs,
                  color: colors.text.muted,
                  userSelect: "none",
                  pt: "4px",
                }}
              >
                {`${hour < 10 ? "0" : ""}${hour}:00`}
              </Box>
            ))}
          </Box>

          {/* Day columns */}
          {days.map((_: string, dayIdx: number) => (
            <Box
              key={dayIdx}
              sx={{ position: "relative", borderLeft: `1px solid ${colors.border.subtle}` }}
            >
              {/* Hour grid lines */}
              {hours.map((hour) => (
                <Box
                  key={hour}
                  sx={{
                    position: "absolute",
                    top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                    left: 0, right: 0,
                    borderTop: `1px solid ${colors.border.subtle}`,
                    height: `${HOUR_HEIGHT}px`,
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* Class blocks — hidden in examMode */}
              {!examMode && dayEvents[dayIdx]?.map((evt, evtIdx) => {
                const cs         = getClassColor(evt.classItem)
                const dateNum    = dates[dayIdx]
                const classDate  = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`
                const courseCode = evt.classItem.courseCode || extractCourseCode(evt.classItem.location || "")
                return (
                  <Box
                    key={evtIdx}
                    onClick={() => handleTimeSlotClick({ ...evt.classItem, time: evt.time, day: days[dayIdx], classDate, courseCode })}
                    sx={{
                      position: "absolute",
                      top: `${evt.top}px`,
                      height: `${evt.height}px`,
                      left: "2px", right: "2px",
                      borderRadius: radius.sm,
                      bgcolor: cs.bg,
                      color: cs.text,
                      border: `1px ${cs.borderStyle} ${cs.border}`,
                      p: "4px 6px",
                      cursor: "pointer",
                      overflow: "hidden",
                      zIndex: 1,
                      transition: "filter 0.15s",
                      "&:hover": { filter: "brightness(0.95)" },
                    }}
                  >
                    <Typography sx={{ fontWeight: fonts.weight.bold, fontSize: "11px", color: "inherit", lineHeight: 1.3 }}>
                      {evt.classItem.name}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", mt: 0.3, opacity: 0.75, color: "inherit", lineHeight: 1.3 }}>
                      {evt.classItem.location}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", opacity: 0.65, color: "inherit", lineHeight: 1.3 }}>
                      {evt.classItem.professor}
                    </Typography>
                    {onNoteClick && (
                      <Box
                        component="span"
                        onClick={(e: any) => { e.stopPropagation(); onNoteClick(courseCode, classDate) }}
                        sx={{
                          fontSize: "9px",
                          color: colors.primary.main,
                          cursor: "pointer",
                          display: "block",
                          mt: 0.5,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        📝 Notes
                      </Box>
                    )}
                  </Box>
                )
              })}

              {/* Exam blocks */}
              {examMode && examEvents[dayIdx]?.map((evt, evtIdx) => (
                <Box
                  key={`exam-${evtIdx}`}
                  onClick={() => handleTimeSlotClick({ ...evt.exam, type: "exam", day: days[dayIdx] })}
                  sx={{
                    position: "absolute",
                    top: `${evt.top}px`,
                    height: `${evt.height}px`,
                    left: "2px", right: "2px",
                    borderRadius: radius.sm,
                    bgcolor: EXAM_COLOR.bg,
                    color: EXAM_COLOR.text,
                    border: `1px solid ${EXAM_COLOR.border}`,
                    p: "4px 6px",
                    cursor: "pointer",
                    overflow: "hidden",
                    zIndex: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: fonts.weight.bold, fontSize: "11px", color: "inherit", lineHeight: 1.3 }}>
                    📝 {evt.exam.subject || evt.exam.name}
                  </Typography>
                  <Typography sx={{ fontSize: "10px", mt: 0.3, opacity: 0.75, color: "inherit" }}>
                    {evt.exam.location || ""}
                  </Typography>
                </Box>
              ))}

              {/* Task blocks */}
              {taskEvents[dayIdx]?.map((evt, evtIdx) => {
                const tc = getTaskColor(evt.task.category)
                return (
                  <Box
                    key={`task-${evtIdx}`}
                    sx={{
                      position: "absolute",
                      top: `${evt.top}px`,
                      height: `${evt.height}px`,
                      left: "2px", right: "2px",
                      borderRadius: radius.sm,
                      bgcolor: tc.bg,
                      color: tc.text,
                      border: `1px solid ${tc.border}`,
                      p: "4px 6px",
                      overflow: "hidden",
                      zIndex: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: fonts.weight.bold, fontSize: "11px", color: "inherit", lineHeight: 1.3 }}>
                      ✓ {evt.task.title}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          ))}

          {/* Now line */}
          {showNowLine && (
            <Box
              sx={{
                position: "absolute",
                top: `${nowTop}px`,
                left: `${TIME_COL_WIDTH}px`,
                right: 0,
                height: "2px",
                bgcolor: colors.primary.main,
                zIndex: 10,
                pointerEvents: "none",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: "-4px", top: "-4px",
                  width: "10px", height: "10px",
                  borderRadius: "50%",
                  bgcolor: colors.primary.main,
                },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Empty state */}
      {weeklySchedule.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6, color: colors.text.muted }}>
          <Typography sx={{ fontSize: fonts.size.sm }}>No classes scheduled for this week</Typography>
        </Box>
      )}
    </Box>
  )
}