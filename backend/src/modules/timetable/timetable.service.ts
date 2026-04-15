import { AppError } from "../../shared/errors/index.js";
import { timetableRepository } from "./timetable.repository.js";

const DAY_ORDER: Record<string, number> = {
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
};

const normalizeDayOrder = (day: unknown) => {
  if (!day || typeof day !== "string") return Number.POSITIVE_INFINITY;
  return DAY_ORDER[day.trim().toLowerCase()] ?? Number.POSITIVE_INFINITY;
};

const timeToMinutes = (time: unknown) => {
  if (!time || typeof time !== "string") return Number.POSITIVE_INFINITY;
  const parts = time.split(":");
  if (parts.length < 2) return Number.POSITIVE_INFINITY;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return Number.POSITIVE_INFINITY;
  }
  return hours * 60 + minutes;
};

const toId = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    const obj = value as { _id?: unknown };
    return obj._id ? String(obj._id) : "";
  }
  return String(value);
};

const readSlotDisplayFields = (slot: any) => {
  const firstOccurrence = Array.isArray(slot?.occurrences)
    ? slot.occurrences[0]
    : null;

  return {
    label: slot?.label ?? "",
    day: slot?.day ?? firstOccurrence?.day ?? "",
    startTime: slot?.startTime ?? firstOccurrence?.startTime ?? "",
  };
};

export const timetableService = {
  getRunTimetable: async (runId: string) => {
    const run = await timetableRepository.findRunById(runId);
    if (!run) {
      throw new AppError("Timetable run not found", 404);
    }

    const assignments = await timetableRepository.findAssignmentsByRunId(runId);
    const groups = new Map<string, any>();

    for (const assignment of assignments as any[]) {
      const slot = assignment.slotId;
      const slotId = toId(slot);
      const slotDisplay = readSlotDisplayFields(slot);

      if (!groups.has(slotId)) {
        groups.set(slotId, {
          slotId,
          label: slotDisplay.label,
          day: slotDisplay.day,
          startTime: slotDisplay.startTime,
          assignments: [],
          totalAssignments: 0,
          softViolationCount: 0,
        });
      }

      const group = groups.get(slotId);
      const violations = Array.isArray(assignment.violations)
        ? assignment.violations
        : [];

      group.assignments.push({
        assignmentId: String(assignment._id),
        course: {
          id: toId(assignment.courseId),
          name: assignment.courseId?.name ?? "",
          code: assignment.courseId?.code ?? "",
        },
        faculty: {
          id: toId(assignment.facultyId),
          name: assignment.facultyId?.name ?? "",
        },
        room: assignment.roomId
          ? {
              id: toId(assignment.roomId),
              name: assignment.roomId?.name ?? "",
            }
          : null,
        violations,
      });

      group.totalAssignments += 1;
      group.softViolationCount += violations.length;
    }

    const slots = Array.from(groups.values()).sort((left, right) => {
      const dayDiff = normalizeDayOrder(left.day) - normalizeDayOrder(right.day);
      if (dayDiff !== 0) return dayDiff;
      return timeToMinutes(left.startTime) - timeToMinutes(right.startTime);
    });

    return {
      runId,
      slots,
    };
  },

  getRunViolations: async (runId: string) => {
    const constraints = await timetableRepository.findConstraintViolationsByRunId(
      runId,
    );

    const mappedConstraints = (constraints as any[]).map((item) => ({
      constraintName: item.constraintName,
      weight: item.weight,
      violationsCount: item.violationsCount ?? 0,
      violations: Array.isArray(item.violations)
        ? item.violations.map((entry: any) => ({
            assignmentId: entry.assignmentId ? String(entry.assignmentId) : null,
            courseId: entry.courseId ? String(entry.courseId) : null,
            slotId: entry.slotId ? String(entry.slotId) : null,
            reason: entry.reason,
          }))
        : [],
    }));

    const totalViolations = mappedConstraints.reduce(
      (sum, constraint) => sum + (constraint.violationsCount || 0),
      0,
    );

    return {
      runId,
      constraints: mappedConstraints,
      totalViolations,
    };
  },
};
