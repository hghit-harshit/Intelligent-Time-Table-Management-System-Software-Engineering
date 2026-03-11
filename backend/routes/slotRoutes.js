import express from 'express';
import {
  getAllSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
} from '../controllers/slotController.js';

const router = express.Router();

// GET /api/slots - Get all slots
router.get('/', getAllSlots);

// GET /api/slots/:id - Get single slot by ID
router.get('/:id', getSlotById);

// POST /api/slots - Create new slot
router.post('/', createSlot);

// PUT /api/slots/:id - Update slot
router.put('/:id', updateSlot);

// DELETE /api/slots/:id - Delete slot
router.delete('/:id', deleteSlot);

export default router;
