import express from 'express';
import {
  createMatch, getAllMatches, getMatch, updateMatch, deleteMatch,
  addMatchEvent, deleteMatchEvent, getMatchEvents, completeMatch,
  getStandings,
  recordPlayerStats, getMatchStats, getLeaderboards,
  createGroup, getAllGroups, updateGroup, deleteGroup,
  getEventSettings, updateEventSettings
} from '../controllers/tournamentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { checkPhase } from '../middleware/phaseMiddleware.js';

const router = express.Router();

const ALLOWED_ADMINS = ['SUPER_ADMIN', 'PODIUM_ADMIN', 'SUB_ADMIN'];

// ── Fixtures ──────────────────────────────────────────────────────────────────
router.get('/matches',     getAllMatches);
router.get('/matches/:id', getMatch);

router.post(  '/matches',     protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), createMatch);
router.put(   '/matches/:id', protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), updateMatch);
router.delete('/matches/:id', protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), deleteMatch);

// Complete match (auto awards clean sheets)
router.post('/matches/:id/complete', protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), completeMatch);

// ── Match Events (single source of truth for score) ──────────────────────────
router.get(   '/matches/:id/events',          getMatchEvents);
router.post(  '/matches/:id/events',          protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), addMatchEvent);
router.delete('/matches/:id/events/:eventId', protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), deleteMatchEvent);

// ── Event Settings (Configurable Event Tracking) ─────────────────────────────
router.get('/settings', getEventSettings);
router.put('/settings', protect, requireRole(...ALLOWED_ADMINS), updateEventSettings);

// ── Player Stats ──────────────────────────────────────────────────────────────
router.get( '/matches/:id/stats', getMatchStats);
router.post('/matches/:id/stats', protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), recordPlayerStats);

// ── Standings & Leaderboards (public) ─────────────────────────────────────────
router.get('/standings',    getStandings);
router.get('/leaderboards', getLeaderboards);

// ── Tournament Groups ──────────────────────────────────────────────────────────
router.get(   '/groups',     getAllGroups);
router.post(  '/groups',     protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), createGroup);
router.put(   '/groups/:id', protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), updateGroup);
router.delete('/groups/:id', protect, requireRole(...ALLOWED_ADMINS), checkPhase('TOURNAMENT'), deleteGroup);

export default router;
