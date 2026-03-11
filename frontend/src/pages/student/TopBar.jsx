/**
 * TopBar.jsx — Student Dashboard Header Bar
 *
 * PURPOSE: Shows semester info, clash status badge, and search bar
 * at the top of the student dashboard.
 */

import { Box, Typography, Chip } from "@mui/material"
import { SearchOutlined } from "@mui/icons-material"
import { colors, fonts, radius, shadows } from "../../styles/tokens"

export default function TopBar({ semester }) {
  return (
    <Box
      sx={{
        m: "12px 12px 0",
        p: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: colors.bg.base,
        border: `1px solid ${colors.border.medium}`,
        borderRadius: radius.lg,
        boxShadow: shadows.sm,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Accent bar — primary deep slate */}
          <Box sx={{ width: 3, height: 20, borderRadius: '2px', bgcolor: colors.primary.main }} />
          <Typography
            variant="h4"
            sx={{ fontFamily: fonts.heading, fontSize: '15px', fontWeight: fonts.weight.bold }}
          >
            Dashboard
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: colors.text.muted, ml: '11px', mt: 0.25, fontSize: fonts.size.xs }}>
          {semester.name} · {semester.period}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {/* Status badge */}
        <Chip
          label={semester.status.text}
          size="small"
          sx={{
            bgcolor: colors.success.ghost,
            color: colors.success.main,
            border: `1px solid ${colors.success.border}`,
            fontWeight: fonts.weight.semibold,
            fontSize: fonts.size.xs,
          }}
        />

        {/* Search bar */}
        <Box
          sx={{
            bgcolor: colors.bg.raised,
            border: `1px solid ${colors.border.medium}`,
            borderRadius: radius.md,
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: "6px 12px",
            fontSize: fonts.size.sm,
            color: colors.text.muted,
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              borderColor: colors.primary.border,
              color: colors.text.secondary,
            },
          }}
        >
          <SearchOutlined sx={{ fontSize: 16 }} />
          Search classes, rooms...
        </Box>
      </Box>
    </Box>
  )
}
