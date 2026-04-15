import { AppError } from "../../shared/errors/index.js";
import { schedulerRepository } from "./scheduler.repository.js";
import { runCpSatSolver } from "./solverBridge.js";
import type { SchedulerConstraints } from "./scheduler.types.js";

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

    const solverResult = await runCpSatSolver({
      constraints,
      ...dataset,
    });

    if (!solverResult.success) {
      throw new AppError(
        solverResult.message || "Unable to generate a feasible schedule",
        422,
      );
    }

    return {
      success: true,
      message: "Slot assignments generated successfully",
      constraints,
      stats: solverResult.stats,
      assignments: solverResult.assignments,
    };
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
