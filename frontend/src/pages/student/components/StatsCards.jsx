/**
 * StatsCards.jsx — Dashboard Statistics Grid
 *
 * PURPOSE: Displays key metrics (courses, exams, classes, attendance)
 * in a 4-column grid. Each card has a colored icon badge for visual
 * hierarchy and is clickable if it has an onClick URL.
 */

import { Box, Typography } from "@mui/material"
import {
  MenuBookOutlined,
  EventNoteOutlined,
  CalendarViewWeekOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material"
import { colors, fonts, radius, shadows } from "../../styles/tokens"

/* Map stat index to an icon and badge color */
const statIcons = [
  { Icon: MenuBookOutlined, bg: colors.primary.ghost, color: colors.primary.main },
  { Icon: EventNoteOutlined, bg: colors.warning.ghost, color: colors.warning.main },
  { Icon: CalendarViewWeekOutlined, bg: 'rgba(124, 58, 237, 0.08)', color: '#7C3AED' },
  { Icon: TrendingUpOutlined, bg: colors.success.ghost, color: colors.success.main },
]

export default function StatsCards({ stats }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px",
        mb: "12px",
      }}
    >
      {stats.map((stat, i) => {
        const iconInfo = statIcons[i] || statIcons[0]
        const IconComp = iconInfo.Icon
        return (
          <Box
            key={i}
            onClick={stat.onClick ? () => (window.location.href = stat.onClick) : undefined}
            sx={{
              bgcolor: colors.bg.base,
              border: `1px solid ${colors.border.medium}`,
              borderRadius: radius.lg,
              p: "14px",
              cursor: stat.onClick ? "pointer" : "default",
              transition: "all 0.15s ease",
              boxShadow: shadows.sm,
              "&:hover": {
                transform: stat.onClick ? "translateY(-2px)" : "none",
                boxShadow: stat.onClick ? shadows.md : shadows.sm,
                borderColor: stat.onClick ? colors.primary.border : colors.border.medium,
              },
            }}
          >
            {/* Icon badge — 28x28 rounded square */}
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: radius.sm,
                bgcolor: iconInfo.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <IconComp sx={{ fontSize: 16, color: iconInfo.color }} />
            </Box>

            <Typography
              sx={{
                fontSize: "22px",
                fontWeight: fonts.weight.bold,
                color: colors.text.primary,
                mb: 0.25,
                fontFamily: fonts.heading,
                lineHeight: 1.2,
              }}
            >
              {stat.num}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                display: "block",
                mb: stat.sub ? 0.5 : 0,
              }}
            >
              {stat.label}
            </Typography>
            {stat.sub && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: fonts.weight.semibold,
                  color: iconInfo.color,
                }}
              >
                {stat.sub}
              </Typography>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
