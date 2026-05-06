import { useEffect, useState } from "react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
/* WHY: Import shared components to replace duplicated top-bar, stats grid, and modal */
import { SubPageHeader, StatsGrid, Modal, NotificationBulkActions } from "../../../shared";
import {
  deleteStudentNotification,
  fetchStudentNotifications,
  markStudentNotificationRead,
} from "../../../services/studentApi";

export default function Notifications() {
  const [filterType, setFilterType] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const card = {
    background: colors.bg.base,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.lg,
    boxShadow: shadows.sm,
  };
  const cardInner = {
    background: colors.bg.raised,
    border: `1px solid ${colors.border.subtle}`,
    borderRadius: radius.md,
  };
  const heading = {
    fontFamily: fonts.heading,
    fontWeight: fonts.weight.semibold,
    color: colors.text.primary,
  };
  const muted = { fontSize: fonts.size.sm, color: colors.text.secondary };
  const caption = { fontSize: fonts.size.xs, color: colors.text.muted };

  const formatRelativeTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getNotificationColor = (notification) => {
    const typeColors = {
      class_change: colors.warning.main,
      schedule_change: colors.warning.main,
      timetable_update: colors.primary.main,
      exam: colors.error.main,
      assignment: colors.info.main,
      grade: colors.success.main,
      announcement: colors.text.secondary,
      system: colors.text.muted,
    };
    if (notification.color) return notification.color;
    if (typeColors[notification.type]) return typeColors[notification.type];
    if (notification.priority === "high") return colors.error.main;
    if (notification.priority === "medium") return colors.warning.main;
    return colors.primary.main;
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    fetchStudentNotifications()
      .then((data) => {
        if (!isMounted) return;
        const normalized = (data || []).map((notification) => ({
          ...notification,
          id: notification.id || notification._id,
          isRead: Boolean(notification.isRead),
          priority: notification.priority || "low",
          time: notification.time || formatRelativeTime(notification.createdAt),
          color: getNotificationColor(notification),
        }));
        setNotifications(normalized);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error?.message || "Unable to load notifications");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications =
    filterType === "all"
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    markStudentNotificationRead(id).catch(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    });
  };
  const markAllAsRead = () => {
    const unread = notifications.filter((n) => !n.isRead).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    unread.forEach((id) => markStudentNotificationRead(id).catch(() => {}));
  };
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    deleteStudentNotification(id).catch(() => {
      fetchStudentNotifications()
        .then((data) => {
          const normalized = (data || []).map((notification) => ({
            ...notification,
            id: notification.id || notification._id,
            isRead: Boolean(notification.isRead),
            priority: notification.priority || "low",
            time: notification.time || formatRelativeTime(notification.createdAt),
            color: getNotificationColor(notification),
          }));
          setNotifications(normalized);
        })
        .catch(() => {});
    });
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const selectAllVisible = () => {
    setSelectedIds(filteredNotifications.map((n) => n.id));
  };

  const clearSelection = () => setSelectedIds([]);

  const deleteSelected = () => {
    const ids = selectedIds;
    if (ids.length === 0) return;
    setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
    setSelectedIds([]);
    ids.forEach((id) => deleteStudentNotification(id).catch(() => {}));
  };

  const getTypeLabel = (type) => {
    const types = {
      all: "All",
      class_change: "Class Changes",
      schedule_change: "Class Rescheduled",
      timetable_update: "Timetable Published",
      exam: "Exams",
      assignment: "Assignments",
      grade: "Grades",
      announcement: "Announcements",
      system: "System",
    };
    return types[type] || type;
  };

  return (
    <>
      {/* WHY: Replaced duplicated accent-bar header with shared SubPageHeader */}
      <SubPageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread · ${notifications.length} total`}
        accentColor={colors.warning.main}
        actions={
          <>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                ...cardInner,
                padding: "6px 12px",
                color: colors.text.primary,
                fontSize: fonts.size.sm,
                cursor: "pointer",
                fontFamily: fonts.body,
              }}
            >
              <option value="all">All Types</option>
              <option value="class_change">Class Changes</option>
              <option value="exam">Exams</option>
              <option value="assignment">Assignments</option>
              <option value="grade">Grades</option>
              <option value="announcement">Announcements</option>
              <option value="system">System</option>
            </select>
            <NotificationBulkActions
              allSelected={
                filteredNotifications.length > 0 &&
                selectedIds.length === filteredNotifications.length
              }
              selectedCount={selectedIds.length}
              onToggleSelectAll={
                selectedIds.length === filteredNotifications.length
                  ? clearSelection
                  : selectAllVisible
              }
              onDeleteSelected={deleteSelected}
              onMarkAllRead={markAllAsRead}
              canMarkAllRead={unreadCount > 0}
            />
          </>
        }
      />

      {loading && (
        <div
          style={{
            margin: "0 12px",
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(59, 130, 246, 0.1)",
            color: "#3b82f6",
            fontSize: "12px",
          }}
        >
          Loading notifications...
        </div>
      )}

      {loadError && (
        <div
          style={{
            margin: "0 12px",
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            fontSize: "12px",
          }}
        >
          {loadError}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          margin: "12px",
          gap: "12px",
          overflow: "hidden",
        }}
      >
        {/* Main Panel */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
          {/* WHY: Replaced inline 4-column stat grid with shared StatsGrid */}
          <StatsGrid
            stats={[
              {
                num: notifications.length.toString(),
                label: "Total Messages",
                color: colors.primary.main,
              },
              {
                num: unreadCount.toString(),
                label: "Unread",
                color:
                  unreadCount > 0 ? colors.error.main : colors.success.main,
              },
              {
                num: notifications
                  .filter((n) => n.priority === "high")
                  .length.toString(),
                label: "High Priority",
                color: colors.warning.main,
              },
              {
                num: notifications.filter((n) => n.isRead).length.toString(),
                label: "Read",
                color: colors.success.main,
              },
            ]}
          />

          {/* Notifications List */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                borderBottom: `1px solid ${colors.border.medium}`,
              }}
            >
              <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>
                {getTypeLabel(filterType)} Notifications
              </h3>
              <span style={{ marginLeft: "auto", ...muted }}>
                {filteredNotifications.length} messages
              </span>
            </div>

            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: "24px 16px",
                  textAlign: "center",
                  color: colors.text.muted,
                }}
              >
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification, i) => (
                <div
                  key={notification.id}
                  style={{
                    padding: "10px 16px",
                    borderBottom:
                      i < filteredNotifications.length - 1
                        ? `1px solid ${colors.border.subtle}`
                        : "none",
                    cursor: "pointer",
                    transition: "background 0.1s ease",
                    background: !notification.isRead
                      ? colors.primary.ghost
                      : "transparent",
                    borderLeft: !notification.isRead
                      ? `3px solid ${colors.primary.main}`
                      : "3px solid transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = colors.bg.raised)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = !notification.isRead
                      ? colors.primary.ghost
                      : "transparent")
                  }
                  onClick={() => {
                    setSelectedNotification(notification);
                    markAsRead(notification.id);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelected(notification.id);
                      }}
                      style={{ marginTop: "4px" }}
                    />
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: notification.color,
                        marginTop: "5px",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: fonts.size.base,
                            fontWeight: 500,
                            color: notification.isRead
                              ? colors.text.secondary
                              : colors.text.primary,
                          }}
                        >
                          {notification.title}
                        </div>
                        {!notification.isRead && (
                          <div
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: colors.primary.main,
                            }}
                          />
                        )}
                        {notification.priority === "high" && (
                          <span
                            style={{
                              background: colors.error.ghost,
                              color: colors.error.main,
                              fontSize: "9px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: "3px",
                              textTransform: "uppercase",
                            }}
                          >
                            High
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          ...muted,
                          marginBottom: "6px",
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.message}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={caption}>{notification.time}</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              style={{
                                background: colors.primary.ghost,
                                border: "none",
                                borderRadius: radius.sm,
                                padding: "2px 8px",
                                color: colors.primary.main,
                                fontSize: "10px",
                                cursor: "pointer",
                                fontFamily: fonts.body,
                              }}
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            style={{
                              background: colors.error.ghost,
                              border: "none",
                              borderRadius: radius.sm,
                              padding: "2px 8px",
                              color: colors.error.main,
                              fontSize: "10px",
                              cursor: "pointer",
                              fontFamily: fonts.body,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: "260px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Quick Actions */}
          <div style={{ ...card, padding: "12px" }}>
            <h4
              style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}
            >
              Quick Actions
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {[
                {
                  label: "Mark All Read",
                  onClick: markAllAsRead,
                  disabled: unreadCount === 0,
                },
                {
                  label: "Notification Settings",
                  onClick: () => alert("Opening notification settings..."),
                },
                {
                  label: "Push Notifications",
                  onClick: () => alert("Configuring push notifications..."),
                },
                {
                  label: "Email Preferences",
                  onClick: () => alert("Setting email preferences..."),
                },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  style={{
                    ...cardInner,
                    padding: "8px 10px",
                    color: action.disabled
                      ? colors.border.strong
                      : colors.text.secondary,
                    fontSize: fonts.size.sm,
                    cursor: action.disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textAlign: "left",
                    transition: "background 0.1s ease",
                    fontFamily: fonts.body,
                  }}
                  onMouseEnter={(e) => {
                    if (!action.disabled) {
                      e.currentTarget.style.background = colors.primary.ghost;
                      e.currentTarget.style.color = colors.primary.main;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!action.disabled) {
                      e.currentTarget.style.background = colors.bg.raised;
                      e.currentTarget.style.color = colors.text.secondary;
                    }
                  }}
                >
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Summary */}
          <div style={{ ...card, padding: "12px" }}>
            <h4
              style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}
            >
              Today's Summary
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {[
                {
                  type: "Class Changes",
                  count: notifications.filter((n) => n.type === "class_change")
                    .length,
                  color: colors.warning.main,
                },
                {
                  type: "Exam Updates",
                  count: notifications.filter((n) => n.type === "exam").length,
                  color: colors.error.main,
                },
                {
                  type: "Assignments",
                  count: notifications.filter((n) => n.type === "assignment")
                    .length,
                  color: colors.info.main,
                },
                {
                  type: "Grades Posted",
                  count: notifications.filter((n) => n.type === "grade").length,
                  color: colors.success.main,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 10px",
                    ...cardInner,
                  }}
                >
                  <span
                    style={{
                      fontSize: fonts.size.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    {item.type}
                  </span>
                  <span
                    style={{
                      fontSize: fonts.size.sm,
                      fontWeight: 600,
                      color: item.color,
                    }}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ ...card, padding: "12px", flex: 1 }}>
            <h4
              style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}
            >
              Recent Activity
            </h4>
            <div
              style={{
                fontSize: fonts.size.sm,
                color: colors.text.secondary,
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: "0 0 4px" }}>
                VLSI class rescheduled (10m ago)
              </p>
              <p style={{ margin: "0 0 4px" }}>
                Exam hall assignment received (1h ago)
              </p>
              <p style={{ margin: "0 0 4px" }}>
                Assignment reminder sent (2h ago)
              </p>
              <p style={{ margin: "0 0 4px" }}>
                Grade posted for S&S exam (3h ago)
              </p>
              <p style={{ margin: 0 }}>Lab schedule updated (5h ago)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Details Modal */}
      {/* WHY: Guard with && so children are never evaluated when selectedNotification is null */}
      {selectedNotification && (
        <Modal
          open={true}
          onClose={() => setSelectedNotification(null)}
          maxWidth="500px"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: 4,
                  height: 28,
                  borderRadius: "2px",
                  background: selectedNotification.color,
                  flexShrink: 0,
                }}
              />
              <div>
                <h3
                  style={{
                    ...heading,
                    fontSize: "15px",
                    color: selectedNotification.color,
                    margin: "0 0 4px",
                  }}
                >
                  {selectedNotification.title}
                </h3>
                <div style={caption}>{selectedNotification.time}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedNotification(null)}
              style={{
                background: colors.bg.raised,
                border: `1px solid ${colors.border.subtle}`,
                width: "28px",
                height: "28px",
                borderRadius: radius.md,
                color: colors.text.secondary,
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              color: colors.text.secondary,
              lineHeight: 1.6,
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {selectedNotification.details}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={{
                ...btn,
                background: selectedNotification.color,
                padding: "8px 16px",
              }}
            >
              Take Action
            </button>
            <button
              onClick={() => {
                removeNotification(selectedNotification.id);
                setSelectedNotification(null);
              }}
              style={btnGhost}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
