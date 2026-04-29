import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  },
);

notificationSchema.index({ studentId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export const NotificationModel = mongoose.model(
  "Notification",
  notificationSchema,
);
