/**
 * QuickActions.jsx — Quick Action Button Grid
 *
 * PURPOSE: 2x2 grid of shortcut buttons (Take Notes, Add Event,
 * Set Reminder, View Stats) in the right sidebar panel.
 */

import { Box, Typography } from "@mui/material"
import { colors, fonts, radius, glass } from "../../styles/tokens"

export default function QuickActions({ quickActions, handleQuickAction }) {
  return (
    <Box sx={{ ...glass, p: 1.5 }}>
      <Typography
        sx={{
          fontSize: fonts.size.sm,
          fontWeight: fonts.weight.bold,
          color: colors.text.primary,
          fontFamily: fonts.heading,
          mb: 1,
        }}
      >
        Quick Actions
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        {quickActions.map((action, i) => (
          <Box
            key={i}
            component="button"
            onClick={() => handleQuickAction(action)}
            sx={{
              background: colors.bg.raised,
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: radius.md,
              p: "8px 6px",
              color: colors.text.secondary,
              fontSize: fonts.size.xs,
              fontFamily: fonts.body,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: colors.primary.ghost,
                borderColor: colors.primary.border,
                transform: "translateY(-2px)",
                color: colors.primary.main,
              },
            }}
          >
            <span style={{ fontSize: "16px" }}>{action.icon}</span>
            <span>{action.label}</span>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
