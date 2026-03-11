/**
 * LoginPage.jsx — Role-based Login Screen
 *
 * PURPOSE: Entry point for the app. Users pick their role (Student,
 * Faculty, or Admin) and are routed to the appropriate dashboard.
 *
 * BRAND: Smart Timetable (DISHA)
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material"
import { colors, fonts, radius, shadows, animations } from "../styles/tokens"

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
      <Box
        sx={{
          width: 400,
          bgcolor: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.xl,
          p: "40px 36px 36px",
          boxShadow: shadows.lg,
          animation: animations.fadeUp,
        }}
      >
        {/* Header — Smart Timetable / DISHA */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{
              width: 36, height: 36,
              borderRadius: radius.md,
              background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '17px', fontWeight: 700,
              flexShrink: 0,
              boxShadow: shadows.sm,
            }}>S</Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: fonts.heading,
                  fontSize: fonts.size['2xl'],
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
                  fontSize: '10px',
                  color: colors.text.muted,
                  letterSpacing: fonts.letterSpacing.widest,
                  textTransform: 'uppercase',
                }}
              >
                DISHA
              </Typography>
            </Box>
          </Box>
          <Typography
            sx={{
              fontSize: fonts.size.sm,
              color: colors.text.secondary,
            }}
          >
            Intelligent Timetable Management · Select your role to continue
          </Typography>
        </Box>

        {/* Role Selector Cards */}
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
                    ? `1.5px solid ${r.color}`
                    : `1px solid ${colors.border.medium}`,
                  bgcolor: isSelected
                    ? `${r.color}0A`
                    : isHovered
                      ? colors.bg.raised
                      : colors.bg.base,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? shadows.sm : 'none',
                }}
              >
                {/* Left accent bar */}
                <Box
                  sx={{
                    width: 3,
                    height: 28,
                    borderRadius: "2px",
                    bgcolor: isSelected ? r.color : colors.border.medium,
                    transition: "background 0.15s ease",
                  }}
                />

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

        {/* Login Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleLogin(selected.id)}
          disabled={loading}
          sx={{
            p: "10px 16px",
            borderRadius: radius.md,
            bgcolor: loading ? colors.bg.raised : colors.primary.main,
            color: loading ? colors.text.muted : "#FFFFFF",
            fontSize: fonts.size.sm,
            fontWeight: fonts.weight.medium,
            textTransform: "none",
            boxShadow: shadows.sm,
            "&:hover:not(:disabled)": {
              bgcolor: colors.primary.dark,
              boxShadow: shadows.md,
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} sx={{ color: colors.text.muted }} />
              <span>Signing in...</span>
            </Box>
          ) : (
            `Continue as ${selected.label}`
          )}
        </Button>

        {/* Footer */}
        <Typography
          sx={{
            display: "block",
            textAlign: "center",
            mt: 2.5,
            fontSize: fonts.size.xs,
            color: colors.text.muted,
          }}
        >
          Smart Timetable · Intelligent Timetable Management
        </Typography>
      </Box>
    </Box>
  )
}
