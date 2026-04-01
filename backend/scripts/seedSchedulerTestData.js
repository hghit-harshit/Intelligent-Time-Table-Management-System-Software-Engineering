import mongoose from "mongoose";
import dotenv from "dotenv";
import Slot from "../models/Slot.js";
import Course from "../models/Course.js";
import Professor from "../models/Professor.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/timetable";

const COURSE_BLUEPRINTS = [
  { code: "CSE101", name: "Programming Fundamentals" },
  { code: "CSE201", name: "Data Structures" },
  { code: "MAT201", name: "Discrete Mathematics" },
  { code: "ECE205", name: "Digital Logic Design" },
  { code: "CSE303", name: "Database Systems" },
  { code: "CSE401", name: "Operating Systems" },
  { code: "CSE305", name: "Computer Networks" },
  { code: "CSE307", name: "Software Engineering" },
  { code: "CSE411", name: "Machine Learning" },
  { code: "MAT301", name: "Probability and Statistics" },
  { code: "PHY210", name: "Applied Physics" },
  { code: "EEE220", name: "Signals and Systems" },
  { code: "HUM101", name: "Technical Communication" },
  { code: "MGT201", name: "Engineering Economics" },
];

const PROFESSOR_BLUEPRINTS = [
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

const slotLookupKey = (day, startTime) => `${day}|${startTime}`;

async function seedSchedulerTestData() {
  await mongoose.connect(MONGODB_URI);

  const slots = await Slot.find().lean();
  if (!slots.length) {
    throw new Error('No slots found. Run "npm run seed:slots" first.');
  }

  const slotByKey = new Map(
    slots.map((slot) => [slotLookupKey(slot.day, slot.startTime), slot]),
  );

  const courseDocs = {};
  for (const course of COURSE_BLUEPRINTS) {
    const doc = await Course.findOneAndUpdate(
      { code: course.code },
      {
        $set: {
          code: course.code,
          name: course.name,
          seededBy: "scheduler-test-v2",
        },
      },
      { new: true, upsert: true },
    );
    courseDocs[course.code] = doc;
  }

  const professorDocs = [];
  for (const prof of PROFESSOR_BLUEPRINTS) {
    const courseMappings = prof.teaches
      .map((code) => courseDocs[code]?._id)
      .filter(Boolean);

    const unavailableSlotIds = prof.blocked
      .map(
        (entry) =>
          slotByKey.get(slotLookupKey(entry.day, entry.startTime))?._id,
      )
      .filter(Boolean);

    const professorDoc = await Professor.findOneAndUpdate(
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
          seededBy: "scheduler-test-v1",
        },
      },
      { new: true, upsert: true },
    );

    professorDocs.push(professorDoc);
  }

  const professorByCourseCode = {};
  for (const prof of PROFESSOR_BLUEPRINTS) {
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
    await Course.updateOne(
      { _id: courseDocs[code]._id },
      {
        $set: {
          professorIds,
          facultyIds: professorIds,
        },
      },
    );
  }

  const counts = {
    slots: await Slot.countDocuments(),
    courses: await Course.countDocuments(),
    professors: await Professor.countDocuments(),
  };

  console.log("Scheduler test data seed completed");
  console.log(`Slots: ${counts.slots}`);
  console.log(`Courses: ${counts.courses}`);
  console.log(`Professors: ${counts.professors}`);
}

seedSchedulerTestData()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Scheduler test data seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
