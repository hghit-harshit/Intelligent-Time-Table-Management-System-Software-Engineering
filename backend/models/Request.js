import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty ID is required'],
    },
    facultyName: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
    },
    currentSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Current slot is required'],
    },
    requestedSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Requested slot is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for rescheduling is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model('Request', RequestSchema);

export default Request;
