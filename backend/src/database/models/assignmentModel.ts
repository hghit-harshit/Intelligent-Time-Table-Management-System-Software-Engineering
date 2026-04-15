import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    runId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableRun",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    violations: {
      type: [String],
      default: [],
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);

assignmentSchema.index({ runId: 1, slotId: 1 });

export const AssignmentModel = mongoose.model("Assignment", assignmentSchema);
