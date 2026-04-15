import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import { runsRepository } from "./runs.repository.js";

const mapRunSummary = (run: any) => ({
  runId: String(run._id),
  name: run.name,
  status: run.status,
  totalAssignments: run.totalAssignments ?? 0,
  totalSoftViolations: run.totalSoftViolations ?? 0,
  objectiveValue: run.objectiveValue ?? null,
  runtime: run.runtime ?? null,
  createdAt: run.createdAt,
});

export const runsService = {
  getRuns: async () => {
    const runs = await runsRepository.findAllRuns();
    return (runs as any[]).map(mapRunSummary);
  },

  publishRun: async (runId: string) => {
    const run = await runsRepository.findRunById(runId);
    if (!run) {
      throw new AppError("Run not found", 404);
    }

    if ((run as any).status === "published") {
      throw new AppError("Run is already published", 400);
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await runsRepository.unsetPublishedRuns(session);
        await runsRepository.publishRunById(runId, session);
      });
    } finally {
      await session.endSession();
    }

    return {
      runId,
      status: "published",
    };
  },

  setAssignmentLock: async (
    runId: string,
    assignmentId: string,
    locked: boolean,
  ) => {
    const assignment = await runsRepository.findAssignmentByIdInRun(
      runId,
      assignmentId,
    );

    if (!assignment) {
      throw new AppError("Assignment not found", 404);
    }

    await runsRepository.setAssignmentLock(runId, assignmentId, locked);

    return {
      assignmentId,
      isLocked: locked,
    };
  },
};
