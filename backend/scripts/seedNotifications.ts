import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { NotificationModel } from "../src/database/models/notificationModel.js";
import { UserModel } from "../src/database/models/userModel.js";

const run = async () => {
  try {
    await connectDatabase();
    console.log("Connected to database (notifications seed)");

    // Remove previously-seeded notifications (by metadata flag)
    try {
      await NotificationModel.deleteMany({ "metadata.seed": true });
    } catch (e) {
      // ignore if metadata not present
    }

    const studentEmail = "student@gmail.com";
    const student = await UserModel.findOne({ email: studentEmail }).lean();

    const now = new Date();
    const notifications: any[] = [];

    // Broadcast notification (visible to all)
    notifications.push({
      studentId: null,
      type: "info",
      title: "Welcome to the Timetable",
      message: "The student dashboard is now connected to the database.",
      details: "This notification was seeded for demo purposes.",
      priority: "low",
      isRead: false,
      metadata: { seed: true, createdAt: now.toISOString(), source: "seedNotifications" },
    });

    if (student) {
      notifications.push({
        studentId: student._id,
        type: "assignment",
        title: "New assignment posted",
        message: "Assignment 1 for Database Systems is available.",
        details: "Submit by next Friday.",
        priority: "medium",
        isRead: false,
        metadata: { seed: true, createdAt: now.toISOString(), source: "seedNotifications" },
      });

      notifications.push({
        studentId: student._id,
        type: "exam",
        title: "Exam schedule released",
        message: "Exam schedule for Database Systems is published.",
        details: "Check your exam schedule page for date and time.",
        priority: "high",
        isRead: false,
        metadata: { seed: true, createdAt: now.toISOString(), source: "seedNotifications" },
      });
    } else {
      console.warn(`Student with email ${studentEmail} not found; student-scoped notifications skipped.`);
    }

    const result = await NotificationModel.insertMany(notifications);
    console.log(`Inserted ${result.length} notifications`);
  } catch (error) {
    console.error("Error seeding notifications:", error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

run();
