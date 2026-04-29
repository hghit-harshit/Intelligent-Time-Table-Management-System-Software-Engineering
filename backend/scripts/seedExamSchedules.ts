import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { ExamScheduleModel } from "../src/database/models/examScheduleModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";

const run = async () => {
  try {
    await connectDatabase();
    console.log("Connected to database (exam schedules seed)");

    const courses = await CourseModel.find().limit(8).lean();
    if (!courses.length) {
      throw new Error('No courses found. Run "npm run seed:scheduler-test:inside" first.');
    }

    // Remove existing exam schedules for these courses to avoid duplicates
    const courseIds = courses.map((c) => c._id);
    await ExamScheduleModel.deleteMany({ courseId: { $in: courseIds } });

    const now = Date.now();
    const docs = courses.map((c, idx) => {
      const examDate = new Date(now + (7 + idx) * 24 * 60 * 60 * 1000); // spaced by days
      return {
        courseId: c._id,
        courseCode: c.code,
        courseName: c.name,
        examDate,
        startTime: "09:00",
        endTime: "12:00",
        location: "Main Campus",
        room: "CSE-LH101",
        invigilator: "Dr. Examiner",
        syllabus: ["Chapter 1", "Chapter 2", "Chapter 3"],
        status: "scheduled",
        semester: 1,
        academicYear: "2025-2026",
        students: c.students || 0,
      };
    });

    const result = await ExamScheduleModel.insertMany(docs);
    console.log(`Inserted ${result.length} exam schedule(s)`);
  } catch (error) {
    console.error("Error seeding exam schedules:", error.message || error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

run();
