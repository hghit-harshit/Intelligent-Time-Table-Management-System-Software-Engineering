/**
 * RightPane — Contextual Info Switcher Panel
 *
 * Three states (per DISHA UI Guide §4):
 *   "classes"   — Today's Classes (default) with "View Full Day" shortcut
 *   "notifs"    — Notifications panel (triggered by bell icon in CalendarCard)
 *   "exams"     — Upcoming Exams countdown (triggered by "View Exams" button)
 *
 * No internal tab switcher — state is driven by the parent (CalendarCard bell + View Exams btn).
 * The "×" button in the notifications pane returns to "classes".
 */

import { useState, useEffect, useRef } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { fetchStudentNotifications, fetchStudentExams, deleteStudentNotification, markStudentNotificationRead } from "../../../services/studentApi";
import { CheckCheck, Trash2 } from "lucide-react";

interface TodayClass {
  subject: string;
  time: string;
  duration: string;
  location: string;
  status: string;
  statusColor: string;
  isLive: boolean;
  dotColor: string;
  notes?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

interface Exam {
  courseName: string;
  courseCode: string;
  date: string;
  time: string;
  duration: string;
  hall?: string;
  seat?: string;
  row?: string;
  daysLeft?: number;
}

type PaneState = "classes" | "notifs" | "exams";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  completed: boolean;
}

interface RightPaneProps {
  paneState: PaneState;
  setPaneState: (s: PaneState) => void;
  todaysClasses: TodayClass[];
  examsData?: any[];
  currentDate: { dayName: string; day: number; month: number; year: number };
  onViewFullDay: () => void;
  onAddNotes?: (cls: TodayClass) => void;
  tasks?: Task[];
  onToggleTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function daysLeftFromDate(dateStr: string): number {
  const examDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  return Math.ceil((examDate.getTime() - today.getTime()) / 86400000);
}

function normalizeExam(exam: any): Exam {
  const startTime = exam.time ?? exam.startTime ?? "";
  const endTime = exam.endTime ?? "";
  const duration = exam.duration ?? (() => {
    if (!startTime || !endTime) return "";
    const [sh, sm] = String(startTime).split(":").map(Number);
    const [eh, em] = String(endTime).split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (!Number.isFinite(diff) || diff <= 0) return "";
    return diff % 60 === 0 ? `${diff / 60}h` : `${diff}m`;
  })();
  return {
    ...exam,
    courseName: exam.courseName ?? exam.subject ?? exam.courseCode ?? "Exam",
    courseCode: exam.courseCode ?? "",
    date: exam.date ?? exam.examDate ?? "",
    time: startTime,
    duration,
    hall: exam.hall ?? exam.location ?? exam.room ?? "",
    seat: exam.seat ?? "",
    row: exam.row ?? "",
  };
}

function daysLeftBadgeColor(days: number): { bg: string; text: string } {
  if (days <= 10) return { bg: "rgba(220,38,38,0.08)", text: "#DC2626" };
  if (days <= 17) return { bg: "rgba(217,119,6,0.08)", text: "#D97706" };
  return { bg: "rgba(37,99,235,0.08)", text: "#2563EB" };
}


const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getTaskCategoryColor(category: string): { bg: string; text: string; border: string } {
  if (category === "Academic") return { bg: "rgba(99,102,241,0.08)", text: "#6366f1", border: "rgba(99,102,241,0.2)" };
  if (category === "Personal") return { bg: "rgba(16,185,129,0.08)", text: "#10b981", border: "rgba(16,185,129,0.2)" };
  if (category === "Social") return { bg: "rgba(245,158,11,0.08)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" };
  return { bg: "rgba(99,102,241,0.08)", text: "#6366f1", border: "rgba(99,102,241,0.2)" };
}

function formatTaskDueDate(dueDate: string): string {
  if (!dueDate) return "";
  const d = new Date(dueDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function hasClassStarted(timeStr: string): boolean {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= parseTimeToMinutes(timeStr);
}

export default function RightPane({
  paneState,
  setPaneState,
  todaysClasses,
  examsData = [],
  currentDate,
  onViewFullDay,
  onAddNotes,
  tasks = [],
  onToggleTask,
  onDeleteTask,
}: RightPaneProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotifIds, setSelectedNotifIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  // Track IDs pending deletion so a fast re-fetch doesn't resurrect them
  const deletedIdsRef = useRef(new Set<string>());

  useEffect(() => {
    if (paneState !== "notifs") return;
    if (notifications.length === 0) setLoadingNotifs(true);
    fetchStudentNotifications()
      .then((data) => {
        const fetched: Notification[] = Array.isArray(data) ? data : data?.notifications || [];
        const normalized = fetched.map((n: any) => ({
          ...n,
          id: n.id || n._id,
          read: Boolean(n.read ?? n.isRead),
        }));
        setNotifications(normalized.filter((n) => !deletedIdsRef.current.has(n.id)));
      })
      .catch(() => {})
      .finally(() => setLoadingNotifs(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paneState]);

  useEffect(() => {
    if (paneState !== "exams") return;

    if (Array.isArray(examsData) && examsData.length > 0) {
      setExams(examsData.map(normalizeExam));
      return;
    }

    if (exams.length === 0) {
      setLoadingExams(true);
      fetchStudentExams()
        .then((data) => {
          const raw = Array.isArray(data) ? data : data?.exams || [];
          setExams(raw.map(normalizeExam));
        })
        .catch(() => setExams([]))
        .finally(() => setLoadingExams(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paneState, examsData]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifs = notifications.slice(0, 20);
  const validExams = exams
    .filter((exam) => {
      const date = new Date(exam.date);
      if (!exam.date || Number.isNaN(date.getTime())) return false;
      return daysLeftFromDate(exam.date) >= 0;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const removeIds = (ids: string[]) => {
    ids.forEach((id) => deletedIdsRef.current.add(id));
    setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
    Promise.allSettled(ids.map((id) => deleteStudentNotification(id))).then((results) => {
      const failedIds = results
        .map((result, index) => (result.status === "rejected" ? ids[index] : null))
        .filter(Boolean);

      failedIds.forEach((id) => deletedIdsRef.current.delete(id));
      if (failedIds.length > 0) {
        fetchStudentNotifications()
          .then((data) => {
            const fetched: Notification[] = Array.isArray(data) ? data : data?.notifications || [];
            const normalized = fetched.map((n: any) => ({
              ...n,
              id: n.id || n._id,
              read: Boolean(n.read ?? n.isRead),
            }));
            setNotifications(normalized.filter((n) => !deletedIdsRef.current.has(n.id)));
          })
          .catch(() => {});
      }
    });
  };

  const handleDeleteSingle = (id: string) => {
    removeIds([id]);
    setSelectedNotifIds((prev) => prev.filter((sid) => sid !== id));
    if (selectedNotifIds.length <= 1) setSelectionMode(false);
  };

  const toggleNotifSelected = (id: string) => {
    setSelectedNotifIds((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id],
    );
  };

  const handleReadAll = () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    unreadIds.forEach((id) => markStudentNotificationRead(id).catch(() => {}));
    setSelectedNotifIds([]);
    setSelectionMode(false);
  };

  const handleDeleteSelected = () => {
    if (selectedNotifIds.length === 0) return;
    removeIds([...selectedNotifIds]);
    setSelectedNotifIds([]);
    setSelectionMode(false);
  };

  const handleTapSelect = (id: string) => {
    if (!selectionMode) setSelectionMode(true);
    toggleNotifSelected(id);
  };

  useEffect(() => {
    if (selectionMode && selectedNotifIds.length === 0) setSelectionMode(false);
  }, [selectionMode, selectedNotifIds.length]);

  return (
    <div
      style={{
        width: "300px",
        minWidth: "300px",
        background: colors.bg.base,
        border: `1px solid ${colors.border.medium}`,
        borderRadius: radius.xl,
        boxShadow: shadows.sm,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* ── STATE 1: Today's Classes ─────────────────────────── */}
      {paneState === "classes" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "16px 16px 6px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: fonts.weight.bold,
                  fontSize: fonts.size.lg,
                  color: colors.text.primary,
                  lineHeight: 1.3,
                }}
              >
                Today's Classes
              </div>
              <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "3px" }}>
                {currentDate.dayName}, {MONTH_NAMES[(currentDate.month || 1) - 1]} {currentDate.day}
              </div>
            </div>
            <button
              onClick={onViewFullDay}
              style={{
                background: "none",
                border: "none",
                color: colors.primary.main,
                fontSize: fonts.size.xs,
                fontWeight: fonts.weight.semibold,
                cursor: "pointer",
                fontFamily: fonts.body,
                paddingTop: "4px",
                flexShrink: 0,
              }}
            >
              View Full Day
            </button>
          </div>

          {/* Class list */}
          {todaysClasses.length === 0 ? (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                color: colors.text.muted,
                fontSize: fonts.size.sm,
              }}
            >
              No classes today.
            </div>
          ) : (
            todaysClasses.map((cls, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 16px",
                  borderTop: `1px solid ${colors.border.subtle}`,
                }}
              >
                {/* Subject + time */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "3px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: fonts.weight.bold,
                      fontSize: fonts.size.sm,
                      color: colors.text.primary,
                    }}
                  >
                    {cls.subject}
                  </div>
                  <div
                    style={{
                      fontSize: fonts.size.xs,
                      color: colors.text.muted,
                      fontWeight: fonts.weight.medium,
                      flexShrink: 0,
                      marginLeft: "8px",
                    }}
                  >
                    {cls.time}
                  </div>
                </div>

                {/* Location (code · room) */}
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "2px" }}>
                  {cls.location}
                </div>

                {/* Duration */}
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "6px" }}>
                  Duration: {cls.duration}
                </div>

                {/* Notes status */}
                <div
                  style={{
                    fontSize: fonts.size.xs,
                    color: colors.text.muted,
                    marginBottom: "8px",
                  }}
                >
                  {cls.notes
                    ? `Notes: ${cls.notes}`
                    : hasClassStarted(cls.time)
                      ? "Notes: Class in progress. You can add notes now."
                      : "Notes: Available once class starts."}
                </div>

                {/* Add notes button */}
                <button
                  onClick={() => onAddNotes?.(cls)}
                  disabled={!hasClassStarted(cls.time)}
                  style={{
                    padding: "5px 12px",
                    background: !hasClassStarted(cls.time) ? colors.bg.raised : colors.bg.raised,
                    border: `1px solid ${colors.border.medium}`,
                    borderRadius: radius.md,
                    color: !hasClassStarted(cls.time) ? colors.text.muted : colors.text.secondary,
                    fontSize: fonts.size.xs,
                    cursor: !hasClassStarted(cls.time) ? "not-allowed" : "pointer",
                    fontFamily: fonts.body,
                    fontWeight: fonts.weight.medium,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!hasClassStarted(cls.time)) return;
                    (e.currentTarget as HTMLButtonElement).style.background = colors.primary.ghost;
                    (e.currentTarget as HTMLButtonElement).style.borderColor = colors.primary.border;
                    (e.currentTarget as HTMLButtonElement).style.color = colors.primary.main;
                  }}
                  onMouseLeave={(e) => {
                    if (!hasClassStarted(cls.time)) return;
                    (e.currentTarget as HTMLButtonElement).style.background = colors.bg.raised;
                    (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border.medium;
                    (e.currentTarget as HTMLButtonElement).style.color = colors.text.secondary;
                  }}
                >
                  {hasClassStarted(cls.time) ? "Add notes" : "Available at class time"}
                </button>
              </div>
            ))
          )}

          {/* ── Tasks Section ─────────────────────────────────── */}
          {tasks.length > 0 && (
            <div>
              {/* Section divider + header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px 6px",
                  borderTop: `1px solid ${colors.border.subtle}`,
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: fonts.size.xs,
                    fontWeight: fonts.weight.semibold,
                    color: colors.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Tasks ({tasks.filter((t) => !t.completed).length} pending)
                </div>
              </div>

              {tasks.map((task) => {
                const tc = getTaskCategoryColor(task.category);
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: "10px 16px",
                      borderTop: `1px solid ${colors.border.subtle}`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      opacity: task.completed ? 0.6 : 1,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {/* Checkbox circle */}
                    <button
                      onClick={() => onToggleTask?.(task.id)}
                      title={task.completed ? "Mark incomplete" : "Mark complete"}
                      style={{
                        flexShrink: 0,
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: `2px solid ${task.completed ? tc.text : colors.border.strong}`,
                        background: task.completed ? tc.bg : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        marginTop: "1px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {task.completed && (
                        <span style={{ fontSize: "10px", color: tc.text, lineHeight: 1 }}>✓</span>
                      )}
                    </button>

                    {/* Task content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: fonts.size.sm,
                          fontWeight: fonts.weight.semibold,
                          color: colors.text.primary,
                          textDecoration: task.completed ? "line-through" : "none",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {task.title}
                      </div>
                      {task.dueDate && (
                        <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "2px" }}>
                          {formatTaskDueDate(task.dueDate)}
                        </div>
                      )}
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "4px",
                          padding: "1px 6px",
                          background: tc.bg,
                          color: tc.text,
                          border: `1px solid ${tc.border}`,
                          borderRadius: "4px",
                          fontSize: "9px",
                          fontWeight: fonts.weight.semibold,
                        }}
                      >
                        {task.category}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteTask?.(task.id)}
                      title="Delete task"
                      style={{
                        flexShrink: 0,
                        background: "none",
                        border: "none",
                        color: colors.text.muted,
                        cursor: "pointer",
                        fontSize: "16px",
                        lineHeight: 1,
                        padding: "0 2px",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = colors.error.main)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = colors.text.muted)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STATE 2: Notifications ───────────────────────────── */}
      {paneState === "notifs" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              padding: "16px 16px 6px",
              gap: "6px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: fonts.weight.bold,
                  fontSize: fonts.size.lg,
                  color: colors.text.primary,
                  lineHeight: 1.3,
                }}
              >
                Notifications
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontWeight: fonts.weight.regular,
                      color: colors.text.muted,
                      fontSize: fonts.size.md,
                    }}
                  >
                    {" "}({unreadCount})
                  </span>
                )}
              </div>
              <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "3px" }}>
                Latest updates
              </div>
            </div>
            <button
              style={{
                background: colors.bg.raised,
                border: `1px solid ${colors.border.medium}`,
                color: unreadCount > 0 ? colors.primary.main : colors.text.muted,
                borderRadius: radius.sm,
                width: 26,
                height: 26,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: unreadCount > 0 ? "pointer" : "not-allowed",
              }}
              onClick={handleReadAll}
              disabled={unreadCount === 0}
              title="Mark all read"
            >
              <CheckCheck size={14} />
            </button>
            <button
              style={{
                background: colors.bg.raised,
                border: `1px solid ${colors.border.medium}`,
                color: selectedNotifIds.length === 0 ? colors.text.muted : colors.error.main,
                borderRadius: radius.sm,
                width: 26,
                height: 26,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: selectedNotifIds.length === 0 ? "not-allowed" : "pointer",
              }}
              onClick={handleDeleteSelected}
              disabled={selectedNotifIds.length === 0}
              title="Delete selected"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => setPaneState("classes")}
              style={{
                background: "none",
                border: "none",
                color: colors.text.muted,
                fontSize: "18px",
                cursor: "pointer",
                padding: "0 2px",
                lineHeight: 1,
                flexShrink: 0,
                fontFamily: fonts.body,
              }}
            >
              ×
            </button>
          </div>

          {loadingNotifs ? (
            <div
              style={{
                padding: "24px 16px",
                textAlign: "center",
                color: colors.text.muted,
                fontSize: fonts.size.sm,
              }}
            >
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                color: colors.text.muted,
                fontSize: fonts.size.sm,
              }}
            >
              No notifications.
            </div>
          ) : (
            visibleNotifs.map((notif) => {
              const type = (notif.type || "").toLowerCase();
              const isExam = type.includes("exam");
              const isReschedule = type.includes("reschedule") || type.includes("schedule_change") || type.includes("schedule");
              const accent = isExam ? "#DC2626" : isReschedule ? "#D97706" : colors.primary.main;
              const accentBg = isExam ? "rgba(220,38,38,0.07)" : isReschedule ? "rgba(217,119,6,0.07)" : "rgba(37,99,235,0.05)";
              const badge = isExam ? "📝 EXAM" : isReschedule ? "↺ RESCHEDULED" : "🔔 UPDATE";
              const details: string[] = ((notif as any).details || "")
                .split("\n")
                .map((s: string) => s.trim())
                .filter(Boolean);

              return (
              <div
                key={notif.id}
                style={{
                  borderTop: `1px solid ${colors.border.subtle}`,
                  borderLeft: `3px solid ${notif.read ? colors.border.medium : accent}`,
                  background: notif.read ? "transparent" : accentBg,
                  position: "relative",
                  opacity: notif.read ? 0.65 : 1,
                }}
              >
                <div
                  style={{ padding: "10px 12px 10px 12px", cursor: selectionMode ? "pointer" : "default" }}
                  onClick={() => selectionMode && handleTapSelect(notif.id)}
                >
                  {/* Top row: badge + time + delete */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {selectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedNotifIds.includes(notif.id)}
                          onChange={(e) => { e.stopPropagation(); toggleNotifSelected(notif.id); }}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                      <span style={{
                        fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em",
                        color: notif.read ? colors.text.muted : accent,
                        background: notif.read ? colors.bg.raised : accentBg,
                        border: `1px solid ${notif.read ? colors.border.medium : accent}`,
                        borderRadius: "4px", padding: "1px 6px",
                      }}>
                        {badge}
                      </span>
                      {!notif.read && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block", flexShrink: 0 }} />
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: fonts.size.xs, color: colors.text.muted, whiteSpace: "nowrap" }}>
                        {timeAgo(notif.createdAt)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSingle(notif.id); }}
                        title="Delete"
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: colors.text.muted, fontSize: "14px", lineHeight: 1,
                          padding: "0 2px", fontFamily: fonts.body,
                        }}
                      >×</button>
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{
                    fontWeight: fonts.weight.semibold,
                    fontSize: fonts.size.sm,
                    color: notif.read ? colors.text.secondary : colors.text.primary,
                    marginBottom: "3px",
                    lineHeight: 1.35,
                  }}>
                    {notif.title}
                  </div>

                  {/* Message */}
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.secondary, lineHeight: 1.5, marginBottom: details.length ? "6px" : 0 }}>
                    {notif.message}
                  </div>

                  {/* Structured details */}
                  {details.length > 0 && (
                    <div style={{
                      background: colors.bg.raised,
                      border: `1px solid ${colors.border.subtle}`,
                      borderRadius: radius.sm,
                      padding: "5px 8px",
                      display: "flex", flexDirection: "column", gap: "2px",
                    }}>
                      {details.map((line, li) => (
                        <div key={li} style={{ fontSize: "10px", color: accent, fontWeight: li === 0 ? fonts.weight.semibold : fonts.weight.regular, lineHeight: 1.4 }}>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mark read */}
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
                        markStudentNotificationRead(notif.id).catch(() => {});
                      }}
                      style={{
                        marginTop: "6px", background: "none", border: `1px solid ${accent}`,
                        borderRadius: radius.sm, padding: "2px 8px", color: accent,
                        fontSize: "10px", cursor: "pointer", fontFamily: fonts.body,
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            )})
          )}
        </div>
      )}

      {/* ── STATE 3: Upcoming Exams ──────────────────────────── */}
      {paneState === "exams" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingExams ? (
            <div
              style={{
                padding: "24px 16px",
                textAlign: "center",
                color: colors.text.muted,
                fontSize: fonts.size.sm,
              }}
            >
              Loading...
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: "16px 16px 6px" }}>
                <div
                  style={{
                    fontWeight: fonts.weight.bold,
                    fontSize: fonts.size.lg,
                    color: colors.text.primary,
                    lineHeight: 1.3,
                  }}
                >
                  Upcoming Exams
                </div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "3px" }}>
                  Next assessments in your schedule
                </div>
              </div>

              {validExams.length === 0 ? (
                <div
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    color: colors.text.muted,
                    fontSize: fonts.size.sm,
                  }}
                >
                  No upcoming exams.
                </div>
              ) : (
                validExams.map((exam, i) => {
                  const dl = daysLeftFromDate(exam.date);
                  const { bg, text } = daysLeftBadgeColor(dl);
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "14px 16px",
                        borderTop: `1px solid ${colors.border.subtle}`,
                      }}
                    >
                      {/* Course name + days badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: fonts.weight.bold,
                            fontSize: fonts.size.sm,
                            color: colors.text.primary,
                          }}
                        >
                          {exam.courseName}
                        </div>
                        <span
                          style={{
                            background: bg,
                            color: text,
                            fontSize: fonts.size.xs,
                            fontWeight: fonts.weight.bold,
                            padding: "2px 7px",
                            borderRadius: radius.full,
                            flexShrink: 0,
                            marginLeft: "8px",
                          }}
                        >
                          {dl}d
                        </span>
                      </div>

                      {/* Course code + hall */}
                      <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "3px" }}>
                        {exam.courseCode}
                        {exam.hall ? ` · ${exam.hall}` : ""}
                      </div>

                      {/* Date + time */}
                      <div
                        style={{
                          fontSize: fonts.size.xs,
                          color: "#2563EB",
                          marginBottom: "3px",
                        }}
                      >
                        {new Date(exam.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {exam.time ? ` · ${exam.time}` : ""}
                        {exam.duration ? ` · ${exam.duration}` : ""}
                      </div>

                      {/* Seat info */}
                      {(exam.row || exam.seat) && (
                        <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                          {exam.row ? `Row ${exam.row}` : ""}
                          {exam.row && exam.seat ? ", " : ""}
                          {exam.seat ? `Seat ${exam.seat}` : ""}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
