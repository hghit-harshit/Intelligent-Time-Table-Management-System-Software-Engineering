import mongoose from "mongoose";
const requestSchema = new mongoose.Schema({
    facultyId: {
        type: String,
        required: true,
        trim: true,
    },
    facultyName: {
        type: String,
        required: true,
        trim: true,
    },
    currentSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
        required: true,
    },
    requestedSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    reviewedBy: {
        type: String,
        default: null,
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    collection: "requests",
});
export const RequestModel = mongoose.model("Request", requestSchema);
//# sourceMappingURL=requestModel.js.map