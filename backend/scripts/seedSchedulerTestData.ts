import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { BatchCourseRequirementModel } from "../src/database/models/batchCourseRequirementModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { ProfessorModel } from "../src/database/models/professorModel.js";
import { RoomModel } from "../src/database/models/roomModel.js";
import { SlotModel } from "../src/database/models/slotModel.js";
import { UserModel } from "../src/database/models/userModel.js";

const courseBlueprints = [
  // ── Artificial Intelligence (AI24 — FY) ──────────────────────
  {
    code: "AI1100",
    name: "Artificial Intelligence",
    students: 800,
    department: "Artificial Intelligence",
    batchIds: ["AI24-FY"],
    compulsoryForBatchIds: ["AI24-FY"],
  },
  {
    code: "AI2100",
    name: "Deep Learning",
    students: 320,
    department: "Artificial Intelligence",
    batchIds: ["AI24-FY"],
    compulsoryForBatchIds: ["AI24-FY"],
  },
  {
    code: "AI3603",
    name: "Computer Vision",
    students: 120,
    department: "Artificial Intelligence",
    batchIds: ["AI24-FY"],
    compulsoryForBatchIds: [],
  },
  {
    code: "AI1110",
    name: "Probability and Random Variables",
    students: 200,
    department: "Artificial Intelligence",
    batchIds: ["AI24-FY", "CS24-FY"],
    compulsoryForBatchIds: ["AI24-FY"],
  },
  {
    code: "AI1013",
    name: "Programming for AI",
    students: 120,
    department: "Artificial Intelligence",
    batchIds: ["AI24-FY"],
    compulsoryForBatchIds: ["AI24-FY"],
  },
  {
    code: "AI3703",
    name: "Natural Language Processing",
    students: 120,
    department: "Artificial Intelligence",
    batchIds: ["AI22-TY"],
    compulsoryForBatchIds: ["AI22-TY"],
  },
  // ── Computer Science (CS24 — FY, CS22 — TY) ─────────────────
  {
    code: "CS1023",
    name: "Software Development Fundamentals",
    students: 70,
    department: "Computer Science and Engineering",
    batchIds: ["CS24-FY"],
    compulsoryForBatchIds: ["CS24-FY"],
  },
  {
    code: "CS2443",
    name: "Algorithms",
    students: 200,
    department: "Computer Science and Engineering",
    batchIds: ["CS24-FY"],
    compulsoryForBatchIds: ["CS24-FY"],
  },
  {
    code: "CS2030",
    name: "Theory of Computation",
    students: 184,
    department: "Computer Science and Engineering",
    batchIds: ["CS24-FY"],
    compulsoryForBatchIds: ["CS24-FY"],
  },
  {
    code: "CS3563",
    name: "Introduction to DBMS II",
    students: 120,
    department: "Computer Science and Engineering",
    batchIds: ["CS22-TY"],
    compulsoryForBatchIds: ["CS22-TY"],
  },
  {
    code: "CS3523",
    name: "Operating Systems-II",
    students: 120,
    department: "Computer Science and Engineering",
    batchIds: ["CS22-TY"],
    compulsoryForBatchIds: ["CS22-TY"],
  },
  {
    code: "CS4443",
    name: "Software Engineering",
    students: 184,
    department: "Computer Science and Engineering",
    batchIds: ["CS22-TY"],
    compulsoryForBatchIds: ["CS22-TY"],
  },
  {
    code: "CS5290",
    name: "Computer Vision",
    students: 120,
    department: "Computer Science and Engineering",
    batchIds: ["CS22-TY"],
    compulsoryForBatchIds: [],
  },
  // ── Biomedical Engineering (BM24 — FY) ──────────────────────
  {
    code: "BM1030",
    name: "Bioengineering",
    students: 200,
    department: "BioMedical Engineering",
    batchIds: ["BM24-FY"],
    compulsoryForBatchIds: ["BM24-FY"],
  },
  {
    code: "BM2003",
    name: "Introduction to Embedded Systems",
    students: 72,
    department: "BioMedical Engineering",
    batchIds: ["BM24-FY"],
    compulsoryForBatchIds: ["BM24-FY"],
  },
  {
    code: "BM2000",
    name: "Control System",
    students: 24,
    department: "BioMedical Engineering",
    batchIds: ["BM24-FY"],
    compulsoryForBatchIds: ["BM24-FY"],
  },
  // ── Biotechnology (BT24 — FY) ───────────────────────────────
  {
    code: "BT2063",
    name: "Molecular and Cellular Biology",
    students: 800,
    department: "Biotechnology",
    batchIds: ["BT24-FY"],
    compulsoryForBatchIds: ["BT24-FY"],
  },
  {
    code: "BT2023",
    name: "Biostatistics",
    students: 200,
    department: "Biotechnology",
    batchIds: ["BT24-FY"],
    compulsoryForBatchIds: ["BT24-FY"],
  },
  {
    code: "BT2070",
    name: "Biochemical Engineering",
    students: 24,
    department: "Biotechnology",
    batchIds: ["BT24-FY"],
    compulsoryForBatchIds: ["BT24-FY"],
  },
  // ── Chemical Engineering (CH24 — FY) ────────────────────────
  {
    code: "CH1130",
    name: "Chemical Process Calculations",
    students: 70,
    department: "Chemical Engineering",
    batchIds: ["CH24-FY"],
    compulsoryForBatchIds: ["CH24-FY"],
  },
  {
    code: "CH1140",
    name: "Thermodynamic Laws & Phase Transitions",
    students: 320,
    department: "Chemical Engineering",
    batchIds: ["CH24-FY"],
    compulsoryForBatchIds: ["CH24-FY"],
  },
  {
    code: "CH2190",
    name: "Fluid Mechanics",
    students: 84,
    department: "Chemical Engineering",
    batchIds: ["CH24-FY"],
    compulsoryForBatchIds: ["CH24-FY"],
  },
  {
    code: "CH2180",
    name: "Heat Transfer",
    students: 84,
    department: "Chemical Engineering",
    batchIds: ["CH24-FY"],
    compulsoryForBatchIds: ["CH24-FY"],
  },
  // ── Civil Engineering (CE24 — FY) ───────────────────────────
  {
    code: "CE1100",
    name: "Construction Materials",
    students: 84,
    department: "Civil Engineering",
    batchIds: ["CE24-FY"],
    compulsoryForBatchIds: ["CE24-FY"],
  },
  {
    code: "CE2920",
    name: "Surveying",
    students: 84,
    department: "Civil Engineering",
    batchIds: ["CE24-FY"],
    compulsoryForBatchIds: ["CE24-FY"],
  },
  {
    code: "CE2140",
    name: "Structural Analysis",
    students: 84,
    department: "Civil Engineering",
    batchIds: ["CE24-FY"],
    compulsoryForBatchIds: ["CE24-FY"],
  },
  // ── Electrical Engineering (EE24 — FY) ──────────────────────
  {
    code: "EE1010",
    name: "Electrical Circuits",
    students: 150,
    department: "Electrical Engineering",
    batchIds: ["EE24-FY"],
    compulsoryForBatchIds: ["EE24-FY"],
  },
  {
    code: "EE2020",
    name: "Signals and Systems",
    students: 120,
    department: "Electrical Engineering",
    batchIds: ["EE24-FY"],
    compulsoryForBatchIds: ["EE24-FY"],
  },
  // ── Mathematics & Computing (MA24 — FY) ─────────────────────
  {
    code: "MA1010",
    name: "Linear Algebra",
    students: 77,
    department: "Mathematics & Computing",
    batchIds: ["MA24-FY"],
    compulsoryForBatchIds: ["MA24-FY"],
  },
  {
    code: "MA1020",
    name: "Calculus and Differential Equations",
    students: 77,
    department: "Mathematics & Computing",
    batchIds: ["MA24-FY"],
    compulsoryForBatchIds: ["MA24-FY"],
  },
  // ── Mechanical Engineering (ME24 — FY) ──────────────────────
  {
    code: "ME1010",
    name: "Engineering Mechanics",
    students: 100,
    department: "Mechanical Engineering",
    batchIds: ["ME24-FY"],
    compulsoryForBatchIds: ["ME24-FY"],
  },
  {
    code: "ME1020",
    name: "Thermodynamics",
    students: 80,
    department: "Mechanical Engineering",
    batchIds: ["ME24-FY"],
    compulsoryForBatchIds: ["ME24-FY"],
  },
  // ── Chemistry (CY24 — FY) ───────────────────────────────────
  {
    code: "CY1031",
    name: "Chemistry Laboratory",
    students: 90,
    department: "Chemistry",
    batchIds: ["CS24-FY", "EE24-FY", "ME24-FY"],
    compulsoryForBatchIds: ["CS24-FY", "EE24-FY"],
  },
  // ── Common / Interdisciplinary ──────────────────────────────
  {
    code: "AI3013",
    name: "AI for Humanity",
    students: 120,
    department: "Artificial Intelligence",
    batchIds: ["CS22-TY", "AI22-TY"],
    compulsoryForBatchIds: [],
  },
];

const professorBlueprints = [
  {
    name: "Dr. Srijith P K",
    email: "srijith.pk@iith.ac.in",
    teaches: ["AI1100", "AI2100"],
    preferredDaysOff: ["Wednesday"],
    blocked: [
      { day: "Monday", startTime: "16:00" },
      { day: "Thursday", startTime: "14:30" },
    ],
  },
  {
    name: "Dr. Mopuri Konda Reddy",
    email: "mopuri.kr@iith.ac.in",
    teaches: ["AI3603", "CS5290"],
    preferredDaysOff: ["Friday"],
    blocked: [
      { day: "Monday", startTime: "14:30" },
      { day: "Thursday", startTime: "16:00" },
    ],
  },
  {
    name: "Dr. Karthik P N",
    email: "karthik.pn@iith.ac.in",
    teaches: ["AI1013"],
    preferredDaysOff: ["Tuesday"],
    blocked: [{ day: "Friday", startTime: "11:00" }],
  },
  {
    name: "Dr. Vajha Myna",
    email: "vajha.myna@iith.ac.in",
    teaches: ["AI1110"],
    preferredDaysOff: ["Thursday"],
    blocked: [{ day: "Tuesday", startTime: "09:00" }],
  },
  {
    name: "Dr. Maunendra Sankar Desarkar",
    email: "maunendra@iith.ac.in",
    teaches: ["AI3703"],
    preferredDaysOff: ["Wednesday"],
    blocked: [{ day: "Monday", startTime: "16:00" }],
  },
  {
    name: "Dr. Shirshendu Das",
    email: "shirshendu@iith.ac.in",
    teaches: ["CS1023"],
    preferredDaysOff: ["Friday"],
    blocked: [{ day: "Wednesday", startTime: "10:00" }],
  },
  {
    name: "Dr. N R Aravind",
    email: "nr.aravind@iith.ac.in",
    teaches: ["CS2443"],
    preferredDaysOff: ["Monday"],
    blocked: [{ day: "Thursday", startTime: "16:00" }],
  },
  {
    name: "Dr. Nitin Saurabh",
    email: "nitin.saurabh@iith.ac.in",
    teaches: ["CS2030"],
    preferredDaysOff: ["Tuesday"],
    blocked: [{ day: "Wednesday", startTime: "10:00" }],
  },
  {
    name: "Dr. Anupam Sanghi",
    email: "anupam.sanghi@iith.ac.in",
    teaches: ["CS3563"],
    preferredDaysOff: ["Thursday"],
    blocked: [{ day: "Tuesday", startTime: "11:00" }],
  },
  {
    name: "Dr. Abhijit Das",
    email: "abhijit.das@iith.ac.in",
    teaches: ["CS3523"],
    preferredDaysOff: ["Friday"],
    blocked: [{ day: "Tuesday", startTime: "10:00" }],
  },
  {
    name: "Dr. Manish Singh",
    email: "manish.singh@iith.ac.in",
    teaches: ["CS4443"],
    preferredDaysOff: ["Wednesday"],
    blocked: [{ day: "Monday", startTime: "10:00" }],
  },
  {
    name: "Dr. Arun Kumar",
    email: "prof@gmail.com",
    teaches: ["AI3013"],
    preferredDaysOff: ["Friday"],
    blocked: [
      { day: "Monday", startTime: "09:00" },
      { day: "Wednesday", startTime: "16:00" },
    ],
  },
  {
    name: "Dr. Nagarajan Ganapathy",
    email: "nagarajan.g@iith.ac.in",
    teaches: ["BM1030"],
    preferredDaysOff: ["Tuesday"],
    blocked: [{ day: "Monday", startTime: "10:00" }],
  },
  {
    name: "Dr. Avinash Eranki",
    email: "avinash.eranki@iith.ac.in",
    teaches: ["BM2003"],
    preferredDaysOff: ["Thursday"],
    blocked: [{ day: "Friday", startTime: "16:00" }],
  },
  {
    name: "Dr. Mohd Suhail Rizvi",
    email: "suhail.rizvi@iith.ac.in",
    teaches: ["BM2000"],
    preferredDaysOff: ["Wednesday"],
    blocked: [{ day: "Monday", startTime: "10:00" }],
  },
  {
    name: "Dr. Gunjan Mehta",
    email: "gunjan.mehta@iith.ac.in",
    teaches: ["BT2063"],
    preferredDaysOff: ["Monday"],
    blocked: [{ day: "Thursday", startTime: "14:30" }],
  },
  {
    name: "Prof. G Narahari Sastry",
    email: "narahari@iith.ac.in",
    teaches: ["BT2023"],
    preferredDaysOff: ["Friday"],
    blocked: [{ day: "Tuesday", startTime: "11:00" }],
  },
  {
    name: "Dr. Avanthi Althuri",
    email: "avanthi.a@iith.ac.in",
    teaches: ["BT2070"],
    preferredDaysOff: ["Wednesday"],
    blocked: [{ day: "Monday", startTime: "12:00" }],
  },
  {
    name: "Dr. Kishalay Mitra",
    email: "kishalay.m@iith.ac.in",
    teaches: ["CH1130"],
    preferredDaysOff: ["Thursday"],
    blocked: [{ day: "Wednesday", startTime: "10:00" }],
  },
  {
    name: "Dr. Saptarshi Majumdar",
    email: "saptarshi.m@iith.ac.in",
    teaches: ["CH1140"],
    preferredDaysOff: ["Monday"],
    blocked: [{ day: "Thursday", startTime: "09:00" }],
  },
  {
    name: "Dr. Ranajit Mondal",
    email: "ranajit.m@iith.ac.in",
    teaches: ["CH2190"],
    preferredDaysOff: ["Tuesday"],
    blocked: [{ day: "Monday", startTime: "12:00" }],
  },
  {
    name: "Dr. Suhanya Duraiswamy",
    email: "suhanya.d@iith.ac.in",
    teaches: ["CH2180"],
    preferredDaysOff: ["Friday"],
    blocked: [{ day: "Tuesday", startTime: "11:00" }],
  },
  {
    name: "Dr. Meenakshi Sharma",
    email: "meenakshi.s@iith.ac.in",
    teaches: ["CE1100"],
    preferredDaysOff: ["Wednesday"],
    blocked: [{ day: "Monday", startTime: "12:00" }],
  },
  {
    name: "Dr. Biswarup Bhattacharyya",
    email: "biswarup.b@iith.ac.in",
    teaches: ["CE2140"],
    preferredDaysOff: ["Friday"],
    blocked: [{ day: "Tuesday", startTime: "11:00" }],
  },
  {
    name: "Dr. Subhojit Kadia",
    email: "subhojit.k@iith.ac.in",
    teaches: ["CE2920"],
    preferredDaysOff: ["Thursday"],
    blocked: [{ day: "Tuesday", startTime: "12:00" }],
  },
];

const roomBlueprints = [
  { name: "LHC-05", capacity: 800, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-13", capacity: 320, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-14", capacity: 200, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-12", capacity: 200, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-03", capacity: 120, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-08", capacity: 120, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-09", capacity: 72, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-10", capacity: 72, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-01", capacity: 72, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-02", capacity: 72, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-11", capacity: 120, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "LHC-07", capacity: 200, department: "ACADEMIC", building: "Lecture Hall Complex" },
  { name: "A-LH-2", capacity: 184, department: "ACADEMIC", building: "Academic Block A" },
  { name: "A-Class Room 117", capacity: 84, department: "ACADEMIC", building: "Academic Block A" },
  { name: "A-Class Room 118", capacity: 84, department: "ACADEMIC", building: "Academic Block A" },
  { name: "A-Class Room 119", capacity: 108, department: "ACADEMIC", building: "Academic Block A" },
  { name: "A-Class Room 111", capacity: 70, department: "ACADEMIC", building: "Academic Block A" },
  { name: "A-Class Room 112", capacity: 80, department: "ACADEMIC", building: "Academic Block A" },
  { name: "CSE-LH-01", capacity: 70, department: "CSE", building: "CSE Block" },
  { name: "CSE-LH-02", capacity: 70, department: "CSE", building: "CSE Block" },
  { name: "CSE-LH-03", capacity: 70, department: "CSE", building: "CSE Block" },
  { name: "BT/BM-118", capacity: 60, department: "BT/BM", building: "Biotech/Biomedical Block" },
  { name: "BT/BM-010", capacity: 24, department: "BT/BM", building: "Biotech/Biomedical Block" },
  { name: "BT/BM-009", capacity: 24, department: "BT/BM", building: "Biotech/Biomedical Block" },
  { name: "CY-LH-1", capacity: 30, department: "CHEMISTRY", building: "Chemistry Block" },
  { name: "CY-LH-2", capacity: 40, department: "CHEMISTRY", building: "Chemistry Block" },
  { name: "CY-LH-3", capacity: 90, department: "CHEMISTRY", building: "Chemistry Block" },
  { name: "MSME-LH-2", capacity: 60, department: "ACADEMIC", building: "MSME Block" },
  { name: "B-Class Room 105", capacity: 32, department: "ACADEMIC", building: "Academic Block B" },
  { name: "C-LH-7", capacity: 70, department: "ACADEMIC", building: "Academic Block C" },
  { name: "C-LH-8", capacity: 40, department: "ACADEMIC", building: "Academic Block C" },
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
          seededBy: "scheduler-test-v3",
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
      semester: 2,
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

  // Find default faculty user to link professor record
  const facultyUser = await UserModel.findOne({ email: "prof@gmail.com" }).lean();

  // Clean up all previously seeded professors to avoid stale/duplicate records
  await ProfessorModel.deleteMany({ seededBy: "scheduler-test-v3" });
  await ProfessorModel.deleteMany({ seededBy: "scheduler-test-v2" });

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

    const updateData: any = {
      name: prof.name,
      email: prof.email,
      preferredDaysOff: prof.preferredDaysOff,
      courseMappings,
      availability: {
        unavailableSlotIds,
      },
      seededBy: "scheduler-test-v3",
    };

    // Link the first professor to the default faculty user
    if (prof.email === "prof@gmail.com" && facultyUser) {
      updateData.userId = facultyUser._id;
    }

    const professorDoc = await ProfessorModel.findOneAndUpdate(
      { email: prof.email },
      { $set: updateData },
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
