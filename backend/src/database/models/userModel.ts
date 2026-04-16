import mongoose from "mongoose";
import { z } from "zod";

export const userRoles = ["admin", "professor", "student"] as const;
export type UserRole = (typeof userRoles)[number];

export const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: userRoles,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "role",
    },
  },
  {
    strict: false,
    timestamps: true,
    collection: "users",
  },
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const UserModel = mongoose.model("User", userSchema);

export const userValidationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(userRoles, { message: "Invalid role" }),
});

export const loginValidationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type User = z.infer<typeof userValidationSchema>;
export type LoginInput = z.infer<typeof loginValidationSchema>;