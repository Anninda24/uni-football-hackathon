import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Newspaper, Calendar, User } from 'lucide-react';

export const CaptainAnnouncementsView = () => {
  const { news } = useSystem();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(157,78,221,0.12) 0%, rgba(0,217,255,0.07) 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-25px', right: '-25px', fontSize: '7rem', opacity: 0.05, pointerEvents: 'none', userSelect: 'none' }}>
          📰
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Newspaper size={26} color="var(--accent-purple)" />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Announcements</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Latest news and updates from league administration
            </p>
          </div>
        </div>
      </div>

      {/* News Cards */}
      {news.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <Newspaper size={40} color="var(--text-dim)" style={{ marginBottom: '12px', opacity: 0.6 }} />
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No announcements published yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {news.map(post => (
            <div key={post.id} className="glass-panel" style={{
              padding: '22px',
              background: 'rgba(157,78,221,0.04)',
              border: '1px solid rgba(157,78,221,0.12)',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'transform 0.2s ease'
            }}>
              {/* Title */}
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                {post.title}
              </h3>

              {/* Meta Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <Calendar size={12} color="var(--text-muted)" />
                  {formatDate(post.date)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <User size={12} color="var(--text-muted)" />
                  {post.author}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '2px 0' }} />

              {/* Content */}
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                margin: 0
              }}>
                {post.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
