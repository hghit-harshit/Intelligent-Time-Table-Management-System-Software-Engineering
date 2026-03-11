/**
 * ClassDetailsModal.jsx — Class Info Popup Modal
 *
 * PURPOSE: Shows detailed info about a selected class when clicked
 * in any calendar view. Displays class name, time, location, and
 * professor. Has actions for adding notes or setting reminders.
 */

import { Box, Typography, Button } from "@mui/material"
import { colors, fonts, radius, shadows } from "../../styles/tokens"

export default function ClassDetailsModal({ selectedTimeSlot, onClose }) {
  return (
    // Overlay backdrop — clicking it closes the modal
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Modal content — stopPropagation prevents closing when clicking inside */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          bgcolor: colors.bg.raised,
          backdropFilter: "blur(24px)",
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.xl,
          p: 3,
          maxWidth: 400,
          width: "90%",
          boxShadow: shadows.xl,
          animation: "fadeUp 0.3s ease",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h4"
            sx={{ fontFamily: fonts.heading, fontSize: fonts.size.lg }}
          >
            Class Details
          </Typography>
          <Box
            component="button"
            onClick={onClose}
            sx={{
              background: "none",
              border: "none",
              color: colors.text.muted,
              fontSize: "20px",
              cursor: "pointer",
              p: 0.5,
              "&:hover": { color: colors.text.primary },
            }}
          >
            ×
          </Box>
        </Box>

        {/* Details */}
        <Box sx={{ color: colors.text.secondary, lineHeight: 1.8, fontSize: fonts.size.base }}>
          <Typography sx={{ fontSize: fonts.size.base, mb: 0.5 }}>
            <Box component="strong" sx={{ color: colors.text.primary }}>Class:</Box> {selectedTimeSlot.name}
          </Typography>
          <Typography sx={{ fontSize: fonts.size.base, mb: 0.5 }}>
            <Box component="strong" sx={{ color: colors.text.primary }}>Time:</Box> {selectedTimeSlot.time}
          </Typography>
          <Typography sx={{ fontSize: fonts.size.base, mb: 0.5 }}>
            <Box component="strong" sx={{ color: colors.text.primary }}>Day:</Box> {selectedTimeSlot.day}
          </Typography>
          {selectedTimeSlot.location && (
            <Typography sx={{ fontSize: fonts.size.base, mb: 0.5 }}>
              <Box component="strong" sx={{ color: colors.text.primary }}>Location:</Box> {selectedTimeSlot.location}
            </Typography>
          )}
          {selectedTimeSlot.professor && (
            <Typography sx={{ fontSize: fonts.size.base, mb: 0.5 }}>
              <Box component="strong" sx={{ color: colors.text.primary }}>Professor:</Box> {selectedTimeSlot.professor}
            </Typography>
          )}
        </Box>

        {/* Action buttons */}
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button variant="contained" size="small">
            Add Note
          </Button>
          <Button variant="outlined" size="small">
            Set Reminder
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
