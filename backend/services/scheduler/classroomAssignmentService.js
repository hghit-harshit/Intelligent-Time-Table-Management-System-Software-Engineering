import Room from "../../models/Room.js";

/**
 * Greedy classroom assignment algorithm
 * Assigns rooms to scheduled courses based on capacity and time constraints
 *
 * @param {Array} slotAssignments - Results from solver: [{courseId, courseName, professorName, slotId, day, startTime, endTime, students}, ...]
 * @returns {Promise<Array>} - Extended assignments with room info: [..., roomName, roomCapacity]
 */
export const assignClassrooms = async (slotAssignments) => {
  if (!slotAssignments || slotAssignments.length === 0) {
    return [];
  }

  // Fetch all available rooms, sorted by capacity (LARGEST FIRST for better assignment)
  const availableRooms = await Room.find().sort({ capacity: -1 });

  if (availableRooms.length === 0) {
    throw new Error("No rooms available for classroom assignment");
  }

  // Track room bookings: { "roomId|day|startTime|endTime": true }
  const roomBookings = new Map();

  // Result array with room assignments
  const assignmentWithRooms = [];

  // For each course assignment, find suitable room
  for (const assignment of slotAssignments) {
    const { students, day, startTime, endTime } = assignment;

    // Find first available room that:
    // 1. Has capacity >= students
    // 2. Is not booked at this day/time
    // Preference: largest room first (to avoid wasting big rooms on small classes)
    let assignedRoom = null;
    let bestRoom = null;
    let smallestSuitableCapacity = Infinity;

    // Find the smallest room that still fits (best fit)
    for (const room of availableRooms) {
      if (room.capacity < students) {
        continue; // Room too small
      }

      const bookingKey = `${room._id}|${day}|${startTime}|${endTime}`;
      if (roomBookings.has(bookingKey)) {
        continue; // Room already booked at this time
      }

      // Track best fit (smallest room that still fits)
      if (room.capacity < smallestSuitableCapacity) {
        smallestSuitableCapacity = room.capacity;
        bestRoom = room;
      }
    }

    assignedRoom = bestRoom;

    if (!assignedRoom) {
      // No suitable room found, still include in output but mark as unassigned
      console.warn(
        `Warning: No suitable room for course ${assignment.courseName} (${students} students at ${day} ${startTime})`
      );
      assignmentWithRooms.push({
        ...assignment,
        roomName: "UNASSIGNED",
        roomCapacity: 0,
      });
    } else {
      roomBookings.set(
        `${assignedRoom._id}|${day}|${startTime}|${endTime}`,
        true
      );
      assignmentWithRooms.push({
        ...assignment,
        roomName: assignedRoom.name,
        roomCapacity: assignedRoom.capacity,
      });
    }
  }

  return assignmentWithRooms;
};
