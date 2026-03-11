/**
 * QuickActions.jsx — Quick Action Button Grid
 *
 * PURPOSE: 2x2 grid of shortcut buttons (Take Notes, Add Event,
 * Set Reminder, View Stats) in the right sidebar panel.
 * Each button gets an MUI icon for visual weight.
 */

import { Box, Typography } from "@mui/material"
import {
  StickyNote2Outlined,
  AddCircleOutlineOutlined,
  NotificationsActiveOutlined,
  BarChartOutlined,
} from "@mui/icons-material"
import { colors, fonts, radius, shadows } from "../../../styles/tokens"

/* Map quick action labels to MUI icons */
const iconMap = {
  "Take Notes": StickyNote2Outlined,
  "Add Event": AddCircleOutlineOutlined,
  "Set Reminder": NotificationsActiveOutlined,
  "View Stats": BarChartOutlined,
}

export default function QuickActions({ quickActions, handleQuickAction }) {
  return (
    <Box sx={{
      bgcolor: colors.bg.base,
      border: `1px solid ${colors.border.medium}`,
      borderRadius: radius.lg,
      boxShadow: shadows.sm,
      p: 1.5,
    }}>
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
        {quickActions.map((action, i) => {
          const IconComp = iconMap[action.label] || StickyNote2Outlined
          return (
            <Box
              key={i}
              component="button"
              onClick={() => handleQuickAction(action)}
              sx={{
                background: colors.bg.raised,
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: radius.md,
                p: "10px 6px",
                color: colors.text.secondary,
                fontSize: fonts.size.xs,
                fontFamily: fonts.body,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: colors.primary.ghost,
                  borderColor: colors.primary.border,
                  transform: "translateY(-1px)",
                  color: colors.primary.main,
                  boxShadow: shadows.sm,
                },
              }}
            >
              <IconComp sx={{ fontSize: 18 }} />
              <span>{action.label}</span>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
