import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import * as subAdminController from '../controllers/subAdminController.js';

const router = express.Router();

router.use(protect, requireRole('SUB_ADMIN', 'SUPER_ADMIN'));

// Fixtures
router.post('/fixtures/generate', subAdminController.generateFixture);
router.get('/fixtures', subAdminController.getFixtures);
router.patch('/fixtures/:id', subAdminController.updateMatch);
router.delete('/fixtures/:id', subAdminController.deleteMatch);
router.patch('/fixtures/:id/status', subAdminController.updateMatchStatus);
router.patch('/fixtures/:id/score', subAdminController.updateMatchScore);

// Teams
router.get('/teams', subAdminController.getTeams);
router.post('/teams', subAdminController.createTeam);
router.patch('/teams/:id', subAdminController.updateTeam);
router.delete('/teams/:id', subAdminController.deleteTeam);

// Events
router.post('/fixtures/:matchId/events', subAdminController.addMatchEvent);
router.patch('/fixtures/:matchId/events/:eventId', subAdminController.updateMatchEvent);
router.delete('/fixtures/:matchId/events/:eventId', subAdminController.deleteMatchEvent);

// Lineup
router.get('/fixtures/:matchId/lineup', subAdminController.getLineup);
router.patch('/fixtures/:matchId/lineup', subAdminController.updateLineup);

// Data
router.get('/statistics', subAdminController.getStatistics);
router.get('/standings', subAdminController.getStandings);

// Settings
router.get('/settings', subAdminController.getSettings);
router.patch('/settings', subAdminController.updateSettings);

export default router;
