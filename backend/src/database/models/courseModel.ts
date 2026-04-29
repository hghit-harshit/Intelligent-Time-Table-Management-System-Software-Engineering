import mongoose from "mongoose";
import { slotSchema as slotSchemaDefinition } from "./slotModel.js";

const courseSchema = new mongoose.Schema(
  {
    name: String,
    code: String,
    credits: Number,
    department: {
      type: String,
      trim: true,
      uppercase: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    segmentName: {
      type: String,
      trim: true,
    },
    slotSchema: {
      type: slotSchemaDefinition,
      default: null,
    },
    roomNo: {
      type: String,
      trim: true,
    },
    batchIds: [String],
    professorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Professor",
      },
    ],
    sessionsPerWeek: Number,
    students: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    strict: false,
    timestamps: true,
    collection: "courses",
  },
);

export const CourseModel = mongoose.model("Course", courseSchema);
