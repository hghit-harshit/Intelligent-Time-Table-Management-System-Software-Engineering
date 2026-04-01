import Timeslot from "../../models/Timeslot.js";
import Slot from "../../models/Slot.js";
import Course from "../../models/Course.js";
import Professor from "../../models/Professor.js";

export const getSchedulerInputData = async () => {
  const [timeslotDocs, slotDocs, courses, professors] = await Promise.all([
    Timeslot.find().sort({ day: 1, startTime: 1 }).lean(),
    Slot.find().lean(),
    Course.find().lean(),
    Professor.find().lean(),
  ]);

  let timeslots = timeslotDocs.length ? timeslotDocs : slotDocs;

  // Expand slots with multiple days into individual day-time combinations
  timeslots = timeslots.flatMap((slot) => {
    const days = Array.isArray(slot.days) ? slot.days : [slot.day || "Monday"];
    return days.map((day) => ({
      ...slot,
      day,
      originalSlotId: slot._id,
      originalLabel: slot.label,
    }));
  });

  return { timeslots, courses, professors };
};
