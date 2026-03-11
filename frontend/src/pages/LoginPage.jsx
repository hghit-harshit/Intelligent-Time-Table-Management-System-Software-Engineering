/**
 * LoginPage.jsx — Role-based Login Screen
 * 
 * PURPOSE: Entry point for the app. Users pick their role (Student,
 * Faculty, or Admin) and are routed to the appropriate dashboard.
 * This page is the REFERENCE IMPLEMENTATION of our design system —
 * it demonstrates tokens, MUI components, Tailwind utilities, and
 * our animation patterns working together.
 * 
 * DESIGN: Dark utilitarian aesthetic with a centered glass card,
 * floating background orbs, and subtle grid overlay.
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material"
import { colors, fonts, radius, shadows, glass, animations } from "../styles/tokens"

// ─── ROLE DEFINITIONS ────────────────────────────────────────
// Each role maps to a color from our design tokens
const roles = [
  {
    id: "student",
    label: "Student",
    icon: "◎",
    desc: "View your schedule & classes",
    color: colors.primary.main,
  },
  {
    id: "faculty",
    label: "Faculty",
    icon: "◈",
    desc: "Manage lectures & availability",
    color: colors.secondary.main,
  },
  {
    id: "admin",
    label: "Admin",
    icon: "◆",
    desc: "Full system control",
    color: colors.warning.main,
  },
]

export default function Login() {
  // useState tracks which role the user has selected
  const [role, setRole] = useState("student")
  // useState tracks which card the mouse is hovering over
  const [hoveredRole, setHoveredRole] = useState(null)
  // useState shows a loading spinner when "logging in"
  const [loading, setLoading] = useState(false)
  // useNavigate lets us redirect to a different page programmatically
  const navigate = useNavigate()

  // Find the full role object for the currently selected role
  const selected = roles.find((r) => r.id === role)

  const handleLogin = (roleId) => {
    setLoading(true)
    // Simulate a 1.2s auth delay, then navigate to the right dashboard
    setTimeout(() => {
      if (roleId === "student") navigate("/StudentPage")
      else if (roleId === "faculty") navigate("/FacultyPage")
      else if (roleId === "admin") navigate("/AdminPage")
      setLoading(false)
    }, 1200)
  }

  return (
    <Box
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      sx={{ background: colors.bg.deep }}
    >
      {/* ── FLOATING BACKGROUND ORBS ─────────────────────────── */}
      {/* Decorative blurred circles that drift slowly for depth */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          top: -150,
          left: -150,
          background: `radial-gradient(circle, ${colors.primary.glow} 0%, transparent 70%)`,
          animation: "float 9s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          bottom: -100,
          right: -80,
          background: `radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)`,
          animation: "float 12s ease-in-out infinite",
          animationDelay: "3s",
          pointerEvents: "none",
        }}
      />

      {/* ── GRID OVERLAY ─────────────────────────────────────── */}
      {/* Subtle grid pattern — gives a "blueprint / institutional" feel */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* ── LOGIN CARD ───────────────────────────────────────── */}
      <Box
        sx={{
          width: 420,
          ...glass,
          background: "rgba(255,255,255,0.03)",
          p: "44px 40px 40px",
          boxShadow: shadows.xl + ", " + shadows.inner,
          animation: animations.fadeUp,
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Rotating decorative ring — top right corner */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            border: `1px dashed ${colors.primary.border}`,
            borderRadius: "50%",
            animation: "spinSlow 20s linear infinite",
          }}
        />

        {/* ── HEADER ───────────────────────────────────────── */}
        <Box sx={{ mb: 4, animation: "fadeUp 0.6s 0.1s ease both", opacity: 0 }}>
          {/* Live system status badge */}
          <Chip
            label="Live System"
            size="small"
            icon={
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: colors.primary.main,
                  animation: animations.pulse,
                  ml: 1,
                }}
              />
            }
            sx={{
              bgcolor: colors.primary.ghost,
              border: `1px solid ${colors.primary.border}`,
              color: colors.primary.main,
              fontFamily: fonts.body,
              fontSize: fonts.size.xs,
              letterSpacing: fonts.letterSpacing.widest,
              textTransform: "uppercase",
              mb: 2,
              "& .MuiChip-icon": { order: -1 },
            }}
          />

          {/* App title with gradient shimmer */}
          <Typography
            variant="h1"
            sx={{
              fontFamily: fonts.heading,
              fontSize: fonts.size["2xl"],
              mb: 0.5,
              lineHeight: 1.15,
            }}
          >
            Timetable
            <br />
            <Box
              component="span"
              sx={{
                background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.secondary.main}, ${colors.primary.main})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: animations.shimmer,
              }}
            >
              Portal
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ color: colors.text.muted }}>
            Select your access level to continue
          </Typography>
        </Box>

        {/* ── ROLE SELECTOR CARDS ──────────────────────────── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", mb: "28px" }}>
          {roles.map((r, i) => {
            const isSelected = role === r.id
            const isHovered = hoveredRole === r.id

            return (
              <Box
                key={r.id}
                onClick={() => setRole(r.id)}
                onMouseEnter={() => setHoveredRole(r.id)}
                onMouseLeave={() => setHoveredRole(null)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: "14px 16px",
                  borderRadius: radius.lg,
                  border: isSelected
                    ? `1px solid ${r.color}55`
                    : `1px solid ${colors.border.subtle}`,
                  background: isSelected
                    ? `linear-gradient(135deg, ${r.color}12, ${r.color}06)`
                    : isHovered
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  animation: `fadeUp 0.5s ${0.15 + i * 0.08}s ease both`,
                  opacity: 0,
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.02)",
                  },
                }}
              >
                {/* Role icon */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: radius.md,
                    bgcolor: isSelected ? `${r.color}20` : "rgba(255,255,255,0.05)",
                    fontSize: "18px",
                    color: isSelected ? r.color : colors.text.disabled,
                    transition: "all 0.25s ease",
                    flexShrink: 0,
                  }}
                >
                  {r.icon}
                </Box>

                {/* Role label + description */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: fonts.body,
                      fontSize: fonts.size.base,
                      fontWeight: fonts.weight.bold,
                      color: isSelected ? colors.text.primary : colors.text.secondary,
                      letterSpacing: fonts.letterSpacing.wide,
                      transition: "color 0.2s",
                    }}
                  >
                    {r.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: fonts.size.xs,
                      color: isSelected ? colors.text.muted : colors.text.disabled,
                      mt: 0.25,
                      transition: "color 0.2s",
                    }}
                  >
                    {r.desc}
                  </Typography>
                </Box>

                {/* Selection indicator dot */}
                {isSelected && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: r.color,
                      boxShadow: `0 0 10px ${r.color}`,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>
            )
          })}
        </Box>

        {/* ── LOGIN BUTTON ─────────────────────────────────── */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleLogin(selected.id)}
          disabled={loading}
          sx={{
            p: "14px",
            borderRadius: radius.lg,
            background: loading
              ? "rgba(45, 212, 191, 0.1)"
              : `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)`,
            color: loading ? colors.text.disabled : colors.bg.deep,
            fontSize: fonts.size.sm,
            fontWeight: fonts.weight.bold,
            letterSpacing: fonts.letterSpacing.wider,
            textTransform: "uppercase",
            boxShadow: loading ? "none" : `0 8px 24px ${selected.color}30`,
            animation: "fadeUp 0.5s 0.4s ease both",
            opacity: 0,
            transition: "all 0.3s ease",
            "&:hover:not(:disabled)": {
              transform: "translateY(-2px)",
              boxShadow: `0 12px 40px ${selected.color}40`,
              background: `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)`,
            },
            "&:active:not(:disabled)": {
              transform: "translateY(0) scale(0.98)",
            },
          }}
        >
          {loading ? (
            <Box className="flex items-center gap-2">
              <CircularProgress size={16} sx={{ color: colors.text.muted }} />
              <span>Authenticating...</span>
            </Box>
          ) : (
            `Enter as ${selected.label} →`
          )}
        </Button>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 2.5,
            color: colors.text.disabled,
            animation: "fadeUp 0.5s 0.5s ease both",
            opacity: 0,
          }}
        >
          Academic Management System · v0.1
        </Typography>
      </Box>
    </Box>
  )
}