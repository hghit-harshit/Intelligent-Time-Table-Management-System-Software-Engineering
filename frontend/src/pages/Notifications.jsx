import { useState } from "react"
import Layout from "../components/Layout"

/* ── LIGHT-MODE STYLE HELPERS ──────────────────────────────── */
const card = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px" }
const cardInner = { background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: "6px" }
const heading = { fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#111827" }
const muted = { fontSize: "12px", color: "#6B7280" }
const caption = { fontSize: "11px", color: "#9CA3AF" }

export default function Notifications() {
  const [filterType, setFilterType] = useState("all")
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [notifications, setNotifications] = useState([
    { id: 1, type: "class_change", title: "Class Rescheduled", message: "VLSI Design (Wed 2pm) moved to Fri 2pm · F-102. Auto-updated in calendar.", time: "10 min ago", isRead: false, priority: "high", icon: "⚠️", color: "#D97706", details: "Due to Dr. Patel's emergency meeting, the VLSI Design class scheduled for Wednesday at 2:00 PM has been moved to Friday at the same time. The classroom remains F-102. All registered students have been notified automatically." },
    { id: 2, type: "exam", title: "Exam Hall Published", message: "Digital Circuits exam: Hall A, Row 4, Seat 12. Invigilator: Dr. Nair.", time: "1 hr ago", isRead: false, priority: "high", icon: "✏️", color: "#DC2626", details: "Your seat assignment for the Digital Circuits examination on February 27th has been published. Please report to Exam Hall A at least 30 minutes before the exam starts. Bring your ID card and hall ticket." },
    { id: 3, type: "assignment", title: "Assignment Reminder", message: "DSA Assignment #3 due tomorrow at 11:59 PM. Submit via portal.", time: "2 hrs ago", isRead: true, priority: "medium", icon: "📝", color: "#2563EB", details: "Data Structures Assignment #3 on Binary Trees and Graph Algorithms is due tomorrow. Make sure to include proper documentation and test cases. Late submissions will incur penalty." },
    { id: 4, type: "grade", title: "Grade Posted", message: "Signals & Systems exam results are now available. You scored 85/100.", time: "3 hrs ago", isRead: true, priority: "low", icon: "📊", color: "#16A34A", details: "Congratulations! Your Signals & Systems examination score is 85/100, earning you an A grade. The class average was 78. Detailed score breakdown is available in the student portal." },
    { id: 5, type: "announcement", title: "Lab Schedule Update", message: "Networks Lab sessions will now include WiFi security practicals starting next week.", time: "5 hrs ago", isRead: true, priority: "low", icon: "��", color: "#6B7280", details: "The Networks Laboratory curriculum has been updated to include hands-on WiFi security practicals. Students should bring their laptops with Wireshark pre-installed starting from next Monday." },
    { id: 6, type: "system", title: "System Maintenance", message: "Student portal will be down for maintenance on Saturday 2-4 AM.", time: "1 day ago", isRead: true, priority: "low", icon: "⚙️", color: "#9CA3AF", details: "The student portal and related services will undergo scheduled maintenance on Saturday from 2:00 AM to 4:00 AM. Please complete any urgent tasks before this time." }
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
          <h2 style={{ ...heading, fontSize: "15px", margin: "0 0 2px" }}>Notifications</h2>
          <p style={{ ...caption, margin: 0 }}>{unreadCount} unread · {notifications.length} total messages</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ ...cardInner, padding: "6px 12px", color: "#111827", fontSize: "12px", cursor: "pointer" }}>
            <option value="all">All Types</option>
            <option value="class_change">Class Changes</option>
            <option value="exam">Exams</option>
            <option value="assignment">Assignments</option>
            <option value="grade">Grades</option>
            <option value="announcement">Announcements</option>
            <option value="system">System</option>
          </select>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={{ background: "#006ADC", border: "none", borderRadius: "6px", padding: "6px 14px", color: "#fff", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Mark All Read</button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", margin: "12px", gap: "12px", overflow: "hidden" }}>
        {/* Main Panel */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
            {[
              { icon: "📨", num: notifications.length.toString(), label: "Total Messages", color: "#006ADC" },
              { icon: "🆕", num: unreadCount.toString(), label: "Unread", color: unreadCount > 0 ? "#DC2626" : "#16A34A" },
              { icon: "⚠️", num: notifications.filter(n => n.priority === "high").length.toString(), label: "High Priority", color: "#D97706" },
              { icon: "✅", num: notifications.filter(n => n.isRead).length.toString(), label: "Read", color: "#16A34A" },
            ].map((stat, i) => (
              <div key={i} style={{ ...card, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", marginBottom: "6px" }}>{stat.icon}</div>
                <div style={{ fontSize: "20px", fontWeight: "600", color: stat.color, marginBottom: "2px", fontVariantNumeric: "tabular-nums" }}>{stat.num}</div>
                <div style={muted}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #E5E7EB" }}>
              <h3 style={{ ...heading, fontSize: "13px", margin: 0 }}>{getTypeLabel(filterType)} Notifications</h3>
              <span style={{ marginLeft: "auto", ...muted }}>{filteredNotifications.length} messages</span>
            </div>

            {filteredNotifications.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "#9CA3AF" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification, i) => (
                <div key={notification.id} style={{
                  padding: "10px 16px",
                  borderBottom: i < filteredNotifications.length - 1 ? "1px solid #F3F4F6" : "none",
                  cursor: "pointer",
                  transition: "background 0.1s ease",
                  background: !notification.isRead ? "rgba(0,106,220,0.03)" : "transparent",
                  borderLeft: !notification.isRead ? "3px solid #006ADC" : "3px solid transparent",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                onMouseLeave={(e) => e.currentTarget.style.background = !notification.isRead ? "rgba(0,106,220,0.03)" : "transparent"}
                onClick={() => { setSelectedNotification(notification); markAsRead(notification.id) }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ fontSize: "18px", marginTop: "2px" }}>{notification.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: notification.isRead ? "#6B7280" : "#111827" }}>{notification.title}</div>
                        {!notification.isRead && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#006ADC" }} />}
                        {notification.priority === "high" && (
                          <span style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", fontSize: "9px", fontWeight: "600", padding: "2px 6px", borderRadius: "3px", textTransform: "uppercase" }}>High</span>
                        )}
                      </div>
                      <div style={{ ...muted, marginBottom: "6px", lineHeight: 1.4 }}>{notification.message}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={caption}>{notification.time}</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {!notification.isRead && (
                            <button onClick={(e) => { e.stopPropagation(); markAsRead(notification.id) }} style={{ background: "rgba(0,106,220,0.08)", border: "none", borderRadius: "4px", padding: "2px 8px", color: "#006ADC", fontSize: "10px", cursor: "pointer" }}>Mark Read</button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id) }} style={{ background: "rgba(220,38,38,0.08)", border: "none", borderRadius: "4px", padding: "2px 8px", color: "#DC2626", fontSize: "10px", cursor: "pointer" }}>Delete</button>
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
            <h4 style={{ ...heading, fontSize: "12px", margin: "0 0 8px" }}>Quick Actions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { icon: "✅", label: "Mark All Read", onClick: markAllAsRead, disabled: unreadCount === 0 },
                { icon: "🔔", label: "Notification Settings", onClick: () => alert('Opening notification settings...') },
                { icon: "📱", label: "Push Notifications", onClick: () => alert('Configuring push notifications...') },
                { icon: "📧", label: "Email Preferences", onClick: () => alert('Setting email preferences...') },
              ].map((action, i) => (
                <button key={i} onClick={action.onClick} disabled={action.disabled} style={{
                  ...cardInner,
                  padding: "8px 10px",
                  color: action.disabled ? "#D1D5DB" : "#6B7280",
                  fontSize: "12px",
                  cursor: action.disabled ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textAlign: "left",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => { if (!action.disabled) { e.currentTarget.style.background = "rgba(0,106,220,0.06)"; e.currentTarget.style.color = "#006ADC" } }}
                onMouseLeave={(e) => { if (!action.disabled) { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.color = "#6B7280" } }}>
                  <span style={{ fontSize: "14px" }}>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Summary */}
          <div style={{ ...card, padding: "12px" }}>
            <h4 style={{ ...heading, fontSize: "12px", margin: "0 0 8px" }}>Today's Summary</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { type: "Class Changes", count: notifications.filter(n => n.type === "class_change").length, color: "#D97706" },
                { type: "Exam Updates", count: notifications.filter(n => n.type === "exam").length, color: "#DC2626" },
                { type: "Assignments", count: notifications.filter(n => n.type === "assignment").length, color: "#2563EB" },
                { type: "Grades Posted", count: notifications.filter(n => n.type === "grade").length, color: "#16A34A" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", ...cardInner }}>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>{item.type}</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ ...card, padding: "12px", flex: 1 }}>
            <h4 style={{ ...heading, fontSize: "12px", margin: "0 0 8px" }}>Recent Activity</h4>
            <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 4px" }}>• VLSI class rescheduled (10m ago)</p>
              <p style={{ margin: "0 0 4px" }}>• Exam hall assignment received (1h ago)</p>
              <p style={{ margin: "0 0 4px" }}>• Assignment reminder sent (2h ago)</p>
              <p style={{ margin: "0 0 4px" }}>• Grade posted for S&S exam (3h ago)</p>
              <p style={{ margin: 0 }}>• Lab schedule updated (5h ago)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedNotification(null)}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "24px", maxWidth: "500px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "22px" }}>{selectedNotification.icon}</span>
                <div>
                  <h3 style={{ ...heading, fontSize: "15px", color: selectedNotification.color, margin: "0 0 4px" }}>{selectedNotification.title}</h3>
                  <div style={caption}>{selectedNotification.time}</div>
                </div>
              </div>
              <button onClick={() => setSelectedNotification(null)} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ color: "#6B7280", lineHeight: 1.6, fontSize: "13px", marginBottom: "16px" }}>{selectedNotification.details}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ background: selectedNotification.color, border: "none", borderRadius: "6px", padding: "8px 16px", color: "#fff", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Take Action</button>
              <button onClick={() => { deleteNotification(selectedNotification.id); setSelectedNotification(null) }} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "8px 16px", color: "#111827", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
