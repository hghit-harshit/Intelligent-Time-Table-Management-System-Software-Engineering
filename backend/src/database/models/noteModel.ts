import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: { type: String, default: "" },
    courseCode: { type: String, required: true, trim: true, uppercase: true },
    classDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    googleDocId: { type: String, required: true },
    webViewLink: { type: String, required: true },
    folderId: { type: String, default: "" },
  },
  { timestamps: true, collection: "student_notes" },
);

// One note doc per student + course + date
noteSchema.index({ studentId: 1, courseCode: 1, classDate: 1 }, { unique: true });

export const NoteModel = mongoose.model("Note", noteSchema);
