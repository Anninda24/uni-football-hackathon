import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemPhase } from '../context/SystemPhaseContext';
import { useSystem } from '../context/SystemContext';
import { Shield, User, Key, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';

export function LoginRegisterView({ onLoginSuccess }) {
  const { login, PRESET_ACCOUNTS, setCurrentUser } = useAuth();
  const { currentPhase } = useSystemPhase();
  const { systemState, players, setPlayers, addNotification } = useSystem();
  const [activeTab, setActiveTab] = useState('LOGIN');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSession, setRegSession] = useState(systemState.academicSessions[0] || '');
  const [regJerseyName, setRegJerseyName] = useState('');
  const [regJerseyNumber, setRegJerseyNumber] = useState('');
  const [regPrimaryPosition, setRegPrimaryPosition] = useState(systemState.positions[0]?.code || '');
  const [regSecondaryPositions, setRegSecondaryPositions] = useState([]);
  const [regImageUrl, setRegImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const positions = systemState.positions || [];
  const sessions = systemState.academicSessions || [];

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    setTimeout(() => {
      setRegImageUrl(URL.createObjectURL(file));
      setUploadingImage(false);
      addNotification('success', 'Image Uploaded', 'Profile photo attached.');
    }, 600);
  };

  const toggleSecondaryPosition = (code) => {
    if (code === regPrimaryPosition) return;
    setRegSecondaryPositions(prev => {
      const exists = prev.includes(code);
      return exists ? prev.filter(p => p !== code) : [...prev, code];
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username) return;
    const res = login(username, password);
    if (res.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handlePresetSelect = (roleKey) => {
    const acc = PRESET_ACCOUNTS[roleKey];
    const res = login(acc.email, 'password', roleKey);
    if (res.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!regName || !regStudentId || !regEmail || !regPassword || !regSession || !regJerseyName || !regJerseyNumber || !regPrimaryPosition) {
      addNotification('error', 'Missing Fields', 'Please complete all required fields.');
      return;
    }

    if (!regImageUrl) {
      addNotification('error', 'Profile Image Required', 'You must upload a profile photo to complete registration.');
      return;
    }

    const newPlayer = {
      id: 'ply-' + Date.now(),
      name: regName,
      studentId: regStudentId,
      email: regEmail,
      password: regPassword,
      session: regSession,
      jerseyName: regJerseyName.toUpperCase(),
      jerseyNumber: regJerseyNumber,
      primaryPosition: regPrimaryPosition,
      secondaryPositions: regSecondaryPositions,
      imageUrl: regImageUrl,
      cloudPublicId: 'cld_ply_' + Date.now(),
      categoryId: '',
      basePrice: 0,
      status: 'APPROVED',
      soldToTeamId: null,
      soldAmount: 0
    };

    setPlayers(prev => [newPlayer, ...prev]);
    addNotification('success', 'Registration Submitted', 'Your profile has been created. Redirecting...');

    setRegSuccess(true);
    setTimeout(() => {
      setCurrentUser({
        id: newPlayer.id,
        name: newPlayer.name,
        email: newPlayer.email,
        role: 'PLAYER',
        avatar: '⚽',
        studentId: newPlayer.studentId,
        teamId: null
      });
      if (onLoginSuccess) onLoginSuccess();
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto' }}>
      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
        <button
          onClick={() => setActiveTab('LOGIN')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'LOGIN' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(30, 41, 59, 0.6)',
            color: activeTab === 'LOGIN' ? '#fff' : '#94a3b8',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <User style={{ width: '18px', height: '18px' }} />
          <span>Portal Login</span>
        </button>

        <button
          onClick={() => setActiveTab('REGISTER')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'REGISTER' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(30, 41, 59, 0.6)',
            color: activeTab === 'REGISTER' ? '#fff' : '#94a3b8',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserPlus style={{ width: '18px', height: '18px' }} />
          <span>Player Registration</span>
        </button>
      </div>

      {activeTab === 'LOGIN' ? (
        <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '8px' }}>
            Platform Portal Access
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
            Enter your credentials or select a quick demo persona to access your workspace.
          </p>

          {/* Quick Preset Selector */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
              Instant Persona Login
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
              {Object.entries(PRESET_ACCOUNTS).filter(([k]) => k !== 'SPECTATOR').map(([roleKey, acc]) => (
                <button
                  key={roleKey}
                  onClick={() => handlePresetSelect(roleKey)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(30, 41, 59, 0.5)',
                    color: '#f8fafc',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ fontSize: '1.4rem' }}>{acc.avatar}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{acc.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 600 }}>
                    {roleKey.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '24px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Username or Email</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or admin@football.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Log In to Workspace
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '8px' }}>
            Player Profile Registration
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
            Register your university athlete profile for the active draft pool. (Active System Phase: <strong style={{ color: currentPhase.badgeColor }}>{currentPhase.label}</strong>)
          </p>

          {regSuccess ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <CheckCircle2 style={{ width: '48px', height: '48px', color: '#22c55e', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>Registration Submitted!</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Redirecting to your Player Dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Julian Sterling"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="ST-2026-901"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>University Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="julian@student.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Session *</label>
                  <select
                    required
                    value={regSession}
                    onChange={(e) => setRegSession(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }}
                  >
                    {sessions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Primary Position *</label>
                  <select
                    required
                    value={regPrimaryPosition}
                    onChange={(e) => setRegPrimaryPosition(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }}
                  >
                    {positions.map(pos => (
                      <option key={pos.code} value={pos.code}>{pos.name} ({pos.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Jersey Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="STERLING"
                    value={regJerseyName}
                    onChange={(e) => setRegJerseyName(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Jersey Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="10"
                    value={regJerseyNumber}
                    onChange={(e) => setRegJerseyNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Secondary Positions (Optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {positions.map(pos => {
                    const isPrimary = regPrimaryPosition === pos.code;
                    const isSelected = regSecondaryPositions.includes(pos.code);
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
                          border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? 'rgba(0, 217, 255, 0.2)' : '#1e293b',
                          color: isSelected ? 'var(--accent-cyan)' : '#94a3b8'
                        }}
                      >
                        + {pos.code}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Profile Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    fontSize: '0.82rem'
                  }}
                />
                {regImageUrl && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={regImageUrl} alt="Preview" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--accent-green)' }} />
                    <span style={{ fontSize: '0.78rem', color: '#00e699' }}>✓ Profile photo attached</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Submit Player Registration Profile
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
