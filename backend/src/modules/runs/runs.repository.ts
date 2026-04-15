import { AssignmentModel } from "../../database/models/assignmentModel.js";
import { TimetableRunModel } from "../../database/models/timetableRunModel.js";

export const runsRepository = {
  findAllRuns: async () => {
    return TimetableRunModel.find()
      .sort({ createdAt: -1 })
      .select(
        "_id name status totalAssignments totalSoftViolations objectiveValue runtime createdAt",
      )
      .lean();
  },

  findRunById: async (runId: string) => {
    return TimetableRunModel.findById(runId).lean();
  },

  unsetPublishedRuns: async (session?: any) => {
    return TimetableRunModel.updateMany(
      { status: "published" },
      { $set: { status: "draft" } },
      session ? { session } : undefined,
    );
  },

  publishRunById: async (runId: string, session?: any) => {
    return TimetableRunModel.updateOne(
      { _id: runId },
      { $set: { status: "published" } },
      session ? { session } : undefined,
    );
  },

  findAssignmentByIdInRun: async (runId: string, assignmentId: string) => {
    return AssignmentModel.findOne({ _id: assignmentId, runId })
      .select("_id isLocked")
      .lean();
  },

  setAssignmentLock: async (
    runId: string,
    assignmentId: string,
    locked: boolean,
  ) => {
    return AssignmentModel.updateOne(
      { _id: assignmentId, runId },
      { $set: { isLocked: locked } },
    );
  },
};
