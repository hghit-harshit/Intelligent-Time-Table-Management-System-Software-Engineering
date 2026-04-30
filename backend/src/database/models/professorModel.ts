import mongoose from "mongoose";

const professorSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    availability: mongoose.Schema.Types.Mixed,
    courseMappings: [mongoose.Schema.Types.ObjectId],
    preferredDaysOff: [String],
  },
  {
    strict: false,
    timestamps: true,
    collection: "professors",
  },
);

export const ProfessorModel = mongoose.model("Professor", professorSchema);
