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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * CourseAssignmentView
 * Displays assignments organized by course
 * Shows all the time slots where each course is scheduled
 *
 * @param {Array} assignments - Schedule assignments from solver
 */
const CourseAssignmentView = ({ assignments = [] }) => {
  const groupedAssignments = useMemo(() => {
    const grouped = {};

    assignments.forEach((assignment) => {
      const courseKey = `${assignment.courseId}|${assignment.courseName}`;

      if (!grouped[courseKey]) {
        grouped[courseKey] = {
          courseId: assignment.courseId,
          courseName: assignment.courseName,
          slots: [],
        };
      }

      grouped[courseKey].slots.push({
        day: assignment.day,
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        professorName: assignment.professorName,
        timeslotLabel: assignment.timeslotLabel,
      });
    });

    // Sort each course's slots by day and time
    Object.values(grouped).forEach((course) => {
      const dayOrder = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
      };
      course.slots.sort((a, b) => {
        const dayDiff = (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0);
        if (dayDiff !== 0) return dayDiff;
        return (a.startTime || "").localeCompare(b.startTime || "");
      });
    });

    return Object.values(grouped).sort((a, b) =>
      a.courseName.localeCompare(b.courseName),
    );
  }, [assignments]);

  if (assignments.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: "center" }}>
        <Typography color="textSecondary">
          No schedule data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: "100%" }}>
      <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
        <Typography variant="h6">Course Schedule Assignment</Typography>
        <Typography variant="caption" color="textSecondary">
          {groupedAssignments.length} courses scheduled with{" "}
          {assignments.length} total sessions
        </Typography>
      </Box>

      <Box>
        {groupedAssignments.map((course) => (
          <Accordion key={course.courseId} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <Typography sx={{ fontWeight: "500", flex: 1 }}>
                  {course.courseName}
                </Typography>
                <Chip label={`${course.slots.length} sessions`} size="small" />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Day</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Professor
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {course.slots.map((slot, idx) => (
                      <TableRow
                        key={idx}
                        sx={{ "&:hover": { backgroundColor: "#fafafa" } }}
                      >
                        <TableCell>{slot.day}</TableCell>
                        <TableCell>
                          {slot.startTime} - {slot.endTime}
                        </TableCell>
                        <TableCell>{slot.professorName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Paper>
  );
};

export default CourseAssignmentView;
