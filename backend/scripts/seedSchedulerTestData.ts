import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { ProfessorModel } from "../src/database/models/professorModel.js";
import { RoomModel } from "../src/database/models/roomModel.js";
import { SlotModel } from "../src/database/models/slotModel.js";

const courseBlueprints = [
  { code: "CSE101", name: "Programming Fundamentals", students: 120 },
  { code: "CSE201", name: "Data Structures", students: 95 },
  { code: "MAT201", name: "Discrete Mathematics", students: 85 },
  { code: "ECE205", name: "Digital Logic Design", students: 70 },
  { code: "CSE303", name: "Database Systems", students: 56 },
  { code: "CSE401", name: "Operating Systems", students: 78 },
  { code: "CSE305", name: "Computer Networks", students: 92 },
  { code: "CSE307", name: "Software Engineering", students: 110 },
  { code: "CSE411", name: "Machine Learning", students: 65 },
  { code: "MAT301", name: "Probability and Statistics", students: 88 },
  { code: "PHY210", name: "Applied Physics", students: 100 },
  { code: "EEE220", name: "Signals and Systems", students: 75 },
  { code: "HUM101", name: "Technical Communication", students: 140 },
  { code: "MGT201", name: "Engineering Economics", students: 130 },
];

const professorBlueprints = [
  {
    name: "Dr. Arun Kumar",
    email: "arun.kumar@demo.edu",
    teaches: ["CSE101", "CSE201"],
    preferredDaysOff: ["Friday"],
    blocked: [
      { day: "Monday", startTime: "09:00" },
      { day: "Wednesday", startTime: "16:00" },
    ],
  },
  {
    name: "Prof. Meera Nair",
    email: "meera.nair@demo.edu",
    teaches: ["MAT201", "ECE205"],
    preferredDaysOff: ["Wednesday"],
    blocked: [
      { day: "Tuesday", startTime: "12:00" },
      { day: "Thursday", startTime: "10:00" },
    ],
  },
  {
    name: "Dr. Sanjay Iyer",
    email: "sanjay.iyer@demo.edu",
    teaches: ["CSE303", "CSE401"],
    preferredDaysOff: ["Monday"],
    blocked: [
      { day: "Friday", startTime: "14:30" },
      { day: "Tuesday", startTime: "09:00" },
    ],
  },
  {
    name: "Dr. Priya Raman",
    email: "priya.raman@demo.edu",
    teaches: ["CSE305", "CSE307"],
    preferredDaysOff: ["Thursday"],
    blocked: [
      { day: "Monday", startTime: "14:30" },
      { day: "Friday", startTime: "10:00" },
    ],
  },
  {
    name: "Prof. Nikhil Verma",
    email: "nikhil.verma@demo.edu",
    teaches: ["CSE411", "MAT301"],
    preferredDaysOff: ["Tuesday"],
    blocked: [
      { day: "Wednesday", startTime: "09:00" },
      { day: "Thursday", startTime: "16:00" },
    ],
  },
  {
    name: "Dr. Kavya Menon",
    email: "kavya.menon@demo.edu",
    teaches: ["PHY210", "EEE220"],
    preferredDaysOff: ["Friday"],
    blocked: [
      { day: "Tuesday", startTime: "11:00" },
      { day: "Monday", startTime: "16:00" },
    ],
  },
  {
    name: "Prof. Rahul Sharma",
    email: "rahul.sharma@demo.edu",
    teaches: ["HUM101", "MGT201"],
    preferredDaysOff: ["Wednesday"],
    blocked: [
      { day: "Thursday", startTime: "12:00" },
      { day: "Friday", startTime: "09:00" },
    ],
  },
];

const roomBlueprints = [
  { name: "LH101", capacity: 150 },
  { name: "LH102", capacity: 140 },
  { name: "LH103", capacity: 120 },
  { name: "LH104", capacity: 110 },
  { name: "LH105", capacity: 95 },
  { name: "LH106", capacity: 85 },
  { name: "CR201", capacity: 70 },
  { name: "CR202", capacity: 65 },
  { name: "CR203", capacity: 60 },
  { name: "CR204", capacity: 55 },
  { name: "SR301", capacity: 45 },
  { name: "SR302", capacity: 42 },
  { name: "SR303", capacity: 38 },
  { name: "SR304", capacity: 35 },
  { name: "SR305", capacity: 32 },
  { name: "SR306", capacity: 30 },
];

const slotLookupKey = (day: string, startTime: string) => `${day}|${startTime}`;

const run = async () => {
  await connectDatabase();

  const slots = await SlotModel.find().lean();
  if (!slots.length) {
    throw new Error('No slots found. Run "npm run seed:slots" first.');
  }

  const slotByKey = new Map(
    slots.flatMap((slot: any) =>
      (slot.occurrences || []).map((occurrence: any) => [
        slotLookupKey(occurrence.day, occurrence.startTime),
        {
          _id: occurrence._id,
          label: slot.label,
          day: occurrence.day,
          startTime: occurrence.startTime,
          endTime: occurrence.endTime,
        },
      ]),
    ),
  );

  const courseDocs: Record<string, any> = {};
  for (const course of courseBlueprints) {
    const doc = await CourseModel.findOneAndUpdate(
      { code: course.code },
      {
        $set: {
          code: course.code,
          name: course.name,
          students: course.students,
          sessionsPerWeek: 1,
          seededBy: "scheduler-test-v2",
        },
      },
      { new: true, upsert: true },
    );
    courseDocs[course.code] = doc;
  }

  for (const room of roomBlueprints) {
    await RoomModel.findOneAndUpdate(
      { name: room.name },
      { $set: room },
      { new: true, upsert: true },
    );
  }

  const professorDocs: any[] = [];
  for (const prof of professorBlueprints) {
    const courseMappings = prof.teaches
      .map((code) => courseDocs[code]?._id)
      .filter(Boolean);
    const unavailableSlotIds = prof.blocked
      .map(
        (entry) =>
          (slotByKey.get(slotLookupKey(entry.day, entry.startTime)) as any)
            ?._id,
      )
      .filter(Boolean);

    const professorDoc = await ProfessorModel.findOneAndUpdate(
      { email: prof.email },
      {
        $set: {
          name: prof.name,
          email: prof.email,
          preferredDaysOff: prof.preferredDaysOff,
          courseMappings,
          availability: {
            unavailableSlotIds,
          },
          seededBy: "scheduler-test-v2",
        },
      },
      { new: true, upsert: true },
    );

    professorDocs.push(professorDoc);
  }

  const professorByCourseCode: Record<string, any[]> = {};
  for (const prof of professorBlueprints) {
    const profDoc = professorDocs.find((item) => item.email === prof.email);
    for (const code of prof.teaches) {
      if (!professorByCourseCode[code]) {
        professorByCourseCode[code] = [];
      }
      professorByCourseCode[code].push(profDoc._id);
    }
  }

  for (const code of Object.keys(courseDocs)) {
    const professorIds = professorByCourseCode[code] || [];
    await CourseModel.updateOne(
      { _id: courseDocs[code]._id },
      {
        $set: {
          professorIds,
          facultyIds: professorIds,
        },
      },
    );
  }

  console.log("Scheduler test data seed completed");
  console.log(`Slots: ${await SlotModel.countDocuments()}`);
  console.log(`Courses: ${await CourseModel.countDocuments()}`);
  console.log(`Professors: ${await ProfessorModel.countDocuments()}`);
  console.log(`Rooms: ${await RoomModel.countDocuments()}`);
};

run()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Scheduler test data seed failed:", error.message);
    await disconnectDatabase();
    process.exit(1);
  });
