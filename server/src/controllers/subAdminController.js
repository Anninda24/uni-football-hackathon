import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Fixtures
export const generateFixture = async (req, res) => {
  try {
    const { teamAId, teamBId, date, time, venue, twoLegged, leg2Date, leg2Time } = req.body;
    if (teamAId === teamBId) {
      return res.status(400).json({ error: 'Home and Away teams must differ.' });
    }
    const scheduledTime = new Date(\T\:00);

    const createDefaultLineups = async (matchId, tAId, tBId) => {
      const aPlayers = await prisma.playerProfile.findMany({ where: { teamId: tAId }, orderBy: { jerseyNumber: 'asc' } });
      const bPlayers = await prisma.playerProfile.findMany({ where: { teamId: tBId }, orderBy: { jerseyNumber: 'asc' } });
      const lineupData = [
        ...aPlayers.map((p, i) => ({ matchId, teamSide: 'A', playerId: p.id, positionOrder: i + 1 })),
        ...bPlayers.map((p, i) => ({ matchId, teamSide: 'B', playerId: p.id, positionOrder: i + 1 }))
      ];
      if (lineupData.length > 0) {
        await prisma.matchLineup.createMany({ data: lineupData });
      }
    };

    const teamA = await prisma.team.findUnique({ where: { id: teamAId } });
    const teamB = await prisma.team.findUnique({ where: { id: teamBId } });
    const teamAName = teamA?.name || '';
    const teamBName = teamB?.name || '';

    if (!twoLegged) {
      const match = await prisma.match.create({
        data: {
          teamAId, teamBId, venue, scheduledTime,
          status: 'UPCOMING', scoreA: 0, scoreB: 0,
          isTwoLegged: false, leg: 1, teamAName, teamBName
        }
      });
      await createDefaultLineups(match.id, teamAId, teamBId);
      return res.json({ matches: [match] });
    }

    const fixtureGroupId = g-\-\;
    const leg2Scheduled = leg2Date ? new Date(\T\:00) : new Date(scheduledTime.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [leg1, leg2] = await prisma.\([
      prisma.match.create({
        data: {
          teamAId, teamBId, venue, scheduledTime,
          status: 'UPCOMING', scoreA: 0, scoreB: 0,
          isTwoLegged: true, leg: 1, fixtureGroupId,
          teamAName, teamBName
        }
      }),
      prisma.match.create({
        data: {
          teamAId: teamBId, teamBId: teamAId, venue,
          scheduledTime: leg2Scheduled,
          status: 'UPCOMING', scoreA: 0, scoreB: 0,
          isTwoLegged: true, leg: 2, fixtureGroupId,
          teamAName: teamBName, teamBName: teamAName
        }
      })
    ]);

    await createDefaultLineups(leg1.id, teamAId, teamBId);
    await createDefaultLineups(leg2.id, teamBId, teamAId);

    const io = req.app.get('io');
    if (io) {
      io.emit('match:fixtureCreated', { matches: [leg1, leg2] });
    }

    return res.json({ matches: [leg1, leg2] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getFixtures = async (req, res) => {
  try {
    const { status, search } = req.query;
    let where = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { teamAName: { contains: search } },
        { teamBName: { contains: search } }
      ];
    }
    const matches = await prisma.match.findMany({ 
      where,
      include: {
        events: true,
        lineups: true
      },
      orderBy: [
        { scheduledTime: 'asc' }
      ]
    });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const match = await prisma.match.update({
      where: { id },
      data: updateData,
      include: { events: true, lineups: true }
    });
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.match.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMatchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    let updateData = { status };
    if (status === 'COMPLETED') {
      updateData.finishedAt = new Date();
    }
    
    const match = await prisma.match.update({ where: { id }, data: updateData });
    const io = req.app.get('io');
    if (io) {
      if (status === 'LIVE') io.emit('match:started', { matchId: match.id, teamAId: match.teamAId, teamBId: match.teamBId });
      if (status === 'COMPLETED') io.emit('match:finished', { matchId: match.id, scoreA: match.scoreA, scoreB: match.scoreB, mvpId: match.mvpId });
    }
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMatchScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { scoreA, scoreB, currentMinute } = req.body;
    const match = await prisma.match.update({
      where: { id },
      data: { scoreA, scoreB, currentMinute }
    });
    const io = req.app.get('io');
    if (io) {
      io.emit('match:scoreUpdate', { matchId: id, scoreA, scoreB, currentMinute });
    }
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Events
export const addMatchEvent = async (req, res) => {
  try {
    const { matchId } = req.params;
    const eventData = req.body;
    const event = await prisma.matchEvent.create({
      data: {
        matchId,
        ...eventData
      }
    });
    const io = req.app.get('io');
    if (io) io.emit('match:eventAdded', { matchId, event });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMatchEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await prisma.matchEvent.update({
      where: { id: eventId },
      data: req.body
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMatchEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    await prisma.matchEvent.delete({ where: { id: eventId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lineup
export const getLineup = async (req, res) => {
  try {
    const { matchId } = req.params;
    const lineups = await prisma.matchLineup.findMany({
      where: { matchId },
      orderBy: { positionOrder: 'asc' }
    });
    const A = lineups.filter(l => l.teamSide === 'A');
    const B = lineups.filter(l => l.teamSide === 'B');
    res.json({ A, B });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLineup = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { A, B } = req.body;
    
    // Upsert lineups
    const ops = [];
    if (A) A.forEach(l => ops.push(prisma.matchLineup.upsert({
      where: { matchId_teamSide_playerId: { matchId, teamSide: 'A', playerId: l.playerId } },
      update: { positionOrder: l.positionOrder },
      create: { matchId, teamSide: 'A', playerId: l.playerId, positionOrder: l.positionOrder }
    })));
    if (B) B.forEach(l => ops.push(prisma.matchLineup.upsert({
      where: { matchId_teamSide_playerId: { matchId, teamSide: 'B', playerId: l.playerId } },
      update: { positionOrder: l.positionOrder },
      create: { matchId, teamSide: 'B', playerId: l.playerId, positionOrder: l.positionOrder }
    })));
    
    await prisma.\(ops);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Statistics
export const getStatistics = async (req, res) => {
  try {
    const events = await prisma.matchEvent.findMany({
      where: { match: { status: { in: ['LIVE', 'COMPLETED'] } } },
      include: { match: { select: { leg: true } } }
    });

    const statMap = {};
    for (const e of events) {
      if (!statMap[e.playerId]) {
        statMap[e.playerId] = { goals: 0, assists: 0, yellow: 0, red: 0, saves: 0, tackles: 0, shots: 0, interceptions: 0, played: 0, events: [] };
      }
      const s = statMap[e.playerId];
      s.played++;
      switch (e.type) {
        case 'GOAL': s.goals++; break;
        case 'ASSIST': s.assists++; break;
        case 'YELLOW_CARD': s.yellow++; break;
        case 'RED_CARD': s.red++; break;
        case 'SAVE': s.saves++; break;
        case 'TACKLE': s.tackles++; break;
        case 'SHOT_ON_TARGET': s.shots++; break;
        case 'INTERCEPTION': s.interceptions++; break;
      }
      
      if (e.type === 'GOAL' && e.assistPlayerId) {
        if (!statMap[e.assistPlayerId]) statMap[e.assistPlayerId] = { goals: 0, assists: 0, yellow: 0, red: 0, saves: 0, tackles: 0, shots: 0, interceptions: 0, played: 0, events: [] };
        statMap[e.assistPlayerId].assists++;
        statMap[e.assistPlayerId].played++;
      }
      s.events.push({ matchId: e.matchId, kind: e.type, minute: e.minute, leg: e.match.leg });
    }

    const players = await prisma.playerProfile.findMany({ include: { user: true, team: true } });
    const result = players.map(p => ({
      ...p,
      ...(statMap[p.id] ?? { goals: 0, assists: 0, yellow: 0, red: 0, saves: 0, tackles: 0, shots: 0, interceptions: 0, played: 0, events: [] }),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Standings
export const getStandings = async (req, res) => {
  try {
    const { mode = 'ALL' } = req.query;
    let whereClause = { status: 'COMPLETED' };
    if (mode === 'SINGLE') whereClause.isTwoLegged = false;
    if (mode === 'TWOLEG') whereClause.isTwoLegged = true;

    const matches = await prisma.match.findMany({ where: whereClause, orderBy: { finishedAt: 'asc' } });
    const teams = await prisma.team.findMany();

    const grouped = {};
    const singles = [];
    for (const m of matches) {
      if (m.fixtureGroupId) {
        grouped[m.fixtureGroupId] = grouped[m.fixtureGroupId] || [];
        grouped[m.fixtureGroupId].push(m);
      } else {
        singles.push(m);
      }
    }

    const results = [];
    for (const [gid, legs] of Object.entries(grouped)) {
      if (legs.length === 2) {
        legs.sort((a, b) => a.leg - b.leg);
        const leg1 = legs[0];
        const homeId = leg1.teamAId;
        const awayId = leg1.teamBId;
        const homeGoals = legs.reduce((s, l) => s + (l.teamAId === homeId ? l.scoreA : l.scoreB), 0);
        const awayGoals = legs.reduce((s, l) => s + (l.teamBId === awayId ? l.scoreB : l.scoreA), 0);
        results.push({ homeId, awayId, homeGoals, awayGoals, matchId: gid });
      } else {
         // partial? just process as singles for now or skip.
         legs.forEach(m => singles.push(m));
      }
    }
    for (const m of singles) {
      results.push({ homeId: m.teamAId, awayId: m.teamBId, homeGoals: m.scoreA, awayGoals: m.scoreB, matchId: m.id });
    }

    const map = {};
    for (const t of teams) {
      map[t.id] = { teamId: t.id, name: t.name, shortName: t.shortName, color: t.color, logoUrl: t.logoUrl, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: [] };
    }
    
    for (const r of results) {
      const home = map[r.homeId];
      const away = map[r.awayId];
      if (!home || !away) continue;
      home.played++; away.played++;
      home.gf += r.homeGoals; home.ga += r.awayGoals;
      away.gf += r.awayGoals; away.ga += r.homeGoals;
      
      let homeRes = 'draw', awayRes = 'draw';
      if (r.homeGoals > r.awayGoals) {
        home.won++; away.lost++; home.points += 3;
        homeRes = 'win'; awayRes = 'loss';
      } else if (r.homeGoals < r.awayGoals) {
        away.won++; home.lost++; away.points += 3;
        homeRes = 'loss'; awayRes = 'win';
      } else {
        home.drawn++; away.drawn++; home.points++; away.points++;
      }
      
      home.form.push(homeRes);
      away.form.push(awayRes);
    }

    const standings = Object.values(map).map(s => ({ 
      ...s, 
      gd: s.gf - s.ga,
      form: s.form.slice(-5)
    })).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Settings
export const getSettings = async (req, res) => {
  try {
    const settings = await prisma.tournamentSettings.findMany();
    const map = {};
    settings.forEach(s => {
      try { map[s.key] = JSON.parse(s.value); } 
      catch (e) { map[s.key] = s.value; }
    });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settingsObj = req.body;
    const ops = [];
    for (const [k, v] of Object.entries(settingsObj)) {
      ops.push(prisma.tournamentSettings.upsert({
        where: { key: k },
        update: { value: JSON.stringify(v) },
        create: { key: k, value: JSON.stringify(v) }
      }));
    }
    await prisma.\(ops);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
