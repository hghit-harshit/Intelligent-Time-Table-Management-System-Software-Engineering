// @ts-nocheck
import React, { useMemo } from "react";
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

/**
 * SlotAllocationView
 * Displays schedule organized by slots with recurring patterns
 *
 * Shows: Slot A (Mon, Tues, Wed 09:00-10:00): [Course1, Course2, Course3]
 */

const SlotAllocationView = ({ assignments = [] }) => {
  const slotGrouping = useMemo(() => {
    if (!assignments || assignments.length === 0) {
      return {};
    }

    const grouped = {};

    assignments.forEach((assignment) => {
      const slotLabel =
        assignment.slotLabel ||
        assignment.originalLabel ||
        assignment.timeslotLabel ||
        "Unknown";
      const slotId =
        assignment.slotId || assignment.originalSlotId || slotLabel;

      if (!grouped[slotId]) {
        grouped[slotId] = {
          slotId,
          label: slotLabel,
          courses: new Map(),
          occurrences: new Map(),
        };
      }

      const courseKey = `${assignment.courseId || assignment.courseName}::${assignment.professorId || assignment.professorName}`;
      if (!grouped[slotId].courses.has(courseKey)) {
        grouped[slotId].courses.set(courseKey, {
          courseId: assignment.courseId,
          courseName: assignment.courseName,
          professorName: assignment.professorName,
        });
      }

      const occurrenceKey = `${assignment.day}|${assignment.startTime}|${assignment.endTime}`;
      if (!grouped[slotId].occurrences.has(occurrenceKey)) {
        grouped[slotId].occurrences.set(occurrenceKey, {
          day: assignment.day,
          startTime: assignment.startTime,
          endTime: assignment.endTime,
        });
      }
    });

    Object.values(grouped).forEach((slot) => {
      const dayOrder = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
      };

      slot.courses = Array.from(slot.courses.values());
      slot.occurrences = Array.from(slot.occurrences.values()).sort((a, b) => {
        const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
        if (dayDiff !== 0) {
          return dayDiff;
        }
        return (a.startTime || "").localeCompare(b.startTime || "");
      });

      slot.firstStartTime = slot.occurrences[0]?.startTime || "";
    });

    return grouped;
  }, [assignments]);

  if (Object.keys(slotGrouping).length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: "center" }}>
        <Typography color="textSecondary">
          No schedule data available
        </Typography>
      </Paper>
    );
  }

  const slotList = Object.values(slotGrouping).sort((a, b) => {
    const timeDiff = (a.firstStartTime || "").localeCompare(
      b.firstStartTime || "",
    );
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return (a.label || "").localeCompare(b.label || "");
  });

  const totalUniqueCourseAssignments = slotList.reduce(
    (acc, slot) => acc + slot.courses.length,
    0,
  );

  return (
    <Paper
      sx={{
        width: "100%",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          background:
            "linear-gradient(180deg, rgba(248,250,252,0.7) 0%, rgba(255,255,255,1) 100%)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Slot Allocation Overview
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {slotList.length} slots with {totalUniqueCourseAssignments} total
          course assignments
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(248, 250, 252, 0.9)" }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "20%",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                Slot
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "22%",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                Days & Time
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                Courses Assigned
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {slotList.map((slot) => (
              <TableRow
                key={slot.slotId}
                sx={{
                  transition: "background-color 0.18s ease",
                  "&:hover": { backgroundColor: "rgba(2, 6, 23, 0.02)" },
                  "& td": { borderBottom: "1px solid rgba(15, 23, 42, 0.06)" },
                  "&:last-child td": { borderBottom: "none" },
                }}
              >
                <TableCell
                  sx={{ fontWeight: 600, verticalAlign: "top", pt: 1.5 }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {slot.label}
                  </Typography>
                </TableCell>

                <TableCell sx={{ verticalAlign: "top", pt: 1.5 }}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {slot.occurrences.map((occurrence, occurrenceIndex) => (
                      <Box
                        key={`${slot.slotId}-${occurrence.day}-${occurrence.startTime}-${occurrenceIndex}`}
                      >
                        <Typography
                          variant="body2"
                          display="block"
                          sx={{ fontWeight: 600, color: "text.primary" }}
                        >
                          📅 {occurrence.day}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                          sx={{ fontSize: "0.74rem" }}
                        >
                          🕒 {occurrence.startTime} - {occurrence.endTime}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </TableCell>

                <TableCell sx={{ verticalAlign: "top", pt: 1.2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      alignItems: "stretch",
                    }}
                  >
                    {slot.courses.map((course, idx) => (
                      <Box
                        key={`${course.courseId || course.courseName}-${idx}`}
                        sx={{
                          minWidth: 190,
                          maxWidth: 280,
                          flex: "1 1 220px",
                          border: "1px solid rgba(15, 23, 42, 0.08)",
                          backgroundColor: "rgba(248, 250, 252, 0.85)",
                          borderRadius: 2,
                          px: 1.25,
                          py: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            lineHeight: 1.35,
                          }}
                        >
                          {course.courseName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{
                            mt: 0.4,
                            display: "block",
                            fontSize: "0.74rem",
                          }}
                        >
                          👤 {course.professorName}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          p: 2,
          backgroundColor: "rgba(248, 250, 252, 0.7)",
          borderTop: "1px solid rgba(15, 23, 42, 0.08)",
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Total assignments: {totalUniqueCourseAssignments} courses across{" "}
          {slotList.length} slots
        </Typography>
      </Box>
    </Paper>
  );
};

export default SlotAllocationView;
