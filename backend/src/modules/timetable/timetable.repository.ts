import { AssignmentModel } from "../../database/models/assignmentModel.js";
import { SoftConstraintViolationModel } from "../../database/models/softConstraintViolationModel.js";
import { TimetableRunModel } from "../../database/models/timetableRunModel.js";

export const timetableRepository = {
  findRunById: async (runId: string) => {
    return TimetableRunModel.findById(runId).lean();
  },

  findAssignmentsByRunId: async (runId: string) => {
    return AssignmentModel.find({ runId })
      .populate("courseId", "name code")
      .populate("facultyId", "name")
      .populate("roomId", "name")
      .populate("slotId", "label day startTime occurrences")
      .lean();
  },

  findConstraintViolationsByRunId: async (runId: string) => {
    return SoftConstraintViolationModel.find({ runId })
      .sort({ violationsCount: -1 })
      .lean();
  },
};
