import mongoose from "mongoose";

const examDateWindowSchema = new mongoose.Schema(
  {
    dates: {
      type: [Date],
      required: true,
      validate: {
        validator(value: unknown) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one exam date is required",
      },
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
      default: "08:00",
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
      default: "20:00",
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    semester: {
      type: Number,
      min: 1,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "exam_date_windows",
  },
);

examDateWindowSchema.index({ isActive: 1 });

export const ExamDateWindowModel = mongoose.model(
  "ExamDateWindow",
  examDateWindowSchema,
);
