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

const router = express.Router();

// ── Fixtures ──────────────────────────────────────────────────────────────────
// Public read (available in TOURNAMENT phase and onwards)
router.get('/matches',      getAllMatches);
router.get('/matches/:id',  getMatch);

// Admin CRUD (open for demo - no auth middleware)
router.post('/matches', createMatch);
router.put('/matches/:id', updateMatch);
router.delete('/matches/:id', deleteMatch);

// Live Score Update
router.put('/matches/:id/score', updateScore);

// ── Player Stats ───────────────────────────────────────────────────────────────
router.get('/matches/:id/stats', getMatchStats);
router.post('/matches/:id/stats', recordPlayerStats);

// ── Standings & Leaderboards ───────────────────────────────────────────────────
router.get('/standings',    getStandings);
router.get('/leaderboards', getLeaderboards);

export default router;
