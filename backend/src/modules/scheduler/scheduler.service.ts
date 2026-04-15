import mongoose from "mongoose";
import { AssignmentModel } from "../../database/models/assignmentModel.js";
import { SoftConstraintViolationModel } from "../../database/models/softConstraintViolationModel.js";
import { TimetableRunModel } from "../../database/models/timetableRunModel.js";
import { AppError } from "../../shared/errors/index.js";
import { schedulerRepository } from "./scheduler.repository.js";
import { runCpSatSolver } from "./solverBridge.js";
import type { SchedulerConstraints } from "./scheduler.types.js";

const SOFT_VIOLATION_REASON: Record<string, string> = {
  sc1_unavailable_slot_violated:
    "Assigned in a professor unavailable or blocked slot.",
  sc2_preferred_day_off_violated:
    "Assigned on professor preferred day off.",
};

const toPositiveNumberOrNull = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const deriveViolationNames = (assignment: any) => {
  if (Array.isArray(assignment?.violations)) {
    return assignment.violations.filter(
      (entry: unknown): entry is string => typeof entry === "string" && !!entry,
    );
  }

  const softViolations = assignment?.softViolations;
  if (!softViolations || typeof softViolations !== "object") {
    return [];
  }

  return Object.entries(softViolations)
    .filter(([, violated]) => Boolean(violated))
    .map(([name]) => name);
};

const getConstraintFlags = (input: SchedulerConstraints = {}) => ({
  hc1_enabled: input.hc1_enabled !== false,
  sc1_enabled: input.sc1_enabled !== false,
  sc2_enabled: input.sc2_enabled !== false,
});

const assignClassroomsGreedy = async (slotAssignments: any[]) => {
  const availableRooms = await schedulerRepository.getRoomsByCapacityDesc();
  if (!availableRooms.length) {
    throw new AppError("No rooms available for classroom assignment", 422);
  }

  const roomBookings = new Map<string, boolean>();
  const assignmentsWithRooms = [];

  for (const assignment of slotAssignments) {
    const { students, day, startTime, endTime } = assignment;

    let bestRoom: any = null;
    let smallestSuitableCapacity = Number.POSITIVE_INFINITY;

    for (const room of availableRooms) {
      if (room.capacity < students) {
        continue;
      }

      const bookingKey = `${room._id}|${day}|${startTime}|${endTime}`;
      if (roomBookings.has(bookingKey)) {
        continue;
      }

      if (room.capacity < smallestSuitableCapacity) {
        smallestSuitableCapacity = room.capacity;
        bestRoom = room;
      }
    }

    if (!bestRoom) {
      assignmentsWithRooms.push({
        ...assignment,
        roomName: "UNASSIGNED",
        roomCapacity: 0,
      });
      continue;
    }

    roomBookings.set(`${bestRoom._id}|${day}|${startTime}|${endTime}`, true);
    assignmentsWithRooms.push({
      ...assignment,
      roomName: bestRoom.name,
      roomCapacity: bestRoom.capacity,
    });
  }

  return assignmentsWithRooms;
};

export const schedulerService = {
  generateSchedule: async (constraintsInput: SchedulerConstraints = {}) => {
    const constraints = getConstraintFlags(constraintsInput);
    const dataset = await schedulerRepository.getSchedulerInputData();

    if (!dataset.slots.length) {
      throw new AppError("No slots found in MongoDB", 400);
    }

    if (!dataset.courses.length) {
      throw new AppError("No courses found in MongoDB", 400);
    }

    if (!dataset.professors.length) {
      throw new AppError("No professors found in MongoDB", 400);
    }

    const solverStartedAt = performance.now();
    const solverResult = await runCpSatSolver({
      constraints,
      ...dataset,
    });
    const runtimeSeconds =
      toPositiveNumberOrNull(solverResult?.runtime) ??
      toPositiveNumberOrNull(solverResult?.stats?.runtime) ??
      Number(((performance.now() - solverStartedAt) / 1000).toFixed(3));

    if (!solverResult.success) {
      throw new AppError(
        solverResult.message || "Unable to generate a feasible schedule",
        422,
      );
    }

    const objectiveValue =
      toPositiveNumberOrNull(
        solverResult?.objectiveValue ?? solverResult?.stats?.objectiveValue,
      ) ?? 0;

    const rawAssignments = Array.isArray(solverResult.assignments)
      ? solverResult.assignments
      : [];

    const session = await mongoose.startSession();

    try {
      let runId = "";
      let totalAssignments = 0;
      let totalSoftViolations = 0;

      await session.withTransaction(async () => {
        const [runDoc] = await TimetableRunModel.create(
          [
            {
              name: `Draft ${new Date().toISOString()}`,
              status: "draft",
              hardConstraintsSatisfied: true,
              objectiveValue,
              runtime: runtimeSeconds,
            },
          ],
          { session },
        );

        runId = String(runDoc._id);

        const assignmentPayload = rawAssignments.map((entry: any) => ({
          runId: runDoc._id,
          courseId: entry.courseId,
          facultyId: entry.facultyId ?? entry.professorId,
          roomId: entry.roomId ?? null,
          slotId: entry.slotId,
          isLocked: false,
          violations: deriveViolationNames(entry),
        }));

        const insertedAssignments = await AssignmentModel.insertMany(
          assignmentPayload,
          {
            session,
            ordered: true,
          },
        );

        totalAssignments = insertedAssignments.length;

        const violationGroups = new Map<
          string,
          Array<{
            assignmentId: mongoose.Types.ObjectId;
            courseId: mongoose.Types.ObjectId;
            slotId: mongoose.Types.ObjectId;
            reason: string;
          }>
        >();

        insertedAssignments.forEach((assignmentDoc, index) => {
          const source = rawAssignments[index] || {};
          const violations = deriveViolationNames(source);

          violations.forEach((constraintName) => {
            const current = violationGroups.get(constraintName) ?? [];
            current.push({
              assignmentId: assignmentDoc._id,
              courseId: assignmentDoc.courseId,
              slotId: assignmentDoc.slotId,
              reason:
                source?.softViolationReasons?.[constraintName] ||
                SOFT_VIOLATION_REASON[constraintName] ||
                `${constraintName} violated`,
            });
            violationGroups.set(constraintName, current);
          });
        });

        const violationDocs = Array.from(violationGroups.entries()).map(
          ([constraintName, violations]) => ({
            runId: runDoc._id,
            constraintName,
            weight: null,
            violationsCount: violations.length,
            violations,
          }),
        );

        if (violationDocs.length > 0) {
          await SoftConstraintViolationModel.insertMany(violationDocs, {
            session,
            ordered: true,
          });
        }

        totalSoftViolations = violationDocs.reduce(
          (sum, item) => sum + (item.violationsCount || 0),
          0,
        );

        await TimetableRunModel.updateOne(
          { _id: runDoc._id },
          {
            $set: {
              totalAssignments,
              totalSoftViolations,
            },
          },
          { session },
        );
      });

      return {
        runId,
        totalAssignments,
        totalSoftViolations,
        objectiveValue,
        runtime: runtimeSeconds,
      };
    } catch {
      throw new Error("Failed to persist solver output");
    } finally {
      await session.endSession();
    }
  },

  assignClassrooms: async (assignments: any[]) => {
    if (!Array.isArray(assignments) || assignments.length === 0) {
      throw new AppError(
        "Slot assignments required. Run slot assignment first.",
        400,
      );
    }

    const assignmentsWithRooms = await assignClassroomsGreedy(assignments);

    return {
      success: true,
      message: "Classroom assignments generated successfully",
      assignments: assignmentsWithRooms,
    };
  },
};
