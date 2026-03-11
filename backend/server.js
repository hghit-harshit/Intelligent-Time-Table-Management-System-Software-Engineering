import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import Slot from './models/Slot.js';
import Request from './models/Request.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ==================== Slot Routes ====================

// GET /api/slots - Get all slots
app.get('/api/slots', async (req, res) => {
  try {
    const slots = await Slot.find().sort({ Day: 1, StartTime: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots', error: error.message });
  }
});

// POST /api/slots - Create a new slot
app.post('/api/slots', async (req, res) => {
  try {
    const { StartTime, EndTime, Day } = req.body;

    if (!StartTime || !EndTime || !Day) {
      return res.status(400).json({ message: 'StartTime, EndTime, and Day are required' });
    }

    const slot = new Slot({ StartTime, EndTime, Day });
    await slot.save();

    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ message: 'Error creating slot', error: error.message });
  }
});

// ==================== Request Routes ====================

// GET /api/requests - Get all rescheduling requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('currentSlotId')
      .populate('requestedSlotId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// POST /api/requests - Create a new rescheduling request
app.post('/api/requests', async (req, res) => {
  try {
    const { facultyId, facultyName, currentSlotId, requestedSlotId, reason } = req.body;

    if (!facultyId || !facultyName || !currentSlotId || !requestedSlotId || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const request = new Request({
      facultyId,
      facultyName,
      currentSlotId,
      requestedSlotId,
      reason,
    });
    await request.save();

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: 'Error creating request', error: error.message });
  }
});

// ==================== Server Start ====================

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
