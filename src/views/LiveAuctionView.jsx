import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Gavel, Timer, Eye, EyeOff, Play, Pause, RotateCcw, 
  CheckCircle2, XCircle, ShieldAlert, TrendingUp, 
  Users, History, Plus, Minus, Settings2, Dices, RefreshCw,
  ArrowUpFromLine
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
    budgetLedger, adjustTeamBudget, randomToPodium, resetAuctionState
  } = useSystem();

  const [rightTab, setRightTab] = useState('POOL');
  const [selectedTeamId, setSelectedTeamId] = useState(currentUser.teamId || teams[0]?.id || 'team-1');
  const [customBidAmount, setCustomBidAmount] = useState('');
  const [blindBidInput, setBlindBidInput] = useState('');

  // Admin Budget Control
  const [budgetAdjustTeamId, setBudgetAdjustTeamId] = useState(teams[0]?.id || 'team-1');
  const [budgetAdjustAmount, setBudgetAdjustAmount] = useState('');
  const [budgetAdjustReason, setBudgetAdjustReason] = useState('Sponsorship');

  // Feature 4 – global normal-bid timer
  const [globalTimerSetting, setGlobalTimerSetting] = useState(30);
  const [globalTimerInput, setGlobalTimerInput] = useState('30');

  // Feature 5 – bidding type + isolated blind timer
  const [biddingType, setBiddingType] = useState('NORMAL');
  const [blindTimerSetting, setBlindTimerSetting] = useState(60);
  const [blindTimerInput, setBlindTimerInput] = useState('60');

  const activePlayer = players.find(p => p.id === auctionState.activePlayerId);
  const activeCategory = activePlayer ? systemState.categories.find(c => c.id === activePlayer.categoryId) : null;
  const highBidderTeam = teams.find(t => t.id === auctionState.highBidderTeamId);
  const biddingTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const minRaise = calculateMinimumRaise(auctionState.currentBid);
  const nextMinBid = auctionState.currentBid + minRaise;

  // Countdown ticker
  useEffect(() => {
    let interval = null;
    if (auctionState.isTimerRunning && auctionState.timer > 0) {
      interval = setInterval(() => {
        setAuctionState(prev => ({ ...prev, timer: prev.timer - 1 }));
      }, 1000);
    } else if (auctionState.timer === 0 && auctionState.isTimerRunning) {
      setAuctionState(prev => ({ ...prev, isTimerRunning: false }));
      if (auctionState.mode === 'BLIND') {
        addNotification('warning', 'T=0 Sealed Envelopes Ready', 'Timer reached 0! Podium Admin can now reveal winning envelope.');
      } else {
        addNotification('info', 'Timer Expired', 'Podium timer expired! Ready to award player.');
      }
    }
    return () => clearInterval(interval);
  }, [auctionState.isTimerRunning, auctionState.timer]);

  const handleRaiseBid = (increment) => placeBid(selectedTeamId, auctionState.currentBid + increment);

  const handleCustomBid = (e) => {
    e.preventDefault();
    const amount = Number(customBidAmount);
    if (!amount) return;
    if (placeBid(selectedTeamId, amount)) setCustomBidAmount('');
  };

  const handleBlindBidSubmit = (e) => {
    e.preventDefault();
    const amount = Number(blindBidInput);
    if (!amount) return;
    placeBid(selectedTeamId, amount);
    setBlindBidInput('');
  };

  const guardCheck = validateBudgetGuardrail(selectedTeamId, nextMinBid);

  const captainOrVCIds = new Set();
  teams.forEach(t => {
    if (t.captainId) captainOrVCIds.add(t.captainId);
    if (t.viceCaptainId) captainOrVCIds.add(t.viceCaptainId);
  });
  const unsoldApprovedPlayers = players.filter(
    p => p.status === 'APPROVED' && !captainOrVCIds.has(p.id) && p.categoryId !== 'cat-icon'
  );

  const handleBudgetAdjust = (amount, preset = false) => {
    const val = preset ? amount : Number(budgetAdjustAmount);
    if (!val || isNaN(val)) return;
    adjustTeamBudget(budgetAdjustTeamId, val, preset ? (val > 0 ? 'Quick Bonus' : 'Quick Penalty') : budgetAdjustReason);
    if (!preset) setBudgetAdjustAmount('');
  };

  // Feature 5 – apply selected bidding type to active player
  const handleApplyBiddingType = (type) => {
    setBiddingType(type);
    const timerVal = type === 'BLIND' ? blindTimerSetting : type === 'SPEED' ? 10 : globalTimerSetting;
    setAuctionState(prev => ({
      ...prev,
      mode: type === 'BLIND' ? 'BLIND' : 'NORMAL',
      timer: timerVal,
      isTimerRunning: false,
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

  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'PODIUM_ADMIN';

  // ──────────────────────────────────────────────────────────────────
  // ADMIN DASHBOARD VIEW
  // ──────────────────────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Top Header */}
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gavel color="var(--accent-gold)" /> Auction Dashboard
              </h2>
              <span className="badge badge-gold">
                <span className="live-pulse" style={{ marginRight: '6px' }}></span> PHASE 3 ACTIVE
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mission Control: Monitor live bidding and manage franchise financial ledgers.
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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Podium Status Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gavel size={20} color="var(--accent-gold)" /> Podium Status
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
                      <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>{activePlayer.name}</h2>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{activeCategory?.name || 'Tier'} • Base: ${activePlayer.basePrice.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT BID</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-gold)' }}>${auctionState.currentBid.toLocaleString()}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>{highBidderTeam ? highBidderTeam.name : 'No Bids'}</div>
                    </div>
                  </div>

                  {/* Feature 5 – Bidding Type Selector */}
                  <div style={{ background: 'var(--bg-card-solid)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Bidding Type</div>
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

                  {/* Podium action controls */}
                  <div style={{ background: 'var(--bg-card-solid)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>PODIUM CONTROLS</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <ActionButton onClick={() => setAuctionState(prev => ({ ...prev, isTimerRunning: true }))} className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} flashColor="rgba(0,230,153,0.5)">
                        <Play size={14} /> Start Timer
                      </ActionButton>
                      <ActionButton onClick={() => setAuctionState(prev => ({ ...prev, isTimerRunning: false }))} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} flashColor="rgba(255,255,255,0.2)">
                        <Pause size={14} /> Pause
                      </ActionButton>
                      <ActionButton
                        onClick={() => setAuctionState(prev => ({ ...prev, timer: auctionState.mode === 'BLIND' ? blindTimerSetting : globalTimerSetting, isTimerRunning: false }))}
                        className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} flashColor="rgba(0,217,255,0.4)"
                      >
                        <RotateCcw size={14} /> Reset
                      </ActionButton>
                      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }}></div>
                      <ActionButton onClick={sellActivePlayer} className="btn btn-gold" style={{ padding: '8px 12px', fontSize: '0.8rem' }} flashColor="rgba(255,183,3,0.6)">
                        <CheckCircle2 size={14} /> Sell
                      </ActionButton>
                      <ActionButton onClick={passActivePlayer} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} flashColor="rgba(255,77,109,0.4)">
                        <XCircle size={14} /> Pass
                      </ActionButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Gavel size={48} color="var(--accent-gold)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Podium is Empty</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click the <ArrowUpFromLine size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> icon next to any player in the pool, or use "Random to Podium".</p>
                </div>
              )}
            </div>

            {/* Feature 4 – Timer Configuration Panel */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Timer size={18} color="var(--accent-cyan)" /> Timer Configuration
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Normal bid timer */}
                <div style={{ background: 'var(--bg-card-solid)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📢 Normal Bid Global Timer</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number" min="5" max="300"
                      value={globalTimerInput}
                      onChange={(e) => setGlobalTimerInput(e.target.value)}
                      className="form-control"
                      style={{ flex: 1, padding: '8px', fontSize: '0.9rem', textAlign: 'center' }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>sec</span>
                    <ActionButton onClick={applyGlobalTimer} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }} flashColor="rgba(0,230,153,0.5)">
                      Apply
                    </ActionButton>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                    Current: <strong style={{ color: 'var(--text-main)' }}>{globalTimerSetting}s</strong> — applies globally to all Normal bids
                  </div>
                </div>
                {/* Blind bid timer */}
                <div style={{ background: 'var(--bg-card-solid)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(157,78,221,0.3)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#c77dff', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔒 Blind Bid Timer (Isolated)</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number" min="10" max="600"
                      value={blindTimerInput}
                      onChange={(e) => setBlindTimerInput(e.target.value)}
                      className="form-control"
                      style={{ flex: 1, padding: '8px', fontSize: '0.9rem', textAlign: 'center', borderColor: 'rgba(157,78,221,0.4)' }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>sec</span>
                    <ActionButton
                      onClick={applyBlindTimer}
                      style={{ padding: '8px 14px', fontSize: '0.78rem', background: 'rgba(157,78,221,0.25)', border: '1px solid rgba(157,78,221,0.5)', color: '#c77dff', borderRadius: '10px', whiteSpace: 'nowrap', cursor: 'pointer' }}
                      flashColor="rgba(157,78,221,0.5)"
                    >
                      Apply
                    </ActionButton>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                    Current: <strong style={{ color: '#c77dff' }}>{blindTimerSetting}s</strong> — isolated, won't affect Normal timer
                  </div>
                </div>
              </div>
            </div>

            {/* Franchise Budget Control Panel */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings2 size={20} color="var(--accent-cyan)" /> Franchise Budget Control
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

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Team Financial Overview */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--accent-green)" /> Team Financial Overview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto', paddingRight: '6px' }}>
                {teams.map(team => {
                  const total = systemState.totalBudget;
                  const spentPct = Math.min(100, Math.max(0, (team.spent / total) * 100));
                  return (
                    <div key={team.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700 }}>{team.logo} {team.name}</span>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>${team.budget.toLocaleString()}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${spentPct}%`, background: team.primaryColor || 'var(--accent-green)', transition: 'width 0.5s ease' }}></div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>Spent: ${team.spent.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature 1 – Player Pool with Send-to-Podium button */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} color="var(--accent-cyan)" /> Player Pool</span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{unsoldApprovedPlayers.length} Available</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', maxHeight: '320px', overflowY: 'auto' }}>
                {unsoldApprovedPlayers.length > 0 ? unsoldApprovedPlayers.map(ply => {
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
                        <img src={ply.imageUrl} alt={ply.name} style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ply.name}</div>
                          <div style={{ fontSize: '0.63rem', color: cat ? cat.color : 'var(--accent-green)' }}>{cat ? cat.name : 'Tier'} • ${ply.basePrice.toLocaleString()}</div>
                        </div>
                      </div>
                      <ActionButton
                        onClick={() => { if (!isOnStage) pullPlayerToPodium(ply.id); }}
                        title={isOnStage ? 'Currently on stage' : 'Send to Podium'}
                        disabled={isOnStage}
                        flashColor="rgba(0,230,153,0.5)"
                        style={{
                          padding: '5px 9px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0,
                          background: isOnStage ? 'rgba(255,183,3,0.2)' : 'rgba(0,230,153,0.12)',
                          border: `1px solid ${isOnStage ? 'var(--accent-gold)' : 'var(--accent-green)'}`,
                          borderRadius: '6px',
                          color: isOnStage ? 'var(--accent-gold)' : 'var(--accent-green)',
                          cursor: isOnStage ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <ArrowUpFromLine size={11} />
                        {isOnStage ? 'ON STAGE' : 'Podium'}
                      </ActionButton>
                    </div>
                  );
                }) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>All registered players have been drafted!</div>
                )}
              </div>
            </div>

            {/* Budget Adjustment Ledger */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--accent-blue)" /> Adjustment Ledger
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                {budgetLedger && budgetLedger.length > 0 ? budgetLedger.map(entry => (
                  <div key={entry.id} style={{ background: 'var(--bg-card-solid)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{entry.teamLogo} {entry.teamName}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: entry.amount > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {entry.amount > 0 ? '+' : ''}${entry.amount.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>{entry.reason}</span>
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>No manual adjustments recorded.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // MANAGER / ICON / SPECTATOR VIEW
  // ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Phase Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Gavel color="var(--accent-gold)" /> LIVE AUCTION ARENA
            </h2>
            <span className="badge badge-gold">
              <span className="live-pulse" style={{ marginRight: '6px' }}></span> PHASE 3 ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time franchise bidding engine with serialized mutex execution &amp; backend budget guardrails.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {auctionState.mode === 'NORMAL' ? <Eye size={16} color="var(--accent-green)" /> : <EyeOff size={16} color="var(--accent-purple)" />}
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>MODE: <span style={{ color: auctionState.mode === 'NORMAL' ? 'var(--accent-green)' : '#c77dff' }}>{auctionState.mode} BIDDING</span></span>
          </div>
          <div style={{ background: auctionState.timer <= 5 ? 'rgba(255,77,109,0.2)' : 'rgba(0,230,153,0.1)', border: `1px solid ${auctionState.timer <= 5 ? 'var(--accent-red)' : 'var(--accent-green)'}`, borderRadius: '12px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Timer size={18} color={auctionState.timer <= 5 ? 'var(--accent-red)' : 'var(--accent-green)'} />
            <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: auctionState.timer <= 5 ? 'var(--accent-red)' : 'var(--text-main)' }}>
              00:{auctionState.timer < 10 ? `0${auctionState.timer}` : auctionState.timer}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Stage Card */}
          <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
            {activePlayer ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: activeCategory ? activeCategory.color : 'var(--accent-green)', background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: '8px' }}>
                      {activeCategory ? activeCategory.name : 'Platinum Tier'} • Base Price: ${activePlayer.basePrice.toLocaleString()}
                    </span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '8px' }}>{activePlayer.name}</h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '14px', marginTop: '4px' }}>
                      <span>Student ID: <strong>{activePlayer.studentId}</strong></span>
                      <span>Jersey: <strong>{activePlayer.jerseyName}</strong></span>
                      <span>Session: <strong>{activePlayer.session}</strong></span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{auctionState.mode === 'NORMAL' ? 'CURRENT HIGH BID' : 'SEALED ENVELOPES'}</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>${auctionState.currentBid.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px', background: 'var(--bg-card-solid)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)' }}>
                  <img src={activePlayer.imageUrl} alt={activePlayer.name} style={{ width: '100%', height: '180px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--accent-green)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Positional Blueprint:</div>
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
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Podium Stage Empty</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '8px auto 0 auto' }}>
                  The Podium Admin can select an approved player from the unsold pool to initiate live bidding.
                </p>
              </div>
            )}
          </div>

          {/* Manager Bidding Console */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp color="var(--accent-green)" /> Franchise Manager Bidding Panel
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bidding as:</span>
                <select className="form-control" style={{ padding: '4px 10px', fontSize: '0.85rem', fontWeight: 700, width: 'auto' }} value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.logo} {t.name} (${t.budget.toLocaleString()})</option>)}
                </select>
              </div>
            </div>
            <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CURRENT BUDGET</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-green)' }}>${biddingTeam.budget.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ROSTER SLOTS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{biddingTeam.roster.length} / {systemState.minRoster} min</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MIN BID RESERVE NEEDED</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>${(Math.max(0, systemState.minRoster - (biddingTeam.roster.length + 1)) * 3000).toLocaleString()}</div>
                </div>
              </div>
              {!guardCheck.valid && activePlayer && (
                <div style={{ marginTop: '12px', background: 'rgba(255,77,109,0.15)', border: '1px solid var(--accent-red)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} /> <strong>Guardrail Alert:</strong> {guardCheck.reason}
                </div>
              )}
            </div>
            {activePlayer && auctionState.auctionStatus === 'BIDDING' ? (
              auctionState.mode === 'NORMAL' ? (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                    DYNAMIC INCREMENT BUTTONS (+{minRaise ? minRaise.toLocaleString() : '0'} minimum raise):
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
                  <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Envelopes Submitted: <strong>{auctionState.blindBids?.length || 0} teams</strong>
                  </div>
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '10px 0', fontSize: '0.9rem' }}>
                Bidding controls disabled until player is active on stage.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tabbed Desks */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
            <button onClick={() => setRightTab('POOL')} style={{ flex: 1, padding: '12px 16px', border: 'none', borderBottom: rightTab === 'POOL' ? '2px solid var(--accent-cyan)' : '2px solid transparent', background: rightTab === 'POOL' ? 'rgba(0,217,255,0.08)' : 'transparent', color: rightTab === 'POOL' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Users size={14} /> Unsold Pool
            </button>
            <button onClick={() => setRightTab('LEDGER')} style={{ flex: 1, padding: '12px 16px', border: 'none', borderBottom: rightTab === 'LEDGER' ? '2px solid var(--accent-green)' : '2px solid transparent', background: rightTab === 'LEDGER' ? 'rgba(0,230,153,0.08)' : 'transparent', color: rightTab === 'LEDGER' ? 'var(--accent-green)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <History size={14} /> Bidding Ledger
            </button>
          </div>
          <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
            {rightTab === 'POOL' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Unsold Approved Pool</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{unsoldApprovedPlayers.length} Available</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {unsoldApprovedPlayers.length > 0 ? unsoldApprovedPlayers.map(ply => {
                    const cat = systemState.categories.find(c => c.id === ply.categoryId);
                    return (
                      <div key={ply.id} style={{ background: 'var(--bg-card-solid)', padding: '8px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={ply.imageUrl} alt={ply.name} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{ply.name}</div>
                            <div style={{ fontSize: '0.65rem', color: cat ? cat.color : 'var(--accent-green)' }}>{cat ? cat.name : 'Tier'} • ${ply.basePrice.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>All registered players have been drafted!</div>
                  )}
                </div>
              </div>
            )}
            {rightTab === 'LEDGER' && (
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={16} color="var(--accent-cyan)" /> Live Bidding Ledger
                </h3>
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
    </div>
  );
};

