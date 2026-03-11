/**
 * TodaysClasses.jsx — Today's Class Schedule List
 *
 * PURPOSE: Shows a vertical list of today's classes with time,
 * subject, location, and live/done/moved status badges.
 */

import { Box, Typography, Chip } from "@mui/material"
import { colors, fonts, radius, shadows } from "../../styles/tokens"

export default function TodaysClasses({ todaysClasses, currentDate, handleTimeSlotClick, setSelectedView }) {
  return (
    <Box sx={{
      bgcolor: colors.bg.base,
      border: `1px solid ${colors.border.medium}`,
      borderRadius: radius.lg,
      boxShadow: shadows.sm,
      overflow: "hidden",
    }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: "10px 16px",
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <Typography
          sx={{
            fontSize: fonts.size.sm,
            fontWeight: fonts.weight.bold,
            color: colors.text.primary,
            fontFamily: fonts.heading,
          }}
        >
          Today's Classes — {currentDate.dayName}, Feb {currentDate.day}
        </Typography>
        <Box
          component="button"
          onClick={() => setSelectedView("day")}
          sx={{
            ml: "auto",
            color: colors.primary.main,
            fontSize: fonts.size.sm,
            fontWeight: fonts.weight.medium,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: fonts.body,
            transition: "color 0.15s ease",
            "&:hover": { color: colors.primary.light },
          }}
        >
          View full day
        </Box>
      </Box>

      {/* Class list */}
      {todaysClasses.map((class_, i) => (
        <Box
          key={i}
          onClick={() => handleTimeSlotClick({ name: class_.subject, time: class_.time })}
          sx={{
            display: "flex",
            alignItems: "center",
            p: "10px 16px",
            borderBottom: i < todaysClasses.length - 1 ? `1px solid ${colors.border.subtle}` : "none",
            gap: 2,
            cursor: "pointer",
            transition: "background 0.15s ease",
            "&:hover": { bgcolor: colors.bg.raised },
          }}
        >
          {/* Time */}
          <Box sx={{ width: 70, textAlign: "left" }}>
            <Typography sx={{ fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.text.primary }}>
              {class_.time}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.muted }}>
              {class_.duration}
            </Typography>
          </Box>

          {/* Status dot */}
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: class_.dotColor,
              flexShrink: 0,
              boxShadow: class_.isLive ? `0 0 0 3px ${colors.success.ghost}` : "none",
            }}
          />

          {/* Subject and location */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: fonts.weight.semibold, fontSize: fonts.size.base, color: colors.text.primary, mb: 0.25 }}>
              {class_.subject}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.muted }}>
              {class_.location}
            </Typography>
          </Box>

          {/* Status badge */}
          <Chip
            label={class_.status}
            size="small"
            sx={{
              bgcolor: class_.status === "Done"
                ? colors.success.ghost
                : class_.status.includes("Live")
                  ? colors.success.ghost
                  : colors.error.ghost,
              color: class_.statusColor,
              border: `1px solid ${class_.statusColor}30`,
              fontWeight: fonts.weight.semibold,
              fontSize: fonts.size.xs,
            }}
          />
        </Box>
      ))}
    </Box>
  )
}
