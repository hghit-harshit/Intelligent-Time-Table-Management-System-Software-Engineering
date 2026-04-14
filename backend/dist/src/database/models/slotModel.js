import mongoose from "mongoose";
const occurrenceSchema = new mongoose.Schema({
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
}, { _id: true });
const slotSchema = new mongoose.Schema({
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
}, { timestamps: true });
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};
slotSchema.pre("validate", function (next) {
    const occurrences = this.occurrences ?? [];
    for (const occurrence of occurrences) {
        if (occurrence.startTime >= occurrence.endTime) {
            const err = new Error("End time must be after start time for each occurrence");
            err.name = "ValidationError";
            return next(err);
        }
    }
    for (let left = 0; left < occurrences.length; left += 1) {
        for (let right = left + 1; right < occurrences.length; right += 1) {
            const a = occurrences[left];
            const b = occurrences[right];
            if (a.day !== b.day) {
                continue;
            }
            const aStart = timeToMinutes(a.startTime);
            const aEnd = timeToMinutes(a.endTime);
            const bStart = timeToMinutes(b.startTime);
            const bEnd = timeToMinutes(b.endTime);
            if (aStart < bEnd && bStart < aEnd) {
                const err = new Error(`Occurrences overlap within slot ${this.label} on ${a.day}`);
                err.name = "ValidationError";
                return next(err);
            }
        }
    }
    return next();
});
export const SlotModel = mongoose.model("Slot", slotSchema);
