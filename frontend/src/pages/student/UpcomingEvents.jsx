/**
 * UpcomingEvents.jsx — Upcoming Events List
 *
 * PURPOSE: Shows upcoming exams, assignments, and labs in the
 * right sidebar. Each event has a color-coded dot and date.
 */

import { Box, Typography } from "@mui/material"
import { colors, fonts, radius, glass } from "../../styles/tokens"

export default function UpcomingEvents({ upcomingEvents }) {
  return (
    <Box sx={{ ...glass, p: 1.5, flex: 1 }}>
      <Typography
        sx={{
          fontSize: fonts.size.sm,
          fontWeight: fonts.weight.bold,
          color: colors.text.primary,
          fontFamily: fonts.heading,
          mb: 1,
        }}
      >
        Upcoming This Week
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {upcomingEvents.map((event, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: "8px 12px",
              borderRadius: radius.md,
              bgcolor: colors.bg.raised,
              border: `1px solid ${event.color}20`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: `${event.color}10`,
                borderColor: `${event.color}40`,
              },
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: event.color,
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: fonts.size.sm,
                  fontWeight: fonts.weight.bold,
                  color: colors.text.primary,
                }}
              >
                {event.title}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.text.muted }}>
                {event.date}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
