import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
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
  }
);

// Index for efficient queries by day
slotSchema.index({ day: 1, startTime: 1 });

// Validate that end time is after start time
slotSchema.pre('save', function (next) {
  if (this.startTime >= this.endTime) {
    const err = new Error('End time must be after start time');
    err.name = 'ValidationError';
    return next(err);
  }
  next();
});

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;
