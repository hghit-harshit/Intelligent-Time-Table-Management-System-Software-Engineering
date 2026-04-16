import { BatchCourseRequirementModel } from "../../database/models/batchCourseRequirementModel.js";
import { CourseModel } from "../../database/models/courseModel.js";
import { ProfessorModel } from "../../database/models/professorModel.js";
import { RoomModel } from "../../database/models/roomModel.js";
import { SlotModel } from "../../database/models/slotModel.js";
export const schedulerRepository = {
    getSchedulerInputData: async () => {
        const [slots, courses, professors, rooms, batchCourseRequirements] = await Promise.all([
            SlotModel.find().sort({ label: 1 }).lean(),
            CourseModel.find().lean(),
            ProfessorModel.find().lean(),
            RoomModel.find().lean(),
            BatchCourseRequirementModel.find({
                requirementType: "compulsory",
                active: { $ne: false },
            }).lean(),
        ]);
        return { slots, courses, professors, rooms, batchCourseRequirements };
    },
    getRoomsByCapacityDesc: async () => {
        const rooms = await RoomModel.find().sort({ capacity: -1 }).lean();
        return rooms;
    },
};
