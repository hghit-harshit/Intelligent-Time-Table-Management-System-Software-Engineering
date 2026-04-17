import mongoose from "mongoose";

const studentEnrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    batchId: {
      type: String,
      required: true,
      uppercase: true,
    },
    enrolledCourseIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    academicYear: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
    collection: "student_enrollments",
  }
);

studentEnrollmentSchema.index({ studentId: 1, academicYear: 1, semester: 1 }, { unique: true });
studentEnrollmentSchema.index({ batchId: 1 });

export const StudentEnrollmentModel = mongoose.model("StudentEnrollment", studentEnrollmentSchema);