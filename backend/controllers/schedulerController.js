import { getSchedulerInputData } from "../services/scheduler/schedulerDataService.js";
import { runCpSatSolver } from "../services/scheduler/solverBridge.js";

const getConstraintFlags = (input = {}) => ({
  hc1_enabled: input.hc1_enabled !== false,
  sc1_enabled: input.sc1_enabled !== false,
  sc2_enabled: input.sc2_enabled !== false,
});

export const generateSchedule = async (req, res) => {
  try {
    const constraints = getConstraintFlags(
      req.body?.constraints || req.body || {},
    );
    const dataset = await getSchedulerInputData();

    if (!dataset.timeslots.length) {
      return res.status(400).json({ message: "No timeslots found in MongoDB" });
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
      message: "Schedule generated successfully",
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
