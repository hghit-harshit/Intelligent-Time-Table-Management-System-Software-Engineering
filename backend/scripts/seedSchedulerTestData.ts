import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { BatchCourseRequirementModel } from "../src/database/models/batchCourseRequirementModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { ProfessorModel } from "../src/database/models/professorModel.js";
import { RoomModel } from "../src/database/models/roomModel.js";
import { SlotModel } from "../src/database/models/slotModel.js";

const courseBlueprints = [
  {
    code: "CSE101",
    name: "Programming Fundamentals",
    students: 120,
    department: "CSE",
    batchIds: ["CS-FY"],
    compulsoryForBatchIds: ["CS-FY"],
  },
  {
    code: "CSE201",
    name: "Data Structures",
    students: 95,
    department: "CSE",
    batchIds: ["CS-SY"],
    compulsoryForBatchIds: ["CS-SY"],
  },
  {
    code: "MAT201",
    name: "Discrete Mathematics",
    students: 85,
    department: "MATH",
    batchIds: ["CS-SY", "EE-SY"],
    compulsoryForBatchIds: ["CS-SY", "EE-SY"],
  },
  {
    code: "ECE205",
    name: "Digital Logic Design",
    students: 70,
    department: "ECE",
    batchIds: ["EE-SY"],
    compulsoryForBatchIds: ["EE-SY"],
  },
  {
    code: "CSE303",
    name: "Database Systems",
    students: 56,
    department: "CSE",
    batchIds: ["CS-TY"],
    compulsoryForBatchIds: ["CS-TY"],
  },
  {
    code: "CSE401",
    name: "Operating Systems",
    students: 78,
    department: "CSE",
    batchIds: ["CS-TY"],
    compulsoryForBatchIds: ["CS-TY"],
  },
  {
    code: "CSE305",
    name: "Computer Networks",
    students: 92,
    department: "CSE",
    batchIds: ["CS-TY"],
    compulsoryForBatchIds: ["CS-TY"],
  },
  {
    code: "CSE307",
    name: "Software Engineering",
    students: 110,
    department: "CSE",
    batchIds: ["CS-TY"],
    compulsoryForBatchIds: ["CS-TY"],
  },
  {
    code: "CSE411",
    name: "Machine Learning",
    students: 65,
    department: "CSE",
    batchIds: ["CS-FY"],
    compulsoryForBatchIds: [],
  },
  {
    code: "MAT301",
    name: "Probability and Statistics",
    students: 88,
    department: "MATH",
    batchIds: ["CS-TY", "EE-TY"],
    compulsoryForBatchIds: ["EE-TY"],
  },
  {
    code: "PHY210",
    name: "Applied Physics",
    students: 100,
    department: "PHY",
    batchIds: ["CS-FY", "EE-FY"],
    compulsoryForBatchIds: ["EE-FY"],
  },
  {
    code: "EEE220",
    name: "Signals and Systems",
    students: 75,
    department: "EEE",
    batchIds: ["EE-SY"],
    compulsoryForBatchIds: ["EE-SY"],
  },
  {
    code: "HUM101",
    name: "Technical Communication",
    students: 140,
    department: "HUM",
    batchIds: ["CS-FY", "EE-FY"],
    compulsoryForBatchIds: ["CS-FY", "EE-FY"],
  },
  {
    code: "MGT201",
    name: "Engineering Economics",
    students: 130,
    department: "MGT",
    batchIds: ["CS-SY", "EE-SY"],
    compulsoryForBatchIds: ["CS-SY"],
  },
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
  { name: "CSE-LH101", capacity: 150, department: "CSE", building: "CSE Block" },
  { name: "CSE-LH102", capacity: 140, department: "CSE", building: "CSE Block" },
  { name: "CSE-LH103", capacity: 120, department: "CSE", building: "CSE Block" },
  { name: "CSE-LH104", capacity: 110, department: "CSE", building: "CSE Block" },
  { name: "ECE-LH201", capacity: 95, department: "ECE", building: "ECE Block" },
  { name: "ECE-LH202", capacity: 85, department: "ECE", building: "ECE Block" },
  { name: "MATH-CR301", capacity: 90, department: "MATH", building: "Science Block" },
  { name: "MATH-CR302", capacity: 70, department: "MATH", building: "Science Block" },
  { name: "PHY-CR303", capacity: 110, department: "PHY", building: "Science Block" },
  { name: "EEE-CR304", capacity: 80, department: "EEE", building: "EEE Block" },
  { name: "HUM-SR401", capacity: 150, department: "HUM", building: "Humanities Block" },
  { name: "MGT-SR402", capacity: 140, department: "MGT", building: "Management Block" },
  { name: "CSE-SR501", capacity: 65, department: "CSE", building: "CSE Block" },
  { name: "ECE-SR502", capacity: 60, department: "ECE", building: "ECE Block" },
  { name: "MATH-SR503", capacity: 50, department: "MATH", building: "Science Block" },
  { name: "EEE-SR504", capacity: 45, department: "EEE", building: "EEE Block" },
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
          department: course.department,
          batchIds: course.batchIds,
          students: course.students,
          sessionsPerWeek: 1,
          seededBy: "scheduler-test-v2",
        },
      },
      { new: true, upsert: true },
    );
    courseDocs[course.code] = doc;
  }

  const requirementDocs = Object.values(courseDocs).flatMap((courseDoc: any) => {
    const courseSeed = courseBlueprints.find((item) => item.code === courseDoc.code);
    const compulsoryForBatchIds = courseSeed?.compulsoryForBatchIds || [];
    return compulsoryForBatchIds.map((batchId) => ({
      batchId,
      courseId: courseDoc._id,
      requirementType: "compulsory" as const,
      academicYear: "2025-2026",
      semester: 1,
      active: true,
    }));
  });

  if (requirementDocs.length) {
    const legacyCourseIds = requirementDocs.map((doc) => doc.courseId);
    const legacyBatchIds = requirementDocs.map((doc) => doc.batchId);

    await BatchCourseRequirementModel.deleteMany({
      courseId: { $in: legacyCourseIds },
      batchId: { $in: legacyBatchIds },
      $or: [
        { semester: null },
        { semester: { $exists: false } },
        { academicYear: null },
        { academicYear: { $exists: false } },
      ],
    });

    await BatchCourseRequirementModel.bulkWrite(
      requirementDocs.map((doc) => ({
        updateOne: {
          filter: {
            batchId: doc.batchId,
            courseId: doc.courseId,
            semester: doc.semester,
            academicYear: doc.academicYear,
          },
          update: {
            $set: {
              requirementType: doc.requirementType,
              active: doc.active,
            },
            $setOnInsert: {
              batchId: doc.batchId,
              courseId: doc.courseId,
              semester: doc.semester,
              academicYear: doc.academicYear,
            },
          },
          upsert: true,
        },
      })),
    );
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
        },
      },
    );
  }

  console.log("Scheduler test data seed completed");
  console.log(`Slots: ${await SlotModel.countDocuments()}`);
  console.log(`Courses: ${await CourseModel.countDocuments()}`);
  console.log(`Professors: ${await ProfessorModel.countDocuments()}`);
  console.log(`Rooms: ${await RoomModel.countDocuments()}`);
  console.log(
    `Batch Course Requirements: ${await BatchCourseRequirementModel.countDocuments()}`,
  );
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
