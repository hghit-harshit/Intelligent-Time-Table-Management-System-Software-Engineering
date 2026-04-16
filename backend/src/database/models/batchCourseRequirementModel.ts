import mongoose from "mongoose";

const batchCourseRequirementSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    requirementType: {
      type: String,
      enum: ["compulsory", "elective"],
      default: "compulsory",
      required: true,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "batch_course_requirements",
  },
);

batchCourseRequirementSchema.index(
  { batchId: 1, courseId: 1, semester: 1, academicYear: 1 },
  { unique: true },
);

export const BatchCourseRequirementModel = mongoose.model(
  "BatchCourseRequirement",
  batchCourseRequirementSchema,
);
