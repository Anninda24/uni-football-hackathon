import React, { useState, useEffect, useMemo } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Gavel, Timer, Eye, EyeOff, Play, Pause, RotateCcw, 
  CheckCircle2, XCircle, ShieldAlert, TrendingUp, 
  Users, History, Plus, Minus, Settings2, Dices, RefreshCw,
  ArrowUpFromLine, Search, Filter, Star, BookOpen, Layers,
  Shield, Sparkles, Award, DollarSign, Clock, HelpCircle
} from 'lucide-react';

// ── Animated button with scale + colour flash on click ──────────────────────
const ActionButton = ({ onClick, onSubmit, type = 'button', className = '', style = {}, disabled, children, flashColor = 'rgba(255,255,255,0.22)', title }) => {
  const [flash, setFlash] = useState(false);
  const handle = (e) => {
    if (disabled) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 320);
    if (onClick) onClick(e);
  };
  return (
    <button
      type={type}
      onClick={handle}
      title={title}
      disabled={disabled}
      className={className}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.12s ease, box-shadow 0.18s ease',
        transform: flash ? 'scale(0.91)' : 'scale(1)',
      }}
    >
      {children}
      {flash && (
        <span style={{
          position: 'absolute', inset: 0,
          background: flashColor,
          borderRadius: 'inherit',
          animation: 'fadeFlash 0.32s ease-out forwards',
          pointerEvents: 'none'
        }} />
      )}
    </button>
  );
};

export const LiveAuctionView = ({ isPodiumAdmin = false }) => {
  const { 
    systemState, currentUser, teams, players, auctionState, setAuctionState,
    auctionLedger, pullPlayerToPodium, placeBid, sellActivePlayer, passActivePlayer, 
    calculateMinimumRaise, validateBudgetGuardrail, addNotification,
    budgetLedger, adjustTeamBudget, randomToPodium, resetAuctionState,
    watchlist = [], toggleWatchlist, overrideActivePlayerPrice, overrideAuctionTimer
  } = useSystem();

  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'PODIUM_ADMIN';
  const isManager = currentUser.role === 'TEAM_MANAGER';
  const managerTeam = teams.find(t => t.managerId === currentUser.id)
    || teams.find(t => t.id === currentUser.teamId)
    || teams.find(t => t.managerEmail?.toLowerCase() === currentUser.email?.toLowerCase());

  const [rightTab, setRightTab] = useState('POOL'); // 'POOL' | 'WATCHLIST' | 'ROSTERS' | 'LEDGER'
  const [spectatorTab, setSpectatorTab] = useState('ARENA'); // 'ARENA' | 'ROSTERS' | 'BULLETIN'
  const [selectedTeamId, setSelectedTeamId] = useState(managerTeam?.id || currentUser.teamId || teams[0]?.id || 'team-1');
  const [customBidAmount, setCustomBidAmount] = useState('');
  const [blindBidInput, setBlindBidInput] = useState('');

  // Queue Filters
  const [queueCategoryFilter, setQueueCategoryFilter] = useState('ALL');
  const [queuePositionFilter, setQueuePositionFilter] = useState('ALL');
  const [queueSearch, setQueueSearch] = useState('');

  // Dynamic Overrides for Auctioneer
  const [overridePriceInput, setOverridePriceInput] = useState('');
  const [overrideTimerInput, setOverrideTimerInput] = useState('');

  // Admin Budget Control
  const [budgetAdjustTeamId, setBudgetAdjustTeamId] = useState(teams[0]?.id || 'team-1');
  const [budgetAdjustAmount, setBudgetAdjustAmount] = useState('');
  const [budgetAdjustReason, setBudgetAdjustReason] = useState('Sponsorship');

  // Timer configuration
  const [globalTimerSetting, setGlobalTimerSetting] = useState(30);
  const [globalTimerInput, setGlobalTimerInput] = useState('30');
  const [biddingType, setBiddingType] = useState('NORMAL');
  const [blindTimerSetting, setBlindTimerSetting] = useState(60);
  const [blindTimerInput, setBlindTimerInput] = useState('60');
  const [managerTimer, setManagerTimer] = useState(auctionState.timer);

  const activePlayer = players.find(p => p.id === auctionState.activePlayerId);
  const activeCategory = activePlayer ? systemState.categories.find(c => c.id === activePlayer.categoryId) : null;
  const highBidderTeam = teams.find(t => t.id === auctionState.highBidderTeamId);
  const biddingTeam = teams.find(t => t.id === (isManager ? managerTeam?.id : selectedTeamId)) || teams[0];
  const biddingTeamId = biddingTeam?.id || selectedTeamId;
  const playersRequired = Math.max(0, systemState.minRoster - (biddingTeam?.roster?.length || 0));
  const minRaise = calculateMinimumRaise(auctionState.currentBid);
  const nextMinBid = auctionState.currentBid + minRaise;

  // Countdown ticker
  useEffect(() => {
    let interval = null;
    if (isAdmin && auctionState.isTimerRunning && auctionState.timer > 0) {
      interval = setInterval(() => {
        setAuctionState(prev => ({ ...prev, timer: prev.timer - 1 }));
      }, 1000);
    } else if (isAdmin && auctionState.timer === 0 && auctionState.isTimerRunning) {
      setAuctionState(prev => ({ ...prev, isTimerRunning: false }));
      if (auctionState.mode === 'BLIND') {
        addNotification('warning', 'T=0 Sealed Envelopes Ready', 'Timer reached 0! Podium Admin can now reveal winning envelope.');
      } else {
        addNotification('info', 'Timer Expired', 'Podium timer expired! Ready to award player.');
      }
    }
    return () => clearInterval(interval);
  }, [isAdmin, auctionState.isTimerRunning, auctionState.timer]);

  useEffect(() => {
    const updateManagerTimer = () => {
      if (auctionState.isTimerRunning && auctionState.timerExpiresAt) {
        setManagerTimer(Math.max(0, Math.ceil((auctionState.timerExpiresAt - Date.now()) / 1000)));
      } else {
        setManagerTimer(auctionState.timer);
      }
    };
    updateManagerTimer();
    const interval = setInterval(updateManagerTimer, 250);
    return () => clearInterval(interval);
  }, [auctionState.isTimerRunning, auctionState.timer, auctionState.timerExpiresAt]);

  const handleRaiseBid = (increment) => placeBid(biddingTeamId, auctionState.currentBid + increment);

  const handleCustomBid = (e) => {
    e.preventDefault();
    const amount = Number(customBidAmount);
    if (!amount) return;
    if (placeBid(biddingTeamId, amount)) setCustomBidAmount('');
  };

  const handleBlindBidSubmit = (e) => {
    e.preventDefault();
    const amount = Number(blindBidInput);
    if (!amount) return;
    placeBid(biddingTeamId, amount);
    setBlindBidInput('');
  };

  const guardCheck = validateBudgetGuardrail(biddingTeamId, nextMinBid);

  const captainOrVCIds = new Set();
  teams.forEach(t => {
    if (t.captainId) captainOrVCIds.add(t.captainId);
    if (t.viceCaptainId) captainOrVCIds.add(t.viceCaptainId);
  });
  
  const unsoldApprovedPlayers = useMemo(() => {
    return players.filter(
      p => p.status === 'APPROVED' && !captainOrVCIds.has(p.id) && p.categoryId !== 'cat-icon'
    );
  }, [players, captainOrVCIds]);

  // Filtered Queue
  const filteredQueuePlayers = useMemo(() => {
    return unsoldApprovedPlayers.filter(p => {
      const matchCat = queueCategoryFilter === 'ALL' || p.categoryId === queueCategoryFilter;
      const matchPos = queuePositionFilter === 'ALL' || p.primaryPosition === queuePositionFilter;
      const matchSearch = !queueSearch.trim() || 
        p.name.toLowerCase().includes(queueSearch.toLowerCase()) || 
        (p.jerseyName || '').toLowerCase().includes(queueSearch.toLowerCase());
      return matchCat && matchPos && matchSearch;
    });
  }, [unsoldApprovedPlayers, queueCategoryFilter, queuePositionFilter, queueSearch]);

  const handleBudgetAdjust = (amount, preset = false) => {
    const val = preset ? amount : Number(budgetAdjustAmount);
    if (!val || isNaN(val)) return;
    adjustTeamBudget(budgetAdjustTeamId, val, preset ? (val > 0 ? 'Quick Bonus' : 'Quick Penalty') : budgetAdjustReason);
    if (!preset) setBudgetAdjustAmount('');
  };

  const handleApplyBiddingType = (type) => {
    setBiddingType(type);
    const timerVal = type === 'BLIND' ? blindTimerSetting : type === 'SPEED' ? 10 : globalTimerSetting;
    setAuctionState(prev => ({
      ...prev,
      mode: type === 'BLIND' ? 'BLIND' : 'NORMAL',
      timer: timerVal,
      isTimerRunning: false,
      timerExpiresAt: null,
      auctionStatus: 'BIDDING'
    }));
    addNotification('info', 'Bidding Type Changed', `Mode: ${type} | Timer: ${timerVal}s`);
  };

  const applyGlobalTimer = () => {
    const val = Math.max(5, Math.min(300, Number(globalTimerInput) || 30));
    setGlobalTimerSetting(val);
    setGlobalTimerInput(String(val));
    if (auctionState.mode !== 'BLIND') {
      setAuctionState(prev => ({ ...prev, timer: val, isTimerRunning: false }));
    }
    addNotification('success', 'Global Timer Updated', `Normal bid timer set to ${val}s`);
  };

  const applyBlindTimer = () => {
    const val = Math.max(10, Math.min(600, Number(blindTimerInput) || 60));
    setBlindTimerSetting(val);
    setBlindTimerInput(String(val));
    if (auctionState.mode === 'BLIND') {
      setAuctionState(prev => ({ ...prev, timer: val, isTimerRunning: false }));
    }
    addNotification('success', 'Blind Timer Updated', `Blind bid timer set to ${val}s — does NOT affect Normal timer`);
  };

  const handleDynamicPriceOverride = (e) => {
    if (e) e.preventDefault();
    const val = Number(overridePriceInput);
    if (!val || isNaN(val) || val < 0) {
      addNotification('error', 'Invalid Price', 'Please enter a valid monetary amount.');
      return;
    }
    if (overrideActivePlayerPrice) {
      overrideActivePlayerPrice(val);
      setOverridePriceInput('');
    } else {
      setAuctionState(prev => ({ ...prev, currentBid: val }));
      addNotification('info', 'Price Override', `Bid adjusted to $${val.toLocaleString()}`);
      setOverridePriceInput('');
    }
  };

  const handleQuickPriceAdjust = (delta) => {
    const newPrice = Math.max(0, (auctionState.currentBid || 0) + delta);
    if (overrideActivePlayerPrice) {
      overrideActivePlayerPrice(newPrice);
    } else {
      setAuctionState(prev => ({ ...prev, currentBid: newPrice }));
    }
  };

  const handleDynamicTimerOverride = (seconds) => {
    const s = Math.max(1, Number(seconds));
    if (isNaN(s)) return;
    if (overrideAuctionTimer) {
      overrideAuctionTimer(s);
    } else {
      setAuctionState(prev => ({
        ...prev,
        timer: s,
        timerExpiresAt: prev.isTimerRunning ? Date.now() + (s * 1000) : null
      }));
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // ADMIN DASHBOARD VIEW (PODIUM AUCTIONEER CONSOLE)
  // ──────────────────────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Top Header */}
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gavel color="var(--accent-gold)" /> Podium Admin Console
              </h2>
              <span className="badge badge-gold">
                <span className="live-pulse" style={{ marginRight: '6px' }}></span> PHASE 3 ACTIVE
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Auctioneer Command Surface: Live floor controls, dynamic dispute overrides, and interactive queue browser.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <ActionButton onClick={randomToPodium} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} flashColor="rgba(0,230,153,0.5)">
              <Dices size={16} style={{ marginRight: '8px' }} /> Random to Podium
            </ActionButton>
            <ActionButton onClick={resetAuctionState} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} flashColor="rgba(255,77,109,0.4)">
              <RefreshCw size={16} style={{ marginRight: '8px' }} /> Reset State
            </ActionButton>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Total Players', value: players.length, color: 'var(--accent-cyan)' },
            { label: 'Sold Players', value: players.filter(p => p.status === 'SOLD').length, color: 'var(--accent-green)' },
            { label: 'Unsold Pool', value: unsoldApprovedPlayers.length, color: 'var(--accent-gold)' },
            { label: 'Total Teams', value: teams.length, color: 'var(--accent-purple)' },
          ].map(stat => (
            <div key={stat.label} className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Main Grid 2/3 split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>

          {/* ── LEFT COLUMN: PODIUM & FLOOR CONTROLS & DYNAMIC OVERRIDES ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Podium Status Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gavel size={20} color="var(--accent-gold)" /> Live Podium Arena
                </h3>
                {activePlayer && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {auctionState.mode === 'NORMAL' ? <Eye size={16} color="var(--accent-green)" /> : <EyeOff size={16} color="var(--accent-purple)" />}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: auctionState.mode === 'NORMAL' ? 'var(--accent-green)' : '#c77dff' }}>{auctionState.mode}</span>
                    </div>
                    <div style={{ background: auctionState.timer <= 5 ? 'rgba(255,77,109,0.2)' : 'rgba(0,230,153,0.1)', border: `1px solid ${auctionState.timer <= 5 ? 'var(--accent-red)' : 'var(--accent-green)'}`, borderRadius: '12px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Timer size={18} color={auctionState.timer <= 5 ? 'var(--accent-red)' : 'var(--accent-green)'} />
                      <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: auctionState.timer <= 5 ? 'var(--accent-red)' : 'var(--text-main)' }}>
                        00:{auctionState.timer < 10 ? `0${auctionState.timer}` : auctionState.timer}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {activePlayer ? (
                <div>
                  {/* Player info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 4px 0' }}>{activePlayer.name}</h2>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: activeCategory?.color || '#3b82f6', fontWeight: 800 }}>{activeCategory?.name || 'Tier'}</span> • Pos: <strong>{activePlayer.primaryPosition}</strong> • Base: ${activePlayer.basePrice.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT BID</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-gold)' }}>${auctionState.currentBid.toLocaleString()}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 700 }}>{highBidderTeam ? highBidderTeam.name : 'No Bids Placed'}</div>
                    </div>
                  </div>

                  {/* Bidding Type Selector */}
                  <div style={{ background: 'var(--bg-card-solid)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Bidding Mode</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'NORMAL', label: '📢 Normal', desc: `${globalTimerSetting}s timer`, color: 'var(--accent-green)', flash: 'rgba(0,230,153,0.4)' },
                        { id: 'BLIND',  label: '🔒 Blind',  desc: `${blindTimerSetting}s timer`, color: '#c77dff', flash: 'rgba(157,78,221,0.4)' },
                        { id: 'SPEED',  label: '⚡ Speed',  desc: '10s per bid', color: 'var(--accent-gold)', flash: 'rgba(255,183,3,0.4)' },
                      ].map(bt => (
                        <ActionButton
                          key={bt.id}
                          onClick={() => handleApplyBiddingType(bt.id)}
                          flashColor={bt.flash}
                          style={{
                            flex: 1, padding: '10px 12px',
                            border: `2px solid ${biddingType === bt.id ? bt.color : 'var(--border-color)'}`,
                            borderRadius: '10px',
                            background: biddingType === bt.id ? bt.color + '22' : 'transparent',
                            color: biddingType === bt.id ? bt.color : 'var(--text-muted)',
                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                            fontSize: '0.8rem', fontWeight: 700, minWidth: '90px'
                          }}
                        >
                          <span>{bt.label}</span>
                          <span style={{ fontSize: '0.63rem', fontWeight: 400, color: 'var(--text-dim)' }}>{bt.desc}</span>
                        </ActionButton>
                      ))}
                    </div>
                  </div>

                  {/* Podium Action Floor Controls */}
                  <div style={{ background: 'var(--bg-card-solid)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>TACTICAL FLOOR CONTROLS</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <ActionButton onClick={() => setAuctionState(prev => ({ ...prev, isTimerRunning: true, timerExpiresAt: Date.now() + (prev.timer * 1000) }))} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} flashColor="rgba(0,230,153,0.5)">
                        <Play size={15} /> Start Timer
                      </ActionButton>
                      <ActionButton onClick={() => setAuctionState(prev => ({ ...prev, isTimerRunning: false, timerExpiresAt: null }))} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} flashColor="rgba(255,255,255,0.2)">
                        <Pause size={15} /> Pause
                      </ActionButton>
                      <ActionButton
                        onClick={() => setAuctionState(prev => ({ ...prev, timer: auctionState.mode === 'BLIND' ? blindTimerSetting : globalTimerSetting, isTimerRunning: false, timerExpiresAt: null }))}
                        className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} flashColor="rgba(0,217,255,0.4)"
                      >
                        <RotateCcw size={15} /> Reset Timer
                      </ActionButton>
                      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }}></div>
                      <ActionButton onClick={sellActivePlayer} className="btn btn-gold" style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800 }} flashColor="rgba(255,183,3,0.6)">
                        <CheckCircle2 size={15} /> 🔨 Hammer Down (Sold)
                      </ActionButton>
                      <ActionButton onClick={passActivePlayer} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.4)' }} flashColor="rgba(255,77,109,0.4)">
                        <XCircle size={15} /> Mark Unsold
                      </ActionButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Gavel size={48} color="var(--accent-gold)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Podium is Empty</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select a player from the Interactive Queue on the right or use "Random to Podium".</p>
                </div>
              )}
            </div>

            {/* ── DYNAMIC FLOOR OVERRIDES PANEL (CRITICAL DISPUTE RESOLUTION) ── */}
            <div className="glass-panel" style={{ padding: '22px', borderRadius: '18px', border: '1px solid rgba(255, 183, 3, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#ffb703', margin: 0 }}>
                  <ShieldAlert size={18} /> Dynamic Live Floor Dispute Overrides (Auctioneer Control)
                </h3>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>ON-THE-FLY OVERRIDES</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
                Instantly adjust base price, current high bid, or countdown timer on stage to resolve floor disputes in real time.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                {/* 1. Price Override Card */}
                <div style={{ background: 'var(--bg-card-solid)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.74rem', color: '#00e699', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                    💰 Price / Base Bid Override
                  </div>
                  <form onSubmit={handleDynamicPriceOverride} style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <input
                      type="number"
                      placeholder="Set exact price ($)..."
                      className="form-control"
                      value={overridePriceInput}
                      onChange={(e) => setOverridePriceInput(e.target.value)}
                      style={{ flex: 1, padding: '7px 10px', fontSize: '0.85rem' }}
                    />
                    <ActionButton type="submit" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: '0.78rem' }}>
                      Apply
                    </ActionButton>
                  </form>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => handleQuickPriceAdjust(1000)} className="btn btn-secondary" style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem' }}>+$1k</button>
                    <button type="button" onClick={() => handleQuickPriceAdjust(5000)} className="btn btn-secondary" style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem' }}>+$5k</button>
                    <button type="button" onClick={() => handleQuickPriceAdjust(-1000)} className="btn btn-secondary" style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem', color: '#ef4444' }}>-$1k</button>
                    {activePlayer && (
                      <button type="button" onClick={() => handleQuickPriceAdjust(activePlayer.basePrice - auctionState.currentBid)} className="btn btn-secondary" style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem', color: '#ffb703' }}>Reset Base</button>
                    )}
                  </div>
                </div>

                {/* 2. Timer Override Card */}
                <div style={{ background: 'var(--bg-card-solid)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.74rem', color: '#00d9ff', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                    ⏱️ Timer Clock Override
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <input
                      type="number"
                      placeholder="Set seconds..."
                      className="form-control"
                      value={overrideTimerInput}
                      onChange={(e) => setOverrideTimerInput(e.target.value)}
                      style={{ flex: 1, padding: '7px 10px', fontSize: '0.85rem' }}
                    />
                    <ActionButton onClick={() => { handleDynamicTimerOverride(overrideTimerInput); setOverrideTimerInput(''); }} className="btn btn-primary" style={{ padding: '7px 12px', fontSize: '0.78rem' }}>
                      Set
                    </ActionButton>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => handleDynamicTimerOverride(auctionState.timer + 10)} className="btn btn-secondary" style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem' }}>+10s</button>
                    <button type="button" onClick={() => handleDynamicTimerOverride(auctionState.timer + 5)} className="btn btn-secondary" style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem' }}>+5s</button>
                    <button type="button" onClick={() => handleDynamicTimerOverride(Math.max(1, auctionState.timer - 5))} className="btn btn-secondary" style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem', color: '#ef4444' }}>-5s</button>
                    <button type="button" onClick={() => handleDynamicTimerOverride(30)} className="btn btn-secondary" style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem', color: '#00d9ff' }}>30s</button>
                  </div>
                </div>

              </div>
            </div>

            {/* Franchise Budget Adjustments */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings2 size={20} color="var(--accent-cyan)" /> Franchise Budget Manager
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Select Franchise</label>
                  <select className="form-control" value={budgetAdjustTeamId} onChange={(e) => setBudgetAdjustTeamId(e.target.value)} style={{ width: '100%', marginBottom: '16px' }}>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.logo} {t.name} (${t.budget.toLocaleString()})</option>)}
                  </select>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Quick Adjustments</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <ActionButton onClick={() => handleBudgetAdjust(50000, true)} className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} flashColor="rgba(0,230,153,0.5)">
                      <Plus size={14} /> 50k
                    </ActionButton>
                    <ActionButton onClick={() => handleBudgetAdjust(-10000, true)} className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} flashColor="rgba(255,77,109,0.4)">
                      <Minus size={14} /> 10k
                    </ActionButton>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card-solid)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Custom Adjustment Amount</label>
                  <input type="number" className="form-control" placeholder="Enter amount (+ or -)" value={budgetAdjustAmount} onChange={(e) => setBudgetAdjustAmount(e.target.value)} style={{ width: '100%', marginBottom: '16px' }} />
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Reason / Memo</label>
                  <select className="form-control" value={budgetAdjustReason} onChange={(e) => setBudgetAdjustReason(e.target.value)} style={{ width: '100%', marginBottom: '16px' }}>
                    <option value="Sponsorship">Sponsorship Bonus</option>
                    <option value="Penalty">Rule Violation Penalty</option>
                    <option value="Correction">Admin Correction</option>
                    <option value="Trade">Trade Allocation</option>
                  </select>
                  <ActionButton onClick={() => handleBudgetAdjust(0, false)} className="btn btn-gold" style={{ width: '100%' }} flashColor="rgba(255,183,3,0.5)">
                    Apply Custom Adjustment
                  </ActionButton>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: INTERACTIVE FILTERABLE PLAYER QUEUE ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Interactive Player Queue Browser */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1rem' }}>
                  <Users size={18} color="var(--accent-cyan)" /> Interactive Player Queue
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {filteredQueuePlayers.length} / {unsoldApprovedPlayers.length}
                </span>
              </div>

              {/* Queue Filters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Search player name or jersey..."
                    className="form-control"
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select
                    className="form-control"
                    value={queueCategoryFilter}
                    onChange={(e) => setQueueCategoryFilter(e.target.value)}
                    style={{ height: '32px', fontSize: '0.78rem', padding: '4px 8px' }}
                  >
                    <option value="ALL">All Tiers</option>
                    {systemState.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    className="form-control"
                    value={queuePositionFilter}
                    onChange={(e) => setQueuePositionFilter(e.target.value)}
                    style={{ height: '32px', fontSize: '0.78rem', padding: '4px 8px' }}
                  >
                    <option value="ALL">All Positions</option>
                    {systemState.positions.map(p => (
                      <option key={p.code} value={p.code}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Player Queue List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', maxHeight: '420px', overflowY: 'auto' }}>
                {filteredQueuePlayers.length > 0 ? filteredQueuePlayers.map(ply => {
                  const cat = systemState.categories.find(c => c.id === ply.categoryId);
                  const isOnStage = ply.id === auctionState.activePlayerId;
                  return (
                    <div key={ply.id} style={{
                      background: isOnStage ? 'rgba(255,183,3,0.08)' : 'var(--bg-card-solid)',
                      padding: '8px 10px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      border: `1px solid ${isOnStage ? 'var(--accent-gold)' : 'var(--border-color)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <img src={ply.imageUrl} alt={ply.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ply.name}</div>
                          <div style={{ fontSize: '0.65rem', color: cat ? cat.color : 'var(--accent-green)' }}>
                            {ply.primaryPosition} • {cat ? cat.name : 'Tier'} • ${ply.basePrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <ActionButton
                        onClick={() => { if (!isOnStage) pullPlayerToPodium(ply.id); }}
                        title={isOnStage ? 'Currently on stage' : 'Push to Stage'}
                        disabled={isOnStage}
                        flashColor="rgba(0,230,153,0.5)"
                        style={{
                          padding: '5px 10px', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0,
                          background: isOnStage ? 'rgba(255,183,3,0.2)' : 'rgba(0,230,153,0.12)',
                          border: `1px solid ${isOnStage ? 'var(--accent-gold)' : 'var(--accent-green)'}`,
                          borderRadius: '6px',
                          color: isOnStage ? 'var(--accent-gold)' : 'var(--accent-green)',
                          cursor: isOnStage ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <ArrowUpFromLine size={12} />
                        {isOnStage ? 'ON STAGE' : 'Push'}
                      </ActionButton>
                    </div>
                  );
                }) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '24px' }}>
                    No players matching filter criteria.
                  </div>
                )}
              </div>
            </div>

            {/* Team Financial Status */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--accent-green)" /> Team Budgets & Roster Slots
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '240px', overflowY: 'auto' }}>
                {teams.map(team => {
                  const total = systemState.totalBudget;
                  const spentPct = Math.min(100, Math.max(0, (team.spent / total) * 100));
                  return (
                    <div key={team.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700 }}>{team.logo} {team.name} ({team.roster?.length || 0} p)</span>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>${team.budget.toLocaleString()}</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${spentPct}%`, background: team.primaryColor || 'var(--accent-green)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // MANAGER & SPECTATOR VIEW (FEATURING SIDE-BY-SIDE ROSTER & BULLETIN HUB)
  // ──────────────────────────────────────────────────────────────────
  const isStarredActive = activePlayer && (watchlist.includes(activePlayer.id) || (localStorage.getItem('ff_watchlist') && JSON.parse(localStorage.getItem('ff_watchlist') || '[]').includes(activePlayer.id)));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Phase & Navigation Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <Gavel color="var(--accent-gold)" /> LIVE AUCTION ARENA
            </h2>
            <span className="badge badge-gold">
              <span className="live-pulse" style={{ marginRight: '6px' }}></span> PHASE 3 ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Real-time synchronized live stage with budget guardrails, competitor roster side-by-side, and information bulletin.
          </p>
        </div>

        {/* Spectator/Manager Main Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { id: 'ARENA', label: '🏟️ Live Podium Arena' },
            { id: 'ROSTERS', label: '📊 Side-by-Side Rosters' },
            { id: 'BULLETIN', label: '📋 Information Hub' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSpectatorTab(tab.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: spectatorTab === tab.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
                background: spectatorTab === tab.id ? 'rgba(255, 183, 3, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                color: spectatorTab === tab.id ? 'var(--accent-gold)' : '#94a3b8',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: LIVE PODIUM ARENA ────────────────────────────────────────── */}
      {spectatorTab === 'ARENA' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
          
          {/* Left Column: Active Stage & Manager Bidding Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Active Stage Card */}
            <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              {activePlayer ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: activeCategory ? activeCategory.color : 'var(--accent-green)', background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: '8px' }}>
                          {activeCategory ? activeCategory.name : 'Platinum Tier'} • Base Price: ${activePlayer.basePrice.toLocaleString()}
                        </span>
                        
                        {/* Star Button for Watchlist */}
                        <button
                          type="button"
                          onClick={() => toggleWatchlist && toggleWatchlist(activePlayer.id)}
                          style={{
                            background: isStarredActive ? 'rgba(255,183,3,0.2)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${isStarredActive ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}`,
                            color: isStarredActive ? 'var(--accent-gold)' : '#94a3b8',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Star size={13} fill={isStarredActive ? '#ffb703' : 'none'} />
                          <span>{isStarredActive ? 'Starred' : 'Watchlist'}</span>
                        </button>
                      </div>

                      <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '8px', color: '#f8fafc' }}>{activePlayer.name}</h2>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '14px', marginTop: '4px' }}>
                        <span>Student ID: <strong>{activePlayer.studentId}</strong></span>
                        <span>Jersey: <strong>{activePlayer.jerseyName}</strong></span>
                        <span>Session: <strong>{activePlayer.session}</strong></span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {auctionState.mode === 'NORMAL' ? 'CURRENT HIGH BID' : 'SEALED ENVELOPES'}
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                        ${auctionState.currentBid.toLocaleString()}
                      </div>
                      <div style={{ color: managerTimer <= 5 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 800, fontSize: '0.9rem' }}>
                        ⏱️ TIME: {managerTimer}s
                      </div>
                    </div>
                  </div>

                  {/* Player Positional & Highest Bidder Box */}
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px', background: 'var(--bg-card-solid)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)' }}>
                    <img src={activePlayer.imageUrl} alt={activePlayer.name} style={{ width: '100%', height: '180px', borderRadius: '12px', objectFit: 'cover', border: `2px solid ${activeCategory?.color || 'var(--accent-green)'}` }} />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Positional Profile:</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>PRIMARY: {activePlayer.primaryPosition}</span>
                          {activePlayer.secondaryPositions && activePlayer.secondaryPositions.map(sec => (
                            <span key={sec} className="badge badge-cyan" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>SECONDARY: {sec}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Highest Bidder:</div>
                        {highBidderTeam ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--accent-green)' }}>
                            <span style={{ fontSize: '1.2rem' }}>{highBidderTeam.logo}</span>
                            <span>{highBidderTeam.name}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.85rem' }}>No bids placed yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Gavel size={54} color="var(--accent-gold)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>No player is currently on the podium</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '8px auto 0 auto' }}>
                    The Podium Admin will bring the next player to the block shortly.
                  </p>
                </div>
              )}
            </div>

            {/* Manager Bidding Console */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <TrendingUp color="var(--accent-green)" /> Franchise Manager Bidding Panel
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bidding as:</span>
                  {isManager ? (
                    <strong style={{ fontSize: '0.85rem' }}>{biddingTeam?.logo} {biddingTeam?.name}</strong>
                  ) : (
                    <select className="form-control" style={{ padding: '4px 10px', fontSize: '0.85rem', fontWeight: 700, width: 'auto' }} value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.logo} {t.name} (${t.budget.toLocaleString()})</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* Financial Snapshot & Guardrails Indicator */}
              <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CURRENT BUDGET</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-green)' }}>${(biddingTeam?.budget || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PLAYERS SIGNED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{biddingTeam?.roster?.length || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PLAYERS REQUIRED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: playersRequired ? 'var(--accent-gold)' : 'var(--accent-green)' }}>{playersRequired}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MIN BID RESERVE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>${(playersRequired * 3000).toLocaleString()}</div>
                  </div>
                </div>
                
                {!guardCheck.valid && activePlayer && (
                  <div style={{ marginTop: '12px', background: 'rgba(255,77,109,0.15)', border: '1px solid var(--accent-red)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} /> <strong>Guardrail Alert:</strong> {guardCheck.reason}
                  </div>
                )}
              </div>

              {/* Bidding Trigger Controls */}
              {activePlayer && auctionState.auctionStatus === 'BIDDING' ? (
                auctionState.mode === 'NORMAL' ? (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                      DYNAMIC BID RAISES (+${minRaise ? minRaise.toLocaleString() : '0'} minimum increment):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                      <ActionButton onClick={() => handleRaiseBid(minRaise)} className="btn btn-primary" disabled={!guardCheck.valid} style={{ padding: '12px', fontSize: '0.95rem' }} flashColor="rgba(0,230,153,0.5)">
                        +${minRaise.toLocaleString()} (Next: ${nextMinBid.toLocaleString()})
                      </ActionButton>
                      <ActionButton onClick={() => handleRaiseBid(minRaise * 2)} className="btn btn-gold" disabled={!guardCheck.valid} style={{ padding: '12px', fontSize: '0.95rem' }} flashColor="rgba(255,183,3,0.5)">
                        +${(minRaise * 2).toLocaleString()}
                      </ActionButton>
                      <ActionButton onClick={() => handleRaiseBid(minRaise * 5)} className="btn btn-secondary" disabled={!guardCheck.valid} style={{ padding: '12px', fontSize: '0.95rem' }} flashColor="rgba(255,255,255,0.2)">
                        +${(minRaise * 5).toLocaleString()}
                      </ActionButton>
                    </div>
                    <form onSubmit={handleCustomBid} style={{ display: 'flex', gap: '10px' }}>
                      <input type="number" className="form-control" placeholder={`Enter custom bid (Min: $${nextMinBid.toLocaleString()})`} value={customBidAmount} onChange={(e) => setCustomBidAmount(e.target.value)} min={nextMinBid} disabled={!guardCheck.valid} />
                      <ActionButton type="submit" className="btn btn-primary" disabled={!guardCheck.valid} flashColor="rgba(0,230,153,0.5)">Place Custom Bid</ActionButton>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div style={{ background: 'rgba(157,78,221,0.15)', border: '1px solid rgba(157,78,221,0.4)', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '0.85rem' }}>
                      🔒 <strong>Blind Auction Active:</strong> Submit one hidden monetary envelope bid. All bids remain sealed until timer reaches T=0.
                    </div>
                    <form onSubmit={handleBlindBidSubmit} style={{ display: 'flex', gap: '10px' }}>
                      <input type="number" className="form-control" placeholder="Enter sealed envelope bid amount ($)" value={blindBidInput} onChange={(e) => setBlindBidInput(e.target.value)} min={activePlayer.basePrice} />
                      <ActionButton type="submit" className="btn btn-gold" flashColor="rgba(255,183,3,0.5)">Submit Sealed Envelope</ActionButton>
                    </form>
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '10px 0', fontSize: '0.9rem' }}>
                  Bidding controls are active when a player is on the podium.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tabbed Desk (Pool, Watchlist, Ledger) */}
          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
              <button onClick={() => setRightTab('POOL')} style={{ flex: 1, padding: '12px 8px', border: 'none', borderBottom: rightTab === 'POOL' ? '2px solid var(--accent-cyan)' : '2px solid transparent', background: rightTab === 'POOL' ? 'rgba(0,217,255,0.08)' : 'transparent', color: rightTab === 'POOL' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Users size={14} /> Pool ({unsoldApprovedPlayers.length})
              </button>
              <button onClick={() => setRightTab('WATCHLIST')} style={{ flex: 1, padding: '12px 8px', border: 'none', borderBottom: rightTab === 'WATCHLIST' ? '2px solid var(--accent-gold)' : '2px solid transparent', background: rightTab === 'WATCHLIST' ? 'rgba(255,183,3,0.08)' : 'transparent', color: rightTab === 'WATCHLIST' ? 'var(--accent-gold)' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Star size={14} /> Starred
              </button>
              <button onClick={() => setRightTab('LEDGER')} style={{ flex: 1, padding: '12px 8px', border: 'none', borderBottom: rightTab === 'LEDGER' ? '2px solid var(--accent-green)' : '2px solid transparent', background: rightTab === 'LEDGER' ? 'rgba(0,230,153,0.08)' : 'transparent', color: rightTab === 'LEDGER' ? 'var(--accent-green)' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <History size={14} /> Ledger
              </button>
            </div>

            <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
              
              {/* TAB 1: POOL */}
              {rightTab === 'POOL' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {unsoldApprovedPlayers.length > 0 ? unsoldApprovedPlayers.map(ply => {
                      const cat = systemState.categories.find(c => c.id === ply.categoryId);
                      const isStarred = watchlist.includes(ply.id) || (localStorage.getItem('ff_watchlist') && JSON.parse(localStorage.getItem('ff_watchlist') || '[]').includes(ply.id));
                      return (
                        <div key={ply.id} style={{ background: 'var(--bg-card-solid)', padding: '8px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <img src={ply.imageUrl} alt={ply.name} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{ply.name}</div>
                              <div style={{ fontSize: '0.65rem', color: cat ? cat.color : 'var(--accent-green)' }}>{ply.primaryPosition} • {cat ? cat.name : 'Tier'} • ${ply.basePrice.toLocaleString()}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleWatchlist && toggleWatchlist(ply.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isStarred ? '#ffb703' : '#64748b', padding: '4px' }}
                          >
                            <Star size={15} fill={isStarred ? '#ffb703' : 'none'} />
                          </button>
                        </div>
                      );
                    }) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>All registered players have been drafted!</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: WATCHLIST */}
              {rightTab === 'WATCHLIST' && (
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: '0 0 10px 0', color: '#ffb703' }}>My Target Watchlist</h4>
                  {(() => {
                    const saved = localStorage.getItem('ff_watchlist') ? JSON.parse(localStorage.getItem('ff_watchlist') || '[]') : [];
                    const targets = players.filter(p => saved.includes(p.id));
                    if (targets.length === 0) {
                      return <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '20px' }}>No players starred yet. Click the star on players to track them here.</div>;
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {targets.map(ply => {
                          const cat = systemState.categories.find(c => c.id === ply.categoryId);
                          return (
                            <div key={ply.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 183, 3, 0.25)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={ply.imageUrl} alt={ply.name} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>{ply.name}</div>
                                  <div style={{ fontSize: '0.65rem', color: cat?.color || '#38bdf8' }}>{ply.primaryPosition} • ${ply.basePrice?.toLocaleString()}</div>
                                </div>
                              </div>
                              <span className={`badge ${ply.status === 'SOLD' ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                                {ply.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 3: LEDGER */}
              {rightTab === 'LEDGER' && (
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--accent-green)' }}>Live Bidding Ledger</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {auctionLedger.length > 0 ? auctionLedger.map(entry => (
                      <div key={entry.id} style={{ background: 'var(--bg-card-solid)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                        <div>
                          <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>{entry.teamLogo} {entry.teamName}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>bid for {entry.playerName}</span>
                        </div>
                        <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>${entry.amount.toLocaleString()}</div>
                      </div>
                    )) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>No bid activity recorded yet.</div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SIDE-BY-SIDE ROSTER UI (SPECTATOR / COMPARISON) ─────────── */}
      {spectatorTab === 'ROSTERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--accent-gold)" /> Competitor Roster & Budget Comparison
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Live multi-franchise telemetry tracking player acquisitions, remaining purse allowances, and vacant squad slots.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {teams.map(team => {
              const teamRoster = players.filter(p => p.soldToTeamId === team.id || team.roster?.includes(p.id));
              const budgetPct = Math.round((team.spent / (team.budget + team.spent || 100000)) * 100);
              const spotsRemaining = Math.max(0, (systemState.minRoster || 7) - teamRoster.length);

              return (
                <div key={team.id} className="glass-panel" style={{ padding: '20px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '14px', border: `1px solid ${team.primaryColor || 'rgba(255,255,255,0.1)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '2rem' }}>{team.logo}</span>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>{team.name}</h4>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Manager: {team.managerName || 'Unassigned'}</div>
                      </div>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      {teamRoster.length} / {systemState.minRoster || 7} Slots
                    </span>
                  </div>

                  {/* Budget bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Purse Remaining:</span>
                      <span style={{ fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'monospace' }}>${team.budget.toLocaleString()}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${budgetPct}%`, background: team.primaryColor || '#00e699' }}></div>
                    </div>
                  </div>

                  {/* Roster Players List */}
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                      Acquired Squad ({teamRoster.length})
                    </div>
                    {teamRoster.length === 0 ? (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>No players signed yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                        {teamRoster.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>{p.primaryPosition}</span>
                              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{p.jerseyName || p.name}</span>
                            </div>
                            <span style={{ fontFamily: 'monospace', color: 'var(--accent-gold)', fontWeight: 700 }}>
                              ${(p.soldAmount || p.basePrice || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: INFORMATION HUB & DYNAMIC BULLETIN BOARD ───────────────── */}
      {spectatorTab === 'BULLETIN' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          
          {/* Highlight Marquee Signings Ticker */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#ffb703', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} /> Marquee Highlight Signings
            </h3>
            
            {(() => {
              const soldPlayers = players.filter(p => p.status === 'SOLD' && p.soldAmount > 0).sort((a, b) => (b.soldAmount || 0) - (a.soldAmount || 0));

              if (soldPlayers.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <Sparkles size={36} color="#64748b" style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No players sold yet in this session.</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#475569' }}>Top transfer records will automatically populate here as auction hammers down.</p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {soldPlayers.map((p, idx) => {
                    const buyerTeam = teams.find(t => t.id === p.soldToTeamId);
                    const cat = systemState.categories.find(c => c.id === p.categoryId);
                    return (
                      <div key={p.id} style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 183, 3, 0.2)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === 0 ? '#ffb703' : idx === 1 ? '#c0c0c0' : '#cd7f32', color: '#000', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            #{idx + 1}
                          </div>
                          <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f8fafc' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              Signed by <strong style={{ color: 'var(--accent-green)' }}>{buyerTeam?.name || 'Franchise'}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                            ${p.soldAmount.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: cat?.color || '#38bdf8' }}>
                            {cat?.name} Tier
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Tournament Rules & Franchise Directory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Rules Summary */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 14px 0', color: '#00d9ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} /> Official Auction Regulations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  🔹 <strong>Budget Allowance:</strong> Each franchise begins with $100,000 total purse purse.
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  🔹 <strong>Roster Mandate:</strong> Teams must draft a minimum of 7 players to compete in tournament fixtures.
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  🔹 <strong>Budget Guardrails:</strong> Bids that leave insufficient remaining funds to fulfill empty squad slots are automatically blocked.
                </div>
              </div>
            </div>

            {/* Franchise Directory */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 14px 0', color: '#00e699', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} /> Franchise Directory
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {teams.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '10px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{t.logo}</span>
                      <strong style={{ color: '#f8fafc' }}>{t.name}</strong>
                    </div>
                    <span style={{ color: '#94a3b8' }}>Mgr: {t.managerName || 'Unassigned'}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
