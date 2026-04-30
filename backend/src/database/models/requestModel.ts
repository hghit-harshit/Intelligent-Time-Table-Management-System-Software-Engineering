import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    currentSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      default: null,
    },
    requestedSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      default: null,
    },
    currentSlot: {
      day: { type: String, trim: true },
      time: { type: String, trim: true },
      room: { type: String, trim: true },
    },
    requestedSlot: {
      day: { type: String, trim: true },
      time: { type: String, trim: true },
      room: { type: String, trim: true },
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    conflictStatus: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "requests",
  },
);

export const RequestModel = mongoose.model("Request", requestSchema);
