import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

export function useAuctionSocket() {
  const [state, setState] = useState({
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
  });

  const [connected, setConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Instantiate Socket.IO client connection
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setErrorMsg(null);
      console.log('🔌 Connected to Bidding WebSocket server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('🔌 Disconnected from Bidding WebSocket server');
    });

    socket.on('auction_state', (newState) => {
      setState(newState);
    });

    socket.on('timer_tick', ({ timer }) => {
      setState((prev) => ({ ...prev, timer }));
    });

    socket.on('error', (err) => {
      setErrorMsg(err.message || 'An error occurred during bidding');
      setTimeout(() => setErrorMsg(null), 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Action emitters
  const startLot = (playerId, mode = 'NORMAL') => {
    socketRef.current?.emit('admin_start_lot', { playerId, mode });
  };

  const placeBid = (teamId, amount) => {
    socketRef.current?.emit('place_bid', { teamId, amount });
  };

  const submitBlindBid = (teamId, amount) => {
    socketRef.current?.emit('blind_bid_submit', { teamId, amount });
  };

  const pauseLot = () => {
    socketRef.current?.emit('admin_pause');
  };

  const resumeLot = () => {
    socketRef.current?.emit('admin_resume');
  };

  const rollbackBid = () => {
    socketRef.current?.emit('admin_rollback');
  };

  const cancelLot = () => {
    socketRef.current?.emit('admin_cancel');
  };

  const sellLot = () => {
    socketRef.current?.emit('admin_sell');
  };

  return {
    state,
    connected,
    errorMsg,
    startLot,
    placeBid,
    submitBlindBid,
    pauseLot,
    resumeLot,
    rollbackBid,
    cancelLot,
    sellLot
  };
}
