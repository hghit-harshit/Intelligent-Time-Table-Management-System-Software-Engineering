import { AppError } from "../../shared/errors/index.js";
import { schedulerRepository } from "./scheduler.repository.js";
import { runCpSatSolver } from "./solverBridge.js";
const getConstraintFlags = (input = {}) => ({
    hc1_enabled: input.hc1_enabled !== false,
    hc2_enabled: input.hc2_enabled !== false,
    hc3_enabled: input.hc3_enabled !== false,
    sc1_enabled: input.sc1_enabled !== false,
    sc2_enabled: input.sc2_enabled !== false,
});
const normalizeDepartment = (value) => {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim().toUpperCase();
};
const extractRoomDepartments = (room) => {
    const values = [
        room.department,
        room.owningDepartment,
        room.buildingDepartment,
        ...(Array.isArray(room.departments) ? room.departments : []),
        ...(Array.isArray(room.allowedDepartments) ? room.allowedDepartments : []),
    ];
    return new Set(values.map(normalizeDepartment).filter(Boolean));
};
const roomAllowedForDepartment = (room, department) => {
    if (!department) {
        return true;
    }
    const roomDepartments = extractRoomDepartments(room);
    if (!roomDepartments.size) {
        return false;
    }
    return roomDepartments.has(department);
};
const isInterdisciplinaryAssignment = (assignment, courseDepartment) => {
    if (assignment.interdisciplinary === true || assignment.isInterdisciplinary === true) {
        return true;
    }
    const rawDepartment = String(assignment.courseDepartment ?? assignment.department ?? "").toUpperCase();
    if (!courseDepartment) {
        return true;
    }
    if (["INTERDISCIPLINARY", "INTER-DISCIPLINARY", "ID"].includes(courseDepartment)) {
        return true;
    }
    return ["/", "&", ","].some((token) => rawDepartment.includes(token));
};
const isCommonLectureHall = (room) => {
    if (room.isCommonLectureHallComplex === true || room.commonLectureHallComplex === true) {
        return true;
    }
    const name = String(room.name ?? "").toUpperCase();
    const building = String(room.building ?? room.complex ?? "").toUpperCase();
    const department = normalizeDepartment(room.department);
    if (department === "COMMON") {
        return true;
    }
    return (building.includes("COMMON LECTURE HALL") ||
        building.includes("CLH") ||
        name.includes("CLH"));
};
const assignClassroomsGreedy = async (slotAssignments) => {
    const availableRooms = await schedulerRepository.getRoomsByCapacityDesc();
    if (!availableRooms.length) {
        throw new AppError("No rooms available for classroom assignment", 422);
    }
    const roomBookings = new Map();
    const assignmentsWithRooms = [];
    for (const assignment of slotAssignments) {
        const { students, day, startTime, endTime } = assignment;
        const courseDepartment = normalizeDepartment(assignment.courseDepartment ?? assignment.department);
        const interdisciplinary = isInterdisciplinaryAssignment(assignment, courseDepartment);
        let bestRoom = null;
        let smallestSuitableCapacity = Number.POSITIVE_INFINITY;
        const tryPickRoom = (predicate) => {
            for (const room of availableRooms) {
                if (!predicate(room)) {
                    continue;
                }
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
        };
        if (!interdisciplinary && courseDepartment) {
            tryPickRoom((room) => roomAllowedForDepartment(room, courseDepartment));
        }
        if (!bestRoom) {
            smallestSuitableCapacity = Number.POSITIVE_INFINITY;
            tryPickRoom((room) => isCommonLectureHall(room));
        }
        if (!bestRoom) {
            assignmentsWithRooms.push({
                ...assignment,
                roomName: "UNASSIGNED",
                roomCapacity: 0,
                roomDepartment: "",
                roomAssignmentMode: "unassigned",
                classroomConstraintViolation: true,
            });
            continue;
        }
        roomBookings.set(`${bestRoom._id}|${day}|${startTime}|${endTime}`, true);
        const roomAssignmentMode = isCommonLectureHall(bestRoom)
            ? "common-lecture-hall"
            : "department";
        assignmentsWithRooms.push({
            ...assignment,
            roomName: bestRoom.name,
            roomCapacity: bestRoom.capacity,
            roomDepartment: normalizeDepartment(bestRoom.department),
            roomAssignmentMode,
            classroomConstraintViolation: false,
        });
    }
    return assignmentsWithRooms;
};
export const schedulerService = {
    generateSchedule: async (constraintsInput = {}) => {
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
        if (!dataset.rooms.length) {
            throw new AppError("No rooms found in MongoDB", 400);
        }
        const solverResult = await runCpSatSolver({
            constraints,
            ...dataset,
        });
        if (!solverResult.success) {
            throw new AppError(solverResult.message || "Unable to generate a feasible schedule", 422);
        }
        return {
            success: true,
            message: "Slot assignments generated successfully",
            constraints,
            stats: solverResult.stats,
            assignments: solverResult.assignments,
        };
    },
    assignClassrooms: async (assignments) => {
        if (!Array.isArray(assignments) || assignments.length === 0) {
            throw new AppError("Slot assignments required. Run slot assignment first.", 400);
        }
        const assignmentsWithRooms = await assignClassroomsGreedy(assignments);
        const unassignedCount = assignmentsWithRooms.filter((item) => item.roomName === "UNASSIGNED").length;
        return {
            success: true,
            message: unassignedCount > 0
                ? `Classroom assignments generated with ${unassignedCount} unassigned entries (no department/common hall room available)`
                : "Classroom assignments generated successfully",
            assignments: assignmentsWithRooms,
        };
    },
};
