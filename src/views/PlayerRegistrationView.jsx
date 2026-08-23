import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { UserPlus, Image as ImageIcon, ShieldCheck, CheckCircle2, AlertCircle, Edit3, Trash2, UploadCloud } from 'lucide-react';

export const PlayerRegistrationView = () => {
  const { systemState, players, setPlayers, addNotification } = useSystem();

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    password: '',
    session: systemState.academicSessions[0] || '',
    jerseyName: '',
    jerseyNumber: '',
    primaryPosition: systemState.positions[0]?.code || '',
    secondaryPositions: [],
    imageUrl: '',
    categoryId: systemState.categories[0]?.id || 'cat-plat'
  });

  const [imagePreview, setImagePreview] = useState('');
  const [cloudUploadProgress, setCloudUploadProgress] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);

  // Position Handler
  const handlePrimaryChange = (posCode) => {
    setFormData(prev => ({
      ...prev,
      primaryPosition: posCode,
      secondaryPositions: prev.secondaryPositions.filter(p => p !== posCode)
    }));
  };

  const toggleSecondaryPosition = (posCode) => {
    if (posCode === formData.primaryPosition) return;
    setFormData(prev => {
      const exists = prev.secondaryPositions.includes(posCode);
      return {
        ...prev,
        secondaryPositions: exists
          ? prev.secondaryPositions.filter(p => p !== posCode)
          : [...prev.secondaryPositions, posCode]
      };
    });
  };

  // Image Upload Handler (Cloud Storage Manager simulation)
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCloudUploadProgress(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const simulatedCloudUrl = event.target.result;
      setImagePreview(simulatedCloudUrl);
      setFormData(prev => ({
        ...prev,
        imageUrl: simulatedCloudUrl
      }));
      setCloudUploadProgress(false);
      addNotification('success', 'Cloud Media Uploaded', 'Image uploaded to Cloud Media Storage (Cloudinary Public ID generated).');
    };
    reader.onerror = () => {
      setCloudUploadProgress(false);
      addNotification('error', 'Upload Failed', 'Could not read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (systemState.currentPhase !== 'SETUP' && systemState.currentPhase !== 'REGISTRATION') {
      addNotification('error', 'Portal Locked', 'Player registrations & updates are closed during Phase 3 (AUCTION) and Phase 4 (TOURNAMENT).');
      return;
    }

    if (!formData.name || !formData.studentId || !formData.email || !formData.password || !formData.jerseyName || !formData.jerseyNumber || !formData.primaryPosition) {
      addNotification('error', 'Missing Fields', 'Please complete all required fields.');
      return;
    }



    const category = systemState.categories.find(c => c.id === formData.categoryId) || systemState.categories[0];
    const defaultImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

    if (editingPlayerId) {
      setPlayers(prev => prev.map(p => p.id === editingPlayerId ? {
        ...p,
        ...formData,
        imageUrl: formData.imageUrl || p.imageUrl || defaultImage,
        basePrice: category ? category.basePrice : 10000
      } : p));
      setEditingPlayerId(null);
      addNotification('success', 'Profile Updated', 'Player registration updated successfully.');
    } else {
      const newPlayer = {
        id: 'ply-' + Date.now(),
        ...formData,
        imageUrl: formData.imageUrl || defaultImage,
        cloudPublicId: 'cld_ply_' + Date.now(),
        categoryId: category.id,
        basePrice: category ? category.basePrice : 10000,
        status: 'APPROVED',
        soldToTeamId: null,
        soldAmount: 0
      };
      setPlayers(prev => [newPlayer, ...prev]);
      addNotification('success', 'Registration Submitted', 'Player registration profile successfully added to auction pool.');
    }

    setFormData({
      name: '',
      studentId: '',
      email: '',
      password: '',
      session: systemState.academicSessions[0] || '',
      jerseyName: '',
      jerseyNumber: '',
      primaryPosition: systemState.positions[0]?.code || '',
      secondaryPositions: [],
      imageUrl: '',
      categoryId: systemState.categories[0]?.id || 'cat-plat'
    });
    setImagePreview('');
  };

  const handleEdit = (player) => {
    setFormData({
      name: player.name,
      studentId: player.studentId,
      email: player.email || '',
      password: player.password || '',
      session: player.session,
      jerseyName: player.jerseyName,
      jerseyNumber: player.jerseyNumber || '',
      primaryPosition: player.primaryPosition,
      secondaryPositions: player.secondaryPositions || [],
      imageUrl: player.imageUrl,
      categoryId: player.categoryId
    });
    setImagePreview(player.imageUrl);
    setEditingPlayerId(player.id);
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setFormData({
      name: '',
      studentId: '',
      email: '',
      password: '',
      session: systemState.academicSessions[0] || '',
      jerseyName: '',
      jerseyNumber: '',
      primaryPosition: systemState.positions[0]?.code || '',
      secondaryPositions: [],
      imageUrl: '',
      categoryId: systemState.categories[0]?.id || 'cat-plat'
    });
    setImagePreview('');
  };

  const handleWithdraw = (playerId) => {
    if (systemState.currentPhase !== 'SETUP' && systemState.currentPhase !== 'REGISTRATION') {
      addNotification('error', 'Portal Locked', 'Withdrawals are locked once auction phase begins.');
      return;
    }

    setPlayers(prev => prev.filter(p => p.id !== playerId));
    addNotification('info', 'Registration Withdrawn', 'Player registration record deleted from system.');
  };

  const isLocked = systemState.currentPhase === 'THE_AUCTION' || systemState.currentPhase === 'AUCTION' || systemState.currentPhase === 'TOURNAMENT';

  const positions = systemState.positions || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' }}>

      {/* Registration Form Card */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserPlus color="var(--accent-green)" />
              {editingPlayerId ? 'Edit Player Profile' : 'Player Portal Registration'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Submit player credentials & positional data for the franchise auction.
            </p>
          </div>
          {isLocked && (
            <span className="badge badge-red" style={{ padding: '6px 12px' }}>
              <AlertCircle size={14} /> PORTAL LOCKED
            </span>
          )}
        </div>

        {isLocked && (
          <div style={{ background: 'rgba(255, 77, 109, 0.1)', border: '1px solid rgba(255, 77, 109, 0.3)', borderRadius: '12px', padding: '14px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--accent-red)' }}>
            ⚠️ <strong>Phase Constraint:</strong> Global System state is currently <strong>{systemState.currentPhase}</strong>. Player registration modifications and withdrawals are strictly frozen.
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Julian Sterling"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isLocked}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="player@university.edu"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLocked}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLocked}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Academic Session *</label>
              <select
                className="form-control"
                value={formData.session}
                onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value }))}
                disabled={isLocked}
              >
                {systemState.academicSessions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Jersey Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 10"
                value={formData.jerseyNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                disabled={isLocked}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Jersey Display Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. STERLING"
                value={formData.jerseyName}
                onChange={(e) => setFormData(prev => ({ ...prev, jerseyName: e.target.value.toUpperCase() }))}
                disabled={isLocked}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category / Tier</label>
              <select
                className="form-control"
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                disabled={isLocked}
              >
                {systemState.categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Base Price: ${c.basePrice.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Positional Selectors */}
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="form-label">Primary Position * (Select Exactly One)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {positions.map(pos => (
                <button
                  type="button"
                  key={pos.code}
                  onClick={() => handlePrimaryChange(pos.code)}
                  disabled={isLocked}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    border: formData.primaryPosition === pos.code ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                    background: formData.primaryPosition === pos.code ? 'rgba(0, 230, 153, 0.2)' : 'var(--bg-input)',
                    color: formData.primaryPosition === pos.code ? 'var(--accent-green)' : 'var(--text-muted)'
                  }}
                >
                  {pos.code}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Secondary Positions (Optional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {positions.map(pos => {
                const isPrimary = formData.primaryPosition === pos.code;
                const isSelected = formData.secondaryPositions.includes(pos.code);
                return (
                  <button
                    type="button"
                    key={pos.code}
                    onClick={() => toggleSecondaryPosition(pos.code)}
                    disabled={isLocked || isPrimary}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: (isLocked || isPrimary) ? 'not-allowed' : 'pointer',
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

          {/* Cloud Image Upload */}
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="form-label">Profile Image (Cloud Media Provider Required) *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon color="var(--text-dim)" size={28} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
                  <UploadCloud size={16} /> {cloudUploadProgress ? 'Uploading to Cloud...' : 'Upload Image to Cloudinary'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isLocked || cloudUploadProgress}
                    style={{ display: 'none' }}
                  />
                </label>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Assets are stored via Cloud Provider with public IDs for automatic nuke cleanup.
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLocked}>
              {editingPlayerId ? 'Save Changes' : 'Complete Registration'}
            </button>
            {editingPlayerId && (
              <button type="button" className="btn btn-secondary" onClick={() => setEditingPlayerId(null)}>
                Cancel Edit
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Registered Players List */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Registered Player Pool ({players.length})</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered candidates eligible for auction draft pool.</p>
          </div>
          <span className="badge badge-green"><CheckCircle2 size={12} /> {players.filter(p => p.status === 'APPROVED').length} Approved</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '650px', overflowY: 'auto', paddingRight: '4px' }}>
          {players.map(player => {
            const category = systemState.categories.find(c => c.id === player.categoryId);
            return (
              <div
                key={player.id}
                style={{
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src={player.imageUrl}
                  alt={player.name}
                  style={{ width: '54px', height: '54px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{player.name}</h4>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: category ? category.color : 'var(--accent-green)',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {category ? category.name : 'Platinum'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span>ID: <strong>{player.studentId}</strong></span>
                    <span>Email: <strong>{player.email}</strong></span>
                    <span>Session: <strong>{player.session}</strong></span>
                    <span>Jersey: <strong>#{player.jerseyNumber} {player.jerseyName}</strong></span>
                    <span>Base: <strong>${player.basePrice.toLocaleString()}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      PRI: {player.primaryPosition}
                    </span>
                    {player.secondaryPositions && player.secondaryPositions.map(sec => (
                      <span key={sec} className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                        SEC: {sec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {!isLocked && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleEdit(player)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleWithdraw(player.id)}
                      className="btn btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      title="Withdraw"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
