import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Newspaper, Calendar, User } from 'lucide-react';

export const TeamAnnouncementsView = () => {
  const { news, teams } = useSystem();

  const getTeamForAuthor = (author) => {
    return teams.find(t => t.managerName === author);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(255,183,3,0.1) 0%, rgba(0,217,255,0.07) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Newspaper size={28} color="var(--accent-gold)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
            League Announcements
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Stay updated with the latest news, announcements, and updates from the league.
        </p>
      </div>

      {/* News Timeline / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {news.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
            <Newspaper size={40} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
            <p>No announcements yet. Check back later for updates.</p>
          </div>
        ) : (
          news.map((item, index) => {
            const relatedTeam = getTeamForAuthor(item.author);
            return (
              <div key={item.id} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute', left: '28px', top: '52px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: index === 0 ? 'var(--accent-gold)' : 'var(--accent-cyan)',
                  boxShadow: `0 0 8px ${index === 0 ? 'rgba(255,183,3,0.4)' : 'rgba(0,217,255,0.4)'}`,
                  display: index === news.length - 1 ? 'none' : 'block'
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  {/* Icon */}
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Newspaper size={24} color="var(--accent-gold)" />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>{item.title}</h3>
                      {relatedTeam && (
                        <span style={{ fontSize: '1.2rem' }}>{relatedTeam.logo}</span>
                      )}
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={14} color="var(--accent-cyan)" />
                        {formatDate(item.date)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <User size={14} color="var(--accent-gold)" />
                        {item.author}
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {item.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
