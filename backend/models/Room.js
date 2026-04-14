import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
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

const Room = mongoose.model("Room", roomSchema);

export default Room;
