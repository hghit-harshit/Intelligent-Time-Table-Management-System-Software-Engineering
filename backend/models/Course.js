import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
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
  },
  {
    strict: false,
    timestamps: true,
    collection: "courses",
  },
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
