/**
 * Layout.jsx — Shared Sidebar + Main Content Shell
 *
 * PURPOSE: Wraps every authenticated page (Student, Faculty, Admin).
 * Provides the sidebar navigation, user card, and main content area.
 * Uses design tokens for all visual values — no hardcoded colors.
 */

import { useNavigate, useLocation } from "react-router-dom"
import { Box, Typography, Chip } from "@mui/material"
import { colors, fonts, radius, shadows, glass, animations } from "../styles/tokens"

export default function Layout({ children }) {
  // useNavigate lets us programmatically change routes on click
  const navigate = useNavigate()
  // useLocation tells us the current URL path (to highlight active nav item)
  const location = useLocation()

  // Navigation structure — grouped into sections
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
        position: "relative",
      }}
    >
      {/* ── FLOATING BACKGROUND ORBS ─────────────────────── */}
      <Box
        sx={{
          position: "absolute", width: 400, height: 400,
          borderRadius: "50%", top: -100, left: -100,
          background: `radial-gradient(circle, ${colors.primary.ghost} 0%, transparent 70%)`,
          animation: "float 12s ease-in-out infinite",
          pointerEvents: "none", zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: "absolute", width: 350, height: 350,
          borderRadius: "50%", bottom: -80, right: -60,
          background: `radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)`,
          animation: "float 15s ease-in-out infinite",
          animationDelay: "4s",
          pointerEvents: "none", zIndex: 1,
        }}
      />

      {/* ── GRID OVERLAY ────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none", zIndex: 1,
        }}
      />

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <Box
        sx={{
          width: 280,
          m: 2,
          p: "24px 20px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 10,
          animation: animations.fadeUp,
          ...glass,
        }}
      >
        {/* Logo / Brand */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: fonts.heading,
              fontSize: fonts.size.xl,
              fontWeight: fonts.weight.bold,
              mb: 0.5,
              background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.secondary.main})`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: animations.shimmer,
            }}
          >
            SmartTimetable
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: colors.text.disabled,
              letterSpacing: fonts.letterSpacing.wider,
              textTransform: "uppercase",
            }}
          >
            ITMS • Student Portal
          </Typography>
        </Box>

        {/* User Card */}
        <Box
          sx={{
            ...glass,
            p: 2,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* Avatar circle */}
          <Box
            sx={{
              width: 42, height: 42,
              background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: fonts.weight.bold,
              color: colors.bg.deep,
              fontSize: fonts.size.md,
              animation: animations.pulse,
            }}
          >
            RK
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontWeight: fonts.weight.bold,
                fontSize: fonts.size.md,
                color: colors.text.primary,
              }}
            >
              Rishikesh K.
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.muted }}>
              ES23BTECH11033 • ECE
            </Typography>
          </Box>
          <Chip
            label="Y2S2"
            size="small"
            sx={{
              bgcolor: "rgba(124, 58, 237, 0.3)",
              color: colors.secondary.light,
              fontWeight: fonts.weight.bold,
              fontSize: fonts.size.xs,
              height: 24,
            }}
          />
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flex: 1 }}>
          {navigationItems.map((section, sectionIndex) => (
            <Box key={section.section} sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.text.disabled,
                  letterSpacing: fonts.letterSpacing.wider,
                  textTransform: "uppercase",
                  mb: 1,
                  display: "block",
                }}
              >
                {section.section}
              </Typography>
              {section.items.map((item, i) => {
                const isActive = location.pathname === item.path
                return (
                  <Box
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: "10px 12px",
                      borderRadius: radius.md,
                      cursor: "pointer",
                      fontSize: fonts.size.base,
                      mb: 0.5,
                      color: isActive ? colors.primary.main : colors.text.secondary,
                      bgcolor: isActive ? colors.primary.ghost : "transparent",
                      border: isActive
                        ? `1px solid ${colors.primary.border}`
                        : "1px solid transparent",
                      transition: "all 0.2s ease",
                      animation: `fadeUp 0.4s ${0.1 + sectionIndex * 0.1 + i * 0.05}s ease both`,
                      opacity: 0,
                      "&:hover": {
                        bgcolor: colors.primary.ghost,
                        color: colors.primary.main,
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box component="span" sx={{ fontSize: "16px" }}>
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
                          bgcolor: colors.error.main,
                          color: "#fff",
                          fontSize: fonts.size.xs,
                          fontWeight: fonts.weight.bold,
                          height: 20,
                          minWidth: 20,
                          "& .MuiChip-label": { px: 0.75 },
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
            borderTop: `1px solid ${colors.border.subtle}`,
            pt: 2,
            mt: 2,
          }}
        >
          <Box
            onClick={() => navigate("/settings")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: "10px 12px",
              borderRadius: radius.md,
              cursor: "pointer",
              color: colors.text.secondary,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: colors.primary.ghost,
                color: colors.primary.main,
                transform: "translateX(4px)",
              },
            }}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </Box>
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: "10px 12px",
              borderRadius: radius.md,
              cursor: "pointer",
              color: colors.error.main,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: colors.error.ghost,
                transform: "translateX(4px)",
              },
            }}
          >
            <span>↩️</span>
            <span>Logout</span>
          </Box>
        </Box>
      </Box>

      {/* ── MAIN CONTENT AREA ───────────────────────────── */}
      <Box sx={{ flex: 1, position: "relative", zIndex: 10 }}>
        {children}
      </Box>
    </Box>
  )
}