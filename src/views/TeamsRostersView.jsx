import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Users, DollarSign, Shield, Award } from 'lucide-react';

export const TeamsRostersView = () => {
  const { teams, players, systemState } = useSystem();

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users color="var(--accent-gold)" /> Franchise Rosters & Budget Audit
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Complete breakdown of squad players, spent budget, remaining allowance, and roster completion status.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {teams.map(team => {
          const rosterPlayers = players.filter(p => p.soldToTeamId === team.id || team.roster.includes(p.id));
          const isMinMet = rosterPlayers.length >= systemState.minRoster;

          return (
            <div key={team.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '2rem' }}>{team.logo}</span>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{team.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manager: {team.managerName}</span>
                    </div>
                  </div>
                  <span className={`badge ${isMinMet ? 'badge-green' : 'badge-gold'}`}>
                    {rosterPlayers.length} / {systemState.minRoster} Min
                  </span>
                </div>

                {/* Financial Overview */}
                <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', uppercase: true }}>Remaining Budget</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                      ${team.budget.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', uppercase: true }}>Auction Spent</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                      ${team.spent.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Squad Player List */}
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-muted)' }}>Drafted Roster ({rosterPlayers.length}):</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  {rosterPlayers.length > 0 ? rosterPlayers.map(ply => (
                    <div key={ply.id} style={{ background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={ply.imageUrl} alt={ply.name} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{ply.name} ({ply.primaryPosition})</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                        ${(ply.soldAmount || ply.basePrice).toLocaleString()}
                      </span>
                    </div>
                  )) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                      No players acquired yet.
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
