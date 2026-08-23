import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { useSystemPhase } from '../context/SystemPhaseContext';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, DollarSign, Star, Crown, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';

const POSITION_COLORS = {
  GK: '#9d4edd',
  CB: '#00d9ff', LB: '#00d9ff', RB: '#00d9ff',
  CDM: '#00e699', CM: '#00e699', CAM: '#00e699',
  LW: '#ffb703', RW: '#ffb703', ST: '#ff4d6d', CF: '#ff4d6d'
};

const CATEGORY_COLORS = {
  'cat-icon': '#ef4444',
  'cat-plat': '#00d9ff',
  'cat-gold': '#ffb703',
  'cat-silver': '#c0c0c0',
  'cat-bronze': '#cd7f32'
};

export const MyTeamInfoView = () => {
  const { teams, players, systemState, setTeams, addNotification } = useSystem();
  const { currentPhase } = useSystemPhase();
  const { currentUser } = useAuth();
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [captainAssignId, setCaptainAssignId] = useState('');
  const [viceCaptainAssignId, setViceCaptainAssignId] = useState('');

  const role = currentUser.role;

  const resolveMyTeam = () => {
    if (currentUser?.role === 'TEAM_MANAGER') {
      return teams.find(t => t.managerId === currentUser.id) ||
             teams.find(t => t.id === currentUser.teamId) ||
             teams.find(t => t.managerEmail?.toLowerCase() === currentUser?.email?.toLowerCase()) ||
             teams[0] || null;
    }
    const myPlayer = players.find(p => p.id === currentUser?.id || p.email?.toLowerCase() === currentUser?.email?.toLowerCase() || (currentUser.studentId && p.studentId === currentUser.studentId));
    const teamId = myPlayer?.soldToTeamId || currentUser?.teamId;
    return teams.find(t => t.id === teamId) || teams[0] || null;
  };

  const myTeam = resolveMyTeam();
  const displayRoster = myTeam
    ? players.filter(p => p.soldToTeamId === myTeam.id || myTeam.roster?.includes(p.id))
    : [];

  const totalPurse = myTeam ? (Number(myTeam.budget || 0) + Number(myTeam.spent || 0)) : (systemState.totalBudget || 100000);
  const budgetUsedPct = totalPurse > 0 && myTeam ? Math.round((Number(myTeam.spent || 0) / totalPurse) * 100) : 0;
  const remainingBudget = myTeam ? (myTeam.budget ?? 100000) : 100000;

  const isManager = role === 'TEAM_MANAGER';
  const canAssignLeaders = isManager || role === 'SUPER_ADMIN' || role === 'SUB_ADMIN';

  const handleAssignCaptain = () => {
    if (!myTeam || !captainAssignId) return;
    setTeams(prev => prev.map(t => t.id === myTeam.id ? { ...t, captainId: captainAssignId } : t));
    const player = players.find(p => p.id === captainAssignId);
    addNotification('success', 'Captain Assigned', `${player?.name || 'Player'} is now team captain.`);
    setCaptainAssignId('');
  };

  const handleAssignViceCaptain = () => {
    if (!myTeam || !viceCaptainAssignId) return;
    setTeams(prev => prev.map(t => t.id === myTeam.id ? { ...t, viceCaptainId: viceCaptainAssignId } : t));
    const player = players.find(p => p.id === viceCaptainAssignId);
    addNotification('success', 'Vice Captain Assigned', `${player?.name || 'Player'} is now vice captain.`);
    setViceCaptainAssignId('');
  };

  const getPositionColor = (pos) => POSITION_COLORS[pos] || 'var(--text-muted)';

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Hero Header */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(255,183,3,0.1) 0%, rgba(0,217,255,0.07) 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '7rem', opacity: 0.05, pointerEvents: 'none' }}>
          {myTeam?.logo || '⚡'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '2.5rem' }}>{myTeam?.logo || '⚡'}</span>
              <div>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 900, margin: 0 }}>{myTeam?.name || 'Thunderbolts FC'}</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span className="badge badge-gold">{role.replace('_', ' ')} Team View</span>
                  <span className="badge badge-green">{currentPhase.label}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'MANAGER', value: myTeam?.managerName || 'Unassigned', color: 'var(--accent-cyan)' },
              { label: 'ROSTER', value: `${displayRoster.length} Players`, color: 'var(--accent-green)' },
              { label: 'BUDGET', value: `$${(myTeam?.budget || 100000).toLocaleString()}`, color: 'var(--accent-gold)' },
              { label: 'SPENT', value: `$${(myTeam?.spent || 0).toLocaleString()}`, color: 'var(--accent-red)' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
                padding: '10px 14px', textAlign: 'center', border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: item.color, marginTop: '3px' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Progress */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Budget Used ({budgetUsedPct}%)</span>
            <span>${remainingBudget.toLocaleString()} remaining</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${budgetUsedPct}%`,
              background: budgetUsedPct > 80 ? 'var(--accent-red)' : 'linear-gradient(90deg, var(--accent-gold), #fb8500)',
              borderRadius: '8px', transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Team Roster</h3>
          </div>
          <span className="badge badge-gold">{displayRoster.length} Players</span>
        </div>

        {displayRoster.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
            <Users size={40} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
            <p>No players in roster yet. Players will appear here after the auction.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {displayRoster.map((player) => {
              const catColor = CATEGORY_COLORS[player.categoryId] || 'var(--text-muted)';
              const isCaptain = myTeam?.captainId === player.id;
              const isViceCaptain = myTeam?.viceCaptainId === player.id;
              const isExpanded = expandedPlayer === player.id;

              return (
                <div key={player.id} style={{
                  background: 'rgba(255,183,3,0.05)', border: `1px solid ${isCaptain ? 'rgba(255,183,3,0.4)' : 'var(--border-color)'}`,
                  borderRadius: '14px', overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}>
                  {/* Player Header */}
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden',
                      border: `2px solid ${catColor}`, flexShrink: 0,
                      background: 'var(--bg-card-solid)'
                    }}>
                      {player.imageUrl ? (
                        <img src={player.imageUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', truncate: 'ellipsis' }}>{player.name}</span>
                        {isCaptain && <Crown size={14} color="var(--accent-gold)" />}
                        {isViceCaptain && <Star size={14} color="var(--accent-cyan)" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 800, color: getPositionColor(player.primaryPosition),
                          background: 'rgba(0,0,0,0.3)', padding: '2px 7px', borderRadius: '6px'
                        }}>{player.primaryPosition}</span>
                        <span style={{ fontSize: '0.7rem', color: catColor, fontWeight: 700 }}>
                          {player.categoryId?.replace('cat-', '').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Expanded Player Details */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border-color)', padding: '12px 16px', background: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                        <div><span style={{ color: 'var(--text-dim)' }}>Student ID: </span><span style={{ fontFamily: 'var(--font-mono)' }}>{player.studentId}</span></div>
                        <div><span style={{ color: 'var(--text-dim)' }}>Jersey: </span><strong>{player.jerseyName}</strong></div>
                        <div><span style={{ color: 'var(--text-dim)' }}>Session: </span>{player.session}</div>
                        <div><span style={{ color: 'var(--text-dim)' }}>Base Price: </span><span style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>${player.basePrice?.toLocaleString()}</span></div>
                      </div>
                      {player.secondaryPositions?.length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Alt. Positions: </span>
                          {player.secondaryPositions.map(pos => (
                            <span key={pos} style={{
                              marginLeft: '4px', background: 'rgba(255,255,255,0.08)',
                              padding: '2px 7px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700
                            }}>{pos}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Captain & Vice-Captain Assignment */}
      {canAssignLeaders && (
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Crown size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Assign Leaders</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Team Captain</label>
              <select
                value={captainAssignId}
                onChange={(e) => setCaptainAssignId(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '8px 10px', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="">Select captain...</option>
                {displayRoster.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.primaryPosition})</option>
                ))}
              </select>
              <button onClick={handleAssignCaptain} className="btn btn-primary" style={{ width: '100%', marginTop: '8px', fontSize: '0.82rem' }} disabled={!captainAssignId}>
                <Crown size={14} /> Assign Captain
              </button>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Vice Captain</label>
              <select
                value={viceCaptainAssignId}
                onChange={(e) => setViceCaptainAssignId(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '8px 10px', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="">Select vice captain...</option>
                {displayRoster.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.primaryPosition})</option>
                ))}
              </select>
              <button onClick={handleAssignViceCaptain} className="btn btn-secondary" style={{ width: '100%', marginTop: '8px', fontSize: '0.82rem' }} disabled={!viceCaptainAssignId}>
                <Star size={14} /> Assign Vice Captain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Management Notes */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Shield size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Team Rules & Requirements</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { rule: 'Minimum 7 players in roster', status: displayRoster.length >= 7, label: displayRoster.length >= 7 ? 'MET' : 'NOT MET' },
            { rule: 'Captain assigned to roster', status: !!myTeam?.captainId, label: myTeam?.captainId ? 'ASSIGNED' : 'PENDING' },
            { rule: 'Budget within allocation', status: budgetUsedPct <= 100, label: budgetUsedPct <= 100 ? 'OK' : 'EXCEEDED' },
          ].map((r, i) => (
            <div key={i} style={{
              padding: '14px', borderRadius: '12px',
              background: r.status ? 'rgba(0,230,153,0.07)' : 'rgba(255,77,109,0.07)',
              border: `1px solid ${r.status ? 'rgba(0,230,153,0.2)' : 'rgba(255,77,109,0.2)'}`
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>{r.rule}</div>
              <span className={`badge ${r.status ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
