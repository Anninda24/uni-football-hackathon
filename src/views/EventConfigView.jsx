import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { SlidersHorizontal, Shield, DollarSign, Percent, Users, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';

export const EventConfigView = () => {
  const { systemState, setSystemState, teams, setTeams, players, setPlayers, addNotification } = useSystem();

  // Local Form state for dynamic rules
  const [totalBudget, setTotalBudget] = useState(systemState.totalBudget);
  const [minRoster, setMinRoster] = useState(systemState.minRoster);
  
  // Category Tier Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatPrice, setNewCatPrice] = useState('');

  // Team Form
  const [newTeamName, setNewTeamName] = useState('');
  const [newManagerName, setNewManagerName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('⚽');

  const handleSaveBudget = (e) => {
    e.preventDefault();
    setSystemState(prev => ({
      ...prev,
      totalBudget: Number(totalBudget),
      minRoster: Number(minRoster)
    }));
    // Update unspent budget for teams
    setTeams(prev => prev.map(t => ({
      ...t,
      budget: Number(totalBudget) - t.spent
    })));
    addNotification('success', 'Rules Saved', `Total Budget per team set to $${Number(totalBudget).toLocaleString()} & Min Roster set to ${minRoster}`);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName || !newCatPrice) return;

    const newCat = {
      id: 'cat-' + Date.now(),
      name: newCatName,
      basePrice: Number(newCatPrice),
      color: '#00e699'
    };

    setSystemState(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));

    setNewCatName('');
    setNewCatPrice('');
    addNotification('success', 'Category Added', `Player Category '${newCat.name}' created with base price $${newCat.basePrice.toLocaleString()}`);
  };

  const handleRemoveCategory = (catId) => {
    // Icon category is permanently locked — never allow deletion
    if (catId === 'cat-icon') {
      addNotification('error', 'Locked Category', 'The Icon tier is a system default and cannot be deleted.');
      return;
    }
    setSystemState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== catId)
    }));
    addNotification('info', 'Category Removed', 'Category tier deleted.');
  };


  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeamName || !newManagerName) return;

    const newTeam = {
      id: 'team-' + Date.now(),
      name: newTeamName,
      managerName: newManagerName,
      logo: newTeamLogo || '⚽',
      budget: systemState.totalBudget,
      spent: 0,
      roster: []
    };

    setTeams(prev => [...prev, newTeam]);
    setNewTeamName('');
    setNewManagerName('');
    addNotification('success', 'Franchise Created', `Team '${newTeam.name}' created with Manager ${newTeam.managerName}`);
  };

  const handleRemoveTeam = (teamId) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    addNotification('info', 'Team Removed', 'Franchise team deleted from league.');
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(0, 230, 153, 0.1) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SlidersHorizontal color="var(--accent-green)" /> Phase 1: Event Configuration Desk
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Super Admin Panel to define dynamic rules, percentage-based bidding math, player tier base prices, and franchise teams.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Dynamic Budget & Roster Guardrail Settings */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign color="var(--accent-gold)" /> Dynamic League Allowance Rules
          </h3>

          <form onSubmit={handleSaveBudget}>
            <div className="form-group">
              <label className="form-label">Total Team Budget Allowance ($)</label>
              <input
                type="number"
                className="form-control"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                step="5000"
                min="10000"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Applied equally across all franchises ($100,000 default).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Required Roster Slots per Team</label>
              <input
                type="number"
                className="form-control"
                value={minRoster}
                onChange={(e) => setMinRoster(e.target.value)}
                min="1"
                max="25"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Used by backend Budget Guardrails to enforce minimum budget reserves.
              </span>
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '10px' }}>
              Save Dynamic Allowance Rules
            </button>
          </form>
        </div>

        {/* Dynamic Percentage Raise Math Tiers */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent color="var(--accent-cyan)" /> Percentage-Based Bidding Math Engine
          </h3>
          
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Calculates exact monetary increments dynamically based on current bid percentage of team total budget.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {systemState.raiseTiers.map(tier => {
              const minVal = (systemState.totalBudget * (tier.minBudgetPct / 100));
              const maxVal = (systemState.totalBudget * (tier.maxBudgetPct / 100));
              const raiseVal = Math.round((systemState.totalBudget * (tier.raisePct / 100)) / 100) * 100;
              return (
                <div key={tier.id} style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Bid Range: {tier.minBudgetPct}% to {tier.maxBudgetPct}% of Budget
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ${minVal.toLocaleString()} - ${maxVal.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.8rem' }}>
                      +{tier.raisePct}% Raise (+${raiseVal.toLocaleString()})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Categories & Base Prices */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield color="var(--accent-green)" /> Player Categories & Base Prices
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {systemState.categories.map(cat => (
              <div key={cat.id} style={{ background: 'var(--bg-card-solid)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: cat.color }}>{cat.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    Base: ${cat.basePrice.toLocaleString()}
                  </span>
                  <button onClick={() => handleRemoveCategory(cat.id)} className="btn btn-secondary" style={{ padding: '4px 8px', color: 'var(--accent-red)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddCategory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Category Name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Base Price ($)"
              value={newCatPrice}
              onChange={(e) => setNewCatPrice(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Add
            </button>
          </form>
        </div>

        {/* Franchises / Teams Management */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users color="var(--accent-gold)" /> Franchise Teams & Managers ({teams.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
            {teams.map(team => (
              <div key={team.id} style={{ background: 'var(--bg-card-solid)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{team.logo}</span>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{team.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manager: {team.managerName}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-green">${team.budget.toLocaleString()}</span>
                  <button onClick={() => handleRemoveTeam(team.id)} className="btn btn-secondary" style={{ padding: '4px 8px', color: 'var(--accent-red)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTeam} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                className="form-control"
                style={{ width: '50px', textAlign: 'center' }}
                value={newTeamLogo}
                onChange={(e) => setNewTeamLogo(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Team Name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Manager Name"
                value={newManagerName}
                onChange={(e) => setNewManagerName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-gold">
              <Plus size={16} /> Create Franchise Team
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
