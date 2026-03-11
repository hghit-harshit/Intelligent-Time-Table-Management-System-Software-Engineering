/**
 * Layout.jsx — Shared Sidebar + Main Content Shell
 *
 * PURPOSE: Wraps every authenticated page (Student, Faculty, Admin).
 * Provides the sidebar navigation with MUI icons, user card, and scrollable content.
 *
 * AESTHETIC: Notion/Linear — clean sidebar with 1px right border,
 * subtle shadows, DM Sans typeface. MUI icons for every nav item.
 *
 * BRAND: Smart Timetable (DISHA)
 */

import { useNavigate, useLocation } from "react-router-dom"
import { Box, Typography, Chip } from "@mui/material"
import {
  DashboardOutlined,
  EventNoteOutlined,
  NotificationsOutlined,
  SchoolOutlined,
  StickyNote2Outlined,
  ChecklistOutlined,
  AlarmOutlined,
  SmartToyOutlined,
  ExtensionOutlined,
  SettingsOutlined,
  LogoutOutlined,
} from "@mui/icons-material"
import { colors, fonts, radius, shadows, animations } from "../styles/tokens"

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    {
      section: "MAIN",
      items: [
        { label: "My Timetable", path: "/StudentPage", badge: null, icon: DashboardOutlined },
        { label: "Exam Schedule", path: "/exams", badge: "3", icon: EventNoteOutlined },
        { label: "Notifications", path: "/notifications", badge: "3", icon: NotificationsOutlined },
        { label: "Courses", path: "/courses", badge: null, icon: SchoolOutlined },
        { label: "Google Classroom", path: "/google-classroom", badge: null, icon: SchoolOutlined },
      ],
    },
    {
      section: "WORKSPACE",
      items: [
        { label: "My Notes", path: "/notes", badge: null, icon: StickyNote2Outlined },
        { label: "Tasks", path: "/tasks", badge: null, icon: ChecklistOutlined },
        { label: "Reminders", path: "/reminders", badge: null, icon: AlarmOutlined },
      ],
    },
    {
      section: "TOOLS",
      items: [
        { label: "AI Assistant", path: "/ai", badge: null, icon: SmartToyOutlined },
        { label: "Integrations", path: "/integrations", badge: null, icon: ExtensionOutlined },
      ],
    },
  ]

  const handleNavClick = (path) => navigate(path)
  const handleLogout = () => navigate("/")

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: colors.bg.deep,
        fontFamily: fonts.body,
        color: colors.text.primary,
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <Box
        sx={{
          width: 240,
          p: "16px 12px",
          display: "flex",
          flexDirection: "column",
          bgcolor: colors.bg.raised,
          borderRight: `1px solid ${colors.border.medium}`,
          animation: animations.fadeUp,
        }}
      >
        {/* Brand — Smart Timetable / DISHA */}
        <Box sx={{ mb: 2, px: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Logo badge — gradient square with "S" */}
            <Box sx={{
              width: 28, height: 28,
              borderRadius: radius.md,
              background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '14px', fontWeight: 700,
              flexShrink: 0,
              boxShadow: shadows.sm,
            }}>S</Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: fonts.heading,
                  fontSize: fonts.size.md,
                  fontWeight: fonts.weight.bold,
                  color: colors.text.primary,
                  lineHeight: 1.2,
                  letterSpacing: fonts.letterSpacing.tight,
                }}
              >
                Smart Timetable
              </Typography>
              <Typography
                sx={{
                  fontSize: '9px',
                  color: colors.text.muted,
                  letterSpacing: fonts.letterSpacing.widest,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                DISHA
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* User Card */}
        <Box
          sx={{
            p: 1.5,
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: radius.md,
            bgcolor: colors.bg.base,
            boxShadow: shadows.sm,
          }}
        >
          {/* Avatar */}
          <Box
            sx={{
              width: 36, height: 36,
              bgcolor: colors.primary.main,
              borderRadius: radius.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: fonts.weight.semibold,
              color: "#FFFFFF",
              fontSize: fonts.size.sm,
            }}
          >
            RK
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: fonts.weight.medium,
                fontSize: fonts.size.sm,
                color: colors.text.primary,
                lineHeight: 1.3,
              }}
            >
              Rishikesh K.
            </Typography>
            <Typography
              sx={{
                fontSize: fonts.size.xs,
                color: colors.text.muted,
                lineHeight: 1.3,
              }}
            >
              ES23BTECH11033
            </Typography>
          </Box>
          <Chip
            label="Y2S2"
            size="small"
            sx={{
              bgcolor: colors.primary.ghost,
              color: colors.primary.main,
              fontWeight: fonts.weight.medium,
              fontSize: fonts.size.xs,
              height: 22,
              border: `1px solid ${colors.primary.border}`,
            }}
          />
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flex: 1 }}>
          {navigationItems.map((section) => (
            <Box key={section.section} sx={{ mb: 2 }}>
              <Typography
                sx={{
                  color: colors.text.muted,
                  letterSpacing: fonts.letterSpacing.widest,
                  textTransform: "uppercase",
                  fontSize: "10px",
                  fontWeight: fonts.weight.medium,
                  mb: 0.5,
                  px: 1,
                }}
              >
                {section.section}
              </Typography>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path
                const IconComponent = item.icon
                return (
                  <Box
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: "7px 10px",
                      borderRadius: radius.md,
                      cursor: "pointer",
                      fontSize: fonts.size.sm,
                      mb: "2px",
                      fontWeight: isActive ? fonts.weight.medium : fonts.weight.regular,
                      color: isActive ? colors.primary.main : colors.text.secondary,
                      bgcolor: isActive ? colors.primary.ghost : "transparent",
                      transition: "all 0.1s ease",
                      "&:hover": {
                        bgcolor: isActive ? colors.primary.ghost : colors.bg.base,
                        color: isActive ? colors.primary.main : colors.text.primary,
                      },
                    }}
                  >
                    {/* MUI Icon — 18px for visual balance */}
                    <IconComponent sx={{ fontSize: 18, flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                    <Box component="span" sx={{ flex: 1 }}>
                      {item.label}
                    </Box>
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          bgcolor: colors.error.ghost,
                          color: colors.error.main,
                          fontSize: "10px",
                          fontWeight: fonts.weight.medium,
                          height: 18,
                          minWidth: 18,
                          "& .MuiChip-label": { px: 0.5 },
                        }}
                      />
                    )}
                  </Box>
                )
              })}
            </Box>
          ))}
        </Box>

        {/* Settings & Logout */}
        <Box
          sx={{
            borderTop: `1px solid ${colors.border.medium}`,
            pt: 1.5,
            mt: 1,
          }}
        >
          <Box
            onClick={() => navigate("/settings")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: "7px 10px",
              borderRadius: radius.md,
              cursor: "pointer",
              fontSize: fonts.size.sm,
              color: colors.text.secondary,
              transition: "all 0.1s ease",
              "&:hover": {
                bgcolor: colors.bg.base,
                color: colors.text.primary,
              },
            }}
          >
            <SettingsOutlined sx={{ fontSize: 18, opacity: 0.7 }} />
            <span>Settings</span>
          </Box>
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: "7px 10px",
              borderRadius: radius.md,
              cursor: "pointer",
              fontSize: fonts.size.sm,
              color: colors.text.secondary,
              transition: "all 0.1s ease",
              "&:hover": {
                bgcolor: colors.error.ghost,
                color: colors.error.main,
              },
            }}
          >
            <LogoutOutlined sx={{ fontSize: 18, opacity: 0.7 }} />
            <span>Log out</span>
          </Box>
        </Box>
      </Box>

      {/* ── MAIN CONTENT AREA ───────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: colors.bg.base,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
