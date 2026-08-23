import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import {
  Crown, Users, TrendingUp, Calendar, DollarSign, Shield,
  Star, Award, Clock, ChevronRight, Zap, Target, Activity
} from 'lucide-react';

export const CaptainDashboardView = () => {
  const { currentUser } = useAuth();
  const { teams, players, systemState } = useSystem();

  const resolveTeam = () => {
    return teams.find(t => t.captainId === currentUser?.id || t.viceCaptainId === currentUser?.id || t.id === currentUser?.teamId) || teams[0] || null;
  };
  const myTeam = resolveTeam();
  const rosterPlayers = myTeam ? players.filter(p => p.soldToTeamId === myTeam.id || myTeam.roster?.includes(p.id)) : [];
  const approvedPlayers = players.filter(p => p.status === 'APPROVED');

  const totalPurse = myTeam ? (Number(myTeam.budget || 0) + Number(myTeam.spent || 0)) : (systemState.totalBudget || 100000);
  const budgetUsedPct = totalPurse > 0 && myTeam ? Math.round((Number(myTeam.spent || 0) / totalPurse) * 100) : 0;
  const remainingBudget = myTeam ? (myTeam.budget ?? 0) : 0;

  const upcomingMatches = [
    { id: 'm1', opponent: 'Vanguard Lions', date: '2026-08-10', time: '15:00', venue: 'Main Ground', type: 'League' },
    { id: 'm2', opponent: 'Apex Predators', date: '2026-08-17', time: '14:00', venue: 'East Wing', type: 'League' },
    { id: 'm3', opponent: 'Titan Knights', date: '2026-08-24', time: '16:00', venue: 'Main Ground', type: 'Cup' },
  ];

  const recentResults = [
    { id: 'r1', opponent: 'Titan Knights', result: 'W', score: '3-1', date: '2026-07-28' },
    { id: 'r2', opponent: 'Apex Predators', result: 'D', score: '2-2', date: '2026-07-21' },
    { id: 'r3', opponent: 'Vanguard Lions', result: 'W', score: '2-0', date: '2026-07-14' },
  ];

  const statCards = [
    { label: 'TEAM BUDGET', value: `$${(myTeam?.budget || 0).toLocaleString()}`, sub: `$${remainingBudget.toLocaleString()} remaining`, icon: DollarSign, color: 'var(--accent-green)', glow: 'rgba(0,230,153,0.15)' },
    { label: 'ROSTER SIZE', value: `${rosterPlayers.length} Players`, sub: `Min 7 required`, icon: Users, color: 'var(--accent-cyan)', glow: 'rgba(0,217,255,0.15)' },
    { label: 'TEAM RANK', value: '#2 of 4', sub: 'Current standings', icon: TrendingUp, color: 'var(--accent-gold)', glow: 'rgba(255,183,3,0.15)' },
    { label: 'MATCHES PLAYED', value: '3 Played', sub: '2W · 1D · 0L', icon: Activity, color: 'var(--accent-purple)', glow: 'rgba(157,78,221,0.15)' },
  ];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top Hero Banner */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(255,183,3,0.12) 0%, rgba(0,230,153,0.07) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px', fontSize: '8rem',
          opacity: 0.06, pointerEvents: 'none', userSelect: 'none'
        }}>⭐</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Crown size={28} color="var(--accent-gold)" />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
                Captain Dashboard
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Welcome back, <strong style={{ color: 'var(--accent-gold)' }}>Icon Player</strong>. Your team command center.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,183,3,0.3)',
              borderRadius: '12px', padding: '10px 18px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem' }}>{myTeam?.logo || '⚡'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700, marginTop: '2px' }}>
                {myTeam?.name || 'Thunderbolts FC'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-gold">ICON CAPTAIN</span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Phase: {systemState.currentPhase}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {statCards.map((card, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', background: card.glow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {card.label}
              </span>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Budget Progress Bar */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="var(--accent-green)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Team Budget Allocation</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ${(myTeam?.spent || 0).toLocaleString()} / ${(myTeam?.budget || 0).toLocaleString()}
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${budgetUsedPct}%`,
            background: budgetUsedPct > 80 ? 'var(--accent-red)' : budgetUsedPct > 50 ? 'var(--accent-gold)' : 'linear-gradient(90deg, var(--accent-green), var(--accent-cyan))',
            borderRadius: '8px',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 10px rgba(0,230,153,0.4)'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          <span>Spent: {budgetUsedPct}%</span>
          <span>Remaining: ${remainingBudget.toLocaleString()}</span>
        </div>
      </div>

      {/* Two-Column: Upcoming Matches + Recent Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Upcoming Matches */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calendar size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Upcoming Matches</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingMatches.map(match => (
              <div key={match.id} style={{
                background: 'rgba(0,217,255,0.06)', border: '1px solid rgba(0,217,255,0.15)',
                borderRadius: '12px', padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>vs {match.opponent}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {match.date} · {match.time} · {match.venue}
                  </div>
                </div>
                <span className={`badge ${match.type === 'Cup' ? 'badge-gold' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                  {match.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Results</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentResults.map(res => (
              <div key={res.id} style={{
                background: res.result === 'W' ? 'rgba(0,230,153,0.07)' : res.result === 'L' ? 'rgba(255,77,109,0.07)' : 'rgba(255,183,3,0.07)',
                border: `1px solid ${res.result === 'W' ? 'rgba(0,230,153,0.2)' : res.result === 'L' ? 'rgba(255,77,109,0.2)' : 'rgba(255,183,3,0.2)'}`,
                borderRadius: '12px', padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>vs {res.opponent}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{res.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1rem' }}>{res.score}</span>
                  <span className={`badge ${res.result === 'W' ? 'badge-green' : res.result === 'L' ? 'badge-red' : 'badge-gold'}`}
                    style={{ fontSize: '0.65rem', padding: '3px 8px' }}>{res.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Zap size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Quick Actions</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'View My Team Roster', icon: Users, color: 'var(--accent-gold)' },
            { label: 'Check Match Schedule', icon: Calendar, color: 'var(--accent-cyan)' },
            { label: 'View Performance Stats', icon: TrendingUp, color: 'var(--accent-green)' },
            { label: 'Read Announcements', icon: Target, color: 'var(--accent-purple)' },
          ].map((action, i) => (
            <button key={i} className="btn btn-secondary" style={{
              flexDirection: 'column', gap: '8px', padding: '16px', height: 'auto',
              border: '1px solid var(--border-color)', borderRadius: '12px'
            }}>
              <action.icon size={22} color={action.color} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
