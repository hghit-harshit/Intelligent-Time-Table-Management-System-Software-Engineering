import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
  },
  {
    collection: "departments",
  },
);

departmentSchema.index({ name: 1 });

departmentSchema.index({ code: 1 }, { unique: true });

export const DepartmentModel = mongoose.model("Department", departmentSchema);
