/**
 * Seed a published timetable with classes assigned to the default
 * faculty user "prof@gmail.com" (Dr. Arun Kumar).
 *
 * Usage:
 *   npx tsx scripts/seedFacultyTimetable.ts          (local MongoDB)
 *   docker compose -f docker-compose.dev.yml exec backend npm run seed:faculty-timetable:inside
 */

import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { TimetableResultModel } from "../src/database/models/timetableResultModel.js";
import { UserModel } from "../src/database/models/userModel.js";

const TIMETABLE_VERSION = "v-seed-faculty-v2";

const buildAssignments = (professorName: string) => [
  // ── Monday ────────────────────────────────────────────────
  {
    courseCode: "AI1100",
    courseName: "Artificial Intelligence",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Monday",
    startTime: "09:00",
    endTime: "09:55",
    slotLabel: "Slot A",
    roomName: "LHC-05",
    roomCapacity: 800,
    roomDepartment: "ACADEMIC",
    students: 800,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "AI1110",
    courseName: "Probability and Random Variables",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Monday",
    startTime: "12:00",
    endTime: "12:55",
    slotLabel: "Slot D",
    roomName: "LHC-14",
    roomCapacity: 200,
    roomDepartment: "ACADEMIC",
    students: 200,
    interdisciplinary: true,
    classroomConstraintViolation: false,
  },

  // ── Tuesday ───────────────────────────────────────────────
  {
    courseCode: "AI2100",
    courseName: "Deep Learning",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Tuesday",
    startTime: "14:30",
    endTime: "15:55",
    slotLabel: "Slot R",
    roomName: "LHC-13",
    roomCapacity: 320,
    roomDepartment: "ACADEMIC",
    students: 320,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "AI1013",
    courseName: "Programming for AI",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Tuesday",
    startTime: "10:00",
    endTime: "10:55",
    slotLabel: "Slot B",
    roomName: "LHC-08",
    roomCapacity: 120,
    roomDepartment: "ACADEMIC",
    students: 120,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },

  // ── Wednesday ─────────────────────────────────────────────
  {
    courseCode: "AI1100",
    courseName: "Artificial Intelligence",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Wednesday",
    startTime: "11:00",
    endTime: "11:55",
    slotLabel: "Slot A",
    roomName: "LHC-05",
    roomCapacity: 800,
    roomDepartment: "ACADEMIC",
    students: 800,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "AI3013",
    courseName: "AI for Humanity",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Wednesday",
    startTime: "16:00",
    endTime: "17:25",
    slotLabel: "Slot Q",
    roomName: "LHC-11",
    roomCapacity: 120,
    roomDepartment: "ACADEMIC",
    students: 120,
    interdisciplinary: true,
    classroomConstraintViolation: false,
  },

  // ── Thursday ──────────────────────────────────────────────
  {
    courseCode: "AI1100",
    courseName: "Artificial Intelligence",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Thursday",
    startTime: "10:00",
    endTime: "10:55",
    slotLabel: "Slot A",
    roomName: "LHC-05",
    roomCapacity: 800,
    roomDepartment: "ACADEMIC",
    students: 800,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "AI2100",
    courseName: "Deep Learning",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Thursday",
    startTime: "16:00",
    endTime: "17:25",
    slotLabel: "Slot P",
    roomName: "LHC-13",
    roomCapacity: 320,
    roomDepartment: "ACADEMIC",
    students: 320,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },

  // ── Friday ────────────────────────────────────────────────
  {
    courseCode: "AI1110",
    courseName: "Probability and Random Variables",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Friday",
    startTime: "11:00",
    endTime: "11:55",
    slotLabel: "Slot D",
    roomName: "LHC-14",
    roomCapacity: 200,
    roomDepartment: "ACADEMIC",
    students: 200,
    interdisciplinary: true,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "AI1013",
    courseName: "Programming for AI",
    courseDepartment: "Artificial Intelligence",
    professorName,
    day: "Friday",
    startTime: "09:00",
    endTime: "09:55",
    slotLabel: "Slot E",
    roomName: "LHC-08",
    roomCapacity: 120,
    roomDepartment: "ACADEMIC",
    students: 120,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },

  // ── Some classes for other professors (realistic timetable) ──
  {
    courseCode: "CS2443",
    courseName: "Algorithms",
    courseDepartment: "Computer Science and Engineering",
    professorName: "Dr. N R Aravind",
    day: "Monday",
    startTime: "14:30",
    endTime: "15:55",
    slotLabel: "Slot P",
    roomName: "LHC-14",
    roomCapacity: 200,
    roomDepartment: "ACADEMIC",
    students: 200,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "BM1030",
    courseName: "Bioengineering",
    courseDepartment: "BioMedical Engineering",
    professorName: "Dr. Nagarajan Ganapathy",
    day: "Tuesday",
    startTime: "11:00",
    endTime: "11:55",
    slotLabel: "Slot F",
    roomName: "LHC-12",
    roomCapacity: 200,
    roomDepartment: "ACADEMIC",
    students: 200,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "BT2063",
    courseName: "Molecular and Cellular Biology",
    courseDepartment: "Biotechnology",
    professorName: "Dr. Gunjan Mehta",
    day: "Wednesday",
    startTime: "16:00",
    endTime: "17:25",
    slotLabel: "Slot Q",
    roomName: "LHC-05",
    roomCapacity: 800,
    roomDepartment: "ACADEMIC",
    students: 800,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "CH2190",
    courseName: "Fluid Mechanics",
    courseDepartment: "Chemical Engineering",
    professorName: "Dr. Ranajit Mondal",
    day: "Thursday",
    startTime: "09:00",
    endTime: "09:55",
    slotLabel: "Slot C",
    roomName: "A-Class Room 118",
    roomCapacity: 84,
    roomDepartment: "ACADEMIC",
    students: 84,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "CE2140",
    courseName: "Structural Analysis",
    courseDepartment: "Civil Engineering",
    professorName: "Dr. Biswarup Bhattacharyya",
    day: "Friday",
    startTime: "10:00",
    endTime: "10:55",
    slotLabel: "Slot F",
    roomName: "A-Class Room 118",
    roomCapacity: 84,
    roomDepartment: "ACADEMIC",
    students: 84,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
];

async function seedFacultyTimetable() {
  await connectDatabase();
  console.log("Connected to database");

  // Look up the default faculty user
  const profUser = await UserModel.findOne({ email: "prof@gmail.com" }).lean();
  if (!profUser) {
    console.error(
      'User "prof@gmail.com" not found. Run "npm run db-setup:inside" first.'
    );
    process.exit(1);
  }

  const professorName = `${profUser.firstName} ${profUser.lastName}`;
  console.log(`Found faculty user: ${professorName} (${profUser._id})`);

  const assignments = buildAssignments(professorName);

  // Upsert the timetable — clear previous seed version if any
  // Also unset isLatest on other timetables
  await TimetableResultModel.updateMany(
    { isLatest: true },
    { $set: { isLatest: false } }
  );

  const result = await TimetableResultModel.findOneAndUpdate(
    { version: TIMETABLE_VERSION },
    {
      $set: {
        version: TIMETABLE_VERSION,
        status: "published",
        isLatest: true,
        assignments,
        academicYear: "2025-2026",
        semester: 2,
        stats: {
          totalAssignments: assignments.length,
          timeslotCount: 10,
          unassignedCourseCount: 0,
          unassignedCourses: [],
          solverDuration: 0,
          solverStatus: "seeded",
        },
        constraints: {
          hc1_enabled: true,
          hc2_enabled: true,
          hc3_enabled: true,
          sc1_enabled: true,
          sc2_enabled: true,
        },
        generatedAt: new Date(),
        publishedAt: new Date(),
        generatedBy: profUser._id,
      },
    },
    { upsert: true, new: true }
  );

  console.log(`\nTimetable seeded successfully!`);
  console.log(`  Version:      ${result.version}`);
  console.log(`  Status:       ${result.status}`);
  console.log(`  isLatest:     ${result.isLatest}`);
  console.log(`  Assignments:  ${result.assignments.length}`);
  console.log(
    `  For professor: "${professorName}" (${
      assignments.filter((a) => a.professorName === professorName).length
    } classes)`
  );
  console.log(`\nSchedule for ${professorName}:`);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  for (const day of days) {
    const dayClasses = assignments
      .filter((a) => a.day === day && a.professorName === professorName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (dayClasses.length === 0) continue;
    console.log(`  ${day}:`);
    for (const cls of dayClasses) {
      console.log(
        `    ${cls.startTime}–${cls.endTime}  ${cls.courseName} (${cls.courseCode})  @ ${cls.roomName}`
      );
    }
  }
}

seedFacultyTimetable()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error.message);
    await disconnectDatabase();
    process.exit(1);
  });
