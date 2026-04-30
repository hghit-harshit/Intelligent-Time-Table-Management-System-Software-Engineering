import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    courseCode: {
      type: String,
      trim: true,
    },
    courseName: {
      type: String,
      trim: true,
    },
    examName: {
      type: String,
      trim: true,
      default: "End Semester Exam",
    },
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
    },
    examDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    room: {
      type: String,
      trim: true,
    },
    invigilator: {
      type: String,
      trim: true,
    },
    syllabus: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["scheduled", "conflict", "draft", "completed"],
      default: "scheduled",
    },
    score: {
      type: String,
      default: "",
    },
    grade: {
      type: String,
      default: "",
    },
    semester: {
      type: Number,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    students: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "exam_schedules",
  },
);

examScheduleSchema.index({ examDate: 1 });
examScheduleSchema.index({ courseId: 1, courseCode: 1 });

export const ExamScheduleModel = mongoose.model(
  "ExamSchedule",
  examScheduleSchema,
);
