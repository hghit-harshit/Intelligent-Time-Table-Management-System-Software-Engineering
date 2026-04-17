import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { UserModel } from "../src/database/models/userModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { StudentEnrollmentModel } from "../src/database/models/studentEnrollmentModel.js";

const BATCHES = ["CS-FY", "CS-SY", "CS-TY", "EE-FY", "EE-SY", "EE-TY"];

const FIRST_NAMES = [
  "Aarav", "Aanya", "Arjun", "Avni", "Aditya", "Aisha", "Arnav", "Ananya",
  "Aryan", "Aadhira", "Vihaan", "Vanya", "Reyansh", "Riya", "Sai", "Saanvi",
  "Krishna", "Kavya", "Ishaan", "Ira", "Atharv", "Aria", "Dhruv", "Diya",
  "Kabir", "Kiara", "Manav", "Myra", "Nakul", "Navya"
];

const LAST_NAMES = [
  "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Verma", "Reddy", "Rao",
  "Joshi", "Mehta", "Shah", "Khatri", "Nair", "Iyer", "Menon", "Das"
];

const generateEmail = (firstName: string, lastName: string, idx: number) => 
  `${firstName.toLowerCase()}.${lastName.toLowerCase()}${idx}@student.disha.edu`;

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

  const courses = await CourseModel.find().lean();
  if (!courses.length) {
    throw new Error("No courses found. Run seedSchedulerTestData.ts first.");
  }

  console.log(`Found ${courses.length} courses`);

  const existingStudents = await UserModel.find({ role: "student" }).lean();
  if (existingStudents.length >= 30) {
    console.log(`Already have ${existingStudents.length} students. Skipping student creation.`);
    
    const enrollments = await StudentEnrollmentModel.find().lean();
    if (enrollments.length >= 30) {
      console.log(`Already have ${enrollments.length} enrollments. Skipping.`);
      await disconnectDatabase();
      return;
    }
  } else {
    await UserModel.deleteMany({ role: "student" });
    console.log("Cleared existing students");
  }

  await StudentEnrollmentModel.deleteMany({});
  console.log("Cleared existing enrollments");

  const studentUsers: any[] = [];
  let nameIdx = 0;

  for (let b = 0; b < BATCHES.length; b++) {
    const batchId = BATCHES[b];
    const studentsInBatch = b < 5 ? 5 : 5; 

    const batchCourseIds = getCoursesForBatch(batchId, courses);
    console.log(`Batch ${batchId} has ${batchCourseIds.length} courses`);

    for (let i = 0; i < studentsInBatch; i++) {
      if (nameIdx >= FIRST_NAMES.length) break;
      
      const firstName = FIRST_NAMES[nameIdx];
      const lastName = LAST_NAMES[nameIdx % LAST_NAMES.length];
      const email = generateEmail(firstName, lastName, nameIdx + 1);
      const hashedPassword = await bcrypt.hash("password123", 12);

      const userDoc = await UserModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "student",
        isActive: true,
      });

      const enrolledCourseIds = assignRandomCourses(batchCourseIds, 3, 5).map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      await StudentEnrollmentModel.create({
        studentId: userDoc._id,
        batchId,
        enrolledCourseIds,
        academicYear: "2025-2026",
        semester: 1,
      });

      studentUsers.push({ email, batchId, courseCount: enrolledCourseIds.length });
      nameIdx++;
    }
  }

  console.log(`\nSeeded ${studentUsers.length} students with enrollments`);
  
  const totalEnrollments = await StudentEnrollmentModel.countDocuments();
  console.log(`Total enrollments: ${totalEnrollments}`);
  
  console.log("\nSample student credentials:");
  console.log("Email: aarav.sharma1@student.disha.edu");
  console.log("Password: password123");
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