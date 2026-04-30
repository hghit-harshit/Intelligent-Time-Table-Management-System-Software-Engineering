import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { ExamScheduleModel } from "../src/database/models/examScheduleModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { ProfessorModel } from "../src/database/models/professorModel.js";
import { RoomModel } from "../src/database/models/roomModel.js";
import { ExamDateWindowModel } from "../src/database/models/examDateWindowModel.js";

const run = async () => {
  try {
    await connectDatabase();
    console.log("Connected to database (exam schedules seed)");

    // Get active date window
    const window = await ExamDateWindowModel.findOne({ isActive: true }).lean();

    const courses = await CourseModel.find().limit(14).lean();
    if (!courses.length) {
      throw new Error('No courses found. Run "npm run seed:scheduler-test:inside" first.');
    }

    const professors = await ProfessorModel.find().lean();
    const rooms = await RoomModel.find().sort({ capacity: -1 }).lean();

    // Remove existing exam schedules to avoid duplicates
    await ExamScheduleModel.deleteMany({});
    console.log("Cleared existing exam schedules");

    // Only seed 2 approved exams (to leave room for the request flow)
    const examCourses = courses.slice(3, 5); // Pick courses at index 3 and 4
    const now = Date.now();

    const docs = examCourses.map((c, idx) => {
      // Use date window dates if available, otherwise generate future dates
      let examDate;
      if (window?.dates?.length > idx + 3) {
        examDate = new Date(window.dates[idx + 3]);
      } else {
        examDate = new Date(now + (10 + idx) * 24 * 60 * 60 * 1000);
      }

      // Find professor for this course
      const prof = professors.find((p) =>
        (p.courseMappings || []).some((cid: any) => cid.toString() === c._id.toString()),
      );

      // Find suitable room
      const courseStudents = (c as any).students || 50;
      const room = rooms.find((r) => r.capacity >= courseStudents) || rooms[0];

      const startTimes = ["09:00", "14:00"];
      const endTimes = ["12:00", "17:00"];

      return {
        courseId: c._id,
        courseCode: c.code,
        courseName: c.name,
        examName: "End Semester Exam",
        professorId: prof?._id || null,
        examDate,
        startTime: startTimes[idx % 2],
        endTime: endTimes[idx % 2],
        location: room?.name || "CSE-LH101",
        room: room?.name || "CSE-LH101",
        invigilator: prof?.name || "Dr. Examiner",
        syllabus: ["Unit 1", "Unit 2", "Unit 3", "Unit 4"],
        status: "scheduled",
        semester: 1,
        academicYear: "2025-2026",
        students: courseStudents,
      };
    });

    const result = await ExamScheduleModel.insertMany(docs);
    console.log(`Inserted ${result.length} exam schedule(s):`);
    result.forEach((e) => {
      console.log(
        `  ${e.courseCode} — ${e.examName} on ${new Date(e.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${e.startTime}–${e.endTime} at ${e.room}`,
      );
    });
  } catch (error) {
    console.error("Error seeding exam schedules:", error.message || error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

run();
