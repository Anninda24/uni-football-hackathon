import express from 'express';
import { registerPlayer, updateRegistration, withdrawRegistration, getMyRegistration } from '../controllers/playerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { checkPhase } from '../middleware/phaseMiddleware.js';
import { uploadImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// GET my registration details (read-only, allowed anytime once registered)
router.get('/me', protect, requireRole('PLAYER'), getMyRegistration);

// Create registration profile (Phase 1 & 2 allowed, Phase 3 & 4 blocked)
router.post(
  '/register',
  protect,
  requireRole('PLAYER'),
  checkPhase('SETUP', 'REGISTRATION'),
  uploadImage,
  registerPlayer
);

// Edit profile (Phase 1 & 2 allowed, Phase 3 & 4 blocked)
router.put(
  '/register',
  protect,
  requireRole('PLAYER'),
  checkPhase('SETUP', 'REGISTRATION'),
  uploadImage,
  updateRegistration
);

// Withdraw registration profile (Phase 1 & 2 allowed, Phase 3 & 4 blocked)
router.delete(
  '/register',
  protect,
  requireRole('PLAYER'),
  checkPhase('SETUP', 'REGISTRATION'),
  withdrawRegistration
);

export default router;
