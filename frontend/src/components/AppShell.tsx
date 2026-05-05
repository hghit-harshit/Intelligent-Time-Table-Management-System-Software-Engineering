/**
 * AppShell — Unified sidebar + header layout used by all roles (Admin, Student, Faculty).
 *
 * WHY: AdminLayout, StudentLayout, and FacultyLayout were ~95% identical (~280 lines each).
 * This component extracts the shared structure and accepts props for the parts that differ.
 *
 * Props:
 *   navSections        — Array of { label, items: [{ icon, label, path, badge? }] }
 *   portalSubtitle     — e.g. "DISHA — Admin Console"
 *   user               — { initials, name, subtitle, avatarColor? }
 *   roleBadge          — { text, bg, color, borderColor? }
 *   searchPlaceholder  — placeholder text for the header search bar (null to hide)
 *   notificationCount  — number shown on bell icon
 *   notificationPath   — optional route when clicking bell icon
 *   settingsPath       — optional route for Settings in bottom nav (omit to hide)
 *   extraHeadStyles    — optional extra <style> CSS string (e.g. admin hover/btn rules)
 *   isGoogleConnected  — (student only) shows sync dot on profile card
 *   onConnectGoogle    — (student only) callback to trigger OAuth flow
 *   onDisconnectGoogle — (student only) callback to disconnect
 *   userEmail          — (student only) shown in popover
 *   children           — page content rendered in the main area
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { colors, fonts, radius, shadows, transitions } from "../styles/tokens";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  Mail,
  Link2,
  Link2Off,
  CheckCircle2,
} from "lucide-react";

// Inline Google "G" SVG icon
function GoogleGIcon({ size = 14, grayscale = false }: { size?: number; grayscale?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ flexShrink: 0, filter: grayscale ? "grayscale(1) opacity(0.5)" : "none" }}
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill={grayscale ? "#888" : "#4285F4"}
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill={grayscale ? "#888" : "#34A853"}
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill={grayscale ? "#888" : "#FBBC05"}
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill={grayscale ? "#888" : "#EA4335"}
      />
    </svg>
  );
}

export default function AppShell({
  navSections,
  portalSubtitle,
  user,
  roleBadge,
  searchPlaceholder = null,
  notificationCount = 0,
  notificationPath = null,
  settingsPath,
  onLogout,
  extraHeadStyles = "",
  children,
  // Google auth props (student only) — optional so Admin/Faculty layouts are unaffected
  isGoogleConnected = false,
  onConnectGoogle = null,
  onDisconnectGoogle = null,
  userEmail = "",
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Is this a student role (determines if we show Google connect)
  const isStudent = roleBadge?.text === "Student";

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profilePopoverOpen &&
        profileCardRef.current &&
        !profileCardRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setProfilePopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profilePopoverOpen]);

  const isActive = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    const rootPath = `/${segments[0]}`;
    if (path === rootPath) return location.pathname === rootPath;
    return location.pathname.startsWith(path);
  };

  const avatarColor = user.avatarColor || colors.primary.main;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg.deep,
        fontFamily: fonts.body,
        color: colors.text.primary,
        display: "flex",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes popoverIn { from { opacity:0; transform:translateY(-8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .admin-card-hover:hover { border-color: ${colors.border.strong} !important; box-shadow: ${shadows.md} !important; }
        .admin-btn:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(0.95); }
        *::-webkit-scrollbar { width:4px; }
        *::-webkit-scrollbar-track { background:transparent; }
        *::-webkit-scrollbar-thumb { background:${colors.border.medium}; border-radius:4px; }
        *::-webkit-scrollbar-thumb:hover { background:${colors.border.strong}; }
        .nav-item-hover:hover { background: ${colors.bg.raised} !important; color: ${colors.text.primary} !important; }
        .profile-card-hover:hover { background: ${colors.primary.ghost} !important; border-color: ${colors.primary.border} !important; cursor: pointer; }
        ${extraHeadStyles}
      `}</style>

      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <div
        style={{
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
        }}
      >
        {/* Logo + collapse toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            marginBottom: "20px",
            padding: "0 4px",
          }}
        >
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: "18px",
                    fontWeight: fonts.weight.bold,
                    letterSpacing: fonts.letterSpacing.wider,
                    color: colors.primary.main,
                  }}
                >
                  Disha
                </span>
                <span
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: "18px",
                    fontWeight: fonts.weight.semibold,
                    letterSpacing: fonts.letterSpacing.wide,
                    color: colors.primary.dark,
                  }}
                >
                  TimeTable
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  color: colors.text.muted,
                  letterSpacing: fonts.letterSpacing.widest,
                  textTransform: "uppercase",
                }}
              >
                Academic Scheduler
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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

        {/* ── Profile Identity Card ─────────────────────────── */}
        {!collapsed && (
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <div
              ref={profileCardRef}
              className="profile-card-hover"
              onClick={() => setProfilePopoverOpen((v) => !v)}
              style={{
                background: colors.primary.ghost,
                border: `1px solid ${colors.primary.border}`,
                borderRadius: radius.xl,
                padding: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: transitions.smooth,
                userSelect: "none",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  background: avatarColor,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: fonts.weight.bold,
                  color: "#fff",
                  fontSize: fonts.size.sm,
                  flexShrink: 0,
                }}
              >
                {user.initials}
              </div>

              {/* Role, Name, Email */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      background: roleBadge.bg,
                      color: roleBadge.color,
                      fontSize: "10px",
                      fontWeight: fonts.weight.bold,
                      padding: "2px 6px",
                      borderRadius: radius.sm,
                      letterSpacing: "0.04em",
                      ...(roleBadge.borderColor ? { border: `1px solid ${roleBadge.borderColor}` } : {}),
                    }}
                  >
                    {roleBadge.text}
                  </span>

                  {/* Google G icon with sync dot — student only */}
                  {isStudent && (
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <GoogleGIcon size={14} grayscale={!isGoogleConnected} />
                      {isGoogleConnected && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "-2px",
                            right: "-2px",
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#10B981",
                            border: "1px solid white",
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    fontWeight: fonts.weight.bold,
                    fontSize: "16px",
                    color: colors.text.primary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </span>
                {user.subtitle && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: colors.text.muted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* ── Profile Popover ───────────────────────────── */}
            {profilePopoverOpen && isStudent && (
              <div
                ref={popoverRef}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: colors.bg.base,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: radius.xl,
                  boxShadow: shadows.lg,
                  padding: "14px",
                  zIndex: 100,
                  animation: "popoverIn 0.18s cubic-bezier(0.4,0,0.2,1) both",
                }}
              >
                {/* Email row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    background: colors.bg.raised,
                    borderRadius: radius.md,
                    marginBottom: "10px",
                  }}
                >
                  <Mail size={13} style={{ color: colors.text.muted, flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: fonts.size.sm,
                      color: colors.text.secondary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {userEmail || user.subtitle}
                  </span>
                </div>

                {/* Divider label */}
                <p
                  style={{
                    fontSize: fonts.size.xs,
                    color: colors.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: fonts.letterSpacing.wider,
                    margin: "0 0 8px",
                    padding: "0 2px",
                  }}
                >
                  Google Account
                </p>

                {/* Connect / Disconnect toggle */}
                {isGoogleConnected ? (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 10px",
                        background: "rgba(16, 185, 129, 0.06)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        borderRadius: radius.md,
                        marginBottom: "8px",
                      }}
                    >
                      <CheckCircle2 size={14} style={{ color: "#10B981", flexShrink: 0 }} />
                      <span style={{ fontSize: fonts.size.sm, color: "#10B981", fontWeight: fonts.weight.medium }}>
                        Connected
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onDisconnectGoogle?.();
                        setProfilePopoverOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "8px 10px",
                        background: colors.error.ghost,
                        border: `1px solid ${colors.error.border}`,
                        borderRadius: radius.md,
                        color: colors.error.main,
                        fontSize: fonts.size.sm,
                        fontWeight: fonts.weight.medium,
                        cursor: "pointer",
                        fontFamily: fonts.body,
                        transition: transitions.smooth,
                      }}
                    >
                      <Link2Off size={13} />
                      Disconnect Google Account
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onConnectGoogle?.();
                      setProfilePopoverOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "9px 10px",
                      background: colors.primary.ghost,
                      border: `1px solid ${colors.primary.border}`,
                      borderRadius: radius.md,
                      color: colors.primary.main,
                      fontSize: fonts.size.sm,
                      fontWeight: fonts.weight.semibold,
                      cursor: "pointer",
                      fontFamily: fonts.body,
                      transition: transitions.smooth,
                    }}
                  >
                    <GoogleGIcon size={14} />
                    <Link2 size={13} />
                    Connect Google Account
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation sections */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {navSections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: section.label ? "16px" : "8px" }}>
              {/* Only render header if label is non-empty */}
              {!collapsed && section.label && (
                <p
                  style={{
                    fontSize: fonts.size.xs,
                    color: colors.text.muted,
                    letterSpacing: fonts.letterSpacing.wider,
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    padding: "0 8px",
                    fontWeight: fonts.weight.medium,
                  }}
                >
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <div
                    key={item.path}
                    className={active ? "" : "nav-item-hover"}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: collapsed ? "9px" : "9px 10px",
                      borderRadius: radius.md,
                      cursor: "pointer",
                      marginBottom: "3px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      background: active ? colors.primary.ghost : "transparent",
                      color: active ? colors.primary.main : colors.text.secondary,
                      border: active
                        ? `1px solid ${colors.primary.border}`
                        : "1px solid transparent",
                      transition: transitions.smooth,
                      fontWeight: active ? fonts.weight.semibold : fonts.weight.regular,
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, fontSize: fonts.size.sm }}>{item.label}</span>
                        {item.badge && (
                          <span
                            style={{
                              background: colors.error.main,
                              color: "#fff",
                              fontSize: fonts.size.xs,
                              fontWeight: fonts.weight.bold,
                              padding: "1px 5px",
                              borderRadius: radius.full,
                              lineHeight: "14px",
                            }}
                          >
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

        {/* Bottom actions */}
        <div
          style={{
            borderTop: `1px solid ${colors.border.subtle}`,
            paddingTop: "12px",
          }}
        >
          {settingsPath && (
            <div
              onClick={() => navigate(settingsPath)}
              title={collapsed ? "Settings" : undefined}
              className="nav-item-hover"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "9px" : "8px 10px",
                borderRadius: radius.md,
                cursor: "pointer",
                color: colors.text.secondary,
                justifyContent: collapsed ? "center" : "flex-start",
                transition: transitions.smooth,
                marginBottom: "2px",
              }}
            >
              <Settings size={16} strokeWidth={1.8} />
              {!collapsed && <span style={{ fontSize: fonts.size.sm }}>Settings</span>}
            </div>
          )}
          <div
            onClick={onLogout || (() => navigate("/"))}
            title={collapsed ? "Logout" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: collapsed ? "9px" : "8px 10px",
              borderRadius: radius.md,
              cursor: "pointer",
              color: colors.error.main,
              justifyContent: collapsed ? "center" : "flex-start",
              transition: transitions.smooth,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = colors.error.ghost;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
            }}
          >
            <LogOut size={16} />
            {!collapsed && <span style={{ fontSize: fonts.size.sm }}>Log Out</span>}
          </div>
        </div>
      </div>

      {/* ─── Main Content Area ───────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        {/* Header Bar — only if notificationPath or searchPlaceholder */}
        {(searchPlaceholder || notificationPath || notificationCount > 0) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "10px 24px",
              borderBottom: `1px solid ${colors.border.subtle}`,
              background: colors.bg.base,
              flexShrink: 0,
              gap: "12px",
            }}
          >
            {/* Notification bell */}
            <button
              type="button"
              aria-label="Open notifications"
              onClick={notificationPath ? () => navigate(notificationPath) : undefined}
              style={{
                position: "relative",
                background: colors.bg.raised,
                borderRadius: radius.md,
                padding: "7px",
                cursor: notificationPath ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${colors.border.medium}`,
              }}
            >
              <Bell size={16} style={{ color: colors.text.secondary }} />
              {notificationCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-3px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: colors.error.main,
                    color: "#fff",
                    fontSize: fonts.size.xs,
                    fontWeight: fonts.weight.bold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Page Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            animation: "fadeUp 0.35s ease",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
