import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    color: {
      type: String,
      default: "#3b82f6",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "notes",
  },
);

noteSchema.index({ studentId: 1, createdAt: -1 });
noteSchema.index({ studentId: 1, courseId: 1 });

export const NoteModel = mongoose.model("Note", noteSchema);
