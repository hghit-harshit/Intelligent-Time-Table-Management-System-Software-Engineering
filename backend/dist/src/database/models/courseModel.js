import mongoose from "mongoose";
const courseSchema = new mongoose.Schema({
    name: String,
    code: String,
    professorIds: [mongoose.Schema.Types.ObjectId],
    facultyIds: [mongoose.Schema.Types.ObjectId],
    sessionsPerWeek: Number,
    students: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    strict: false,
    timestamps: true,
    collection: "courses",
});
export const CourseModel = mongoose.model("Course", courseSchema);
//# sourceMappingURL=courseModel.js.map