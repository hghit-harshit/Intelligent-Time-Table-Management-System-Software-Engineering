import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { ExamDateWindowModel } from "../src/database/models/examDateWindowModel.js";

const run = async () => {
  try {
    await connectDatabase();
    console.log("Connected to database (exam date window seed)");

    // Deactivate any existing windows
    await ExamDateWindowModel.updateMany({}, { $set: { isActive: false } });
    await ExamDateWindowModel.deleteMany({ "metadata.seed": true });

    // Create a window with dates starting from tomorrow for 5 consecutive days
    const now = new Date();
    const dates = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      d.setHours(0, 0, 0, 0);
      dates.push(d);
    }

    const window = await ExamDateWindowModel.create({
      dates,
      startTime: "08:00",
      endTime: "20:00",
      semester: 1,
      academicYear: "2025-2026",
      isActive: true,
    });

    console.log(`Created exam date window with ${dates.length} dates:`);
    dates.forEach((d) => {
      console.log(
        `  ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`,
      );
    });
    console.log(`Time window: ${window.startTime} – ${window.endTime}`);
  } catch (error) {
    console.error("Error seeding exam date window:", error.message || error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

run();
