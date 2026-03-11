import mongoose from 'mongoose';

const SlotSchema = new mongoose.Schema(
  {
    StartTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    EndTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
    Day: {
      type: String,
      required: [true, 'Day is required'],
      trim: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  },
  {
    timestamps: true,
  }
);

const Slot = mongoose.model('Slot', SlotSchema);

export default Slot;
