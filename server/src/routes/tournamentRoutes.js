import express from 'express';
import {
  createMatch,
  getAllMatches,
  getMatch,
  updateMatch,
  deleteMatch,
  updateScore,
  getStandings,
  recordPlayerStats,
  getMatchStats,
  getLeaderboards
} from '../controllers/tournamentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { checkPhase } from '../middleware/phaseMiddleware.js';

const router = express.Router();

// ── Fixtures ──────────────────────────────────────────────────────────────────
// Public read (available in TOURNAMENT phase and onwards)
router.get('/matches',      getAllMatches);
router.get('/matches/:id',  getMatch);

// Admin CRUD (SUPER_ADMIN only, requires TOURNAMENT phase)
router.post(
  '/matches',
  protect,
  requireRole('SUPER_ADMIN'),
  checkPhase('TOURNAMENT'),
  createMatch
);
router.put(
  '/matches/:id',
  protect,
  requireRole('SUPER_ADMIN'),
  checkPhase('TOURNAMENT'),
  updateMatch
);
router.delete(
  '/matches/:id',
  protect,
  requireRole('SUPER_ADMIN'),
  checkPhase('TOURNAMENT'),
  deleteMatch
);

// Live Score Update (SUPER_ADMIN or PODIUM_ADMIN)
router.put(
  '/matches/:id/score',
  protect,
  requireRole('SUPER_ADMIN', 'PODIUM_ADMIN'),
  checkPhase('TOURNAMENT'),
  updateScore
);

// ── Player Stats ───────────────────────────────────────────────────────────────
router.get( '/matches/:id/stats', getMatchStats);
router.post(
  '/matches/:id/stats',
  protect,
  requireRole('SUPER_ADMIN', 'PODIUM_ADMIN'),
  checkPhase('TOURNAMENT'),
  recordPlayerStats
);

// ── Standings & Leaderboards ───────────────────────────────────────────────────
router.get('/standings',    getStandings);
router.get('/leaderboards', getLeaderboards);

export default router;
