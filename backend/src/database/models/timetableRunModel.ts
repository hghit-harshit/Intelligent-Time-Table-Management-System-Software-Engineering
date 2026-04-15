import mongoose from "mongoose";

const timetableRunSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    hardConstraintsSatisfied: {
      type: Boolean,
    },
    objectiveValue: {
      type: Number,
    },
    runtime: {
      type: Number,
    },
    totalAssignments: {
      type: Number,
    },
    totalSoftViolations: {
      type: Number,
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);

export const TimetableRunModel = mongoose.model(
  "TimetableRun",
  timetableRunSchema,
);
