/**
 * AdminPage.jsx — Admin Dashboard
 *
 * PURPOSE: Provides admin controls for managing time slots and
 * semester configuration. Two side-by-side panels let the admin
 * add/remove time slots and set semester metadata.
 *
 * WHY useState: Each piece of form state (timeSlots, semesterDetails,
 * newSlot, activeTab) is independent local state — no prop drilling
 * or global store needed for a single-page form.
 */

import { useState } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Chip,
} from "@mui/material"
import {
  AccessTime as ClockIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material"
import Layout from "../../components/Layout"
import { colors, fonts, radius, glass, animations } from "../../styles/tokens"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function AdminPage() {
  // WHY separate useState calls: each state slice updates independently,
  // avoiding unnecessary re-renders of unrelated UI sections.
  const [timeSlots, setTimeSlots] = useState([])
  const [semesterDetails, setSemesterDetails] = useState({
    name: "",
    year: "",
    branch: "",
    section: "",
    startDate: "",
    endDate: "",
  })
  const [newSlot, setNewSlot] = useState({
    startTime: "",
    endTime: "",
    day: DAYS[0],
  })

  const handleSlotChange = (e) => {
    const { name, value } = e.target
    setNewSlot((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      alert("Please fill in both start and end times")
      return
    }

    setTimeSlots((prev) => [
      ...prev,
      {
        id: Date.now(),
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        day: newSlot.day,
      },
    ])

    setNewSlot({ startTime: "", endTime: "", day: DAYS[0] })
  }

  const handleRemoveSlot = (id) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== id))
  }

  const handleSemesterChange = (e) => {
    const { name, value } = e.target
    setSemesterDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSemester = () => {
    if (!semesterDetails.name || !semesterDetails.year) {
      alert("Please fill in at least semester name and year")
      return
    }
    console.log("Saving semester details:", semesterDetails)
    alert("Semester details saved successfully!")
  }

  const handleSaveSlots = () => {
    console.log("Saving time slots:", timeSlots)
    alert("Time slots saved successfully!")
  }

  /** Shared sx for glass-panel cards */
  const panelSx = {
    flex: 1,
    p: 2,
    ...glass,
    borderRadius: radius.xl,
  }

  /** Shared sx for form labels */
  const labelSx = {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    color: colors.text.muted,
    mb: 0.75,
    textTransform: "uppercase",
    letterSpacing: fonts.letterSpacing.wide,
  }

  return (
    <Layout>
      {/* ── Top Bar ─────────────────────────────────── */}
      <Box
        sx={{
          m: "12px 12px 0",
          p: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          ...glass,
          borderRadius: radius.xl,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: fonts.heading,
              fontWeight: fonts.weight.bold,
              color: colors.text.primary,
              mb: 0.5,
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colors.text.muted }}
          >
            Manage Time Slots & Semester Configuration
          </Typography>
        </Box>
        <Chip
          icon={<SchoolIcon sx={{ fontSize: 14 }} />}
          label="Admin"
          size="small"
          sx={{
            bgcolor: colors.secondary.ghost,
            color: colors.secondary.main,
            border: `1px solid ${colors.secondary.border}`,
            fontWeight: fonts.weight.bold,
          }}
        />
      </Box>

      {/* ── Content — Two Panels ────────────────────── */}
      <Box
        sx={{
          m: 1.5,
          display: "flex",
          gap: 1.5,
          animation: animations.fadeUp,
          // Stack on small screens
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* ── Time Slots Panel ──────────────────────── */}
        <Box sx={panelSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <ClockIcon sx={{ fontSize: 16, color: colors.primary.main }} />
            <Typography
              variant="h6"
              sx={{
                fontFamily: fonts.heading,
                fontWeight: fonts.weight.bold,
                color: colors.text.primary,
                fontSize: fonts.size.base,
              }}
            >
              Time Slots Configuration
            </Typography>
          </Box>

          {/* Add-slot form row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: 1.5,
              mb: 2,
              alignItems: "end",
            }}
          >
            <Box>
              <Typography sx={labelSx}>Start Time</Typography>
              <TextField
                type="time"
                name="startTime"
                value={newSlot.startTime}
                onChange={handleSlotChange}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <Box>
              <Typography sx={labelSx}>End Time</Typography>
              <TextField
                type="time"
                name="endTime"
                value={newSlot.endTime}
                onChange={handleSlotChange}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <FormControl size="small" fullWidth>
              <Typography sx={labelSx}>Day</Typography>
              <Select
                name="day"
                value={newSlot.day}
                onChange={handleSlotChange}
              >
                {DAYS.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSlot}
              sx={{ minWidth: 110, height: 40 }}
            >
              Add Slot
            </Button>
          </Box>

          {/* Slots list */}
          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            {timeSlots.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 3,
                  color: colors.text.muted,
                }}
              >
                <Typography sx={{ fontSize: 24, mb: 1 }}>🕐</Typography>
                <Typography variant="body2" sx={{ color: colors.text.muted }}>
                  No time slots added yet
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {timeSlots.map((slot) => (
                  <Box
                    key={slot.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: "12px 16px",
                      bgcolor: colors.bg.raised,
                      border: `1px solid ${colors.border.subtle}`,
                      borderRadius: radius.lg,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: colors.primary.border,
                        bgcolor: colors.primary.ghost,
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {/* Teal indicator dot */}
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: colors.primary.main,
                        }}
                      />
                      <Box>
                        <Typography
                          sx={{
                            fontSize: fonts.size.sm,
                            fontWeight: fonts.weight.medium,
                            color: colors.text.primary,
                          }}
                        >
                          {slot.startTime} – {slot.endTime}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: colors.text.muted }}
                        >
                          {slot.day}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSlot(slot.id)}
                      sx={{
                        color: colors.error.main,
                        bgcolor: colors.error.ghost,
                        border: `1px solid ${colors.error.border}`,
                        "&:hover": { bgcolor: "rgba(239,68,68,0.2)" },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {timeSlots.length > 0 && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSlots}
              fullWidth
              sx={{ mt: 2 }}
            >
              Save All Slots
            </Button>
          )}
        </Box>

        {/* ── Semester Details Panel ────────────────── */}
        <Box sx={panelSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <CalendarIcon sx={{ fontSize: 16, color: colors.secondary.main }} />
            <Typography
              variant="h6"
              sx={{
                fontFamily: fonts.heading,
                fontWeight: fonts.weight.bold,
                color: colors.text.primary,
                fontSize: fonts.size.base,
              }}
            >
              Semester Configuration
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
            }}
          >
            {/* Semester Name — full width */}
            <Box sx={{ gridColumn: "span 2" }}>
              <Typography sx={labelSx}>Semester Name</Typography>
              <TextField
                name="name"
                value={semesterDetails.name}
                onChange={handleSemesterChange}
                placeholder="e.g., Spring Semester 2025"
                size="small"
                fullWidth
              />
            </Box>

            {/* Academic Year */}
            <FormControl size="small" fullWidth>
              <Typography sx={labelSx}>Academic Year</Typography>
              <Select
                name="year"
                value={semesterDetails.year}
                onChange={handleSemesterChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Year
                </MenuItem>
                {[1, 2, 3, 4].map((yr) => (
                  <MenuItem key={yr} value={String(yr)}>
                    Year {yr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Branch */}
            <Box>
              <Typography sx={labelSx}>Branch</Typography>
              <TextField
                name="branch"
                value={semesterDetails.branch}
                onChange={handleSemesterChange}
                placeholder="e.g., ECE, CSE, ME"
                size="small"
                fullWidth
              />
            </Box>

            {/* Section */}
            <Box>
              <Typography sx={labelSx}>Section</Typography>
              <TextField
                name="section"
                value={semesterDetails.section}
                onChange={handleSemesterChange}
                placeholder="e.g., A, B, C"
                size="small"
                fullWidth
              />
            </Box>

            {/* Start Date */}
            <Box>
              <Typography sx={labelSx}>Start Date</Typography>
              <TextField
                type="date"
                name="startDate"
                value={semesterDetails.startDate}
                onChange={handleSemesterChange}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            {/* End Date — full width */}
            <Box sx={{ gridColumn: "span 2" }}>
              <Typography sx={labelSx}>End Date</Typography>
              <TextField
                type="date"
                name="endDate"
                value={semesterDetails.endDate}
                onChange={handleSemesterChange}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSemester}
            fullWidth
            sx={{ mt: 3 }}
          >
            Save Semester Details
          </Button>
        </Box>
      </Box>
    </Layout>
  )
}
