import mongoose from "mongoose";

const timeslotSchema = new mongoose.Schema(
  {
    label: String,
    day: String,
    startTime: String,
    endTime: String,
  },
  {
    strict: false,
    timestamps: true,
    collection: "timeslots",
  },
);

timeslotSchema.index({ day: 1, startTime: 1 });

const Timeslot = mongoose.model("Timeslot", timeslotSchema);

export default Timeslot;
