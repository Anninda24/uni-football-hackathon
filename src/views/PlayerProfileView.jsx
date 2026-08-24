import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { User, Edit3, Save, X, Mail, Calendar, Hash, Shirt, Shield } from 'lucide-react';

export const PlayerProfileView = () => {
  const { currentUser } = useAuth();
  const { players, setPlayers, addNotification, systemState } = useSystem();

  const positions = systemState.positions || [];

  const myPlayer = players.find(p => 
    p.id === currentUser?.id || 
    (p.email && p.email.toLowerCase() === currentUser?.email?.toLowerCase()) ||
    (currentUser?.studentId && p.studentId === currentUser.studentId)
  ) || (currentUser?.role === 'PLAYER' || currentUser?.role === 'ICON_PLAYER' ? {
    id: currentUser.id,
    name: currentUser.name || 'Athlete',
    email: currentUser.email || '',
    studentId: currentUser.studentId || 'N/A',
    session: '2025/2026',
    jerseyName: currentUser.name?.toUpperCase() || 'PLAYER',
    jerseyNumber: '10',
    primaryPosition: 'ST',
    secondaryPositions: [],
    imageUrl: '',
    categoryId: null,
    basePrice: 0,
    status: 'APPROVED',
    soldToTeamId: null
  } : null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    jerseyName: '',
    jerseyNumber: '',
    primaryPosition: '',
    secondaryPositions: [],
    imageUrl: ''
  });

  const startEdit = () => {
    if (!myPlayer) return;
    setEditForm({
      name: myPlayer.name,
      email: myPlayer.email || '',
      jerseyName: myPlayer.jerseyName || '',
      jerseyNumber: myPlayer.jerseyNumber || '',
      primaryPosition: myPlayer.primaryPosition || '',
      secondaryPositions: myPlayer.secondaryPositions || [],
      imageUrl: myPlayer.imageUrl || ''
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: '',
      email: '',
      jerseyName: '',
      jerseyNumber: '',
      primaryPosition: '',
      secondaryPositions: [],
      imageUrl: ''
    });
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (!myPlayer) return;

    setPlayers(prev => prev.map(p => p.id === myPlayer.id ? {
      ...p,
      ...editForm
    } : p));
    addNotification('success', 'Profile Updated', 'Your player profile has been updated.');
    setIsEditing(false);
  };

  const toggleSecondaryPosition = (code) => {
    if (code === editForm.primaryPosition) return;
    setEditForm(prev => {
      const exists = prev.secondaryPositions.includes(code);
      return {
        ...prev,
        secondaryPositions: exists
          ? prev.secondaryPositions.filter(p => p !== code)
          : [...prev.secondaryPositions, code]
      };
    });
  };

  if (!myPlayer) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <User size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>No Player Profile Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Your player profile has not been created yet. Please complete registration from the home page.
          </p>
        </div>
      </div>
    );
  }

  const category = systemState.categories.find(c => c.id === myPlayer.categoryId);
  const soldTeam = myPlayer.soldToTeamId ? teams.find(t => t.id === myPlayer.soldToTeamId) : null;

  // Calculate FIFA Card Ratings & Attributes based on tier and position
  const tierOvrMap = {
    'cat-icon': 92,
    'cat-plat': 87,
    'cat-gold': 82,
    'cat-silver': 76,
    'cat-bronze': 70
  };
  const ovr = tierOvrMap[myPlayer.categoryId] || 75;

  const getPositionStats = (pos, baseOvr) => {
    switch (pos) {
      case 'ST':
      case 'LW':
      case 'RW':
        return { pac: baseOvr + 4, sho: baseOvr + 3, pas: baseOvr - 2, dri: baseOvr + 2, def: baseOvr - 30, phy: baseOvr - 5 };
      case 'CAM':
      case 'CM':
        return { pac: baseOvr - 2, sho: baseOvr, pas: baseOvr + 5, dri: baseOvr + 3, def: baseOvr - 15, phy: baseOvr - 4 };
      case 'CDM':
        return { pac: baseOvr - 4, sho: baseOvr - 10, pas: baseOvr + 2, dri: baseOvr - 2, def: baseOvr + 4, phy: baseOvr + 3 };
      case 'CB':
      case 'LB':
      case 'RB':
        return { pac: baseOvr + 1, sho: baseOvr - 20, pas: baseOvr - 5, dri: baseOvr - 8, def: baseOvr + 6, phy: baseOvr + 5 };
      case 'GK':
        return { pac: baseOvr - 10, sho: baseOvr - 30, pas: baseOvr + 2, dri: baseOvr - 10, def: baseOvr + 8, phy: baseOvr + 2 };
      default:
        return { pac: baseOvr, sho: baseOvr - 5, pas: baseOvr, dri: baseOvr, def: baseOvr - 5, phy: baseOvr };
    }
  };

  const cardStats = getPositionStats(myPlayer.primaryPosition, ovr);

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <User color="var(--accent-green)" /> Athlete Profile & Digital Card
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Registered credentials, assigned auction tier, live market valuation, and FIFA card stats.
          </p>
        </div>
        {!isEditing && (
          <button onClick={startEdit} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit3 size={16} /> Edit Details
          </button>
        )}
      </div>

      {/* Main Grid: Left Side FIFA Digital Card, Right Side Details & Auction Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* ── FIFA DIGITAL PLAYER CARD ────────────────────────────────────── */}
        <div style={{
          background: myPlayer.categoryId === 'cat-icon' 
            ? 'linear-gradient(145deg, #1e0000 0%, #7f1d1d 40%, #1e0000 100%)'
            : myPlayer.categoryId === 'cat-plat'
            ? 'linear-gradient(145deg, #082f49 0%, #0369a1 40%, #082f49 100%)'
            : myPlayer.categoryId === 'cat-gold'
            ? 'linear-gradient(145deg, #451a03 0%, #b45309 40%, #451a03 100%)'
            : 'linear-gradient(145deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '24px 20px',
          border: `2px solid ${category?.color || '#3b82f6'}`,
          boxShadow: `0 14px 30px rgba(0,0,0,0.6), 0 0 25px ${category?.color || '#3b82f6'}33`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Holographic top badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            fontSize: '0.68rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            color: category?.color || '#fff'
          }}>
            {category?.name || 'Tier'}
          </div>

          {/* OVR + Position & Photo */}
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', marginBottom: '14px' }}>
            <div style={{ textAlign: 'center', paddingLeft: '8px' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'monospace', lineHeight: 0.9, color: '#f8fafc' }}>
                {ovr}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: category?.color || '#38bdf8', marginTop: '2px' }}>
                {myPlayer.primaryPosition}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>
                #{myPlayer.jerseyNumber || '10'}
              </div>
            </div>

            {/* Photo */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: `2px solid ${category?.color || '#3b82f6'}88`,
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
              background: '#020617'
            }}>
              <img
                src={myPlayer.imageUrl || 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80'}
                alt={myPlayer.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Jersey Name */}
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#f8fafc',
            textAlign: 'center',
            marginBottom: '14px',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            width: '100%',
            paddingBottom: '8px'
          }}>
            {myPlayer.jerseyName || myPlayer.name}
          </div>

          {/* 6 FIFA Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            width: '100%',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '14px',
            padding: '12px 10px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            {[
              { label: 'PAC', val: cardStats.pac },
              { label: 'SHO', val: cardStats.sho },
              { label: 'PAS', val: cardStats.pas },
              { label: 'DRI', val: cardStats.dri },
              { label: 'DEF', val: cardStats.def },
              { label: 'PHY', val: cardStats.phy }
            ].map(st => (
              <div key={st.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'monospace', color: '#f8fafc' }}>
                  {Math.min(99, Math.max(45, st.val))}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          {/* Team / Draft Banner */}
          <div style={{
            marginTop: '14px',
            width: '100%',
            textAlign: 'center',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: soldTeam ? '#00e699' : '#ffb703',
            background: 'rgba(0,0,0,0.35)',
            padding: '6px 10px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            {soldTeam ? `⚡ ${soldTeam.name}` : `📋 Draft Pool (${myPlayer.status || 'APPROVED'})`}
          </div>
        </div>

        {/* ── RIGHT COLUMN: DETAILS & FINANCIAL STATUS ─────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Post-Auction Market Financials Summary Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--accent-gold)" /> Auction & Market Status
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              
              {/* Assigned Tier */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Tier</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: category?.color || '#3b82f6', marginTop: '4px' }}>
                  {category?.name || 'Unallocated'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>League Classification</div>
              </div>

              {/* Starting Base Price */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Starting Base Price</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#00e699', fontFamily: 'monospace', marginTop: '4px' }}>
                  ${(myPlayer.basePrice || category?.basePrice || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>Floor Reserve</div>
              </div>

              {/* Selling Price / Acquisition Status */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Selling Price</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: myPlayer.soldAmount > 0 ? '#ffb703' : '#94a3b8', fontFamily: 'monospace', marginTop: '4px' }}>
                  {myPlayer.soldAmount > 0 ? `$${myPlayer.soldAmount.toLocaleString()}` : (myPlayer.status === 'SOLD' ? 'Acquired' : 'Awaiting Bids')}
                </div>
                <div style={{ fontSize: '0.65rem', color: soldTeam ? '#00d9ff' : '#64748b', marginTop: '2px' }}>
                  {soldTeam ? soldTeam.name : 'Unsold Pool'}
                </div>
              </div>

            </div>
          </div>

          {/* Registered Details & Editing Form */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            {isEditing ? (
              <form onSubmit={saveEdit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Jersey Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.jerseyName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, jerseyName: e.target.value.toUpperCase() }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jersey Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.jerseyNumber}
                      onChange={(e) => setEditForm(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Primary Position * (Select Exactly One)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {positions.map(pos => (
                      <button
                        type="button"
                        key={pos.code}
                        onClick={() => setEditForm(prev => ({
                          ...prev,
                          primaryPosition: pos.code,
                          secondaryPositions: prev.secondaryPositions.filter(p => p !== pos.code)
                        }))}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: editForm.primaryPosition === pos.code ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                          background: editForm.primaryPosition === pos.code ? 'rgba(0, 230, 153, 0.2)' : 'var(--bg-input)',
                          color: editForm.primaryPosition === pos.code ? 'var(--accent-green)' : 'var(--text-muted)'
                        }}
                      >
                        {pos.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Secondary Positions (Optional)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {positions.map(pos => {
                      const isPrimary = editForm.primaryPosition === pos.code;
                      const isSelected = editForm.secondaryPositions.includes(pos.code);
                      return (
                        <button
                          type="button"
                          key={pos.code}
                          onClick={() => toggleSecondaryPosition(pos.code)}
                          disabled={isPrimary}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: isPrimary ? 'not-allowed' : 'pointer',
                            opacity: isPrimary ? 0.4 : 1,
                            border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            background: isSelected ? 'rgba(0, 217, 255, 0.2)' : 'var(--bg-input)',
                            color: isSelected ? 'var(--accent-cyan)' : 'var(--text-dim)'
                          }}
                        >
                          + {pos.code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Changes
                  </button>
                  <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                    <X size={16} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px 0', color: '#f8fafc' }}>Registered Player Information</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Student ID', value: myPlayer.studentId, icon: Hash },
                    { label: 'Email', value: myPlayer.email, icon: Mail },
                    { label: 'Session', value: myPlayer.session, icon: Calendar },
                    { label: 'Primary Position', value: myPlayer.primaryPosition, icon: Shield },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} style={{
                        background: 'var(--bg-card-solid)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <Icon size={16} color="var(--accent-cyan)" />
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>{item.label}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '6px' }}>Secondary Positions</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {myPlayer.secondaryPositions && myPlayer.secondaryPositions.length > 0 ? (
                      myPlayer.secondaryPositions.map(pos => (
                        <span key={pos} className="badge badge-cyan" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                          {pos}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None specified</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
