import React, { useMemo, useState } from "react";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search } from "lucide-react";

/**
 * ClassroomAllocationView
 * Displays classroom assignments for each scheduled course
 *
 * Shows: Course Name | Code | Professor | Room | Capacity | Assignment Mode
 */

const ClassroomAllocationView = ({ assignments = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Separate deduplication from filtering for accurate counts
  const deduplicatedAssignments = useMemo(() => {
    if (!assignments || assignments.length === 0) {
      return [];
    }

    // Deduplicate: Keep only first occurrence of each course (by courseId)
    const seenCourseIds = new Set();
    const deduplicated = [];
    
    for (const assignment of assignments) {
      const courseId = assignment.courseId;
      if (!seenCourseIds.has(courseId)) {
        seenCourseIds.add(courseId);
        deduplicated.push(assignment);
      }
    }
    
    return deduplicated;
  }, [assignments]);

  // Then apply search filter on deduplicated results
  const filteredAssignments = useMemo(() => {
    if (!deduplicatedAssignments || deduplicatedAssignments.length === 0) {
      return [];
    }

    if (!searchTerm.trim()) {
      return deduplicatedAssignments;
    }

    const searchLower = searchTerm.toLowerCase();

    return deduplicatedAssignments.filter((assignment) => {
      const courseName = (assignment.courseName || "").toLowerCase();
      const courseCode = (assignment.courseCode || "").toLowerCase();
      const roomName = (assignment.roomName || "").toLowerCase();

      return (
        courseName.includes(searchLower) ||
        courseCode.includes(searchLower) ||
        roomName.includes(searchLower)
      );
    });
  }, [deduplicatedAssignments, searchTerm]);

  const unassignedCount = filteredAssignments.filter(
    (a) => a.roomName === "UNASSIGNED" || !a.roomName,
  ).length;

  if (!assignments || assignments.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: "center" }}>
        <Typography color="textSecondary">
          No classroom assignments available. Run the solver first.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        width: "100%",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: 600,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          background:
            "linear-gradient(180deg, rgba(248,250,252,0.7) 0%, rgba(255,255,255,1) 100%)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Classroom Allocation Overview
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1.5 }}>
          {filteredAssignments.length} / {deduplicatedAssignments.length} assignments
          {unassignedCount > 0 && (
            <Typography component="span" sx={{ color: "warning.main", ml: 1 }}>
              ({unassignedCount} unassigned)
            </Typography>
          )}
        </Typography>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search by course, code, or room..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} style={{ opacity: 0.5 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "0.875rem",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            },
          }}
        />
      </Box>

      {/* Table Container with Scroll */}
      <TableContainer
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(15, 23, 42, 0.05)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(15, 23, 42, 0.15)",
            borderRadius: "4px",
            "&:hover": {
              background: "rgba(15, 23, 42, 0.25)",
            },
          },
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(248, 250, 252, 0.9)" }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "25%",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                Course Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "12%",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                Code
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "20%",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                Professor
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "15%",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                Room
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "14%",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                  textAlign: "center",
                }}
              >
                Capacity
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "14%",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                  textAlign: "center",
                }}
              >
                Students
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  width: "15%",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                  textAlign: "center",
                }}
              >
                Assignment Mode
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAssignments.map((assignment, idx) => {
              const isUnassigned = assignment.roomName === "UNASSIGNED" || !assignment.roomName;
              const isCrowded =
                assignment.students && assignment.roomCapacity
                  ? assignment.students > assignment.roomCapacity * 0.85
                  : false;
              const assignmentMode = assignment.roomAssignmentMode || (isUnassigned ? "unassigned" : "department");
              const assignmentModeLabel =
                assignmentMode === "common-lecture-hall"
                  ? "Common Lecture Hall"
                  : assignmentMode === "department"
                    ? "Department"
                    : "Unassigned";

              return (
                <TableRow
                  key={`${assignment.courseId || idx}-${assignment.roomName}`}
                  sx={{
                    backgroundColor: isUnassigned
                      ? "rgba(245, 127, 23, 0.04)"
                      : isCrowded
                        ? "rgba(25, 118, 210, 0.04)"
                        : "transparent",
                    transition: "background-color 0.18s ease",
                    "&:hover": {
                      backgroundColor: isUnassigned
                        ? "rgba(245, 127, 23, 0.08)"
                        : "rgba(2, 6, 23, 0.02)",
                    },
                    "& td": { borderBottom: "1px solid rgba(15, 23, 42, 0.06)" },
                    "&:last-child td": { borderBottom: "none" },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>
                    {assignment.courseName || "Unknown"}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                    {assignment.courseCode || "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem" }}>
                    {assignment.professorName || "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: isUnassigned ? "warning.main" : "primary.main",
                    }}
                  >
                    {assignment.roomName || "—"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                    {assignment.roomCapacity || "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      color: isCrowded ? "info.main" : "text.primary",
                    }}
                  >
                    {assignment.students || "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      color:
                        assignmentMode === "common-lecture-hall"
                          ? "info.main"
                          : isUnassigned
                            ? "warning.main"
                            : "success.main",
                    }}
                  >
                    {assignmentModeLabel}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredAssignments.length === 0 && (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography color="textSecondary" variant="body2">
            No results matching "{searchTerm}"
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ClassroomAllocationView;
