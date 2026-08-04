import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { useSystemPhase } from '../context/SystemPhaseContext';
import {
  Trophy,
  Gavel,
  Users,
  Calendar,
  BookOpen,
  Shield,
  Activity,
  Award,
  Zap,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Radio,
  Crown,
  Target,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const HomePageView = ({ onNavigate }) => {
  const { teams, players, managers } = useSystem();
  const { currentPhase, currentPhaseId } = useSystemPhase();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const statCards = [
    { label: 'FRANCHISE TEAMS', value: teams.length || 6, sub: 'Registered CSE Batches', icon: Shield, color: '#00d9ff', glow: 'rgba(0, 217, 255, 0.12)' },
    { label: 'REGISTERED PLAYERS', value: players.length || 45, sub: 'Athletes in Draft Pool', icon: Users, color: '#00e699', glow: 'rgba(0, 230, 153, 0.12)' },
    { label: 'ACTIVE MANAGERS', value: managers.length || 6, sub: 'Team Captains', icon: Crown, color: '#ffb703', glow: 'rgba(255, 183, 3, 0.12)' },
    { label: 'LEAGUE STAGE', value: currentPhase.label || 'Phase 1: Setup', sub: 'Current Active Phase', icon: Activity, color: '#9d4edd', glow: 'rgba(157, 78, 221, 0.12)' },
  ];

  const keyFeatures = [
    {
      icon: Gavel,
      color: '#ffb703',
      title: 'Live Player Auction & Bidding',
      desc: 'Real-time franchise bidding podium with automated base prices, purse budget validation, and live socket sync.'
    },
    {
      icon: Shield,
      color: '#00d9ff',
      title: 'Departmental Franchise Teams',
      desc: 'Unique squad rosters for CSE batches with dedicated icon captains, purse tracking, and squad depth stats.'
    },
    {
      icon: Trophy,
      color: '#00e699',
      title: 'Live Tournament & Standings',
      desc: 'Group stage fixtures, double-legged playoffs, live scoreboards, and real-time points table standings.'
    },
    {
      icon: Award,
      color: '#ff4d6d',
      title: 'Player Performance Stats',
      desc: 'Track Golden Boot top goalscorers, playmaking assists, Golden Glove clean sheets, and match MVP awards.'
    },
    {
      icon: BookOpen,
      color: '#9d4edd',
      title: 'Official CSE Rulebook',
      desc: 'Transparent bidding math matrix, player category base prices, retention rules, and match length limits.'
    },
    {
      icon: Crown,
      color: '#38bdf8',
      title: 'Captain & Manager Desk',
      desc: 'Exclusive command portal for team captains to manage tactics, squad balance, and bidding strategies.'
    }
  ];

  const roadmapSteps = [
    { step: '01', title: 'Setup & Rules', status: 'COMPLETED', desc: 'Financial limits, category base prices, and batch franchises created.' },
    { step: '02', title: 'Player Registration', status: currentPhaseId === 'PHASE_2_REGISTRATION' ? 'ACTIVE' : 'UPCOMING', desc: 'CSE students register profiles, positions, preferred roles, and bio.' },
    { step: '03', title: 'The Live Auction', status: currentPhaseId === 'PHASE_3_AUCTION' ? 'ACTIVE' : 'UPCOMING', desc: 'Real-time dynamic bidding for players by franchise managers.' },
    { step: '04', title: 'Tournament Finals', status: currentPhaseId === 'PHASE_4_TOURNAMENT' ? 'ACTIVE' : 'UPCOMING', desc: 'Thrilling group matches, semi-finals, and grand trophy championship.' }
  ];

  const faqs = [
    {
      q: 'What is the GSTU CSE Football Tournament?',
      a: 'It is the official Department of Computer Science & Engineering Football Tournament at GSTU, featuring batch franchises, live player auctions, and competitive tournament fixtures.'
    },
    {
      q: 'How does the Live Player Auction work?',
      a: 'Each team manager receives a virtual budget purse. Players are put up on the auction podium by category with base prices. Managers bid in real time to build their dream squad within budget limits.'
    },
    {
      q: 'Who can participate as a player?',
      a: 'All current students, alumni, and faculty members of the GSTU CSE Department can register as players in the pool.'
    },
    {
      q: 'Where can I check the match schedule and standings?',
      a: 'Navigate to the Schedule and Live Tournament tabs in the top navigation bar to view real-time match fixtures, scores, and points table.'
    }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Hero Banner Container */}
      <section className="glass-panel" style={{
        position: 'relative',
        padding: '48px 36px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        borderRadius: '24px'
      }}>
        {/* Background Decorative Glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-120px',
          left: '-80px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 230, 153, 0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          {/* Top Badges Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
            <span className="badge badge-cyan" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
              <Sparkles style={{ width: '14px', height: '14px' }} /> OFFICIAL CSE LEAGUE PLATFORM
            </span>
            <span className="badge badge-green" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
              <Activity style={{ width: '14px', height: '14px' }} /> CURRENT PHASE: {currentPhase.label}
            </span>
            <span className="badge badge-gold" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
              <Shield style={{ width: '14px', height: '14px' }} /> GSTU DEPARTMENTAL GLORY
            </span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'calc(2rem + 1.8vw)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: '0 0 16px 0',
            maxWidth: '1000px',
            textTransform: 'uppercase'
          }}>
            GSTU CSE <span className="gradient-text-green">FOOTBALL TOURNAMENT</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.05rem',
            color: '#94a3b8',
            maxWidth: '780px',
            margin: '0 0 28px 0',
            lineHeight: 1.6
          }}>
            The premier Computer Science & Engineering football franchise platform at GSTU. Experience live player bidding auctions, squad management, legged fixtures, and real-time tournament statistics.
          </p>

          {/* Hero Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {currentPhaseId === 'AUCTION' && (
              <button
                onClick={() => onNavigate && onNavigate('PUBLIC_LIVE_AUCTION')}
                className="btn btn-gold"
                style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: '12px' }}
              >
                <Radio style={{ width: '18px', height: '18px' }} />
                <span>Live Auction</span>
              </button>
            )}
            {currentPhaseId === 'TOURNAMENT' && (
              <button
                onClick={() => onNavigate && onNavigate('PUBLIC_LIVE_TOURNAMENT')}
                className="btn btn-primary"
                style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: '12px' }}
              >
                <Trophy style={{ width: '18px', height: '18px' }} />
                <span>Live Tournament</span>
              </button>
            )}
            <button
              onClick={() => onNavigate && onNavigate('PUBLIC_SCHEDULE')}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: '12px' }}
            >
              <Calendar style={{ width: '18px', height: '18px' }} />
              <span>View Tournament Schedule</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('PUBLIC_RULEBOOK')}
              className="btn btn-secondary"
              style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: '12px' }}
            >
              <BookOpen style={{ width: '18px', height: '18px', color: '#00d9ff' }} />
              <span>Official Rulebook</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('PUBLIC_LOGIN')}
              className="btn btn-gold"
              style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: '12px' }}
            >
              <Users style={{ width: '18px', height: '18px' }} />
              <span>Player Registration & Login</span>
            </button>
          </div>

        </div>
      </section>

      {/* Live Statistics Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="glass-panel"
              style={{
                padding: '24px',
                background: card.glow,
                border: `1px solid ${card.color}33`,
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {card.label}
                </span>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: `${card.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: card.color }} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {card.sub}
              </div>
            </div>
          );
        })}
      </section>

      {/* Key Tournament Features Section */}
      <section className="glass-panel" style={{ padding: '36px', borderRadius: '20px' }}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(0, 230, 153, 0.1)', border: '1px solid rgba(0, 230, 153, 0.25)', color: '#00e699', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
            <Zap style={{ width: '14px', height: '14px' }} /> POWERFUL PLATFORM FEATURES
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Everything Built for GSTU CSE Football
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '6px', maxWidth: '600px', margin: '6px auto 0' }}>
            From pre-auction budget math matrix to post-tournament trophy celebrations, explore how our platform powers the entire league lifecycle.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {keyFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: `${feat.color}18`,
                  border: `1px solid ${feat.color}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon style={{ width: '24px', height: '24px', color: feat.color }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Event Lifecycle & Roadmap Timeline */}
      <section className="glass-panel" style={{ padding: '36px', borderRadius: '20px' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(157, 78, 221, 0.1)', border: '1px solid rgba(157, 78, 221, 0.25)', color: '#c77dff', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
            <Clock style={{ width: '14px', height: '14px' }} /> TOURNAMENT ROADMAP
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            4-Stage League Execution Lifecycle
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {roadmapSteps.map((s, i) => (
            <div
              key={i}
              style={{
                background: s.status === 'ACTIVE' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                border: s.status === 'ACTIVE' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: s.status === 'ACTIVE' ? '#3b82f6' : '#64748b' }}>
                  {s.step}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: s.status === 'COMPLETED' ? 'rgba(0, 230, 153, 0.15)' : s.status === 'ACTIVE' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.15)',
                  color: s.status === 'COMPLETED' ? '#00e699' : s.status === 'ACTIVE' ? '#60a5fa' : '#64748b'
                }}>
                  {s.status}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                {s.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="glass-panel" style={{ padding: '36px', borderRadius: '20px' }}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(0, 217, 255, 0.1)', border: '1px solid rgba(0, 217, 255, 0.25)', color: '#00d9ff', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
            <HelpCircle style={{ width: '14px', height: '14px' }} /> TOURNAMENT FAQ
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '900px', margin: '0 auto' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => toggleFaq(idx)}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>
                  {faq.q}
                </span>
                {openFaq === idx ? (
                  <ChevronUp style={{ width: '18px', height: '18px', color: '#00d9ff' }} />
                ) : (
                  <ChevronDown style={{ width: '18px', height: '18px', color: '#64748b' }} />
                )}
              </div>
              {openFaq === idx && (
                <div style={{ marginTop: '12px', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Footer Card */}
      <section style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
        borderRadius: '20px',
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 12px 30px rgba(29, 78, 216, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
          Ready for the GSTU CSE Football Showdown?
        </h2>
        <p style={{ color: '#93c5fd', fontSize: '0.95rem', maxWidth: '600px', margin: 0 }}>
          Register your player profile now, explore batch team rosters, and join the excitement on auction day!
        </p>
        <button
          onClick={() => onNavigate && onNavigate('PUBLIC_LOGIN')}
          className="btn btn-gold"
          style={{ padding: '12px 28px', fontSize: '0.92rem', marginTop: '8px' }}
        >
          <Crown style={{ width: '18px', height: '18px' }} />
          <span>Register / Login to Portal</span>
        </button>
      </section>

    </div>
  );
};
