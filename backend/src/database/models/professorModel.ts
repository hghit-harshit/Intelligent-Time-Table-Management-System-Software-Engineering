import mongoose from "mongoose";

const professorSchema = new mongoose.Schema(
  {
    name: String,
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
