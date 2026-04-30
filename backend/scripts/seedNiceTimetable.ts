import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { TimetableResultModel } from "../src/database/models/timetableResultModel.js";

const assignments = [
  // ── Monday ────────────────────────────────────────────────────────
  {
    courseCode: "CSE101",
    courseName: "Programming Fundamentals",
    courseDepartment: "CSE",
    professorName: "Dr. Arun Kumar",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    roomName: "CSE-LH102",
    roomCapacity: 140,
    roomDepartment: "CSE",
    students: 120,
    slotLabel: "L1",
  },
  {
    courseCode: "MAT201",
    courseName: "Discrete Mathematics",
    courseDepartment: "MATH",
    professorName: "Prof. Meera Nair",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    roomName: "MATH-CR301",
    roomCapacity: 90,
    roomDepartment: "MATH",
    students: 85,
    slotLabel: "L1",
  },
  {
    courseCode: "CSE201",
    courseName: "Data Structures",
    courseDepartment: "CSE",
    professorName: "Dr. Arun Kumar",
    day: "Monday",
    startTime: "10:00",
    endTime: "11:00",
    roomName: "CSE-LH103",
    roomCapacity: 120,
    roomDepartment: "CSE",
    students: 95,
    slotLabel: "L2",
  },
  {
    courseCode: "ECE205",
    courseName: "Digital Logic Design",
    courseDepartment: "ECE",
    professorName: "Prof. Meera Nair",
    day: "Monday",
    startTime: "11:00",
    endTime: "12:00",
    roomName: "ECE-LH201",
    roomCapacity: 95,
    roomDepartment: "ECE",
    students: 70,
    slotLabel: "L3",
  },
  // ── Tuesday ───────────────────────────────────────────────────────
  {
    courseCode: "CSE101",
    courseName: "Programming Fundamentals",
    courseDepartment: "CSE",
    professorName: "Dr. Arun Kumar",
    day: "Tuesday",
    startTime: "09:00",
    endTime: "10:00",
    roomName: "CSE-LH102",
    roomCapacity: 140,
    roomDepartment: "CSE",
    students: 120,
    slotLabel: "L1",
  },
  {
    courseCode: "MAT201",
    courseName: "Discrete Mathematics",
    courseDepartment: "MATH",
    professorName: "Prof. Meera Nair",
    day: "Tuesday",
    startTime: "10:00",
    endTime: "11:00",
    roomName: "MATH-CR301",
    roomCapacity: 90,
    roomDepartment: "MATH",
    students: 85,
    slotLabel: "L2",
  },
  // ── Wednesday ─────────────────────────────────────────────────────
  {
    courseCode: "CSE201",
    courseName: "Data Structures",
    courseDepartment: "CSE",
    professorName: "Dr. Arun Kumar",
    day: "Wednesday",
    startTime: "09:00",
    endTime: "10:00",
    roomName: "CSE-LH103",
    roomCapacity: 120,
    roomDepartment: "CSE",
    students: 95,
    slotLabel: "L1",
  },
  {
    courseCode: "CSE303",
    courseName: "Database Systems",
    courseDepartment: "CSE",
    professorName: "Dr. Sanjay Iyer",
    day: "Wednesday",
    startTime: "10:00",
    endTime: "11:00",
    roomName: "CSE-SR501",
    roomCapacity: 65,
    roomDepartment: "CSE",
    students: 56,
    slotLabel: "L2",
  },
];

const run = async () => {
  await connectDatabase();

  console.log("Wiping existing published timetables to avoid version conflicts...");
  // Mark any old published versions as false
  await TimetableResultModel.updateMany({ isLatest: true }, { isLatest: false });

  console.log("Seeding a 'nice' Timetable schedule for Bulk Rescheduling tests...");
  const newVersion = `published-${Date.now()}`;
  
  await TimetableResultModel.create({
    version: newVersion,
    status: "published",
    isLatest: true,
    academicYear: "2025-2026",
    semester: 1,
    assignments: assignments,
    generatedAt: new Date(),
    stats: {
      totalAssignments: assignments.length,
      timeslotCount: 20,
      unassignedCourseCount: 0,
      unassignedCourses: [],
      solverDuration: 42.5,
      solverStatus: "OPTIMAL",
    },
    constraints: {},
  });

  console.log(`✅ Successfully seeded published timetable version: ${newVersion}`);
  console.log(`It contains ${assignments.length} assignments spanning Mon-Wed.`);
  console.log("You can now test Bulk Rescheduling workflows!");
};

run()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Nice Timetable seed failed:", error.message);
    await disconnectDatabase();
    process.exit(1);
  });
