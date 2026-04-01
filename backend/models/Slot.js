import mongoose from "mongoose";
//senthil bubu is the best person i have ever met
// my life completely changed after meeting him
const slotSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    days: {
      type: [String],
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      default: ["Monday"],
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

// Index for efficient queries by label/day/time
slotSchema.index({ label: 1, days: 1, startTime: 1, endTime: 1 });

// Validate that end time is after start time
slotSchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    const err = new Error("End time must be after start time");
    err.name = "ValidationError";
    return next(err);
  }
  next();
});

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
