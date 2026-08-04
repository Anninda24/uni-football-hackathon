import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { Clock, Calendar, Timer } from 'lucide-react';

export const CountdownTimerView = () => {
  const { fixtures, systemState, addNotification } = useSystem();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const DEMO_DATE = '2026-09-01T00:00:00';

  const getNextFixtureDate = () => {
    const now = new Date();
    const upcoming = fixtures
      .filter(f => f.status === 'UPCOMING' && new Date(f.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming.length > 0 ? upcoming[0].date : DEMO_DATE;
  };

  const targetDate = getNextFixtureDate();

  useEffect(() => {
    if (!isTimerRunning) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, targetDate]);

  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
    addNotification(
      'info',
      'Timer Toggled',
      isTimerRunning ? 'Countdown timer paused' : 'Countdown timer resumed'
    );
  };

  const formatNumber = (num) => String(num).padStart(2, '0');

  const timerBlocks = [
    { label: 'DAYS', value: formatNumber(timeLeft.days) },
    { label: 'HOURS', value: formatNumber(timeLeft.hours) },
    { label: 'MINS', value: formatNumber(timeLeft.minutes) },
    { label: 'SECS', value: formatNumber(timeLeft.seconds) },
  ];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Countdown Timer Card */}
      <div className="glass-panel" style={{
        padding: '36px 28px',
        background: 'linear-gradient(135deg, rgba(0,217,255,0.1) 0%, rgba(0,230,153,0.06) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px', fontSize: '8rem',
          opacity: 0.04, pointerEvents: 'none', userSelect: 'none'
        }}>
          <Clock size={160} color="var(--accent-cyan)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Timer size={28} color="var(--accent-gold)" />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
              Auction Countdown
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
              {systemState.currentPhase}
            </span>
            <button
              className="btn btn-secondary"
              onClick={toggleTimer}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: isTimerRunning ? 'rgba(255,77,109,0.15)' : 'rgba(0,230,153,0.15)',
                color: isTimerRunning ? 'var(--accent-red)' : 'var(--accent-green)',
                cursor: 'pointer'
              }}
            >
              {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
            </button>
          </div>
        </div>

        {/* Target Date Info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
          fontSize: '0.85rem', color: 'var(--text-muted)'
        }}>
          <Calendar size={16} color="var(--accent-cyan)" />
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            Target: {targetDate === DEMO_DATE ? 'Demo Date' : new Date(targetDate).toLocaleString()}
          </span>
        </div>

        {/* Timer Display */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          {timerBlocks.map((block, i) => (
            <div key={i} className="glass-panel" style={{
              padding: '24px 12px',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(0,217,255,0.15)',
              borderRadius: '16px'
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '3.2rem',
                fontWeight: 900,
                color: 'var(--accent-cyan)',
                lineHeight: 1,
                letterSpacing: '0.04em'
              }}>
                {block.value}
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: '10px'
              }}>
                {block.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
