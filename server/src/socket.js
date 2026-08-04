import { Server } from 'socket.io';
import { processNormalBid, processBlindBid, finalizePlayerSale, rollbackLastBid } from './services/auctionService.js';
import { prisma } from './config/db.js';

// In-Memory Auction State Engine
let auctionState = {
  activePlayerId: null,
  activePlayer: null,
  mode: 'NORMAL', // 'NORMAL' | 'BLIND'
  timer: 30, // seconds
  isTimerRunning: false,
  currentBid: 0,
  highBidderTeamId: null,
  highBidderTeamName: null,
  blindBids: [], // [{ teamId, amount }] for sealed envelope bids
  status: 'IDLE', // 'IDLE', 'BIDDING', 'PAUSED', 'SOLD', 'UNSOLD'
  ledger: [] // Bid history log
};

let timerInterval = null;

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all client connections
      methods: ['GET', 'POST']
    }
  });

  const broadcastState = () => {
    io.emit('auction_state', auctionState);
  };

  const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    auctionState.isTimerRunning = true;

    timerInterval = setInterval(async () => {
      if (auctionState.timer > 0) {
        auctionState.timer--;
        io.emit('timer_tick', { timer: auctionState.timer });
      } else {
        clearInterval(timerInterval);
        auctionState.isTimerRunning = false;
        
        // Handle Timer expiration (T=0)
        if (auctionState.mode === 'BLIND') {
          // Reveal blind bids and automatically select highest bidder
          await resolveBlindAuction();
        } else {
          // Normal bidding mode: trigger unsold or manual sell
          auctionState.status = auctionState.highBidderTeamId ? 'SOLD' : 'UNSOLD';
          if (auctionState.highBidderTeamId) {
            await finalizePlayerSale({
              playerId: auctionState.activePlayerId,
              teamId: auctionState.highBidderTeamId,
              amount: auctionState.currentBid
            });
          }
        }
        broadcastState();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    auctionState.isTimerRunning = false;
  };

  const resolveBlindAuction = async () => {
    if (auctionState.blindBids.length === 0) {
      auctionState.status = 'UNSOLD';
      return;
    }

    // Sort descending by amount
    const sortedBids = [...auctionState.blindBids].sort((a, b) => b.amount - a.amount);
    const winningBid = sortedBids[0];

    auctionState.currentBid = winningBid.amount;
    auctionState.highBidderTeamId = winningBid.teamId;
    auctionState.status = 'SOLD';

    // Fetch team name
    const team = await prisma.team.findUnique({ where: { id: winningBid.teamId } });
    auctionState.highBidderTeamName = team ? team.name : 'Unknown';

    await finalizePlayerSale({
      playerId: auctionState.activePlayerId,
      teamId: winningBid.teamId,
      amount: winningBid.amount
    });
  };

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to auction namespace: ${socket.id}`);

    // Send current initial state upon connection
    socket.emit('auction_state', auctionState);

    // --- PODIUM ADMIN CONTROLS ---

    // 1. Stage Lot Activation
    socket.on('admin_start_lot', async ({ playerId, mode }) => {
      try {
        const player = await prisma.playerProfile.findUnique({
          where: { id: playerId }
        });

        if (!player) {
          socket.emit('error', { message: 'Player not found in draft pool' });
          return;
        }

        // Initialize state for the lot
        auctionState = {
          activePlayerId: playerId,
          activePlayer: player,
          mode: mode || 'NORMAL',
          timer: mode === 'BLIND' ? 45 : 30, // 45s for blind, 30s for normal
          isTimerRunning: true,
          currentBid: player.basePrice || 3000,
          highBidderTeamId: null,
          highBidderTeamName: null,
          blindBids: [],
          status: 'BIDDING',
          ledger: []
        };

        startTimer();
        broadcastState();
        console.log(`📢 Lot started: ${player.jerseyName} (${auctionState.mode})`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 2. Pause Lot Countdown
    socket.on('admin_pause', () => {
      stopTimer();
      auctionState.status = 'PAUSED';
      broadcastState();
      console.log('⏸️ Auction countdown paused by Admin');
    });

    // 3. Resume Lot Countdown
    socket.on('admin_resume', () => {
      startTimer();
      auctionState.status = 'BIDDING';
      broadcastState();
      console.log('▶️ Auction countdown resumed by Admin');
    });

    // 4. Rollback last bid
    socket.on('admin_rollback', async () => {
      try {
        const prevBid = await rollbackLastBid(auctionState.activePlayerId);
        if (prevBid) {
          auctionState.currentBid = prevBid.amount;
          auctionState.highBidderTeamId = prevBid.teamId;
          const team = await prisma.team.findUnique({ where: { id: prevBid.teamId } });
          auctionState.highBidderTeamName = team ? team.name : 'Unknown';
          auctionState.ledger.pop();
        } else {
          // Reset to base price
          auctionState.currentBid = auctionState.activePlayer.basePrice || 3000;
          auctionState.highBidderTeamId = null;
          auctionState.highBidderTeamName = null;
          auctionState.ledger = [];
        }
        broadcastState();
        console.log('↩️ Last bid rolled back by Admin');
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 5. Cancel current lot lot
    socket.on('admin_cancel', () => {
      stopTimer();
      auctionState = {
        activePlayerId: null,
        activePlayer: null,
        mode: 'NORMAL',
        timer: 30,
        isTimerRunning: false,
        currentBid: 0,
        highBidderTeamId: null,
        highBidderTeamName: null,
        blindBids: [],
        status: 'IDLE',
        ledger: []
      };
      broadcastState();
      console.log('❌ Lot cancelled and reset to IDLE');
    });

    // 6. Manual Sell Trigger
    socket.on('admin_sell', async () => {
      stopTimer();
      if (auctionState.highBidderTeamId) {
        auctionState.status = 'SOLD';
        await finalizePlayerSale({
          playerId: auctionState.activePlayerId,
          teamId: auctionState.highBidderTeamId,
          amount: auctionState.currentBid
        });
      } else {
        auctionState.status = 'UNSOLD';
      }
      broadcastState();
    });

    // --- TEAM MANAGER BID SUBMISSIONS ---

    // 1. Submit Normal Incremental Bid
    socket.on('place_bid', async ({ teamId, amount }) => {
      if (auctionState.status !== 'BIDDING' || auctionState.mode !== 'NORMAL') {
        socket.emit('error', { message: 'Normal bidding not active' });
        return;
      }

      if (amount <= auctionState.currentBid) {
        socket.emit('error', { message: 'Bid amount must exceed current bid' });
        return;
      }

      try {
        const result = await processNormalBid({
          playerId: auctionState.activePlayerId,
          teamId,
          amount
        });

        if (result.success) {
          // Update in-memory lot status
          auctionState.currentBid = amount;
          auctionState.highBidderTeamId = teamId;
          auctionState.highBidderTeamName = result.teamName;
          
          const newLedgerItem = {
            teamName: result.teamName,
            amount,
            timestamp: new Date().toISOString()
          };
          auctionState.ledger.push(newLedgerItem);

          // Reset Timer upon valid bid
          auctionState.timer = 30;

          // Restart countdown
          startTimer();
          broadcastState();
          io.emit('bid_success', newLedgerItem);
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // 2. Submit Blind Sealed Bid
    socket.on('blind_bid_submit', async ({ teamId, amount }) => {
      if (auctionState.status !== 'BIDDING' || auctionState.mode !== 'BLIND') {
        socket.emit('error', { message: 'Blind auction phase not active' });
        return;
      }

      try {
        await processBlindBid({
          playerId: auctionState.activePlayerId,
          teamId,
          amount
        });

        // Add to active blind list (hidden from spectators until T=0 reveal)
        auctionState.blindBids.push({ teamId, amount });
        
        socket.emit('blind_submitted', { success: true });
        console.log(`✉️ Sealed bid received from team ${teamId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected from namespace: ${socket.id}`);
    });
  });

  // ── Tournament: live score room ──────────────────────────────────────────────
  io.on('connection', (socket) => {
    socket.on('join_match_room', (matchId) => {
      socket.join(`match_${matchId}`);
    });
    socket.on('leave_match_room', (matchId) => {
      socket.leave(`match_${matchId}`);
    });
  });

  return io;
};
