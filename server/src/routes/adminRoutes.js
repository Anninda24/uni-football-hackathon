import express from 'express';
import { getSystemPhase, updateSystemPhase, getEventRules, updateEventRules } from '../controllers/systemController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// System Phase (accessible to all authenticated admins)
router.get('/system-phase', protect, getSystemPhase);
router.put('/system-phase', protect, requireRole('SUPER_ADMIN', 'SUB_ADMIN', 'PODIUM_ADMIN'), updateSystemPhase);

// Event Rules
router.get('/rules', protect, getEventRules);
router.put('/rules', protect, requireRole('SUPER_ADMIN', 'SUB_ADMIN'), updateEventRules);

export default router;
