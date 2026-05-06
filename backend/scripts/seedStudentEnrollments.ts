import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { UserModel } from "../src/database/models/userModel.js";
import { CourseModel } from "../src/database/models/courseModel.js";
import { StudentEnrollmentModel } from "../src/database/models/studentEnrollmentModel.js";

const BATCHES = [
  "AI24-FY",
  "CS24-FY",
  "EE24-FY",
  "BM24-FY",
  "BT24-FY",
  "CH24-FY",
  "CE24-FY",
  "MA24-FY",
  "ME24-FY",
  "AI22-TY",
  "CS22-TY",
];

// Real student data extracted from rollno.csv (IIT Hyderabad, 2024 & 2022 batches)
const STUDENT_DATA: Array<{ rollNo: string; name: string; batch: string }> = [
  // AI24-FY (Artificial Intelligence, 2024)
  { rollNo: "AI24BTECH11031", name: "Shivram S", batch: "AI24-FY" },
  { rollNo: "AI24BTECH11015", name: "Harshvardhan Patidar", batch: "AI24-FY" },
  { rollNo: "AI24BTECH11030", name: "Shiven Bajpai", batch: "AI24-FY" },
  { rollNo: "AI24BTECH11019", name: "Kotha Pratheek Reddy", batch: "AI24-FY" },
  { rollNo: "AI24BTECH11028", name: "Ronit Ranjan", batch: "AI24-FY" },
  { rollNo: "AI24BTECH11012", name: "Pushkar Gudla", batch: "AI24-FY" },
  // CS24-FY (Computer Science, 2024)
  { rollNo: "CS24BTECH11006", name: "Anant Maheshwary", batch: "CS24-FY" },
  { rollNo: "CS24BTECH11040", name: "Maka Nehith", batch: "CS24-FY" },
  { rollNo: "CS24BTECH11007", name: "Aric Maji", batch: "CS24-FY" },
  { rollNo: "CS24BTECH11005", name: "Akshat Banzal", batch: "CS24-FY" },
  { rollNo: "CS24BTECH11029", name: "H Vasant Kumar", batch: "CS24-FY" },
  { rollNo: "CS24BTECH11030", name: "Harikrishna S", batch: "CS24-FY" },
  // EE24-FY (Electrical Engineering, 2024)
  { rollNo: "EE24BTECH11001", name: "Aditya Tripathy", batch: "EE24-FY" },
  { rollNo: "EE24BTECH11002", name: "Agamjot Singh", batch: "EE24-FY" },
  { rollNo: "EE24BTECH11024", name: "Abhimanyu Koushik", batch: "EE24-FY" },
  { rollNo: "EE24BTECH11003", name: "Akshara Sarma", batch: "EE24-FY" },
  { rollNo: "EE24BTECH11012", name: "Bhavanisankar G S", batch: "EE24-FY" },
  { rollNo: "EE24BTECH11005", name: "Arjun Pavanje", batch: "EE24-FY" },
  // BM24-FY (Biomedical Engineering, 2024)
  { rollNo: "BM24BTECH11001", name: "Nishanth A", batch: "BM24-FY" },
  { rollNo: "BM24BTECH11022", name: "Srijan Sharma", batch: "BM24-FY" },
  { rollNo: "BM24BTECH11012", name: "Mohammed Fazal Ur Rahman", batch: "BM24-FY" },
  { rollNo: "BM24BTECH11002", name: "Aaryan Chaudhari", batch: "BM24-FY" },
  { rollNo: "BM24BTECH11014", name: "N Mithun", batch: "BM24-FY" },
  { rollNo: "BM24BTECH11019", name: "Riva Harsh Mohta", batch: "BM24-FY" },
  // BT24-FY (Biotechnology, 2024)
  { rollNo: "BT24BTECH11023", name: "Shanjai S", batch: "BT24-FY" },
  { rollNo: "BT24BTECH11002", name: "Amogh Kulkarni", batch: "BT24-FY" },
  { rollNo: "BT24BTECH11022", name: "Sach Agarwal", batch: "BT24-FY" },
  { rollNo: "BT24BTECH11007", name: "B Chiranjeevi Adithya", batch: "BT24-FY" },
  { rollNo: "BT24BTECH11024", name: "Vamadev Sundar", batch: "BT24-FY" },
  { rollNo: "BT24BTECH11012", name: "Suhas Gundla", batch: "BT24-FY" },
  // CH24-FY (Chemical Engineering, 2024)
  { rollNo: "CH24BTECH11031", name: "Rahul Joseph Bejoy", batch: "CH24-FY" },
  { rollNo: "CH24BTECH11036", name: "Sheik Muhammad Saadiq", batch: "CH24-FY" },
  { rollNo: "CH24BTECH11042", name: "Vedant Prabhakaran", batch: "CH24-FY" },
  { rollNo: "CH24BTECH11023", name: "Nimish Wadhw", batch: "CH24-FY" },
  { rollNo: "CH24BTECH11003", name: "Adheesh Joshi", batch: "CH24-FY" },
  { rollNo: "CH24BTECH11037", name: "Sheikh Mumin Murtaza", batch: "CH24-FY" },
  // CE24-FY (Civil Engineering, 2024)
  { rollNo: "CE24BTECH11035", name: "Krishna Bahetra", batch: "CE24-FY" },
  { rollNo: "CE24BTECH11042", name: "Nathan Alvares", batch: "CE24-FY" },
  { rollNo: "CE24BTECH11036", name: "Lloyd Roshan", batch: "CE24-FY" },
  { rollNo: "CE24BTECH11010", name: "Atharv Kochar", batch: "CE24-FY" },
  { rollNo: "CE24BTECH11052", name: "Saksham Pandey", batch: "CE24-FY" },
  { rollNo: "CE24BTECH11038", name: "Mohit Choudhary", batch: "CE24-FY" },
  // MA24-FY (Mathematics & Computing, 2024)
  { rollNo: "MA24BTECH11014", name: "Krish Agarwal", batch: "MA24-FY" },
  { rollNo: "MA24BTECH11002", name: "Aaanksh Mallikarjuna", batch: "MA24-FY" },
  { rollNo: "MA24BTECH11024", name: "Munda Tejas Vikas", batch: "MA24-FY" },
  { rollNo: "MA24BTECH11003", name: "Aryan G Bhojwani", batch: "MA24-FY" },
  { rollNo: "MA24BTECH11022", name: "Saransh Yadav", batch: "MA24-FY" },
  { rollNo: "MA24BTECH11017", name: "Nalla Nandan", batch: "MA24-FY" },
  // ME24-FY (Mechanical Engineering, 2024)
  { rollNo: "ME24BTECH11007", name: "Arnav Prashanth", batch: "ME24-FY" },
  { rollNo: "ME24BTECH11004", name: "Aditya Kumar Singh", batch: "ME24-FY" },
  { rollNo: "ME24BTECH11012", name: "Binish Hari B", batch: "ME24-FY" },
  { rollNo: "ME24BTECH11027", name: "Guntha Sai Vedanth", batch: "ME24-FY" },
  { rollNo: "ME24BTECH11010", name: "Bharath S Hegde", batch: "ME24-FY" },
  { rollNo: "ME24BTECH11041", name: "Dhanush Kumar Miriyala", batch: "ME24-FY" },
  // AI22-TY (Artificial Intelligence, 2022)
  { rollNo: "AI22BTECH11001", name: "Aditya Varun V", batch: "AI22-TY" },
  { rollNo: "AI22BTECH11023", name: "Saketh Ram Kumar", batch: "AI22-TY" },
  { rollNo: "AI22BTECH11020", name: "Pranay Pramod", batch: "AI22-TY" },
  { rollNo: "AI22BTECH11031", name: "Yasir Usmani", batch: "AI22-TY" },
  { rollNo: "AI22BTECH11018", name: "Mayank Parasramka", batch: "AI22-TY" },
  { rollNo: "AI22BTECH11002", name: "Arjit Jain", batch: "AI22-TY" },
  // CS22-TY (Computer Science, 2022)
  { rollNo: "CS22BTECH11001", name: "Aarav Sharma", batch: "CS22-TY" },
  { rollNo: "CS22BTECH11023", name: "Siddharth Reddy", batch: "CS22-TY" },
  { rollNo: "CS22BTECH11020", name: "Pranav Kumar", batch: "CS22-TY" },
  { rollNo: "CS22BTECH11031", name: "Vishnu Teja", batch: "CS22-TY" },
  { rollNo: "CS22BTECH11018", name: "Mayank Patel", batch: "CS22-TY" },
  { rollNo: "CS22BTECH11002", name: "Arjun Singh", batch: "CS22-TY" },
];

const generateEmail = (rollNo: string) =>
  `${rollNo.toLowerCase()}@iith.ac.in`;

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

  // Preserve default users; remove only previously seeded students
  await UserModel.deleteMany({ role: "student", email: { $nin: ["student@gmail.com", "es23btech11010@iith.ac.in"] } });
  console.log("Cleared existing students");

  await StudentEnrollmentModel.deleteMany({});
  console.log("Cleared existing enrollments");

  const studentUsers: Array<{ email: string; batchId: string; courseCount: number }> = [];

  for (const studentData of STUDENT_DATA) {
    const email = generateEmail(studentData.rollNo);
    const hashedPassword = await bcrypt.hash("password", 12);

    const userDoc = await UserModel.create({
      firstName: studentData.name.split(" ")[0],
      lastName: studentData.name.split(" ").slice(1).join(" ") || ".",
      email,
      password: hashedPassword,
      role: "student",
      isActive: true,
      rollNo: studentData.rollNo,
    });

    const batchCourseIds = getCoursesForBatch(studentData.batch, courses);

    const enrolledCourseIds = batchCourseIds.length > 0
      ? assignRandomCourses(batchCourseIds, 3, Math.min(5, batchCourseIds.length)).map(
          (id) => new mongoose.Types.ObjectId(id)
        )
      : courses.slice(0, 3).map((c) => new mongoose.Types.ObjectId(c._id.toString()));

    await StudentEnrollmentModel.create({
      studentId: userDoc._id,
      batchId: studentData.batch,
      enrolledCourseIds,
      academicYear: "2025-2026",
      semester: studentData.batch.includes("TY") ? 6 : 2,
    });

    studentUsers.push({ email, batchId: studentData.batch, courseCount: enrolledCourseIds.length });
  }

  // ── Atharva Lohare (named account, always seeded) ────────────────────
  const atharvaUser = await UserModel.findOne({ email: "es23btech11010@iith.ac.in" });
  if (atharvaUser) {
    const existingEnroll = await StudentEnrollmentModel.findOne({ studentId: atharvaUser._id });
    if (!existingEnroll) {
      const atharvaCourseIds = courses
        .filter((c) => ["CS2443", "CS3563", "CS3523", "CS4443", "AI3013"].includes(c.code))
        .map((c) => new mongoose.Types.ObjectId(c._id.toString()));

      await StudentEnrollmentModel.create({
        studentId: atharvaUser._id,
        batchId: "CS22-TY",
        enrolledCourseIds: atharvaCourseIds,
        academicYear: "2025-2026",
        semester: 6,
      });
      console.log(`Created enrollment for Atharva Lohare (${atharvaCourseIds.length} courses)`);
    } else {
      console.log("Atharva enrollment already exists, skipping");
    }
  }

  console.log(`\nSeeded ${studentUsers.length} students with enrollments`);

  const totalEnrollments = await StudentEnrollmentModel.countDocuments();
  console.log(`Total enrollments: ${totalEnrollments}`);

  console.log("\nSample student credentials:");
  console.log("Email: ai24btech11031@iith.ac.in");
  console.log("Password: password");
  console.log("Email: es23btech11010@iith.ac.in");
  console.log("Password: Atharva@1234");
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
