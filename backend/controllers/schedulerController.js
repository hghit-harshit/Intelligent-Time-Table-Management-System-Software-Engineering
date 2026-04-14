import { getSchedulerInputData } from "../services/scheduler/schedulerDataService.js";
import { runCpSatSolver } from "../services/scheduler/solverBridge.js";
import { assignClassrooms } from "../services/scheduler/classroomAssignmentService.js";

const getConstraintFlags = (input = {}) => ({
  hc1_enabled: input.hc1_enabled !== false,
  sc1_enabled: input.sc1_enabled !== false,
  sc2_enabled: input.sc2_enabled !== false,
});

// STAGE 1: Generate schedule with slot assignments only
export const generateSchedule = async (req, res) => {
  try {
    const constraints = getConstraintFlags(
      req.body?.constraints || req.body || {},
    );
    const dataset = await getSchedulerInputData();

    if (!dataset.slots.length) {
      return res
        .status(400)
        .json({ message: "No slots found in MongoDB" });
    }

    if (!dataset.courses.length) {
      return res.status(400).json({ message: "No courses found in MongoDB" });
    }

    if (!dataset.professors.length) {
      return res
        .status(400)
        .json({ message: "No professors found in MongoDB" });
    }

    const solverResult = await runCpSatSolver({
      constraints,
      ...dataset,
    });

    if (!solverResult.success) {
      return res.status(422).json({
        success: false,
        message:
          solverResult.message || "Unable to generate a feasible schedule",
        diagnostics: solverResult.diagnostics || null,
      });
    }

    return res.json({
      success: true,
      message: "Slot assignments generated successfully",
      constraints,
      stats: solverResult.stats,
      assignments: solverResult.assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to run timetable solver",
      error: error.message,
    });
  }
};

// STAGE 2: Assign classrooms to slot-assigned courses
export const assignClassroomsToSlots = async (req, res) => {
  try {
    const { assignments } = req.body;

    if (!assignments || !Array.isArray(assignments)) {
      return res.status(400).json({
        success: false,
        message: "Slot assignments required. Run slot assignment first.",
      });
    }

    if (assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No slot assignments to assign classrooms to",
      });
    }

    // Run classroom assignment on provided slot assignments
    let assignmentsWithRooms;
    try {
      assignmentsWithRooms = await assignClassrooms(assignments);
    } catch (roomError) {
      console.error("Classroom assignment failed:", roomError.message);
      return res.status(422).json({
        success: false,
        message: "Classroom assignment failed: " + roomError.message,
        diagnostics: { roomError: roomError.message },
      });
    }

    return res.json({
      success: true,
      message: "Classroom assignments generated successfully",
      assignments: assignmentsWithRooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign classrooms",
      error: error.message,
    });
  }
};
