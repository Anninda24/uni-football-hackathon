import { prisma } from '../config/db.js';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Recalculate scoreA/scoreB from GOAL events and persist to the match row. */
async function recalculateScore(matchId) {
  const goals = await prisma.matchEvent.findMany({
    where: { matchId, type: 'GOAL' }
  });

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const scoreA = goals.filter(g => g.teamId === match.teamAId).length;
  const scoreB = goals.filter(g => g.teamId === match.teamBId).length;

  let updateData = { scoreA, scoreB };

  if (match.isTwoLegged && match.pairedMatchId) {
    const paired = await prisma.match.findUnique({ where: { id: match.pairedMatchId } });
    if (paired) {
      let teamAGoalsLeg1 = 0, teamBGoalsLeg1 = 0;
      let teamAGoalsLeg2 = 0, teamBGoalsLeg2 = 0;

      if (match.leg === 1) {
        teamAGoalsLeg1 = scoreA;
        teamBGoalsLeg1 = scoreB;
        teamBGoalsLeg2 = paired.scoreA;
        teamAGoalsLeg2 = paired.scoreB;
      } else {
        teamBGoalsLeg2 = scoreA;
        teamAGoalsLeg2 = scoreB;
        teamAGoalsLeg1 = paired.scoreA;
        teamBGoalsLeg1 = paired.scoreB;
      }

      const totalA = teamAGoalsLeg1 + teamAGoalsLeg2;
      const totalB = teamBGoalsLeg1 + teamBGoalsLeg2;

      if (match.leg === 1) {
        updateData.leg1ScoreA = scoreA;
        updateData.leg1ScoreB = scoreB;
        updateData.aggScoreA = totalA;
        updateData.aggScoreB = totalB;
      } else {
        updateData.leg2ScoreA = scoreA;
        updateData.leg2ScoreB = scoreB;
        updateData.aggScoreA = totalB;
        updateData.aggScoreB = totalA;
      }

      await prisma.match.update({
        where: { id: match.pairedMatchId },
        data: {
          aggScoreA: match.leg === 1 ? totalB : totalA,
          aggScoreB: match.leg === 1 ? totalA : totalB
        }
      });
    }
  }

  return prisma.match.update({ where: { id: matchId }, data: updateData });
}

/** Increment or decrement a player's stat in a match. */
async function adjustPlayerStat(playerId, matchId, teamId, field, delta) {
  const existing = await prisma.playerStats.findUnique({
    where: { playerId_matchId: { playerId, matchId } }
  });

  if (existing) {
    const newVal = Math.max(0, (existing[field] || 0) + delta);
    return prisma.playerStats.update({
      where: { playerId_matchId: { playerId, matchId } },
      data: { [field]: newVal }
    });
  } else if (delta > 0) {
    return prisma.playerStats.create({
      data: { playerId, matchId, teamId, [field]: delta }
    });
  }
}

/** Auto-award clean sheets at full time to all players on the non-conceding team. */
async function awardCleanSheets(matchId) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const goalEvents = await prisma.matchEvent.findMany({ where: { matchId, type: 'GOAL' } });
  const goalsAgainstA = goalEvents.filter(g => g.teamId === match.teamBId).length;
  const goalsAgainstB = goalEvents.filter(g => g.teamId === match.teamAId).length;

  const statsToUpdate = await prisma.playerStats.findMany({ where: { matchId } });

  for (const stat of statsToUpdate) {
    const conceded = stat.teamId === match.teamAId ? goalsAgainstA : goalsAgainstB;
    if (conceded === 0) {
      await prisma.playerStats.update({
        where: { id: stat.id },
        data: { cleanSheets: 1 }
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE CRUD — Supports Dual Dates for 2-Legged ties
// ─────────────────────────────────────────────────────────────────────────────

export const createMatch = async (req, res) => {
  try {
    const { 
      teamAId, teamBId, teamAName, teamBName, 
      scheduledTime, scheduledTimeLeg1, scheduledTimeLeg2,
      venue, isTwoLegged, groupId 
    } = req.body;

    if (!teamAId || !teamBId) {
      return res.status(400).json({ success: false, message: 'teamAId and teamBId are required' });
    }
    if (teamAId === teamBId) {
      return res.status(400).json({ success: false, message: 'Teams must be different' });
    }

    const teamA = await prisma.team.findUnique({ where: { id: teamAId } });
    const teamB = await prisma.team.findUnique({ where: { id: teamBId } });

    const resolvedAName = teamAName || teamA?.name || 'Home Team';
    const resolvedBName = teamBName || teamB?.name || 'Away Team';

    const leg1Time = scheduledTimeLeg1 || scheduledTime;
    const leg2Time = scheduledTimeLeg2;

    const match = await prisma.match.create({
      data: {
        teamAId, teamBId,
        teamAName: resolvedAName,
        teamBName: resolvedBName,
        isTwoLegged: !!isTwoLegged,
        scheduledTime: leg1Time ? new Date(leg1Time) : null,
        venue: venue || null,
        groupId: groupId || null,
        leg: 1,
        status: 'UPCOMING'
      }
    });

    let returnLeg = null;
    if (isTwoLegged) {
      returnLeg = await prisma.match.create({
        data: {
          teamAId: teamBId, teamBId: teamAId,
          teamAName: resolvedBName,
          teamBName: resolvedAName,
          isTwoLegged: true,
          leg: 2,
          pairedMatchId: match.id,
          scheduledTime: leg2Time ? new Date(leg2Time) : null,
          venue: venue || null,
          groupId: groupId || null,
          status: 'UPCOMING'
        }
      });
      await prisma.match.update({ where: { id: match.id }, data: { pairedMatchId: returnLeg.id } });
    }

    return res.status(201).json({ success: true, match, returnLeg });
  } catch (error) {
    console.error('createMatch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMatches = async (req, res) => {
  try {
    const { groupId } = req.query;
    const where = groupId ? { groupId } : {};
    const matches = await prisma.match.findMany({
      where,
      include: { stats: { include: { player: true } }, events: { include: { player: true, assistPlayer: true }, orderBy: { minute: 'asc' } } },
      orderBy: { scheduledTime: 'asc' }
    });
    return res.status(200).json({ success: true, matches });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMatch = async (req, res) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
      include: { stats: { include: { player: true } }, events: { include: { player: true, assistPlayer: true }, orderBy: { minute: 'asc' } } }
    });
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    return res.status(200).json({ success: true, match });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMatch = async (req, res) => {
  try {
    const { teamAName, teamBName, scheduledTime, venue, status, groupId } = req.body;
    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        ...(teamAName    !== undefined && { teamAName }),
        ...(teamBName    !== undefined && { teamBName }),
        ...(scheduledTime !== undefined && { scheduledTime: new Date(scheduledTime) }),
        ...(venue        !== undefined && { venue }),
        ...(status       !== undefined && { status }),
        ...(groupId      !== undefined && { groupId })
      }
    });
    return res.status(200).json({ success: true, match });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    await prisma.matchEvent.deleteMany({ where: { matchId } });
    await prisma.playerStats.deleteMany({ where: { matchId } });
    await prisma.match.delete({ where: { id: matchId } });
    return res.status(200).json({ success: true, message: 'Match deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MATCH EVENTS — Single source of truth for score
// ─────────────────────────────────────────────────────────────────────────────

export const addMatchEvent = async (req, res) => {
  try {
    const { type, teamId, playerId, assistPlayerId, minute } = req.body;
    const matchId = req.params.id;

    if (!type || !teamId || !playerId) {
      return res.status(400).json({ success: false, message: 'type, teamId, and playerId are required' });
    }

    const event = await prisma.matchEvent.create({
      data: { matchId, type, teamId, playerId, assistPlayerId: assistPlayerId || null, minute: minute || 0 },
      include: { player: true, assistPlayer: true }
    });

    const statMap = { GOAL: 'goals', YELLOW_CARD: 'yellowCards', RED_CARD: 'redCards', GOAL_SAVED: 'saves' };
    const field = statMap[type];
    if (field) await adjustPlayerStat(playerId, matchId, teamId, field, 1);

    if (type === 'GOAL' && assistPlayerId) {
      await adjustPlayerStat(assistPlayerId, matchId, teamId, 'assists', 1);
    }

    const updatedMatch = await recalculateScore(matchId);

    if (updatedMatch?.status === 'UPCOMING') {
      await prisma.match.update({ where: { id: matchId }, data: { status: 'LIVE' } });
    }

    const io = req.app.get('io');
    if (io && updatedMatch) {
      io.emit('match_score_update', {
        matchId,
        scoreA: updatedMatch.scoreA,
        scoreB: updatedMatch.scoreB,
        status: updatedMatch.status,
        aggScoreA: updatedMatch.aggScoreA,
        aggScoreB: updatedMatch.aggScoreB,
        event: { type, playerId, minute }
      });
    }

    return res.status(201).json({ success: true, event, match: updatedMatch });
  } catch (error) {
    console.error('addMatchEvent error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMatchEvent = async (req, res) => {
  try {
    const { id: matchId, eventId } = req.params;

    const event = await prisma.matchEvent.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    await prisma.matchEvent.delete({ where: { id: eventId } });

    const statMap = { GOAL: 'goals', YELLOW_CARD: 'yellowCards', RED_CARD: 'redCards', GOAL_SAVED: 'saves' };
    const field = statMap[event.type];
    if (field) await adjustPlayerStat(event.playerId, matchId, event.teamId, field, -1);

    if (event.type === 'GOAL' && event.assistPlayerId) {
      await adjustPlayerStat(event.assistPlayerId, matchId, event.teamId, 'assists', -1);
    }

    const updatedMatch = await recalculateScore(matchId);

    const io = req.app.get('io');
    if (io && updatedMatch) {
      io.emit('match_score_update', { matchId, scoreA: updatedMatch.scoreA, scoreB: updatedMatch.scoreB, status: updatedMatch.status, aggScoreA: updatedMatch.aggScoreA, aggScoreB: updatedMatch.aggScoreB });
    }

    return res.status(200).json({ success: true, match: updatedMatch });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMatchEvents = async (req, res) => {
  try {
    const events = await prisma.matchEvent.findMany({
      where: { matchId: req.params.id },
      include: { player: true, assistPlayer: true },
      orderBy: { minute: 'asc' }
    });
    return res.status(200).json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const completeMatch = async (req, res) => {
  try {
    const matchId = req.params.id;

    await awardCleanSheets(matchId);

    const match = await prisma.match.update({
      where: { id: matchId },
      data: { status: 'COMPLETED' }
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('match_score_update', { matchId, scoreA: match.scoreA, scoreB: match.scoreB, status: 'COMPLETED', aggScoreA: match.aggScoreA, aggScoreB: match.aggScoreB });
    }

    return res.status(200).json({ success: true, match });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POINTS TABLE — Dynamic, enriched with team name/logo & points field
// ─────────────────────────────────────────────────────────────────────────────

export const getStandings = async (req, res) => {
  try {
    const { groupId } = req.query;
    const where = { status: 'COMPLETED' };
    if (groupId) where.groupId = groupId;

    const dbTeams = await prisma.team.findMany();
    const dbTeamMap = Object.fromEntries(dbTeams.map(t => [t.id, t]));

    const completedMatches = await prisma.match.findMany({ where });
    const teamsMap = {};

    const ensureTeam = (id, fallbackName) => {
      if (!teamsMap[id]) {
        const teamObj = dbTeamMap[id];
        const name = teamObj?.name || fallbackName || 'Team';
        teamsMap[id] = {
          id,
          teamId: id,
          name,
          teamName: name,
          teamLogo: '⚽',
          mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, points: 0
        };
      }
    };

    for (const match of completedMatches) {
      if (match.isTwoLegged && match.leg === 2) continue;

      ensureTeam(match.teamAId, match.teamAName);
      ensureTeam(match.teamBId, match.teamBName);

      const goalsA = match.isTwoLegged ? match.aggScoreA : match.scoreA;
      const goalsB = match.isTwoLegged ? match.aggScoreB : match.scoreB;

      const tA = teamsMap[match.teamAId];
      const tB = teamsMap[match.teamBId];
      tA.mp++; tB.mp++;
      tA.gf += goalsA; tA.ga += goalsB;
      tB.gf += goalsB; tB.ga += goalsA;

      if (goalsA > goalsB) {
        tA.w++; tA.pts += 3; tA.points += 3;
        tB.l++;
      } else if (goalsA < goalsB) {
        tB.w++; tB.pts += 3; tB.points += 3;
        tA.l++;
      } else {
        tA.d++; tA.pts += 1; tA.points += 1;
        tB.d++; tB.pts += 1; tB.points += 1;
      }
    }

    const standings = Object.values(teamsMap).map(t => ({ ...t, gd: t.gf - t.ga }));
    standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    return res.status(200).json({ success: true, standings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER STATS & LEADERBOARDS
// ─────────────────────────────────────────────────────────────────────────────

export const recordPlayerStats = async (req, res) => {
  try {
    const { playerId, teamId, goals = 0, assists = 0, cleanSheets = 0, saves = 0, yellowCards = 0, redCards = 0 } = req.body;
    const matchId = req.params.id;
    const stats = await prisma.playerStats.upsert({
      where: { playerId_matchId: { playerId, matchId } },
      update: { goals, assists, cleanSheets, saves, yellowCards, redCards, teamId },
      create: { playerId, matchId, teamId, goals, assists, cleanSheets, saves, yellowCards, redCards }
    });
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

export const getLeaderboards = async (req, res) => {
  try {
    const allStats = await prisma.playerStats.groupBy({
      by: ['playerId'],
      _sum: { goals: true, assists: true, cleanSheets: true, saves: true, yellowCards: true, redCards: true },
      _count: { matchId: true }
    });

    const playerIds = allStats.map(s => s.playerId);
    const profiles = await prisma.playerProfile.findMany({
      where: { id: { in: playerIds } },
      include: { user: { select: { name: true } } }
    });
    const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

    const enriched = allStats.map(s => ({
      playerId: s.playerId,
      name: profileMap[s.playerId]?.jerseyName || profileMap[s.playerId]?.user?.name || 'Unknown',
      goals:       s._sum.goals       || 0,
      assists:     s._sum.assists     || 0,
      cleanSheets: s._sum.cleanSheets || 0,
      saves:       s._sum.saves       || 0,
      yellowCards: s._sum.yellowCards || 0,
      redCards:    s._sum.redCards    || 0,
      played:      s._count.matchId   || 0
    }));

    const allPlayerStatsMap = Object.fromEntries(enriched.map(e => [e.playerId, e]));

    const topScorers  = [...enriched].sort((a, b) => b.goals - a.goals).slice(0, 10);
    const topAssists  = [...enriched].sort((a, b) => b.assists - a.assists).slice(0, 10);
    const cleanSheets = [...enriched].sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 10);
    const topSavers   = [...enriched].sort((a, b) => b.saves - a.saves).slice(0, 10);

    return res.status(200).json({
      success: true,
      topScorers,
      topAssists,
      cleanSheets,
      topSavers,
      allPlayerStats: enriched,
      allPlayerStatsMap
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOURNAMENT GROUPS CRUD — Enforces strict 1-to-1 team partition rule
// ─────────────────────────────────────────────────────────────────────────────

export const createGroup = async (req, res) => {
  try {
    const { name, color, teamIds } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Group name is required' });

    const newTeamIds = Array.isArray(teamIds) ? teamIds : (teamIds ? teamIds.split(',') : []);

    const group = await prisma.tournamentGroup.create({
      data: { name, color: color || '#3b82f6', teamIds: newTeamIds.join(',') }
    });

    // Enforce strict 1-to-1 partition: remove assigned teams from any OTHER group
    if (newTeamIds.length > 0) {
      const allGroups = await prisma.tournamentGroup.findMany({ where: { id: { not: group.id } } });
      for (const g of allGroups) {
        const existingIds = g.teamIds ? g.teamIds.split(',').filter(Boolean) : [];
        const cleanedIds = existingIds.filter(id => !newTeamIds.includes(id));
        if (cleanedIds.length !== existingIds.length) {
          await prisma.tournamentGroup.update({
            where: { id: g.id },
            data: { teamIds: cleanedIds.join(',') }
          });
        }
      }
      // Update Team.groupId column for fast DB querying
      await prisma.team.updateMany({
        where: { id: { in: newTeamIds } },
        data: { groupId: group.id }
      });
    }

    return res.status(201).json({ success: true, group });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await prisma.tournamentGroup.findMany({ orderBy: { name: 'asc' } });
    const parsed = groups.map(g => ({ ...g, teamIds: g.teamIds ? g.teamIds.split(',').filter(Boolean) : [] }));
    return res.status(200).json({ success: true, groups: parsed });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { name, color, teamIds } = req.body;
    const newTeamIds = Array.isArray(teamIds) ? teamIds : (teamIds ? teamIds.split(',') : []);

    const group = await prisma.tournamentGroup.update({
      where: { id: req.params.id },
      data: {
        ...(name    !== undefined && { name }),
        ...(color   !== undefined && { color }),
        ...(teamIds !== undefined && { teamIds: newTeamIds.join(',') })
      }
    });

    // Enforce strict 1-to-1 partition across other groups
    if (teamIds !== undefined) {
      const allGroups = await prisma.tournamentGroup.findMany({ where: { id: { not: req.params.id } } });
      for (const g of allGroups) {
        const existingIds = g.teamIds ? g.teamIds.split(',').filter(Boolean) : [];
        const cleanedIds = existingIds.filter(id => !newTeamIds.includes(id));
        if (cleanedIds.length !== existingIds.length) {
          await prisma.tournamentGroup.update({
            where: { id: g.id },
            data: { teamIds: cleanedIds.join(',') }
          });
        }
      }
      await prisma.team.updateMany({ where: { id: { in: newTeamIds } }, data: { groupId: req.params.id } });
    }

    return res.status(200).json({ success: true, group: { ...group, teamIds: newTeamIds } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    await prisma.match.updateMany({ where: { groupId: req.params.id }, data: { groupId: null } });
    await prisma.team.updateMany({ where: { groupId: req.params.id }, data: { groupId: null } });
    await prisma.tournamentGroup.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Group deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EVENT SETTINGS — Configure enabled event types for Tournament
// ─────────────────────────────────────────────────────────────────────────────

export const getEventSettings = async (req, res) => {
  try {
    let state = await prisma.systemState.findFirst();
    if (!state) {
      state = await prisma.systemState.create({ data: { currentPhase: 'TOURNAMENT' } });
    }
    const enabled = state.enabledEvents ? state.enabledEvents.split(',').filter(Boolean) : ['GOAL','ASSIST','YELLOW_CARD','RED_CARD','GOAL_SAVED'];
    return res.status(200).json({ success: true, enabledEvents: enabled });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEventSettings = async (req, res) => {
  try {
    const { enabledEvents } = req.body;
    const eventString = Array.isArray(enabledEvents) ? enabledEvents.join(',') : (enabledEvents || 'GOAL');

    let state = await prisma.systemState.findFirst();
    if (!state) {
      state = await prisma.systemState.create({ data: { currentPhase: 'TOURNAMENT', enabledEvents: eventString } });
    } else {
      state = await prisma.systemState.update({
        where: { id: state.id },
        data: { enabledEvents: eventString }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event settings updated',
      enabledEvents: state.enabledEvents.split(',').filter(Boolean)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
