import { useState } from "react"
import Layout from "../components/Layout"
import { colors, fonts, radius, shadows } from "../styles/tokens"

export default function Notifications() {
  const [filterType, setFilterType] = useState("all")
  const [selectedNotification, setSelectedNotification] = useState(null)

  const card = { background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.lg, boxShadow: shadows.sm }
  const cardInner = { background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, borderRadius: radius.md }
  const heading = { fontFamily: fonts.heading, fontWeight: fonts.weight.semibold, color: colors.text.primary }
  const muted = { fontSize: fonts.size.sm, color: colors.text.secondary }
  const caption = { fontSize: fonts.size.xs, color: colors.text.muted }
  const btn = { background: colors.primary.main, border: "none", borderRadius: radius.md, padding: "6px 14px", color: "#fff", fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }
  const btnGhost = { background: colors.bg.raised, border: `1px solid ${colors.border.medium}`, borderRadius: radius.md, padding: "8px 16px", color: colors.text.primary, fontSize: fonts.size.sm, fontWeight: 500, cursor: "pointer", fontFamily: fonts.body }

  const [notifications, setNotifications] = useState([
    { id: 1, type: "class_change", title: "Class Rescheduled", message: "VLSI Design (Wed 2pm) moved to Fri 2pm · F-102. Auto-updated in calendar.", time: "10 min ago", isRead: false, priority: "high", color: colors.warning.main, details: "Due to Dr. Patel's emergency meeting, the VLSI Design class scheduled for Wednesday at 2:00 PM has been moved to Friday at the same time. The classroom remains F-102. All registered students have been notified automatically." },
    { id: 2, type: "exam", title: "Exam Hall Published", message: "Digital Circuits exam: Hall A, Row 4, Seat 12. Invigilator: Dr. Nair.", time: "1 hr ago", isRead: false, priority: "high", color: colors.error.main, details: "Your seat assignment for the Digital Circuits examination on February 27th has been published. Please report to Exam Hall A at least 30 minutes before the exam starts. Bring your ID card and hall ticket." },
    { id: 3, type: "assignment", title: "Assignment Reminder", message: "DSA Assignment #3 due tomorrow at 11:59 PM. Submit via portal.", time: "2 hrs ago", isRead: true, priority: "medium", color: colors.info.main, details: "Data Structures Assignment #3 on Binary Trees and Graph Algorithms is due tomorrow. Make sure to include proper documentation and test cases. Late submissions will incur penalty." },
    { id: 4, type: "grade", title: "Grade Posted", message: "Signals & Systems exam results are now available. You scored 85/100.", time: "3 hrs ago", isRead: true, priority: "low", color: colors.success.main, details: "Congratulations! Your Signals & Systems examination score is 85/100, earning you an A grade. The class average was 78. Detailed score breakdown is available in the student portal." },
    { id: 5, type: "announcement", title: "Lab Schedule Update", message: "Networks Lab sessions will now include WiFi security practicals starting next week.", time: "5 hrs ago", isRead: true, priority: "low", color: colors.text.secondary, details: "The Networks Laboratory curriculum has been updated to include hands-on WiFi security practicals. Students should bring their laptops with Wireshark pre-installed starting from next Monday." },
    { id: 6, type: "system", title: "System Maintenance", message: "Student portal will be down for maintenance on Saturday 2-4 AM.", time: "1 day ago", isRead: true, priority: "low", color: colors.text.muted, details: "The student portal and related services will undergo scheduled maintenance on Saturday from 2:00 AM to 4:00 AM. Please complete any urgent tasks before this time." }
  ])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const filteredNotifications = filterType === "all" ? notifications : notifications.filter(n => n.type === filterType)

  const markAsRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  const deleteNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

  const getTypeLabel = (type) => {
    const types = { all: "All", class_change: "Class Changes", exam: "Exams", assignment: "Assignments", grade: "Grades", announcement: "Announcements", system: "System" }
    return types[type] || type
  }

  return (
    <Layout>
      {/* Top Bar */}
      <div style={{ ...card, margin: "12px 12px 0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 3, height: 20, borderRadius: "2px", background: colors.warning.main }} />
            <h2 style={{ ...heading, fontSize: "15px", margin: 0, fontWeight: 700 }}>Notifications</h2>
          </div>
          <p style={{ ...caption, margin: "4px 0 0 11px" }}>{unreadCount} unread · {notifications.length} total</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ ...cardInner, padding: "6px 12px", color: colors.text.primary, fontSize: fonts.size.sm, cursor: "pointer", fontFamily: fonts.body }}>
            <option value="all">All Types</option>
            <option value="class_change">Class Changes</option>
            <option value="exam">Exams</option>
            <option value="assignment">Assignments</option>
            <option value="grade">Grades</option>
            <option value="announcement">Announcements</option>
            <option value="system">System</option>
          </select>
          {unreadCount > 0 && <button onClick={markAllAsRead} style={btn}>Mark All Read</button>}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", margin: "12px", gap: "12px", overflow: "hidden" }}>
        {/* Main Panel */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
            {[
              { num: notifications.length.toString(), label: "Total Messages", color: colors.primary.main },
              { num: unreadCount.toString(), label: "Unread", color: unreadCount > 0 ? colors.error.main : colors.success.main },
              { num: notifications.filter(n => n.priority === "high").length.toString(), label: "High Priority", color: colors.warning.main },
              { num: notifications.filter(n => n.isRead).length.toString(), label: "Read", color: colors.success.main },
            ].map((stat, i) => (
              <div key={i} style={{ ...card, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 600, color: stat.color, marginBottom: "2px", fontVariantNumeric: "tabular-nums", fontFamily: fonts.heading }}>{stat.num}</div>
                <div style={muted}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${colors.border.medium}` }}>
              <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>{getTypeLabel(filterType)} Notifications</h3>
              <span style={{ marginLeft: "auto", ...muted }}>{filteredNotifications.length} messages</span>
            </div>

            {filteredNotifications.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: colors.text.muted }}>
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification, i) => (
                <div key={notification.id} style={{
                  padding: "10px 16px",
                  borderBottom: i < filteredNotifications.length - 1 ? `1px solid ${colors.border.subtle}` : "none",
                  cursor: "pointer",
                  transition: "background 0.1s ease",
                  background: !notification.isRead ? colors.primary.ghost : "transparent",
                  borderLeft: !notification.isRead ? `3px solid ${colors.primary.main}` : "3px solid transparent",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.bg.raised}
                onMouseLeave={(e) => e.currentTarget.style.background = !notification.isRead ? colors.primary.ghost : "transparent"}
                onClick={() => { setSelectedNotification(notification); markAsRead(notification.id) }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: notification.color, marginTop: "5px", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ fontSize: fonts.size.base, fontWeight: 500, color: notification.isRead ? colors.text.secondary : colors.text.primary }}>{notification.title}</div>
                        {!notification.isRead && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors.primary.main }} />}
                        {notification.priority === "high" && (
                          <span style={{ background: colors.error.ghost, color: colors.error.main, fontSize: "9px", fontWeight: 600, padding: "2px 6px", borderRadius: "3px", textTransform: "uppercase" }}>High</span>
                        )}
                      </div>
                      <div style={{ ...muted, marginBottom: "6px", lineHeight: 1.4 }}>{notification.message}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={caption}>{notification.time}</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {!notification.isRead && (
                            <button onClick={(e) => { e.stopPropagation(); markAsRead(notification.id) }} style={{ background: colors.primary.ghost, border: "none", borderRadius: radius.sm, padding: "2px 8px", color: colors.primary.main, fontSize: "10px", cursor: "pointer", fontFamily: fonts.body }}>Mark Read</button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id) }} style={{ background: colors.error.ghost, border: "none", borderRadius: radius.sm, padding: "2px 8px", color: colors.error.main, fontSize: "10px", cursor: "pointer", fontFamily: fonts.body }}>Delete</button>
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
        <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Quick Actions */}
          <div style={{ ...card, padding: "12px" }}>
            <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Quick Actions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Mark All Read", onClick: markAllAsRead, disabled: unreadCount === 0 },
                { label: "Notification Settings", onClick: () => alert('Opening notification settings...') },
                { label: "Push Notifications", onClick: () => alert('Configuring push notifications...') },
                { label: "Email Preferences", onClick: () => alert('Setting email preferences...') },
              ].map((action, i) => (
                <button key={i} onClick={action.onClick} disabled={action.disabled} style={{
                  ...cardInner, padding: "8px 10px",
                  color: action.disabled ? colors.border.strong : colors.text.secondary,
                  fontSize: fonts.size.sm, cursor: action.disabled ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: "8px", textAlign: "left",
                  transition: "background 0.1s ease", fontFamily: fonts.body,
                }}
                onMouseEnter={(e) => { if (!action.disabled) { e.currentTarget.style.background = colors.primary.ghost; e.currentTarget.style.color = colors.primary.main } }}
                onMouseLeave={(e) => { if (!action.disabled) { e.currentTarget.style.background = colors.bg.raised; e.currentTarget.style.color = colors.text.secondary } }}>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Summary */}
          <div style={{ ...card, padding: "12px" }}>
            <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Today's Summary</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { type: "Class Changes", count: notifications.filter(n => n.type === "class_change").length, color: colors.warning.main },
                { type: "Exam Updates", count: notifications.filter(n => n.type === "exam").length, color: colors.error.main },
                { type: "Assignments", count: notifications.filter(n => n.type === "assignment").length, color: colors.info.main },
                { type: "Grades Posted", count: notifications.filter(n => n.type === "grade").length, color: colors.success.main },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", ...cardInner }}>
                  <span style={{ fontSize: fonts.size.sm, color: colors.text.secondary }}>{item.type}</span>
                  <span style={{ fontSize: fonts.size.sm, fontWeight: 600, color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ ...card, padding: "12px", flex: 1 }}>
            <h4 style={{ ...heading, fontSize: fonts.size.sm, margin: "0 0 8px" }}>Recent Activity</h4>
            <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 4px" }}>VLSI class rescheduled (10m ago)</p>
              <p style={{ margin: "0 0 4px" }}>Exam hall assignment received (1h ago)</p>
              <p style={{ margin: "0 0 4px" }}>Assignment reminder sent (2h ago)</p>
              <p style={{ margin: "0 0 4px" }}>Grade posted for S&S exam (3h ago)</p>
              <p style={{ margin: 0 }}>Lab schedule updated (5h ago)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedNotification(null)}>
          <div style={{ background: colors.bg.base, border: `1px solid ${colors.border.medium}`, borderRadius: radius.xl, padding: "24px", maxWidth: "500px", width: "90%", boxShadow: shadows.xl }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 4, height: 28, borderRadius: "2px", background: selectedNotification.color, flexShrink: 0 }} />
                <div>
                  <h3 style={{ ...heading, fontSize: "15px", color: selectedNotification.color, margin: "0 0 4px" }}>{selectedNotification.title}</h3>
                  <div style={caption}>{selectedNotification.time}</div>
                </div>
              </div>
              <button onClick={() => setSelectedNotification(null)} style={{ background: colors.bg.raised, border: `1px solid ${colors.border.subtle}`, width: "28px", height: "28px", borderRadius: radius.md, color: colors.text.secondary, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ color: colors.text.secondary, lineHeight: 1.6, fontSize: "13px", marginBottom: "16px" }}>{selectedNotification.details}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ ...btn, background: selectedNotification.color, padding: "8px 16px" }}>Take Action</button>
              <button onClick={() => { deleteNotification(selectedNotification.id); setSelectedNotification(null) }} style={btnGhost}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
