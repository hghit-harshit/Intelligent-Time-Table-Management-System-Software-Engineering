import mongoose from "mongoose";

const professorReferenceSchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseCode: { type: String, required: true, trim: true, uppercase: true, index: true },
    kind: { type: String, trim: true, default: "general", index: true },
    day: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { timestamps: true, collection: "professor_references" },
);

professorReferenceSchema.index({ courseCode: 1, day: 1, startTime: 1, createdAt: -1 });

export const ProfessorReferenceModel = mongoose.model("ProfessorReference", professorReferenceSchema);
