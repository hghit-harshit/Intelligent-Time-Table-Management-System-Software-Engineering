/**
 * Layout.jsx — Shared Sidebar + Main Content Shell
 *
 * PURPOSE: Wraps every authenticated page (Student, Faculty, Admin).
 * Provides the sidebar navigation, user card, and scrollable content.
 *
 * AESTHETIC: Notion Calendar — clean sidebar with 1px right border,
 * no shadows, no floating orbs, no glassmorphism. Whitespace is king.
 */

import { useNavigate, useLocation } from "react-router-dom"
import { Box, Typography, Chip } from "@mui/material"
import { colors, fonts, radius, animations } from "../styles/tokens"

export default function Layout({ children }) {
  // WHY useNavigate: programmatic route changes on sidebar click
  const navigate = useNavigate()
  // WHY useLocation: highlight the currently active nav item
  const location = useLocation()

  const navigationItems = [
    {
      section: "MAIN",
      items: [
        { icon: "📅", label: "My Timetable", path: "/StudentPage", badge: null },
        { icon: "📋", label: "Exam Schedule", path: "/exams", badge: "3" },
        { icon: "🔔", label: "Notifications", path: "/notifications", badge: "3" },
        { icon: "📚", label: "Courses", path: "/courses", badge: null },
      ],
    },
    {
      section: "WORKSPACE",
      items: [
        { icon: "📝", label: "My Notes", path: "/notes", badge: null },
        { icon: "✅", label: "Tasks", path: "/tasks", badge: null },
        { icon: "⏰", label: "Reminders", path: "/reminders", badge: null },
      ],
    },
    {
      section: "TOOLS",
      items: [
        { icon: "🤖", label: "AI Assistant", path: "/ai", badge: null },
        { icon: "🔗", label: "Integrations", path: "/integrations", badge: null },
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
        {/* Logo / Brand */}
        <Box sx={{ mb: 2, px: 0.5 }}>
          <Typography
            sx={{
              fontFamily: fonts.heading,
              fontSize: fonts.size.lg,
              fontWeight: fonts.weight.semibold,
              color: colors.text.primary,
              mb: 0.25,
            }}
          >
            SmartTimetable
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: colors.text.muted,
              letterSpacing: fonts.letterSpacing.wider,
              textTransform: "uppercase",
              fontSize: fonts.size.xs,
            }}
          >
            ITMS • Student Portal
          </Typography>
        </Box>

        {/* User Card */}
        <Box
          sx={{
            p: 1.5,
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.md,
            bgcolor: colors.bg.base,
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
                return (
                  <Box
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: "6px 10px",
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
                    <Box component="span" sx={{ fontSize: "14px", lineHeight: 1 }}>
                      {item.icon}
                    </Box>
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
              p: "6px 10px",
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
            <span style={{ fontSize: 14 }}>⚙️</span>
            <span>Settings</span>
          </Box>
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: "6px 10px",
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
            <span style={{ fontSize: 14 }}>↩️</span>
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