import { prisma } from '../config/db.js';

// ─────────────────────────────────────────────
// FIXTURE MANAGEMENT
// ─────────────────────────────────────────────

// @desc  Create a new fixture
// @route POST /api/tournament/matches
export const createMatch = async (req, res) => {
  try {
    const { teamAId, teamBId, teamAName, teamBName, scheduledTime, returnLegTime, isTwoLegged } = req.body;

    if (!teamAId || !teamBId) {
      return res.status(400).json({ success: false, message: 'teamAId and teamBId are required' });
    }

    if (isTwoLegged && !returnLegTime) {
      return res.status(400).json({ success: false, message: 'Return leg date is required for two-legged matches' });
    }

    let match = await prisma.match.create({
      data: {
        teamAId,
        teamBId,
        teamAName: teamAName || '',
        teamBName: teamBName || '',
        isTwoLegged: !!isTwoLegged,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        leg: 1,
        status: 'UPCOMING'
      }
    });

    // If two-legged, auto-generate the return leg
    let returnLeg = null;
    if (isTwoLegged) {
      returnLeg = await prisma.match.create({
        data: {
          teamAId: teamBId,   // Swapped home/away
          teamBId: teamAId,
          teamAName: teamBName || '',
          teamBName: teamAName || '',
          isTwoLegged: true,
          leg: 2,
          pairedMatchId: match.id,
          scheduledTime: returnLegTime ? new Date(returnLegTime) : null,
          status: 'UPCOMING'
        }
      });

      // Back-link the first leg to the second
      await prisma.match.update({
        where: { id: match.id },
        data: { pairedMatchId: returnLeg.id }
      });

      // Re-fetch the first leg to include the back-link in the response
      match = await prisma.match.findUnique({ where: { id: match.id } });
    }

    return res.status(201).json({ success: true, match, returnLeg });
  } catch (error) {
    console.error('createMatch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all fixtures
// @route GET /api/tournament/matches
export const getAllMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: { stats: { include: { player: true } } },
      orderBy: { scheduledTime: 'asc' }
    });
    return res.status(200).json({ success: true, matches });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single fixture
// @route GET /api/tournament/matches/:id
export const getMatch = async (req, res) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
      include: { stats: { include: { player: true } } }
    });
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    return res.status(200).json({ success: true, match });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update fixture details (venue, schedule, etc.)
// @route PUT /api/tournament/matches/:id
export const updateMatch = async (req, res) => {
  try {
    const { teamAName, teamBName, scheduledTime, venue, status } = req.body;
    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        ...(teamAName !== undefined && { teamAName }),
        ...(teamBName !== undefined && { teamBName }),
        ...(scheduledTime !== undefined && { scheduledTime: new Date(scheduledTime) }),
        ...(venue !== undefined && { venue }),
        ...(status !== undefined && { status })
      }
    });
    return res.status(200).json({ success: true, match });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete a fixture
// @route DELETE /api/tournament/matches/:id
export const deleteMatch = async (req, res) => {
  try {
    await prisma.playerStats.deleteMany({ where: { matchId: req.params.id } });
    await prisma.match.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Match deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// LIVE SCORE UPDATE
// ─────────────────────────────────────────────

// @desc  Update live score and broadcast via socket
// @route PUT /api/tournament/matches/:id/score
export const updateScore = async (req, res) => {
  try {
    const { scoreA, scoreB, status } = req.body;
    const { id } = req.params;

    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Match not found' });

    const updateData = {
      ...(scoreA !== undefined && { scoreA: parseInt(scoreA) }),
      ...(scoreB !== undefined && { scoreB: parseInt(scoreB) }),
      ...(status !== undefined && { status })
    };

    // Handle two-legged aggregate updates
    if (existing.isTwoLegged && existing.pairedMatchId) {
      if (existing.leg === 1) {
        updateData.leg1ScoreA = parseInt(scoreA) || existing.scoreA;
        updateData.leg1ScoreB = parseInt(scoreB) || existing.scoreB;
      }
      if (existing.leg === 2) {
        updateData.leg2ScoreA = parseInt(scoreA) || existing.scoreA;
        updateData.leg2ScoreB = parseInt(scoreB) || existing.scoreB;
      }

      // Fetch the paired leg to recalculate aggregate
      const pairedMatch = await prisma.match.findUnique({ where: { id: existing.pairedMatchId } });
      if (pairedMatch) {
        const leg1A = existing.leg === 1 ? (parseInt(scoreA) || 0) : pairedMatch.scoreA;
        const leg1B = existing.leg === 1 ? (parseInt(scoreB) || 0) : pairedMatch.scoreB;
        const leg2A = existing.leg === 2 ? (parseInt(scoreA) || 0) : pairedMatch.scoreA;
        const leg2B = existing.leg === 2 ? (parseInt(scoreB) || 0) : pairedMatch.scoreB;

        // From original Team A's perspective (leg 1 home = teamA)
        updateData.aggScoreA = leg1A + leg2B; // Team A goals across both legs
        updateData.aggScoreB = leg1B + leg2A; // Team B goals across both legs
      }
    }

    const match = await prisma.match.update({ where: { id }, data: updateData });

    // Broadcast via Socket.IO (get io from global)
    const io = req.app.get('io');
    if (io) {
      io.to(`match_${id}`).emit('match_score_update', { matchId: id, scoreA: match.scoreA, scoreB: match.scoreB, status: match.status, aggScoreA: match.aggScoreA, aggScoreB: match.aggScoreB });
    }

    return res.status(200).json({ success: true, match });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// POINTS TABLE ENGINE
// ─────────────────────────────────────────────

// @desc  Dynamically calculate points table from completed matches
// @route GET /api/tournament/standings
export const getStandings = async (req, res) => {
  try {
    const completedMatches = await prisma.match.findMany({
      where: { status: 'COMPLETED', leg: 1 } // Only process each fixture once (leg 1 handles aggregate)
    });

    const teamsMap = {};

    const ensureTeam = (id, name) => {
      if (!teamsMap[id]) {
        teamsMap[id] = { teamId: id, name, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      }
    };

    for (const match of completedMatches) {
      ensureTeam(match.teamAId, match.teamAName);
      ensureTeam(match.teamBId, match.teamBName);

      let goalsA, goalsB;

      // Use aggregate scores for two-legged ties
      if (match.isTwoLegged) {
        goalsA = match.aggScoreA;
        goalsB = match.aggScoreB;
      } else {
        goalsA = match.scoreA;
        goalsB = match.scoreB;
      }

      const tA = teamsMap[match.teamAId];
      const tB = teamsMap[match.teamBId];

      tA.mp++; tB.mp++;
      tA.gf += goalsA; tA.ga += goalsB;
      tB.gf += goalsB; tB.ga += goalsA;

      if (goalsA > goalsB) {
        tA.w++; tA.pts += 3;
        tB.l++;
      } else if (goalsA < goalsB) {
        tB.w++; tB.pts += 3;
        tA.l++;
      } else {
        tA.d++; tA.pts++;
        tB.d++; tB.pts++;
      }
    }

    const standings = Object.values(teamsMap).map((t) => ({
      ...t,
      gd: t.gf - t.ga
    }));

    // Sort: Points → GD → GF
    standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

    return res.status(200).json({ success: true, standings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PLAYER STATS — RECORD PER MATCH
// ─────────────────────────────────────────────

// @desc  Save/update player stats for a match
// @route POST /api/tournament/matches/:id/stats
export const recordPlayerStats = async (req, res) => {
  try {
    const { playerId, teamId, goals = 0, assists = 0, cleanSheets = 0, yellowCards = 0, redCards = 0 } = req.body;
    const matchId = req.params.id;

    const stats = await prisma.playerStats.upsert({
      where: { playerId_matchId: { playerId, matchId } },
      update: { goals, assists, cleanSheets, yellowCards, redCards, teamId },
      create: { playerId, matchId, teamId, goals, assists, cleanSheets, yellowCards, redCards }
    });

    return res.status(200).json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get stats for a specific match
// @route GET /api/tournament/matches/:id/stats
export const getMatchStats = async (req, res) => {
  try {
    const stats = await prisma.playerStats.findMany({
      where: { matchId: req.params.id },
      include: { player: true }
    });
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// LEADERBOARDS (Aggregated)
// ─────────────────────────────────────────────

// @desc  Top scorers, assist leaders, clean sheet leaders, card leaders
// @route GET /api/tournament/leaderboards
export const getLeaderboards = async (req, res) => {
  try {
    // Aggregate all player stats grouped by player
    const allStats = await prisma.playerStats.groupBy({
      by: ['playerId'],
      _sum: { goals: true, assists: true, cleanSheets: true, yellowCards: true, redCards: true }
    });

    // Fetch player profile names for display
    const playerIds = allStats.map((s) => s.playerId);
    const profiles = await prisma.playerProfile.findMany({
      where: { id: { in: playerIds } },
      include: { user: { select: { name: true } } }
    });
    const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

    const enriched = allStats.map((s) => ({
      playerId: s.playerId,
      name: profileMap[s.playerId]?.jerseyName || profileMap[s.playerId]?.user?.name || 'Unknown',
      goals: s._sum.goals || 0,
      assists: s._sum.assists || 0,
      cleanSheets: s._sum.cleanSheets || 0,
      yellowCards: s._sum.yellowCards || 0,
      redCards: s._sum.redCards || 0
    }));

    const topScorers   = [...enriched].sort((a, b) => b.goals - a.goals).slice(0, 10);
    const topAssists   = [...enriched].sort((a, b) => b.assists - a.assists).slice(0, 10);
    const cleanSheets  = [...enriched].sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 10);

    return res.status(200).json({ success: true, topScorers, topAssists, cleanSheets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
