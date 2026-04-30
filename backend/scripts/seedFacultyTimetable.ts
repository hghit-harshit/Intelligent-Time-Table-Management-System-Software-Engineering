/**
 * Seed a published timetable with classes assigned to the default
 * faculty user "prof@gmail.com" (Prof Work).
 *
 * Usage:
 *   npx tsx scripts/seedFacultyTimetable.ts          (local MongoDB)
 *   docker compose -f docker-compose.dev.yml exec backend npm run seed:faculty-timetable:inside
 */

import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { TimetableResultModel } from "../src/database/models/timetableResultModel.js";
import { UserModel } from "../src/database/models/userModel.js";

const TIMETABLE_VERSION = "v-seed-faculty";

const buildAssignments = (professorName: string) => [
  // ── Monday ────────────────────────────────────────────────
  {
    courseCode: "CSE201",
    courseName: "Data Structures",
    courseDepartment: "CSE",
    professorName,
    day: "Monday",
    startTime: "09:00",
    endTime: "09:55",
    slotLabel: "Slot B",
    roomName: "CSE-LH101",
    roomCapacity: 150,
    roomDepartment: "CSE",
    students: 95,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "CSE303",
    courseName: "Database Systems",
    courseDepartment: "CSE",
    professorName,
    day: "Monday",
    startTime: "11:00",
    endTime: "11:55",
    slotLabel: "Slot D",
    roomName: "CSE-LH103",
    roomCapacity: 120,
    roomDepartment: "CSE",
    students: 56,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },

  // ── Tuesday ───────────────────────────────────────────────
  {
    courseCode: "CSE401",
    courseName: "Operating Systems",
    courseDepartment: "CSE",
    professorName,
    day: "Tuesday",
    startTime: "10:00",
    endTime: "10:55",
    slotLabel: "Slot C",
    roomName: "CSE-LH102",
    roomCapacity: 140,
    roomDepartment: "CSE",
    students: 78,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "CSE201",
    courseName: "Data Structures",
    courseDepartment: "CSE",
    professorName,
    day: "Tuesday",
    startTime: "14:00",
    endTime: "14:55",
    slotLabel: "Slot F",
    roomName: "CSE-LH101",
    roomCapacity: 150,
    roomDepartment: "CSE",
    students: 95,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },

  // ── Wednesday ─────────────────────────────────────────────
  {
    courseCode: "CSE305",
    courseName: "Computer Networks",
    courseDepartment: "CSE",
    professorName,
    day: "Wednesday",
    startTime: "09:00",
    endTime: "09:55",
    slotLabel: "Slot B",
    roomName: "CSE-LH104",
    roomCapacity: 110,
    roomDepartment: "CSE",
    students: 92,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "CSE303",
    courseName: "Database Systems",
    courseDepartment: "CSE",
    professorName,
    day: "Wednesday",
    startTime: "11:00",
    endTime: "11:55",
    slotLabel: "Slot D",
    roomName: "CSE-LH103",
    roomCapacity: 120,
    roomDepartment: "CSE",
    students: 56,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },

  // ── Thursday ──────────────────────────────────────────────
  {
    courseCode: "CSE401",
    courseName: "Operating Systems",
    courseDepartment: "CSE",
    professorName,
    day: "Thursday",
    startTime: "10:00",
    endTime: "10:55",
    slotLabel: "Slot C",
    roomName: "CSE-LH102",
    roomCapacity: 140,
    roomDepartment: "CSE",
    students: 78,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "CSE305",
    courseName: "Computer Networks",
    courseDepartment: "CSE",
    professorName,
    day: "Thursday",
    startTime: "15:00",
    endTime: "15:55",
    slotLabel: "Slot G",
    roomName: "CSE-LH104",
    roomCapacity: 110,
    roomDepartment: "CSE",
    students: 92,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },

  // ── Friday ────────────────────────────────────────────────
  {
    courseCode: "CSE201",
    courseName: "Data Structures",
    courseDepartment: "CSE",
    professorName,
    day: "Friday",
    startTime: "09:00",
    endTime: "09:55",
    slotLabel: "Slot B",
    roomName: "CSE-LH101",
    roomCapacity: 150,
    roomDepartment: "CSE",
    students: 95,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "CSE411",
    courseName: "Machine Learning",
    courseDepartment: "CSE",
    professorName,
    day: "Friday",
    startTime: "11:00",
    endTime: "11:55",
    slotLabel: "Slot D",
    roomName: "CSE-SR501",
    roomCapacity: 65,
    roomDepartment: "CSE",
    students: 65,
    interdisciplinary: false,
    classroomConstraintViolation: false,
  },

  // ── Some classes for other professors (realistic timetable) ──
  {
    courseCode: "MAT201",
    courseName: "Discrete Mathematics",
    courseDepartment: "MATH",
    professorName: "Prof. Meera Nair",
    day: "Monday",
    startTime: "10:00",
    endTime: "10:55",
    slotLabel: "Slot C",
    roomName: "MATH-CR301",
    roomCapacity: 90,
    roomDepartment: "MATH",
    students: 85,
    interdisciplinary: true,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "PHY210",
    courseName: "Applied Physics",
    courseDepartment: "PHY",
    professorName: "Dr. Kavya Menon",
    day: "Tuesday",
    startTime: "09:00",
    endTime: "09:55",
    slotLabel: "Slot B",
    roomName: "PHY-CR303",
    roomCapacity: 110,
    roomDepartment: "PHY",
    students: 100,
    interdisciplinary: true,
    classroomConstraintViolation: false,
  },
  {
    courseCode: "HUM101",
    courseName: "Technical Communication",
    courseDepartment: "HUM",
    professorName: "Prof. Rahul Sharma",
    day: "Wednesday",
    startTime: "14:00",
    endTime: "14:55",
    slotLabel: "Slot F",
    roomName: "HUM-SR401",
    roomCapacity: 150,
    roomDepartment: "HUM",
    students: 140,
    interdisciplinary: true,
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
        stats: {
          totalAssignments: assignments.length,
          timeslotCount: 10,
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
