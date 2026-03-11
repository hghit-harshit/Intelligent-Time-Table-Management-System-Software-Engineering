import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  RotateCcw,
  CalendarClock,
  BookOpen,
  Users,
  DoorOpen,
  Clock,
  Layers,
  BarChart3,
  Plug,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  ChevronsLeftRight,
} from "lucide-react";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/AdminPage" },
      { icon: Cpu, label: "Timetable Engine", path: "/AdminPage/engine" },
      { icon: AlertTriangle, label: "Conflict Monitor", path: "/AdminPage/conflicts" },
      { icon: RotateCcw, label: "Reschedule Requests", path: "/AdminPage/requests", badge: 5 },
      { icon: CalendarClock, label: "Exam Scheduler", path: "/AdminPage/exams" },
    ],
  },
  {
    label: "ACADEMIC STRUCTURE",
    items: [
      { icon: BookOpen, label: "Courses", path: "/AdminPage/courses" },
      { icon: Users, label: "Faculty", path: "/AdminPage/faculty" },
      { icon: DoorOpen, label: "Rooms", path: "/AdminPage/rooms" },
      { icon: Clock, label: "Time Slots", path: "/AdminPage/timeslots" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { icon: ChevronsLeftRight, label: "Bulk Rescheduling", path: "/AdminPage/bulk" },
      { icon: Layers, label: "Timetable Versions", path: "/AdminPage/versions" },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { icon: BarChart3, label: "Analytics", path: "/AdminPage/analytics" },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { icon: Plug, label: "Integrations", path: "/AdminPage/integrations" },
      { icon: Settings, label: "System Settings", path: "/AdminPage/settings" },
    ],
  },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/AdminPage") return location.pathname === "/AdminPage";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a12",
      fontFamily: "'Space Mono', monospace",
      color: "#fff",
      display: "flex",
      overflow: "hidden",
    }}>
      {/* ── Global Styles ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Space+Mono:wght@400;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(251,146,60,0.3);} 50%{box-shadow:0 0 0 8px rgba(251,146,60,0);} }
        .admin-card-hover:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(96,239,255,0.15) !important; }
        .admin-btn:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.1); }
        *::-webkit-scrollbar { width:4px; }
        *::-webkit-scrollbar-track { background:transparent; }
        *::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
        *::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.15); }
      `}</style>

      {/* ── Background Effects ────────────────────────────── */}
      <div style={{
        position: "fixed", width: "400px", height: "400px", borderRadius: "50%",
        top: "-100px", left: "-100px",
        background: "radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", width: "350px", height: "350px", borderRadius: "50%",
        bottom: "-80px", right: "-60px",
        background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)`,
        backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Sidebar ───────────────────────────────────────── */}
      <div style={{
        width: collapsed ? "72px" : "260px",
        minWidth: collapsed ? "72px" : "260px",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        zIndex: 20,
        padding: "16px 12px",
      }}>
        {/* Logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          marginBottom: "20px",
          padding: "0 4px",
        }}>
          {!collapsed && (
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px", fontWeight: "700", margin: "0 0 2px",
                background: "linear-gradient(90deg, #fb923c, #a78bfa)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite",
              }}>
                SmartTimetable
              </h1>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                ITMS • Admin Console
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Admin User Card */}
        {!collapsed && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{
              width: "36px", height: "36px",
              background: "linear-gradient(135deg, #fb923c, #a78bfa)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "700", color: "#0a0a12", fontSize: "12px",
              animation: "pulse-glow 3s infinite",
              flexShrink: 0,
            }}>
              AD
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontWeight: "600", fontSize: "13px", color: "#fff" }}>Admin User</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>System Administrator</div>
            </div>
            <div style={{
              background: "#fb923c",
              color: "#0a0a12",
              fontSize: "9px",
              fontWeight: "700",
              padding: "3px 6px",
              borderRadius: "4px",
            }}>
              ADMIN
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {navSections.map((section) => (
            <div key={section.label} style={{ marginBottom: "16px" }}>
              {!collapsed && (
                <p style={{
                  fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em",
                  textTransform: "uppercase", marginBottom: "6px", padding: "0 8px",
                }}>
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: collapsed ? "9px" : "8px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginBottom: "2px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      background: active ? "rgba(251,146,60,0.12)" : "transparent",
                      color: active ? "#fb923c" : "rgba(255,255,255,0.5)",
                      border: active ? "1px solid rgba(251,146,60,0.2)" : "1px solid transparent",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      }
                    }}
                  >
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, fontSize: "12px", fontWeight: active ? "600" : "400" }}>{item.label}</span>
                        {item.badge && (
                          <span style={{
                            background: "#ef4444",
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: "700",
                            padding: "1px 5px",
                            borderRadius: "8px",
                            lineHeight: "14px",
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "12px",
        }}>
          <div
            onClick={() => navigate("/")}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: collapsed ? "9px" : "8px 10px", borderRadius: "8px",
              cursor: "pointer", color: "rgba(239,68,68,0.7)",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={16} />
            {!collapsed && <span style={{ fontSize: "12px" }}>Logout</span>}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ─────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10, overflow: "hidden" }}>
        {/* Header Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
        }}>
          {/* Global Search */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: searchFocused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
            border: searchFocused ? "1px solid rgba(96,239,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "7px 14px",
            width: "340px",
            transition: "all 0.2s ease",
          }}>
            <Search size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search courses, faculty, rooms..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "12px",
                fontFamily: "'Space Mono', monospace",
                width: "100%",
              }}
            />
            <span style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
              padding: "1px 5px",
              whiteSpace: "nowrap",
            }}>⌘K</span>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Notifications */}
            <div style={{
              position: "relative",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "7px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Bell size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
              <span style={{
                position: "absolute", top: "-3px", right: "-3px",
                width: "16px", height: "16px", borderRadius: "50%",
                background: "#ef4444", color: "#fff",
                fontSize: "9px", fontWeight: "700",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>3</span>
            </div>

            {/* Profile */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              padding: "4px 10px 4px 4px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.03)",
            }}>
              <div style={{
                width: "28px", height: "28px",
                background: "linear-gradient(135deg, #fb923c, #a78bfa)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "700", color: "#0a0a12", fontSize: "10px",
              }}>
                AD
              </div>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Admin</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          animation: "fadeUp 0.35s ease",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
