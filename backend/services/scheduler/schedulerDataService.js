import Slot from "../../models/Slot.js";
import Course from "../../models/Course.js";
import Professor from "../../models/Professor.js";

export const getSchedulerInputData = async () => {
  const [slots, courses, professors] = await Promise.all([
    Slot.find().sort({ label: 1 }).lean(),
    Course.find().lean(),
    Professor.find().lean(),
  ]);

  return { slots, courses, professors };
};
