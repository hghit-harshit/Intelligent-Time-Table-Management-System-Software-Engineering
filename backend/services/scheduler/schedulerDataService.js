import Slot from "../../models/Slot.js";
import Course from "../../models/Course.js";
import Professor from "../../models/Professor.js";

export const getSchedulerInputData = async () => {
  const [slotDocs, courses, professors] = await Promise.all([
    Slot.find().lean(),
    Course.find().lean(),
    Professor.find().lean(),
  ]);

  const timeslots = slotDocs.flatMap((slot) =>
    (slot.occurrences || []).map((occurrence) => ({
      _id: occurrence._id,
      day: occurrence.day,
      startTime: occurrence.startTime,
      endTime: occurrence.endTime,
      label: slot.label,
      slotId: slot._id,
    })),
  );

  return { timeslots, courses, professors };
};
