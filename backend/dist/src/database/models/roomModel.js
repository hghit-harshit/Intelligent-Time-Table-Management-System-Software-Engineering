import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
}, {
    strict: false,
    timestamps: true,
    collection: "rooms",
});
export const RoomModel = mongoose.model("Room", roomSchema);
