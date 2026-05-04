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

const run = async () => {
  await connectDatabase();

  const student = await UserModel.findOne({ email: "student@gmail.com" }).lean();
  if (!student) {
    throw new Error("Student student@gmail.com not found. Run db-setup first.");
  }

  const courses = await CourseModel.find().lean();
  if (!courses.length) {
    throw new Error("No courses found. Run seedSchedulerTestData.ts first.");
  }

  console.log(`Found ${courses.length} courses`);

  await StudentEnrollmentModel.deleteMany({ studentId: student._id });
  console.log("Cleared existing enrollments for student@gmail.com");

  const batchCourseIds = getCoursesForBatch(BATCH, courses);
  console.log(`Batch ${BATCH} has ${batchCourseIds.length} courses`);

  // If batchCourseIds is empty, just use all courses
  const sourceCourses = batchCourseIds.length > 0 ? batchCourseIds : courses.map(c => c._id.toString());

  const enrolledCourseIds = assignRandomCourses(sourceCourses, 3, 6).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  await StudentEnrollmentModel.create({
    studentId: student._id,
    batchId: BATCH,
    enrolledCourseIds,
    academicYear: "2025-2026",
    semester: 1,
  });

  console.log(`\nSeeded student@gmail.com with ${enrolledCourseIds.length} enrollments in batch ${BATCH}`);
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
