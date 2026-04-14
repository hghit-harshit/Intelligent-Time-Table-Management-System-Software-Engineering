import { disconnectDatabase, connectDatabase } from "../src/database/index.js";
import { SlotModel } from "../src/database/models/slotModel.js";

const slotData = [
  { day: "Monday", startTime: "09:00", endTime: "09:55", label: "Slot A" },
  { day: "Monday", startTime: "10:00", endTime: "10:55", label: "Slot B" },
  { day: "Monday", startTime: "11:00", endTime: "11:55", label: "Slot C" },
  { day: "Monday", startTime: "12:00", endTime: "12:55", label: "Slot D" },
  { day: "Monday", startTime: "14:30", endTime: "15:55", label: "Slot P" },
  { day: "Monday", startTime: "16:00", endTime: "17:25", label: "Slot Q" },
  { day: "Tuesday", startTime: "09:00", endTime: "09:55", label: "Slot D" },
  { day: "Tuesday", startTime: "10:00", endTime: "10:55", label: "Slot E" },
  { day: "Tuesday", startTime: "11:00", endTime: "11:55", label: "Slot F" },
  { day: "Tuesday", startTime: "12:00", endTime: "12:55", label: "Slot G" },
  { day: "Tuesday", startTime: "14:30", endTime: "15:55", label: "Slot R" },
  { day: "Tuesday", startTime: "16:00", endTime: "17:25", label: "Slot S" },
  { day: "Wednesday", startTime: "09:00", endTime: "09:55", label: "Slot B" },
  { day: "Wednesday", startTime: "10:00", endTime: "10:55", label: "Slot C" },
  { day: "Wednesday", startTime: "11:00", endTime: "11:55", label: "Slot A" },
  { day: "Wednesday", startTime: "12:00", endTime: "12:55", label: "Slot G" },
  { day: "Wednesday", startTime: "14:30", endTime: "15:55", label: "Slot F" },
  { day: "Wednesday", startTime: "16:00", endTime: "17:25", label: "Challenge Lectures" },
  { day: "Thursday", startTime: "09:00", endTime: "09:55", label: "Slot C" },
  { day: "Thursday", startTime: "10:00", endTime: "10:55", label: "Slot A" },
  { day: "Thursday", startTime: "11:00", endTime: "11:55", label: "Slot B" },
  { day: "Thursday", startTime: "12:00", endTime: "12:55", label: "Slot E" },
  { day: "Thursday", startTime: "14:30", endTime: "15:55", label: "Slot Q" },
  { day: "Thursday", startTime: "16:00", endTime: "17:25", label: "Slot P" },
  { day: "Friday", startTime: "09:00", endTime: "09:55", label: "Slot E" },
  { day: "Friday", startTime: "10:00", endTime: "10:55", label: "Slot F" },
  { day: "Friday", startTime: "11:00", endTime: "11:55", label: "Slot D" },
  { day: "Friday", startTime: "12:00", endTime: "12:55", label: "Slot G" },
  { day: "Friday", startTime: "14:30", endTime: "15:55", label: "Slot S" },
  { day: "Friday", startTime: "16:00", endTime: "17:25", label: "Slot R" },
];

const run = async () => {
  await connectDatabase();
  await SlotModel.deleteMany({});

  const slotsByLabel = new Map<string, Array<{ day: string; startTime: string; endTime: string }>>();

  for (const item of slotData) {
    const existing = slotsByLabel.get(item.label) ?? [];
    existing.push({ day: item.day, startTime: item.startTime, endTime: item.endTime });
    slotsByLabel.set(item.label, existing);
  }

  const docs = Array.from(slotsByLabel.entries()).map(([label, occurrences]) => ({
    label,
    occurrences,
  }));

  await SlotModel.insertMany(docs);
  const count = await SlotModel.countDocuments();
  console.log("Scheduler slots seed completed");
  console.log(`Slots: ${count}`);
};

run()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Scheduler slots seed failed:", error.message);
    await disconnectDatabase();
    process.exit(1);
  });
