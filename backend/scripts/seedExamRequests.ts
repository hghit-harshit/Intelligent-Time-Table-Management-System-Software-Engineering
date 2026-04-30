import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { ExamRequestModel } from "../src/database/models/examRequestModel.js";
import { ExamDateWindowModel } from "../src/database/models/examDateWindowModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { ProfessorModel } from "../src/database/models/professorModel.js";
import { RoomModel } from "../src/database/models/roomModel.js";

const run = async () => {
  try {
    await connectDatabase();
    console.log("Connected to database (exam requests seed)");

    // Clear old seeded requests
    await ExamRequestModel.deleteMany({});
    console.log("Cleared existing exam requests");

    // Get active date window
    const window = await ExamDateWindowModel.findOne({ isActive: true }).lean();
    if (!window || !window.dates.length) {
      throw new Error('No active exam date window. Run "npm run seed:exam-window:inside" first.');
    }

    // Get some courses and their professors
    const courses = await CourseModel.find().limit(14).lean();
    if (courses.length < 3) {
      throw new Error('Need at least 3 courses. Run "npm run seed:scheduler-test:inside" first.');
    }

    const professors = await ProfessorModel.find().lean();
    if (!professors.length) {
      throw new Error("No professors found.");
    }

    const rooms = await RoomModel.find().sort({ capacity: -1 }).lean();
    if (!rooms.length) {
      throw new Error("No rooms found.");
    }

    // Create pending requests for 3 courses
    const requestData = [
      {
        courseCode: courses[0].code,
        courseName: courses[0].name,
        courseId: courses[0]._id,
        examName: "End Semester Exam",
        startTime: "09:00",
        endTime: "12:00",
        dateIndex: 0,
      },
      {
        courseCode: courses[1].code,
        courseName: courses[1].name,
        courseId: courses[1]._id,
        examName: "Final Examination",
        startTime: "14:00",
        endTime: "17:00",
        dateIndex: 1,
      },
      {
        courseCode: courses[2].code,
        courseName: courses[2].name,
        courseId: courses[2]._id,
        examName: "End Semester Exam",
        startTime: "10:00",
        endTime: "13:00",
        dateIndex: 2,
      },
    ];

    const requests: any[] = [];

    for (const data of requestData) {
      // Find professor for this course
      const prof = professors.find((p) =>
        (p.courseMappings || []).some((cid: any) => cid.toString() === data.courseId.toString()),
      );

      if (!prof) {
        console.warn(`No professor found for ${data.courseCode}, skipping`);
        continue;
      }

      // Find a suitable room
      const courseStudents = (data as any).students || courses.find((c) => c._id.toString() === data.courseId.toString())?.students || 50;
      const room = rooms.find((r) => r.capacity >= courseStudents) || rooms[0];

      const examDate = new Date(window.dates[data.dateIndex] || window.dates[0]);

      requests.push({
        courseId: data.courseId,
        courseCode: data.courseCode,
        courseName: data.courseName,
        professorId: prof._id,
        professorName: prof.name,
        examName: data.examName,
        examDate,
        startTime: data.startTime,
        endTime: data.endTime,
        venue: room.name,
        students: courseStudents,
        status: "pending",
      });
    }

    if (requests.length > 0) {
      const result = await ExamRequestModel.insertMany(requests);
      console.log(`Inserted ${result.length} pending exam request(s):`);
      result.forEach((r) => {
        console.log(
          `  ${r.courseCode} — ${r.examName} on ${new Date(r.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${r.startTime}–${r.endTime} at ${r.venue}`,
        );
      });
    } else {
      console.log("No requests created (no matching professors found)");
    }
  } catch (error) {
    console.error("Error seeding exam requests:", error.message || error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

run();
