/**
 * TopBar.jsx — Student Dashboard Header Bar
 *
 * PURPOSE: Shows semester info, clash status badge, and search bar
 * at the top of the student dashboard.
 */

import { Box, Typography, Chip } from "@mui/material"
import { colors, fonts, radius, glass } from "../../styles/tokens"

export default function TopBar({ semester }) {
  return (
    <Box
      sx={{
        m: "12px 12px 0",
        p: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...glass,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{ fontFamily: fonts.heading, mb: 0.5 }}
        >
          My Timetable
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.muted }}>
          {semester.name} • {semester.period}
        </Typography>
      </Box>

      <Box className="flex items-center gap-3">
        {/* Status badge */}
        <Chip
          label={semester.status.text}
          size="small"
          sx={{
            bgcolor: colors.success.ghost,
            color: colors.success.main,
            border: `1px solid ${colors.success.border}`,
            fontWeight: fonts.weight.bold,
            fontSize: fonts.size.xs,
          }}
        />

        {/* Search bar placeholder */}
        <Box
          sx={{
            ...glass,
            borderRadius: radius.md,
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: "6px 12px",
            fontSize: fonts.size.sm,
            color: colors.text.muted,
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: colors.primary.border,
              color: colors.text.secondary,
            },
          }}
        >
          🔍 Search classes, rooms...
        </Box>
      </Box>
    </Box>
  )
}
