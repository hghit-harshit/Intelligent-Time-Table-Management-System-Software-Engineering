import Slot from '../models/Slot.js';

// Get all slots
export const getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find().sort({ day: 1, startTime: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots', error: error.message });
  }
};

// Get single slot by ID
export const getSlotById = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slot', error: error.message });
  }
};

// Check if two time ranges overlap
const hasTimeOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  return s1 < e2 && s2 < e1;
};

// Convert HH:MM to minutes
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check for slot conflicts
const checkConflict = async (day, startTime, endTime, excludeId = null) => {
  const query = { day, _id: { $ne: excludeId } };
  const overlappingSlots = await Slot.find(query);
  
  for (const slot of overlappingSlots) {
    if (hasTimeOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
      return slot;
    }
  }
  return null;
};

// Create new slot
export const createSlot = async (req, res) => {
  try {
    const { label, day, startTime, endTime } = req.body;
    
    // Validate required fields
    if (!label || !day || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check for conflicts
    const conflict = await checkConflict(day, startTime, endTime);
    if (conflict) {
      return res.status(409).json({
        message: 'Time slot conflicts with existing slot',
        conflict: {
          id: conflict._id,
          label: conflict.label,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
        },
      });
    }
    
    const slot = await Slot.create({ label, day, startTime, endTime });
    res.status(201).json(slot);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating slot', error: error.message });
  }
};

// Update slot
export const updateSlot = async (req, res) => {
  try {
    const { label, day, startTime, endTime } = req.body;
    const { id } = req.params;
    
    // Validate required fields
    if (!label || !day || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check for conflicts (excluding current slot)
    const conflict = await checkConflict(day, startTime, endTime, id);
    if (conflict) {
      return res.status(409).json({
        message: 'Time slot conflicts with existing slot',
        conflict: {
          id: conflict._id,
          label: conflict.label,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
        },
      });
    }
    
    const slot = await Slot.findByIdAndUpdate(
      id,
      { label, day, startTime, endTime },
      { new: true, runValidators: true }
    );
    
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    res.json(slot);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating slot', error: error.message });
  }
};

// Delete slot
export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const slot = await Slot.findByIdAndDelete(id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting slot', error: error.message });
  }
};
