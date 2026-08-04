import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Newspaper, Calendar, User, ExternalLink } from 'lucide-react';

export const NewsUpdatesView = () => {
  const { news } = useSystem();

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Hero Header */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(0,230,153,0.1) 0%, rgba(255,183,3,0.07) 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px', fontSize: '7rem', opacity: 0.05,
          pointerEvents: 'none', userSelect: 'none'
        }}>
          <Newspaper size={120} color="var(--accent-green)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Newspaper size={28} color="var(--accent-green)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
            News & Updates
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Latest announcements and league updates.
        </p>
      </div>

      {news.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
          <Newspaper size={40} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '0.9rem' }}>No news posts yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {news.map((item) => (
            <div key={item.id} className="glass-panel" style={{
              padding: '20px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                gap: '8px'
              }}>
                <h4 style={{
                  fontSize: '0.95rem', fontWeight: 800, margin: 0, lineHeight: 1.35,
                  color: 'var(--text-muted)'
                }}>
                  {item.title}
                </h4>
                <ExternalLink size={16} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: '3px' }} />
              </div>

              <p style={{
                fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55,
                margin: 0, display: '-webkit-box', WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>
                {item.content}
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={13} color="var(--text-dim)" />
                  <span>{item.author || 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} color="var(--text-dim)" />
                  <span>{formatDate(item.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
