import { useState } from "react"
import Layout from "../components/Layout"

export default function Notifications() {
  const [filterType, setFilterType] = useState("all")
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "class_change",
      title: "Class Rescheduled",
      message: "VLSI Design (Wed 2pm) moved to Fri 2pm · F-102. Auto-updated in calendar.",
      time: "10 min ago",
      isRead: false,
      priority: "high",
      icon: "⚠️",
      color: "#f59e0b",
      details: "Due to Dr. Patel's emergency meeting, the VLSI Design class scheduled for Wednesday at 2:00 PM has been moved to Friday at the same time. The classroom remains F-102. All registered students have been notified automatically."
    },
    {
      id: 2,
      type: "exam",
      title: "Exam Hall Published",
      message: "Digital Circuits exam: Hall A, Row 4, Seat 12. Invigilator: Dr. Nair.",
      time: "1 hr ago",
      isRead: false,
      priority: "high",
      icon: "✏️",
      color: "#ef4444",
      details: "Your seat assignment for the Digital Circuits examination on February 27th has been published. Please report to Exam Hall A at least 30 minutes before the exam starts. Bring your ID card and hall ticket."
    },
    {
      id: 3,
      type: "assignment",
      title: "Assignment Reminder",
      message: "DSA Assignment #3 due tomorrow at 11:59 PM. Submit via portal.",
      time: "2 hrs ago",
      isRead: true,
      priority: "medium",
      icon: "📝",
      color: "#3b82f6",
      details: "Data Structures Assignment #3 on Binary Trees and Graph Algorithms is due tomorrow. Make sure to include proper documentation and test cases. Late submissions will incur penalty."
    },
    {
      id: 4,
      type: "grade",
      title: "Grade Posted",
      message: "Signals & Systems exam results are now available. You scored 85/100.",
      time: "3 hrs ago",
      isRead: true,
      priority: "low",
      icon: "📊",
      color: "#22c55e",
      details: "Congratulations! Your Signals & Systems examination score is 85/100, earning you an A grade. The class average was 78. Detailed score breakdown is available in the student portal."
    },
    {
      id: 5,
      type: "announcement",
      title: "Lab Schedule Update",
      message: "Networks Lab sessions will now include WiFi security practicals starting next week.",
      time: "5 hrs ago",
      isRead: true,
      priority: "low",
      icon: "🔬",
      color: "#a78bfa",
      details: "The Networks Laboratory curriculum has been updated to include hands-on WiFi security practicals. Students should bring their laptops with Wireshark pre-installed starting from next Monday."
    },
    {
      id: 6,
      type: "system",
      title: "System Maintenance",
      message: "Student portal will be down for maintenance on Saturday 2-4 AM.",
      time: "1 day ago",
      isRead: true,
      priority: "low",
      icon: "⚙️",
      color: "#64748b",
      details: "The student portal and related services will undergo scheduled maintenance on Saturday from 2:00 AM to 4:00 AM. Please complete any urgent tasks before this time."
    }
  ])

  const unreadCount = notifications.filter(n => !n.isRead).length
  
  const filteredNotifications = filterType === "all" 
    ? notifications 
    : notifications.filter(notification => notification.type === filterType)

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const getTypeLabel = (type) => {
    const types = {
      all: "All",
      class_change: "Class Changes", 
      exam: "Exams",
      assignment: "Assignments",
      grade: "Grades",
      announcement: "Announcements",
      system: "System"
    }
    return types[type] || type
  }

  return (
    <Layout>
      {/* Top Bar */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        margin: "16px 16px 0",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#fff",
            margin: "0 0 4px",
            fontFamily: "'Playfair Display', serif",
          }}>
            Notifications
          </h2>
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}>
            {unreadCount} unread • {notifications.length} total messages
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "6px 12px",
              color: "#fff",
              fontSize: "12px",
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
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              style={{
                background: "#60efff", 
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "#0a0a12",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        display: "flex",
        margin: "16px",
        gap: "16px",
        overflow: "hidden",
      }}>
        {/* Main Panel */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "8px",
        }}>
          {/* Stats Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "20px",
          }}>
            {[
              { 
                icon: "📨", 
                num: notifications.length.toString(), 
                label: "Total Messages", 
                color: "#60efff" 
              },
              { 
                icon: "🆕", 
                num: unreadCount.toString(), 
                label: "Unread", 
                color: unreadCount > 0 ? "#ef4444" : "#22c55e" 
              },
              { 
                icon: "⚠️", 
                num: notifications.filter(n => n.priority === "high").length.toString(), 
                label: "High Priority", 
                color: "#f59e0b" 
              },
              { 
                icon: "✅", 
                num: notifications.filter(n => n.isRead).length.toString(), 
                label: "Read", 
                color: "#22c55e" 
              },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
                transition: "all 0.25s ease",
              }} 
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)"
                e.target.style.borderColor = "rgba(96,239,255,0.2)"
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0px)"
                e.target.style.borderColor = "rgba(255,255,255,0.08)"
              }}>
                <div style={{
                  fontSize: "24px",
                  marginBottom: "12px",
                  filter: `drop-shadow(0 0 8px ${stat.color}30)`,
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: stat.color,
                  marginBottom: "4px",
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {stat.num}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.6)",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <h3 style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#fff",
                margin: 0,
                fontFamily: "'Playfair Display', serif",
              }}>
                {getTypeLabel(filterType)} Notifications
              </h3>
              <span style={{
                marginLeft: "auto",
                fontSize: "12px",
                color: "rgba(255,255,255,0.6)",
              }}>
                {filteredNotifications.length} messages
              </span>
            </div>

            {filteredNotifications.length === 0 ? (
              <div style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "rgba(255,255,255,0.4)",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification, i) => (
                <div key={notification.id} style={{
                  padding: "16px 20px",
                  borderBottom: i < filteredNotifications.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  background: !notification.isRead ? "rgba(96,239,255,0.03)" : "transparent",
                  borderLeft: !notification.isRead ? "3px solid #60efff" : "3px solid transparent",
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={(e) => e.target.style.background = !notification.isRead ? "rgba(96,239,255,0.03)" : "transparent"}
                onClick={() => {
                  setSelectedNotification(notification)
                  markAsRead(notification.id)
                }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{
                      fontSize: "20px",
                      marginTop: "2px",
                      filter: `drop-shadow(0 0 8px ${notification.color}30)`,
                    }}>
                      {notification.icon}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: notification.isRead ? "rgba(255,255,255,0.8)" : "#fff",
                        }}>
                          {notification.title}
                        </div>
                        {!notification.isRead && (
                          <div style={{
                            width: "6px", height: "6px",
                            borderRadius: "50%",
                            background: "#60efff",
                          }} />
                        )}
                        {notification.priority === "high" && (
                          <span style={{
                            background: "rgba(239,68,68,0.15)",
                            color: "#ef4444",
                            fontSize: "9px",
                            fontWeight: "700",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}>
                            High
                          </span>
                        )}
                      </div>
                      
                      <div style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: "6px",
                        lineHeight: 1.4,
                      }}>
                        {notification.message}
                      </div>
                      
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}>
                        <span style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.4)",
                        }}>
                          {notification.time}
                        </span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {!notification.isRead && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              style={{
                                background: "rgba(96,239,255,0.1)",
                                border: "1px solid rgba(96,239,255,0.3)",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                color: "#60efff",
                                fontSize: "10px",
                                cursor: "pointer",
                              }}
                            >
                              Mark Read
                            </button>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              borderRadius: "4px",
                              padding: "2px 8px",
                              color: "#ef4444",
                              fontSize: "10px",
                              cursor: "pointer",
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

        {/* Right Panel - Notification Settings */}
        <div style={{
          width: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          {/* Quick Actions */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "16px",
          }}>
            <h4 style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "12px",
              margin: "0 0 12px",
            }}>
              Quick Actions
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { 
                  icon: "✅", 
                  label: "Mark All Read", 
                  onClick: markAllAsRead,
                  disabled: unreadCount === 0 
                },
                { 
                  icon: "🔔", 
                  label: "Notification Settings", 
                  onClick: () => alert('Opening notification settings...')
                },
                { 
                  icon: "📱", 
                  label: "Push Notifications", 
                  onClick: () => alert('Configuring push notifications...')
                },
                { 
                  icon: "📧", 
                  label: "Email Preferences", 
                  onClick: () => alert('Setting email preferences...')
                },
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={action.onClick}
                  disabled={action.disabled}
                  style={{
                    background: action.disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "12px",
                    color: action.disabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)",
                    fontSize: "12px",
                    cursor: action.disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                  }} 
                  onMouseEnter={(e) => {
                    if (!action.disabled) {
                      e.target.style.background = "rgba(96,239,255,0.1)";
                      e.target.style.borderColor = "rgba(96,239,255,0.2)";
                    }
                  }} 
                  onMouseLeave={(e) => {
                    if (!action.disabled) {
                      e.target.style.background = "rgba(255,255,255,0.05)";
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    }
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notification Summary */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "16px",
          }}>
            <h4 style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "12px",
              margin: "0 0 12px",
            }}>
              Today's Summary
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { type: "Class Changes", count: notifications.filter(n => n.type === "class_change").length, color: "#f59e0b" },
                { type: "Exam Updates", count: notifications.filter(n => n.type === "exam").length, color: "#ef4444" }, 
                { type: "Assignments", count: notifications.filter(n => n.type === "assignment").length, color: "#3b82f6" },
                { type: "Grades Posted", count: notifications.filter(n => n.type === "grade").length, color: "#22c55e" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <span style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.8)",
                  }}>
                    {item.type}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: item.color,
                  }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "16px",
            flex: 1,
          }}>
            <h4 style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#fff",
              marginBottom: "12px",
              margin: "0 0 12px",
            }}>
              Recent Activity
            </h4>
            <div style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.5,
            }}>
              <p>• VLSI class rescheduled (10m ago)</p>
              <p>• Exam hall assignment received (1h ago)</p>
              <p>• Assignment reminder sent (2h ago)</p>
              <p>• Grade posted for S&S exam (3h ago)</p>
              <p>• Lab schedule updated (5h ago)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setSelectedNotification(null)}>
          <div style={{
            background: "rgba(15,23,42,0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "500px",
            width: "90%",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ 
                  fontSize: "24px",
                  filter: `drop-shadow(0 0 8px ${selectedNotification.color}30)`,
                }}>
                  {selectedNotification.icon}
                </span>
                <div>
                  <h3 style={{ 
                    color: selectedNotification.color, 
                    fontSize: "16px", 
                    fontWeight: "700", 
                    margin: "0 0 4px",
                  }}>
                    {selectedNotification.title}
                  </h3>
                  <div style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                  }}>
                    {selectedNotification.time}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotification(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              color: "rgba(255,255,255,0.8)", 
              lineHeight: 1.6,
              marginBottom: "16px",
            }}>
              {selectedNotification.details}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{
                background: selectedNotification.color,
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}>
                Take Action
              </button>
              <button 
                onClick={() => deleteNotification(selectedNotification.id)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}