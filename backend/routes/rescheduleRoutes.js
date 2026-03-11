import { Router } from 'express';
import {
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
} from '../controllers/rescheduleController.js';

const router = Router();

router.get('/', getRequests);
router.get('/:id', getRequestById);
router.post('/', createRequest);
router.patch('/:id/approve', approveRequest);
router.patch('/:id/reject', rejectRequest);

export default router;
