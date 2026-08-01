import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Gavel, 
  Timer, 
  Eye, 
  EyeOff, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  TrendingUp, 
  Award, 
  Users, 
  DollarSign, 
  History,
  Lock
} from 'lucide-react';

export const LiveAuctionView = ({ isPodiumAdmin = false }) => {
  const { 
    systemState, 
    currentUser, 
    teams, 
    players, 
    auctionState, 
    setAuctionState,
    auctionLedger, 
    pullPlayerToPodium, 
    placeBid, 
    sellActivePlayer, 
    passActivePlayer, 
    calculateMinimumRaise,
    validateBudgetGuardrail,
    addNotification 
  } = useSystem();

  // Active Player on Stage
  const activePlayer = players.find(p => p.id === auctionState.activePlayerId);
  const activeCategory = activePlayer ? systemState.categories.find(c => c.id === activePlayer.categoryId) : null;
  const highBidderTeam = teams.find(t => t.id === auctionState.highBidderTeamId);

  // Selected Team for bidding (defaults to user's assigned team if Team Manager)
  const [selectedTeamId, setSelectedTeamId] = useState(currentUser.teamId || teams[0]?.id || 'team-1');
  const [customBidAmount, setCustomBidAmount] = useState('');
  const [blindBidInput, setBlindBidInput] = useState('');

  // Selected team object
  const biddingTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  // Dynamic Minimum Raise Calculation
  const minRaise = calculateMinimumRaise(auctionState.currentBid);
  const nextMinBid = auctionState.currentBid + minRaise;

  // Real-time Timer Effect
  useEffect(() => {
    let interval = null;
    if (auctionState.isTimerRunning && auctionState.timer > 0) {
      interval = setInterval(() => {
        setAuctionState(prev => ({
          ...prev,
          timer: prev.timer - 1
        }));
      }, 1000);
    } else if (auctionState.timer === 0 && auctionState.isTimerRunning) {
      // Timer hit T=0!
      setAuctionState(prev => ({ ...prev, isTimerRunning: false }));
      if (auctionState.mode === 'BLIND') {
        addNotification('warning', 'T=0 Sealed Envelopes Ready', 'Timer reached 0! Podium Admin can now reveal winning envelope.');
      } else {
        addNotification('info', 'Timer Expired', 'Podium timer expired! Ready to award player.');
      }
    }

    return () => clearInterval(interval);
  }, [auctionState.isTimerRunning, auctionState.timer]);

  // Handle Quick Raise Bid
  const handleRaiseBid = (increment) => {
    const targetBid = auctionState.currentBid + increment;
    placeBid(selectedTeamId, targetBid);
  };

  const handleCustomBid = (e) => {
    e.preventDefault();
    const amount = Number(customBidAmount);
    if (!amount) return;
    const success = placeBid(selectedTeamId, amount);
    if (success) setCustomBidAmount('');
  };

  const handleBlindBidSubmit = (e) => {
    e.preventDefault();
    const amount = Number(blindBidInput);
    if (!amount) return;
    placeBid(selectedTeamId, amount);
    setBlindBidInput('');
  };

  // Guardrail Status for Selected Bidding Team
  const guardCheck = validateBudgetGuardrail(selectedTeamId, nextMinBid);

  // Unsold Approved Players Pool
  const captainOrVCIds = new Set();
  teams.forEach(t => {
    if (t.captainId) captainOrVCIds.add(t.captainId);
    if (t.viceCaptainId) captainOrVCIds.add(t.viceCaptainId);
  });
  const unsoldApprovedPlayers = players.filter(p => p.status === 'APPROVED' && !captainOrVCIds.has(p.id) && p.categoryId !== 'cat-icon');

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
            Real-time franchise bidding engine with serialized mutex execution & backend budget guardrails.
          </p>
        </div>

        {/* Mode & Timer Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {auctionState.mode === 'NORMAL' ? <Eye size={16} color="var(--accent-green)" /> : <EyeOff size={16} color="var(--accent-purple)" />}
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              MODE: <span style={{ color: auctionState.mode === 'NORMAL' ? 'var(--accent-green)' : '#c77dff' }}>{auctionState.mode} BIDDING</span>
            </span>
          </div>

          <div style={{ 
            background: auctionState.timer <= 5 ? 'rgba(255, 77, 109, 0.2)' : 'rgba(0, 230, 153, 0.1)', 
            border: `1px solid ${auctionState.timer <= 5 ? 'var(--accent-red)' : 'var(--accent-green)'}`,
            borderRadius: '12px',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Timer size={18} color={auctionState.timer <= 5 ? 'var(--accent-red)' : 'var(--accent-green)'} />
            <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: auctionState.timer <= 5 ? 'var(--accent-red)' : 'var(--text-main)' }}>
              00:{auctionState.timer < 10 ? `0${auctionState.timer}` : auctionState.timer}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Podium Stage & Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Podium Center Stage & Manager Bidding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Stage Card */}
          <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
            
            {activePlayer ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 800, 
                      color: activeCategory ? activeCategory.color : 'var(--accent-green)',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '4px 12px',
                      borderRadius: '8px'
                    }}>
                      {activeCategory ? activeCategory.name : 'Platinum Tier'} • Base Price: ${activePlayer.basePrice.toLocaleString()}
                    </span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '8px' }}>
                      {activePlayer.name}
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '14px', marginTop: '4px' }}>
                      <span>Student ID: <strong>{activePlayer.studentId}</strong></span>
                      <span>Jersey: <strong>{activePlayer.jerseyName}</strong></span>
                      <span>Session: <strong>{activePlayer.session}</strong></span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {auctionState.mode === 'NORMAL' ? 'CURRENT HIGH BID' : 'SEALED ENVELOPES'}
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                      ${auctionState.currentBid.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Player Profile Detail Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px', background: 'var(--bg-card-solid)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)' }}>
                  <img
                    src={activePlayer.imageUrl}
                    alt={activePlayer.name}
                    style={{ width: '100%', height: '180px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--accent-green)' }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Positional Blueprint:</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                          PRIMARY: {activePlayer.primaryPosition}
                        </span>
                        {activePlayer.secondaryPositions && activePlayer.secondaryPositions.map(sec => (
                          <span key={sec} className="badge badge-cyan" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                            SECONDARY: {sec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Current Leader Banner */}
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

          {/* Team Manager Bidding Console */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp color="var(--accent-green)" /> Franchise Manager Bidding Panel
              </h3>

              {/* Bidding Team Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bidding as:</span>
                <select
                  className="form-control"
                  style={{ padding: '4px 10px', fontSize: '0.85rem', fontWeight: 700, width: 'auto' }}
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.logo} {t.name} (${t.budget.toLocaleString()})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget & Guardrail Reserve Bar */}
            <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', uppercase: true }}>Current Budget</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                    ${biddingTeam.budget.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', uppercase: true }}>Roster Slots</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {biddingTeam.roster.length} / {systemState.minRoster} min
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', uppercase: true }}>Min Bid Reserve Needed</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    ${(Math.max(0, systemState.minRoster - (biddingTeam.roster.length + 1)) * 3000).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Guardrail Warning Banner */}
              {!guardCheck.valid && activePlayer && (
                <div style={{ marginTop: '12px', background: 'rgba(255, 77, 109, 0.15)', border: '1px solid var(--accent-red)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} /> <strong>Guardrail Alert:</strong> {guardCheck.reason}
                </div>
              )}
            </div>

            {/* Bidding Controls (Normal Mode vs Blind Mode) */}
            {activePlayer && auctionState.auctionStatus === 'BIDDING' ? (
              auctionState.mode === 'NORMAL' ? (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                    DYNAMIC INCREMENT BUTTONS (+{minRaise ? minRaise.toLocaleString() : '0'} minimum raise):
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <button
                      onClick={() => handleRaiseBid(minRaise)}
                      className="btn btn-primary"
                      disabled={!guardCheck.valid}
                      style={{ padding: '12px', fontSize: '0.95rem' }}
                    >
                      +${minRaise.toLocaleString()} (Next Min: ${nextMinBid.toLocaleString()})
                    </button>
                    <button
                      onClick={() => handleRaiseBid(minRaise * 2)}
                      className="btn btn-gold"
                      disabled={!guardCheck.valid}
                      style={{ padding: '12px', fontSize: '0.95rem' }}
                    >
                      +${(minRaise * 2).toLocaleString()}
                    </button>
                    <button
                      onClick={() => handleRaiseBid(minRaise * 5)}
                      className="btn btn-secondary"
                      disabled={!guardCheck.valid}
                      style={{ padding: '12px', fontSize: '0.95rem' }}
                    >
                      +${(minRaise * 5).toLocaleString()}
                    </button>
                  </div>

                  <form onSubmit={handleCustomBid} style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder={`Enter custom bid (Min: $${nextMinBid.toLocaleString()})`}
                      value={customBidAmount}
                      onChange={(e) => setCustomBidAmount(e.target.value)}
                      min={nextMinBid}
                      disabled={!guardCheck.valid}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!guardCheck.valid}>
                      Place Custom Bid
                    </button>
                  </form>
                </div>
              ) : (
                /* Blind Mode Sealed Envelope Submit */
                <div>
                  <div style={{ background: 'rgba(157, 78, 221, 0.15)', border: '1px solid rgba(157, 78, 221, 0.4)', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '0.85rem' }}>
                    🔒 <strong>Blind Auction Active:</strong> Submit one hidden monetary envelope bid. All bids remain sealed until timer reaches T=0.
                  </div>

                  <form onSubmit={handleBlindBidSubmit} style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter sealed envelope bid amount ($)"
                      value={blindBidInput}
                      onChange={(e) => setBlindBidInput(e.target.value)}
                      min={activePlayer.basePrice}
                    />
                    <button type="submit" className="btn btn-gold">
                      Submit Sealed Envelope
                    </button>
                  </form>

                  <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Envelopes Submitted: <strong>{auctionState.blindBids.length} teams</strong>
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

        {/* Right Column: Podium Admin Controls & Unsold Pool / Live Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Podium Admin Control Desk */}
          {(isPodiumAdmin || currentUser.role === 'PODIUM_ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--accent-gold-glow)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gavel size={18} /> Podium Admin Override Desk
              </h3>

              {/* Mode Toggle */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                  onClick={() => setAuctionState(prev => ({ ...prev, mode: 'NORMAL' }))}
                  className={`btn ${auctionState.mode === 'NORMAL' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                >
                  <Eye size={14} /> Normal Mode
                </button>
                <button
                  onClick={() => setAuctionState(prev => ({ ...prev, mode: 'BLIND' }))}
                  className={`btn ${auctionState.mode === 'BLIND' ? 'btn-gold' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                >
                  <EyeOff size={14} /> Blind Mode
                </button>
              </div>

              {/* Timer Controls */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={() => setAuctionState(prev => ({ ...prev, isTimerRunning: true }))}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <Play size={14} /> Start Timer
                </button>
                <button
                  onClick={() => setAuctionState(prev => ({ ...prev, isTimerRunning: false }))}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <Pause size={14} /> Pause Timer
                </button>
                <button
                  onClick={() => setAuctionState(prev => ({ ...prev, timer: 30 }))}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

              {/* Final Award / Pass Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={sellActivePlayer}
                  disabled={!activePlayer}
                  className="btn btn-gold"
                  style={{ padding: '10px', fontSize: '0.85rem' }}
                >
                  <CheckCircle2 size={16} /> 🔨 Sell Player
                </button>
                <button
                  onClick={passActivePlayer}
                  disabled={!activePlayer}
                  className="btn btn-secondary"
                  style={{ padding: '10px', fontSize: '0.85rem' }}
                >
                  <XCircle size={16} /> Pass (Unsold)
                </button>
              </div>
            </div>
          )}

          {/* Unsold Player Pool (Pull to Stage) */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Unsold Approved Pool</span>
              <span className="badge badge-cyan">{unsoldApprovedPlayers.length} Available</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {unsoldApprovedPlayers.length > 0 ? unsoldApprovedPlayers.map(ply => {
                const cat = systemState.categories.find(c => c.id === ply.categoryId);
                return (
                  <div key={ply.id} style={{ background: 'var(--bg-card-solid)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={ply.imageUrl} alt={ply.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{ply.name} ({ply.primaryPosition})</div>
                        <div style={{ fontSize: '0.7rem', color: cat ? cat.color : 'var(--accent-green)' }}>
                          {cat ? cat.name : 'Tier'} • ${ply.basePrice.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => pullPlayerToPodium(ply.id)}
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Pull to Stage
                    </button>
                  </div>
                );
              }) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                  All registered players have been drafted!
                </div>
              )}
            </div>
          </div>

          {/* Live Bidding Stream Ledger */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="var(--accent-cyan)" /> Live Bidding Ledger
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {auctionLedger.length > 0 ? auctionLedger.map(entry => (
                <div key={entry.id} style={{ background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>{entry.teamLogo} {entry.teamName}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>bid for {entry.playerName}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                    ${entry.amount.toLocaleString()}
                  </div>
                </div>
              )) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                  No bid activity recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
