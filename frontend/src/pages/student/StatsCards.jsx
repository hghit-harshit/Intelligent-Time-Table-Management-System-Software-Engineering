/**
 * StatsCards.jsx — Dashboard Statistics Grid
 *
 * PURPOSE: Displays key metrics (courses, exams, classes, attendance)
 * in a 4-column grid. Each card is clickable if it has an onClick URL.
 */

import { Box, Typography } from "@mui/material"
import { colors, fonts, radius, shadows, glass } from "../../styles/tokens"

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
      {stats.map((stat, i) => (
        <Box
          key={i}
          onClick={stat.onClick ? () => (window.location.href = stat.onClick) : undefined}
          sx={{
            ...glass,
            p: "14px",
            textAlign: "center",
            cursor: stat.onClick ? "pointer" : "default",
            transition: "all 0.25s ease",
            "&:hover": {
              transform: stat.onClick ? "translateY(-2px)" : "none",
              boxShadow: stat.onClick ? shadows.md : "none",
              borderColor: stat.onClick ? colors.primary.border : colors.border.subtle,
            },
          }}
        >
          <Box
            sx={{
              fontSize: "18px",
              mb: 0.75,
              filter: 'none',
            }}
          >
            {stat.icon}
          </Box>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: fonts.weight.bold,
              color: stat.color,
              mb: 0.25,
              fontFamily: fonts.body,
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
                fontWeight: fonts.weight.bold,
                color: stat.color,
              }}
            >
              {stat.sub}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}
