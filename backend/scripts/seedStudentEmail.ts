import mongoose from "mongoose";
import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { UserModel } from "../src/database/models/userModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { StudentEnrollmentModel } from "../src/database/models/studentEnrollmentModel.js";

const BATCH = "CS-SY";

const getCoursesForBatch = (batchId: string, courses: any[]): string[] => {
  const batchCourses = courses.filter((c) => c.batchIds?.includes(batchId));
  return batchCourses.map((c) => c._id.toString());
};

const assignRandomCourses = (courseIds: string[], min: number, max: number): string[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...courseIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

import { TimetableResultModel } from "../src/database/models/timetableResultModel.js";

const run = async () => {
  await connectDatabase();

  const student = await UserModel.findOne({ email: "student@gmail.com" }).lean();
  if (!student) {
    throw new Error("Student student@gmail.com not found. Run db-setup first.");
  }

  const timetable = await TimetableResultModel.findOne({ isLatest: true }).lean();
  if (!timetable || !Array.isArray(timetable.assignments)) {
    throw new Error("No latest timetable found. Run seed:faculty-timetable:inside first.");
  }

  // Get unique course codes from the timetable assignments
  const courseCodesInTimetable = Array.from(
    new Set(timetable.assignments.map((a: any) => a.courseCode).filter(Boolean))
  );

  console.log(`Found ${courseCodesInTimetable.length} unique courses in the latest timetable: ${courseCodesInTimetable.join(", ")}`);

  const courses = await CourseModel.find({ code: { $in: courseCodesInTimetable } }).lean();
  
  if (!courses.length) {
    throw new Error("No matching courses found in the database for the timetable.");
  }

  await StudentEnrollmentModel.deleteMany({ studentId: student._id });
  console.log("Cleared existing enrollments for student@gmail.com");

  const enrolledCourseIds = courses.map((c) => new mongoose.Types.ObjectId(c._id as string));

  // Determine a primary batchId from the courses if possible
  const primaryBatch = courses[0]?.batchIds?.[0] || "CS-SY";

  await StudentEnrollmentModel.create({
    studentId: student._id,
    batchId: primaryBatch,
    enrolledCourseIds,
    academicYear: timetable.academicYear || "2025-2026",
    semester: timetable.semester || 1,
  });

  console.log(`\nSeeded student@gmail.com with ${enrolledCourseIds.length} enrollments (courses: ${courses.map(c => c.code).join(", ")})`);
};

run()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Student enrollment seed failed:", error.message);
    await disconnectDatabase();
    process.exit(1);
  });
