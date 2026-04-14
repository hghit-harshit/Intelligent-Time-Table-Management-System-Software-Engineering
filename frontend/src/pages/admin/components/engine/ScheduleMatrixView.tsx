// @ts-nocheck
import React, { useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
} from "@mui/material";

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/**
 * ScheduleMatrixView
 * Displays the timetable in a matrix format:
 * - Rows: Time slots
 * - Columns: Days of the week
 * - Cells: Courses scheduled in that slot
 *
 * @param {Array} assignments - Schedule assignments from solver
 * @param {string} title - Optional title for the view
 */
const ScheduleMatrixView = ({
  assignments = [],
  title = "Course Schedule Matrix",
}) => {
  const scheduleMatrix = useMemo(() => {
    if (!assignments || assignments.length === 0) {
      return { slots: [], matrix: {} };
    }

    // Group assignments by day
    const matrix = {};
    const slotTimes = new Set();

    assignments.forEach((assignment) => {
      const day = assignment.day || "Unknown";
      const timeKey = `${assignment.startTime}-${assignment.endTime}`;

      if (!matrix[day]) {
        matrix[day] = {};
      }

      if (!matrix[day][timeKey]) {
        matrix[day][timeKey] = [];
      }

      matrix[day][timeKey].push({
        courseId: assignment.courseId,
        courseName: assignment.courseName,
        professorName: assignment.professorName,
        timeslotId: assignment.timeslotId,
      });

      slotTimes.add(timeKey);
    });

    // Sort time slots
    const sortedSlots = Array.from(slotTimes).sort();

    return { slots: sortedSlots, matrix };
  }, [assignments]);

  const getCellContent = (day, timeKey) => {
    const courses = scheduleMatrix.matrix[day]?.[timeKey] || [];

    if (courses.length === 0) {
      return (
        <Typography variant="caption" color="textDisabled">
          -
        </Typography>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {courses.map((course, idx) => (
          <Box key={idx}>
            <Chip
              label={course.courseName}
              size="small"
              variant="outlined"
              sx={{ maxWidth: "200px" }}
              title={`${course.courseName} (${course.professorName})`}
            />
            <Typography variant="caption" display="block" sx={{ mt: 0.25 }}>
              {course.professorName}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  if (scheduleMatrix.slots.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: "center" }}>
        <Typography color="textSecondary">
          No schedule data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "auto" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      </Box>

      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold", width: "120px" }}>
                Time Slot
              </TableCell>
              {DAYS_ORDER.map((day) => (
                <TableCell
                  key={day}
                  align="center"
                  sx={{ fontWeight: "bold", width: "200px" }}
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {scheduleMatrix.slots.map((timeKey) => (
              <TableRow
                key={timeKey}
                sx={{ "&:hover": { backgroundColor: "#fafafa" } }}
              >
                <TableCell sx={{ fontWeight: "500", fontSize: "0.875rem" }}>
                  {timeKey}
                </TableCell>

                {DAYS_ORDER.map((day) => (
                  <TableCell
                    key={`${day}-${timeKey}`}
                    sx={{
                      backgroundColor:
                        scheduleMatrix.matrix[day]?.[timeKey]?.length > 0
                          ? "#f0f7ff"
                          : "#ffffff",
                      borderRight: "1px solid #e0e0e0",
                      padding: "8px",
                      verticalAlign: "top",
                    }}
                  >
                    {getCellContent(day, timeKey)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          p: 2,
          backgroundColor: "#f9f9f9",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Total assignments: {assignments.length}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ScheduleMatrixView;
