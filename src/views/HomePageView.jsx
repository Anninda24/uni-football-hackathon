import React from 'react';
import { useSystem } from '../context/SystemContext';
import { LayoutDashboard, Users, Newspaper, Calendar, SlidersHorizontal } from 'lucide-react';

export const HomePageView = () => {
  const { teams, players, managers, systemState } = useSystem();

  const statCards = [
    { label: 'TOTAL TEAMS', value: teams.length, sub: 'Registered franchises', icon: LayoutDashboard, color: 'var(--accent-cyan)', glow: 'rgba(0,217,255,0.1)' },
    { label: 'REGISTERED PLAYERS', value: players.length, sub: 'Athletes in pool', icon: Users, color: 'var(--accent-green)', glow: 'rgba(0,230,153,0.1)' },
    { label: 'MANAGERS', value: managers.length, sub: 'Active captains', icon: Newspaper, color: 'var(--accent-gold)', glow: 'rgba(255,183,3,0.1)' },
    { label: 'CURRENT PHASE', value: systemState.currentPhase, sub: 'System status', icon: SlidersHorizontal, color: 'var(--accent-purple)', glow: 'rgba(157,78,221,0.1)' },
  ];

  const quickLinks = [
    { label: 'Registered Players', icon: Users, color: 'var(--accent-cyan)' },
    { label: 'Auction Schedule', icon: Calendar, color: 'var(--accent-gold)' },
    { label: 'Rules & Categories', icon: Newspaper, color: 'var(--accent-green)' },
    { label: 'News', icon: SlidersHorizontal, color: 'var(--accent-purple)' },
  ];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Hero Banner */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(0,217,255,0.12) 0%, rgba(0,230,153,0.07) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px', fontSize: '8rem',
          opacity: 0.06, pointerEvents: 'none', userSelect: 'none'
        }}>⚽</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <LayoutDashboard size={28} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
            Spectator Portal
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, maxWidth: '700px' }}>
          Welcome to the University Football League spectator portal. Explore teams, players, auction schedules, and the latest news.
        </p>
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

      {/* Quick Links */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <SlidersHorizontal size={18} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Quick Links</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {quickLinks.map((link, i) => (
            <button key={i} className="btn btn-secondary" style={{
              flexDirection: 'column', gap: '8px', padding: '16px', height: 'auto',
              border: '1px solid var(--border-color)', borderRadius: '12px'
            }}>
              <link.icon size={22} color={link.color} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
