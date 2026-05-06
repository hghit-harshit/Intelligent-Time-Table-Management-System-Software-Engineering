import { useEffect, useState } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { NotificationBulkActions } from "../../../shared";

type PaneState = "classes" | "notifs";

interface TodayClass {
  subject: string;
  time: string;
  duration: string;
  location: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
  type?: string;
}

interface Task {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
}

interface FacultyRightPaneProps {
  paneState: PaneState;
  setPaneState: (state: PaneState) => void;
  todaysClasses: TodayClass[];
  currentDate: { dayName: string; day: number; month: number; year: number };
  onViewFullDay: () => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead?: () => void;
  onDeleteNotifications?: (ids: string[]) => void;
  tasks?: Task[];
  onToggleTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function timeAgo(dateStr: string): string {
  if (!dateStr) return "just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.max(Math.floor(diff / 60000), 0);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function notifAccent(notif: NotificationItem): { accent: string; accentBg: string; badge: string } {
  const t = (notif.type || "").toLowerCase();
  if (t.includes("exam")) return { accent: "#DC2626", accentBg: "rgba(220,38,38,0.07)", badge: "📝 EXAM" };
  if (t.includes("reschedule") || t.includes("schedule_change") || t.includes("schedule"))
    return { accent: "#D97706", accentBg: "rgba(217,119,6,0.07)", badge: "↺ RESCHEDULED" };
  if (t === "approved") return { accent: "#059669", accentBg: "rgba(5,150,105,0.07)", badge: "✓ APPROVED" };
  if (t === "rejected") return { accent: "#DC2626", accentBg: "rgba(220,38,38,0.07)", badge: "✕ REJECTED" };
  return { accent: colors.primary.main, accentBg: "rgba(37,99,235,0.05)", badge: "🔔 UPDATE" };
}

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

export default function FacultyRightPane({
  paneState,
  setPaneState,
  todaysClasses,
  currentDate,
  onViewFullDay,
  notifications,
  onMarkAllNotificationsRead,
  onDeleteNotifications,
  tasks = [],
  onToggleTask,
  onDeleteTask,
}: FacultyRightPaneProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifications = notifications.slice(0, 12);
  const [selectedNotifIds, setSelectedNotifIds] = useState<string[]>([]);
  const allVisibleSelected =
    visibleNotifications.length > 0 &&
    selectedNotifIds.length === visibleNotifications.length &&
    visibleNotifications.every((notif) => selectedNotifIds.includes(notif.id));

  const toggleSelectedNotif = (id: string) => {
    setSelectedNotifIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));
  };

  const selectAllVisibleNotifs = () => {
    setSelectedNotifIds(visibleNotifications.map((notif) => notif.id));
  };

  const clearSelectedNotifs = () => setSelectedNotifIds([]);

  const deleteSelectedNotifs = () => {
    if (selectedNotifIds.length === 0) return;
    onDeleteNotifications?.(selectedNotifIds);
    setSelectedNotifIds([]);
  };

  useEffect(() => {
    setSelectedNotifIds((prev) => prev.filter((id) => notifications.some((notif) => notif.id === id)));
  }, [notifications]);

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
      {paneState === "classes" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "16px 16px 6px",
            }}
          >
            <div>
              <div style={{ fontWeight: fonts.weight.bold, fontSize: fonts.size.lg, color: colors.text.primary, lineHeight: 1.3 }}>
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

          {todaysClasses.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: colors.text.muted, fontSize: fonts.size.sm }}>
              No classes today.
            </div>
          ) : (
            todaysClasses.map((cls, i) => (
              <div key={i} style={{ padding: "12px 16px", borderTop: `1px solid ${colors.border.subtle}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
                  <div style={{ fontWeight: fonts.weight.bold, fontSize: fonts.size.sm, color: colors.text.primary }}>
                    {cls.subject}
                  </div>
                  <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, fontWeight: fonts.weight.medium, flexShrink: 0, marginLeft: "8px" }}>
                    {cls.time}
                  </div>
                </div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "2px" }}>
                  {cls.location}
                </div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginBottom: "6px" }}>
                  Duration: {cls.duration}
                </div>
              </div>
            ))
          )}

          {tasks.length > 0 && (
            <div>
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

      {paneState === "notifs" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", padding: "16px 16px 6px", gap: "6px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: fonts.weight.bold, fontSize: fonts.size.lg, color: colors.text.primary, lineHeight: 1.3 }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{ fontWeight: fonts.weight.regular, color: colors.text.muted, fontSize: fonts.size.md }}>
                    {" "}({unreadCount})
                  </span>
                )}
              </div>
              <div style={{ fontSize: fonts.size.xs, color: colors.text.muted, marginTop: "3px" }}>
                Latest updates
              </div>
            </div>
            <NotificationBulkActions
              allSelected={allVisibleSelected}
              selectedCount={selectedNotifIds.length}
              onToggleSelectAll={allVisibleSelected ? clearSelectedNotifs : selectAllVisibleNotifs}
              onDeleteSelected={deleteSelectedNotifs}
              onMarkAllRead={onMarkAllNotificationsRead}
              canMarkAllRead={unreadCount > 0}
              showSelectAll={visibleNotifications.length > 0}
            />
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

          {notifications.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: colors.text.muted, fontSize: fonts.size.sm }}>
              No notifications.
            </div>
          ) : (
            visibleNotifications.map((notif, i) => {
              const { accent, accentBg, badge } = notifAccent(notif);
              const details: string[] = ((notif as any).details || "")
                .split("\n").map((s: string) => s.trim()).filter(Boolean);
              return (
                <div
                  key={notif.id || i}
                  style={{
                    borderTop: `1px solid ${colors.border.subtle}`,
                    borderLeft: `3px solid ${notif.read ? colors.border.medium : accent}`,
                    background: notif.read ? "transparent" : accentBg,
                  }}
                >
                  <div style={{ padding: "10px 12px" }}>
                    {/* Top row: checkbox + badge + time + delete */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="checkbox"
                          checked={selectedNotifIds.includes(notif.id)}
                          onChange={() => toggleSelectedNotif(notif.id)}
                          aria-label={`Select notification ${notif.title}`}
                          style={{ cursor: "pointer", flexShrink: 0 }}
                        />
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
                          onClick={() => onDeleteNotifications?.([notif.id])}
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
                      fontWeight: fonts.weight.semibold, fontSize: fonts.size.sm,
                      color: notif.read ? colors.text.secondary : colors.text.primary,
                      marginBottom: "3px", lineHeight: 1.35,
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
                        background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`,
                        borderRadius: radius.sm, padding: "5px 8px",
                        display: "flex", flexDirection: "column", gap: "2px",
                      }}>
                        {details.map((line, li) => (
                          <div key={li} style={{
                            fontSize: "10px", color: accent, lineHeight: 1.4,
                            fontWeight: li === 0 ? fonts.weight.semibold : fonts.weight.regular,
                          }}>
                            {line}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
