import mongoose from "mongoose";

const timetableAssignmentSchema = new mongoose.Schema(
  {
    courseId: mongoose.Schema.Types.ObjectId,
    courseCode: String,
    courseName: String,
    courseDepartment: String,
    professorId: mongoose.Schema.Types.ObjectId,
    professorName: String,
    batchId: String,
    day: String,
    startTime: String,
    endTime: String,
    slotLabel: String,
    roomName: String,
    roomCapacity: Number,
    roomDepartment: String,
    students: Number,
    interdisciplinary: Boolean,
    classroomConstraintViolation: Boolean,
  },
  { _id: false }
);

const timetableConflictSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["student_conflict", "faculty_conflict", "room_conflict"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["warning", "error"],
      default: "warning",
    },
    description: String,
    courseCode: String,
    courseName: String,
    professorName: String,
    day: String,
    startTime: String,
    endTime: String,
    conflictingCourseCodes: [String],
    conflictingProfessorNames: [String],
    affectedStudents: [String],
    affectedRooms: [String],
  },
  { _id: false }
);

const timetableStatsSchema = new mongoose.Schema(
  {
    totalAssignments: Number,
    timeslotCount: Number,
    unassignedCourseCount: Number,
    unassignedCourses: [String],
    solverDuration: Number,
    solverStatus: String,
  },
  { _id: false }
);

const timetableConstraintsSchema = new mongoose.Schema(
  {
    hc1_enabled: Boolean,
    hc2_enabled: Boolean,
    hc3_enabled: Boolean,
    sc1_enabled: Boolean,
    sc2_enabled: Boolean,
  },
  { _id: false }
);

const timetableResultSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
    },
    academicYear: {
      type: String,
      default: "2025-2026",
    },
    semester: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isLatest: {
      type: Boolean,
      default: false,
      index: true,
    },
    assignments: [timetableAssignmentSchema],
    conflicts: [timetableConflictSchema],
    stats: timetableStatsSchema,
    constraints: timetableConstraintsSchema,
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    publishedAt: Date,
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    commitMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "timetable_results",
  }
);

timetableResultSchema.index({ version: 1 }, { unique: true });
timetableResultSchema.index({ status: 1 });
timetableResultSchema.index({ academicYear: 1, semester: 1 });

export const TimetableResultModel = mongoose.model(
  "TimetableResult",
  timetableResultSchema
);