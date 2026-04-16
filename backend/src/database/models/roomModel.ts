import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    department: {
      type: String,
      trim: true,
      uppercase: true,
    },
    building: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
  },
  {
    strict: false,
    timestamps: true,
    collection: "rooms",
  },
);

export const RoomModel = mongoose.model("Room", roomSchema);
