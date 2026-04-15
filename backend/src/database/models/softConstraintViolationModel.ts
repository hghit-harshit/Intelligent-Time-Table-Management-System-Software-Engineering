import mongoose from "mongoose";

const softConstraintViolationItemSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
    strict: true,
  },
);

const softConstraintViolationSchema = new mongoose.Schema(
  {
    runId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableRun",
      required: true,
      index: true,
    },
    constraintName: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
    },
    violationsCount: {
      type: Number,
    },
    violations: {
      type: [softConstraintViolationItemSchema],
      default: [],
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);

softConstraintViolationSchema.index({ runId: 1, constraintName: 1 });

export const SoftConstraintViolationModel = mongoose.model(
  "SoftConstraintViolation",
  softConstraintViolationSchema,
);
