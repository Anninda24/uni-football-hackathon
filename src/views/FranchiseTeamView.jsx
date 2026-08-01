import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Users, Plus, Edit3, Trash2, Shield, DollarSign, UserCog, UploadCloud, X, Eye, ShoppingBag } from 'lucide-react';

const COLOR_SWATCHES = ['#00e699', '#ffb703', '#00d9ff', '#9d4edd', '#ff4d6d', '#ff85a1', '#70e000'];

export const FranchiseTeamView = () => {
  const { 
    teams, 
    setTeams, 
    managers, 
    setManagers, 
    players, 
    systemState, 
    addNotification 
  } = useSystem();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState(null);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('⚡');
  const [managerId, setManagerId] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#00e699');
  const [captainId, setCaptainId] = useState('');
  const [viceCaptainId, setViceCaptainId] = useState('');

  const handleOpenAdd = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamLogo('⚡');
    setManagerId('');
    setPrimaryColor('#00e699');
    setCaptainId('');
    setViceCaptainId('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamLogo(team.logo || '⚡');
    setManagerId(team.managerId || '');
    setPrimaryColor(team.primaryColor || '#00e699');
    setCaptainId(team.captainId || '');
    setViceCaptainId(team.viceCaptainId || '');
    setShowFormModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName) {
      addNotification('error', 'Missing Data', 'Franchise Name is required.');
      return;
    }

    const assignedMgr = managers.find(m => m.id === managerId);
    const mgrName = assignedMgr ? assignedMgr.name : 'Unassigned';

    if (editingTeam) {
      // Update
      setTeams(prev => prev.map(t => t.id === editingTeam.id ? {
        ...t,
        name: teamName,
        logo: teamLogo || '',
        managerId: managerId || null,
        managerName: mgrName,
        primaryColor,
        captainId: captainId || null,
        viceCaptainId: viceCaptainId || null
      } : t));

      // Link manager to team
      if (managerId) {
        setManagers(prev => prev.map(m => m.id === managerId ? { ...m, teamId: editingTeam.id } : m));
      }

      addNotification('success', 'Franchise Updated', `${teamName} details saved.`);
    } else {
      // Add
      const newTeamId = 'team-' + Date.now();
      const newTeam = {
        id: newTeamId,
        name: teamName,
        logo: teamLogo || '',
        managerId: managerId || null,
        managerName: mgrName,
        primaryColor,
        budget: systemState.totalBudget,
        spent: 0,
        roster: [],
        purchaseHistory: [],
        captainId: captainId || null,
        viceCaptainId: viceCaptainId || null
      };

      setTeams(prev => [...prev, newTeam]);
      if (managerId) {
        setManagers(prev => prev.map(m => m.id === managerId ? { ...m, teamId: newTeamId } : m));
      }
      addNotification('success', 'Franchise Created', `Team '${teamName}' added to league.`);
    }

    setShowFormModal(false);
  };

  const handleDeleteTeam = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setTeams(prev => prev.filter(t => t.id !== teamId));
      // Unlink manager
      setManagers(prev => prev.map(m => m.teamId === teamId ? { ...m, teamId: null } : m));
      addNotification('info', 'Franchise Deleted', `Team '${team.name}' removed.`);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header Bar */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users color="var(--accent-green)" /> Franchise & Team Setup (/admin/teams)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage league franchises, upload team brand logos, assign managers, configure primary brand colors, and inspect real-time squad roster budgets.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> + Add Team
        </button>
      </div>

      {/* Franchise Team Cards Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {teams.map(team => {
          const rosterPlayers = players.filter(p => team.roster.includes(p.id) || p.soldToTeamId === team.id);
          const managerObj = managers.find(m => m.id === team.managerId);
          return (
            <div
              key={team.id}
              className="glass-panel"
              style={{
                padding: '24px',
                borderTop: `5px solid ${team.primaryColor || 'var(--accent-green)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header Logo & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  {team.logo ? (
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      background: 'var(--bg-input)',
                      border: `2px solid ${team.primaryColor || 'var(--accent-green)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem'
                    }}>
                      {team.logo}
                    </div>
                  ) : (
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      background: 'var(--bg-input)',
                      border: `2px dashed ${team.primaryColor || 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      color: 'var(--text-dim)',
                      fontWeight: 700
                    }}>
                      NO LOGO
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{team.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Manager: <strong style={{ color: 'var(--accent-cyan)' }}>{team.managerName}</strong>
                    </div>
                    {(team.captainId || team.viceCaptainId) && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {team.captainId && (
                          <span style={{ color: 'var(--accent-gold)' }}>
                            C: {players.find(p => p.id === team.captainId)?.name || 'TBD'}
                          </span>
                        )}
                        {team.viceCaptainId && (
                          <span style={{ color: 'var(--text-muted)' }}>
                            VC: {players.find(p => p.id === team.viceCaptainId)?.name || 'TBD'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget & Roster Stats */}
                <div style={{ background: 'var(--bg-card-solid)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>REMAINING BUDGET</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                      ${team.budget.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ROSTER SIZE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                      {rosterPlayers.length} / {systemState.minRoster} Players
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => setSelectedTeamDetail(team)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <Eye size={14} /> Details
                </button>
                <button
                  onClick={() => handleOpenEdit(team)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Team Modal Form */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingTeam ? 'Edit Franchise Info' : '+ Create Franchise Team'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="btn btn-secondary" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Franchise Team Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Varsity Strikers FC"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Team Logo Emoji / Icon (Optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ textAlign: 'center', fontSize: '1.3rem', width: '60px' }}
                      value={teamLogo}
                      onChange={(e) => setTeamLogo(e.target.value)}
                      placeholder="⚽"
                    />
                    {teamLogo && (
                      <button type="button" onClick={() => setTeamLogo('')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        <X size={12} /> Clear
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Assign Manager</label>
                  <select
                    className="form-control"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                  >
                    <option value="">-- Leave Unassigned --</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Team Captain</label>
                  <select
                    className="form-control"
                    value={captainId}
                    onChange={(e) => setCaptainId(e.target.value)}
                  >
                    <option value="">-- Not Assigned --</option>
                    {players.filter(p => editingTeam ? editingTeam.roster.includes(p.id) || p.soldToTeamId === editingTeam.id : true).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.primaryPosition})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vice Captain</label>
                  <select
                    className="form-control"
                    value={viceCaptainId}
                    onChange={(e) => setViceCaptainId(e.target.value)}
                  >
                    <option value="">-- Not Assigned --</option>
                    {players.filter(p => editingTeam ? editingTeam.roster.includes(p.id) || p.soldToTeamId === editingTeam.id : true).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.primaryPosition})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Team Brand Primary Color Hex Picker */}
              <div className="form-group">
                <label className="form-label">Team Primary Brand Color (UI Themes)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', width: '120px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COLOR_SWATCHES.map(c => (
                    <div
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: c,
                        cursor: 'pointer',
                        border: primaryColor === c ? '2px solid white' : '1px solid transparent'
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingTeam ? 'Save Franchise Changes' : 'Create Franchise Team'}
                </button>
                <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Detail Panel */}
      {selectedTeamDetail && (
        <div className="modal-overlay" onClick={() => setSelectedTeamDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{selectedTeamDetail.logo || '⚽'}</span>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{selectedTeamDetail.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manager: {selectedTeamDetail.managerName}</div>
                  {(selectedTeamDetail.captainId || selectedTeamDetail.viceCaptainId) && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                      {selectedTeamDetail.captainId && (
                        <span style={{ color: 'var(--accent-gold)' }}>
                          Captain: {players.find(p => p.id === selectedTeamDetail.captainId)?.name || 'TBD'}
                        </span>
                      )}
                      {selectedTeamDetail.viceCaptainId && (
                        <span style={{ color: 'var(--text-muted)' }}>
                          Vice Captain: {players.find(p => p.id === selectedTeamDetail.viceCaptainId)?.name || 'TBD'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedTeamDetail(null)} className="btn btn-secondary" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>TOTAL ALLOWANCE</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>${systemState.totalBudget.toLocaleString()}</div>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>REMAINING BUDGET</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>${selectedTeamDetail.budget.toLocaleString()}</div>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>TOTAL SPENT</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>${selectedTeamDetail.spent.toLocaleString()}</div>
              </div>
            </div>

            {/* Purchased Squad Roster list */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px' }}>Acquired Squad Roster & Draft History</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {players.filter(p => p.soldToTeamId === selectedTeamDetail.id).length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '16px' }}>No players drafted yet in auction.</div>
              ) : (
                players.filter(p => p.soldToTeamId === selectedTeamDetail.id).map(p => (
                  <div key={p.id} style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={p.imageUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.name} ({p.primaryPosition})</span>
                    </div>
                    <span className="badge badge-gold">${p.soldAmount?.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  const t = selectedTeamDetail;
                  setSelectedTeamDetail(null);
                  handleOpenEdit(t);
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Edit Franchise Info
              </button>
              <button onClick={() => setSelectedTeamDetail(null)} className="btn btn-secondary">Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
