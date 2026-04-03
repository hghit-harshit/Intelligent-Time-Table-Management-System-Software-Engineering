import mongoose from "mongoose";

const occurrenceSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
  },
  {
    _id: true,
  },
);

const slotSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    occurrences: {
      type: [occurrenceSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one occurrence is required",
      },
    },
  },
  {
    timestamps: true,
  },
);

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

slotSchema.pre("validate", function (next) {
  if (!Array.isArray(this.occurrences) || this.occurrences.length === 0) {
    return next();
  }

  for (const occurrence of this.occurrences) {
    if (occurrence.startTime >= occurrence.endTime) {
      const err = new Error(
        "End time must be after start time for each occurrence",
      );
      err.name = "ValidationError";
      return next(err);
    }
  }

  for (let leftIndex = 0; leftIndex < this.occurrences.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < this.occurrences.length;
      rightIndex += 1
    ) {
      const left = this.occurrences[leftIndex];
      const right = this.occurrences[rightIndex];

      if (left.day !== right.day) {
        continue;
      }

      const leftStart = timeToMinutes(left.startTime);
      const leftEnd = timeToMinutes(left.endTime);
      const rightStart = timeToMinutes(right.startTime);
      const rightEnd = timeToMinutes(right.endTime);

      if (leftStart < rightEnd && rightStart < leftEnd) {
        const err = new Error(
          `Occurrences overlap within slot ${this.label} on ${left.day}`,
        );
        err.name = "ValidationError";
        return next(err);
      }
    }
  }

  next();
});

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
