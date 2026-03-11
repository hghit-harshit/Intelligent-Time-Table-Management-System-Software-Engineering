/**
 * LoginPage.jsx — Role-based Login Screen
 *
 * PURPOSE: Entry point for the app. Users pick their role (Student,
 * Faculty, or Admin) and are routed to the appropriate dashboard.
 *
 * AESTHETIC: Notion Calendar — clean white canvas, centered card with
 * a thin border, no shadows, no orbs, no gradients. Clinical clarity.
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material"
import { colors, fonts, radius, animations } from "../styles/tokens"

// ─── ROLE DEFINITIONS ────────────────────────────────────────
const roles = [
  {
    id: "student",
    label: "Student",
    desc: "View your schedule & classes",
    color: colors.primary.main,
  },
  {
    id: "faculty",
    label: "Faculty",
    desc: "Manage lectures & availability",
    color: "#7C3AED",
  },
  {
    id: "admin",
    label: "Admin",
    desc: "Full system control",
    color: colors.warning.main,
  },
]

export default function Login() {
  // WHY useState: local UI state — which role is picked, hover target, loading
  const [role, setRole] = useState("student")
  const [hoveredRole, setHoveredRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const selected = roles.find((r) => r.id === role)

  const handleLogin = (roleId) => {
    setLoading(true)
    setTimeout(() => {
      if (roleId === "student") navigate("/StudentPage")
      else if (roleId === "faculty") navigate("/FacultyPage")
      else if (roleId === "admin") navigate("/AdminPage")
      setLoading(false)
    }, 800)
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: colors.bg.raised,
      }}
    >
      {/* ── LOGIN CARD ───────────────────────────────────────── */}
      <Box
        sx={{
          width: 400,
          bgcolor: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.lg,
          p: "40px 36px 36px",
          animation: animations.fadeUp,
        }}
      >
        {/* ── HEADER ───────────────────────────────────────── */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: fonts.heading,
              fontSize: fonts.size["2xl"],
              fontWeight: fonts.weight.semibold,
              color: colors.text.primary,
              mb: 0.5,
              lineHeight: 1.2,
            }}
          >
            SmartTimetable
          </Typography>
          <Typography
            sx={{
              fontSize: fonts.size.sm,
              color: colors.text.secondary,
            }}
          >
            Select your access level to continue
          </Typography>
        </Box>

        {/* ── ROLE SELECTOR CARDS ──────────────────────────── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", mb: "24px" }}>
          {roles.map((r) => {
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
                  gap: 1.5,
                  p: "12px 14px",
                  borderRadius: radius.md,
                  border: isSelected
                    ? `1px solid ${r.color}`
                    : `1px solid ${colors.border.medium}`,
                  bgcolor: isSelected
                    ? `${r.color}0A`
                    : isHovered
                      ? colors.bg.raised
                      : colors.bg.base,
                  cursor: "pointer",
                  transition: "all 0.1s ease",
                }}
              >
                {/* Left accent bar */}
                <Box
                  sx={{
                    width: 3,
                    height: 28,
                    borderRadius: "2px",
                    bgcolor: isSelected ? r.color : colors.border.medium,
                    transition: "background 0.1s ease",
                  }}
                />

                {/* Role label + description */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: fonts.size.sm,
                      fontWeight: fonts.weight.medium,
                      color: isSelected ? colors.text.primary : colors.text.secondary,
                    }}
                  >
                    {r.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: fonts.size.xs,
                      color: colors.text.muted,
                      mt: 0.25,
                    }}
                  >
                    {r.desc}
                  </Typography>
                </Box>

                {/* Selection indicator */}
                {isSelected && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: r.color,
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
            p: "8px 16px",
            borderRadius: radius.md,
            bgcolor: loading ? colors.bg.raised : colors.primary.main,
            color: loading ? colors.text.muted : "#FFFFFF",
            fontSize: fonts.size.sm,
            fontWeight: fonts.weight.medium,
            textTransform: "none",
            boxShadow: "none",
            "&:hover:not(:disabled)": {
              bgcolor: colors.primary.dark,
              boxShadow: "none",
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} sx={{ color: colors.text.muted }} />
              <span>Signing in…</span>
            </Box>
          ) : (
            `Continue as ${selected.label}`
          )}
        </Button>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <Typography
          sx={{
            display: "block",
            textAlign: "center",
            mt: 2.5,
            fontSize: fonts.size.xs,
            color: colors.text.muted,
          }}
        >
          Academic Management System · v0.1
        </Typography>
      </Box>
    </Box>
  )
}