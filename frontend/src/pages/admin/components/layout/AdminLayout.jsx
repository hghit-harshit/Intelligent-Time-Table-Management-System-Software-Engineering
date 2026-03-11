import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { colors, fonts, radius, shadows, transitions } from "../../../../styles/tokens";
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
      background: colors.bg.deep,
      fontFamily: fonts.body,
      color: colors.text.primary,
      display: "flex",
      overflow: "hidden",
    }}>
      {/* Global Styles */}
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .admin-card-hover:hover { border-color: ${colors.border.strong} !important; box-shadow: ${shadows.md} !important; }
        .admin-btn:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(0.95); }
        *::-webkit-scrollbar { width:4px; }
        *::-webkit-scrollbar-track { background:transparent; }
        *::-webkit-scrollbar-thumb { background:${colors.border.medium}; border-radius:4px; }
        *::-webkit-scrollbar-thumb:hover { background:${colors.border.strong}; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: collapsed ? "72px" : "260px",
        minWidth: collapsed ? "72px" : "260px",
        background: colors.bg.base,
        borderRight: `1px solid ${colors.border.medium}`,
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        zIndex: 20,
        padding: "16px 12px",
        boxShadow: shadows.sm,
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
                fontFamily: fonts.heading,
                fontSize: fonts.size.xl,
                fontWeight: fonts.weight.bold,
                margin: "0 0 2px",
                color: colors.primary.main,
              }}>
                Smart Timetable
              </h1>
              <p style={{
                color: colors.text.muted,
                fontSize: fonts.size.xs,
                letterSpacing: fonts.letterSpacing.wider,
                textTransform: "uppercase",
                margin: 0,
              }}>
                DISHA — Admin Console
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: colors.bg.raised,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.md,
              color: colors.text.muted,
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: transitions.smooth,
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Admin User Card */}
        {!collapsed && (
          <div style={{
            background: colors.primary.ghost,
            border: `1px solid ${colors.primary.border}`,
            borderRadius: radius.xl,
            padding: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{
              width: "36px", height: "36px",
              background: colors.primary.main,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: fonts.weight.bold, color: "#fff", fontSize: fonts.size.sm,
              flexShrink: 0,
            }}>
              AD
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontWeight: fonts.weight.semibold, fontSize: fonts.size.base, color: colors.text.primary }}>Admin User</div>
              <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>System Administrator</div>
            </div>
            <div style={{
              background: colors.primary.main,
              color: "#fff",
              fontSize: fonts.size.xs,
              fontWeight: fonts.weight.bold,
              padding: "3px 6px",
              borderRadius: radius.sm,
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
                  fontSize: fonts.size.xs,
                  color: colors.text.muted,
                  letterSpacing: fonts.letterSpacing.wider,
                  textTransform: "uppercase",
                  marginBottom: "6px",
                  padding: "0 8px",
                  fontWeight: fonts.weight.medium,
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
                      borderRadius: radius.md,
                      cursor: "pointer",
                      marginBottom: "2px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      background: active ? colors.primary.ghost : "transparent",
                      color: active ? colors.primary.main : colors.text.secondary,
                      border: active ? `1px solid ${colors.primary.border}` : "1px solid transparent",
                      transition: transitions.smooth,
                      fontWeight: active ? fonts.weight.semibold : fonts.weight.regular,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = colors.bg.raised;
                        e.currentTarget.style.color = colors.text.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = colors.text.secondary;
                      }
                    }}
                  >
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, fontSize: fonts.size.sm }}>{item.label}</span>
                        {item.badge && (
                          <span style={{
                            background: colors.error.main,
                            color: "#fff",
                            fontSize: fonts.size.xs,
                            fontWeight: fonts.weight.bold,
                            padding: "1px 5px",
                            borderRadius: radius.full,
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
          borderTop: `1px solid ${colors.border.subtle}`,
          paddingTop: "12px",
        }}>
          <div
            onClick={() => navigate("/")}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: collapsed ? "9px" : "8px 10px", borderRadius: radius.md,
              cursor: "pointer", color: colors.error.main,
              justifyContent: collapsed ? "center" : "flex-start",
              transition: transitions.smooth,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.error.ghost; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={16} />
            {!collapsed && <span style={{ fontSize: fonts.size.sm }}>Logout</span>}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10, overflow: "hidden" }}>
        {/* Header Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderBottom: `1px solid ${colors.border.subtle}`,
          background: colors.bg.base,
          flexShrink: 0,
        }}>
          {/* Global Search */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: searchFocused ? colors.bg.base : colors.bg.raised,
            border: searchFocused ? `1px solid ${colors.primary.border}` : `1px solid ${colors.border.medium}`,
            borderRadius: radius.md,
            padding: "7px 14px",
            width: "340px",
            transition: transitions.smooth,
            boxShadow: searchFocused ? `0 0 0 3px ${colors.primary.ghost}` : "none",
          }}>
            <Search size={14} style={{ color: colors.text.muted, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search courses, faculty, rooms..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: colors.text.primary,
                fontSize: fonts.size.sm,
                fontFamily: fonts.body,
                width: "100%",
              }}
            />
            <span style={{
              fontSize: fonts.size.xs,
              color: colors.text.muted,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.sm,
              padding: "1px 5px",
              whiteSpace: "nowrap",
            }}>Ctrl+K</span>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Notifications */}
            <div style={{
              position: "relative",
              background: colors.bg.raised,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.md,
              padding: "7px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Bell size={16} style={{ color: colors.text.secondary }} />
              <span style={{
                position: "absolute", top: "-3px", right: "-3px",
                width: "16px", height: "16px", borderRadius: "50%",
                background: colors.error.main, color: "#fff",
                fontSize: fonts.size.xs, fontWeight: fonts.weight.bold,
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
              borderRadius: radius.md,
              border: `1px solid ${colors.border.medium}`,
              background: colors.bg.raised,
            }}>
              <div style={{
                width: "28px", height: "28px",
                background: colors.primary.main,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: fonts.weight.bold, color: "#fff", fontSize: fonts.size.xs,
              }}>
                AD
              </div>
              <span style={{ fontSize: fonts.size.sm, color: colors.text.secondary }}>Admin</span>
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
