import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemPhase } from '../context/SystemPhaseContext';
import { useSystem } from '../context/SystemContext';
import { Shield, User, Key, ArrowRight, UserPlus, CheckCircle2, Lock, LogIn } from 'lucide-react';

export function LoginRegisterView({ onLoginSuccess, initialTab = 'LOGIN' }) {
  const { login, PRESET_ACCOUNTS, setCurrentUser } = useAuth();
  const { currentPhase, isRegistration } = useSystemPhase();
  const { systemState, players, setPlayers, addNotification } = useSystem();
  
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab === 'REGISTER' && !isRegistration) {
      setActiveTab('LOGIN');
    } else {
      setActiveTab(initialTab);
    }
  }, [initialTab, isRegistration]);

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
      addNotification('success', 'Image Uploaded', 'Optional profile photo attached.');
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

    if (!isRegistration) {
      addNotification('error', 'Registration Closed', 'Player registration is only active during Phase 2: Registration.');
      return;
    }

    if (!regName || !regStudentId || !regEmail || !regPassword || !regSession || !regJerseyName || !regJerseyNumber || !regPrimaryPosition) {
      addNotification('error', 'Missing Fields', 'Please complete all required text fields.');
      return;
    }

    // Image upload is OPTIONAL — fallback to default avatar
    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

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
      imageUrl: regImageUrl || defaultAvatar,
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
    <div style={{ maxWidth: '480px', margin: '40px auto', width: '100%' }}>
      {/* Auth Modal Container */}
      <div className="glass-panel" style={{ padding: '36px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        
        {/* Navigation Tabs Header */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px', borderRadius: '12px', marginBottom: '28px' }}>
          <button
            onClick={() => setActiveTab('LOGIN')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'LOGIN' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: activeTab === 'LOGIN' ? '#60a5fa' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={16} />
            <span>Login Portal</span>
          </button>

          {/* Registration Tab — ONLY visible in Phase 2 */}
          {isRegistration && (
            <button
              onClick={() => setActiveTab('REGISTER')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'REGISTER' ? 'rgba(34, 197, 94, 0.25)' : 'transparent',
                color: activeTab === 'REGISTER' ? '#4ade80' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus size={16} />
              <span>Player Register</span>
            </button>
          )}
        </div>

        {/* ── TAB 1: LOGIN PORTAL ────────────────────────────────────────── */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Portal Single Sign-On</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '4px 0 0 0' }}>Enter your credentials or choose a quick demo role below.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Email / Username / Role</label>
              <input
                type="text"
                placeholder="e.g. admin@gmail.com, subadmin, podium, manager..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                placeholder="•••••••• (Default demo: 123456)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <span>Sign In to Platform</span>
              <ArrowRight size={16} />
            </button>

            {/* Quick Switch Demo Accounts */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px', marginTop: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Quick Demo Switcher
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {Object.keys(PRESET_ACCOUNTS).map(key => {
                  const acc = PRESET_ACCOUNTS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePresetSelect(key)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(30, 41, 59, 0.6)',
                        color: '#cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{acc.avatar}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        )}

        {/* ── TAB 2: PLAYER REGISTER (Phase 2 Only) ────────────────────────── */}
        {activeTab === 'REGISTER' && isRegistration && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Player Portal Registration</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0 0' }}>Submit your profile details for auction pool qualification.</p>
            </div>

            {regSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#4ade80' }}>
                <CheckCircle2 size={48} style={{ marginBottom: '12px' }} />
                <h3>Registration Successful!</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Redirecting to your dashboard...</p>
              </div>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Full Name *</label>
                  <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. John Doe" className="form-control" style={{ fontSize: '0.85rem' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Student ID *</label>
                    <input type="text" required value={regStudentId} onChange={(e) => setRegStudentId(e.target.value)} placeholder="ST-2026-08" className="form-control" style={{ fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Academic Session *</label>
                    <select value={regSession} onChange={(e) => setRegSession(e.target.value)} className="form-control" style={{ fontSize: '0.85rem' }}>
                      {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Email *</label>
                    <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="student@univ.edu" className="form-control" style={{ fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Password *</label>
                    <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" className="form-control" style={{ fontSize: '0.85rem' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Jersey Name *</label>
                    <input type="text" required value={regJerseyName} onChange={(e) => setRegJerseyName(e.target.value)} placeholder="DOE" className="form-control" style={{ fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Jersey Number *</label>
                    <input type="text" required value={regJerseyNumber} onChange={(e) => setRegJerseyNumber(e.target.value)} placeholder="10" className="form-control" style={{ fontSize: '0.85rem' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Primary Position *</label>
                  <select value={regPrimaryPosition} onChange={(e) => setRegPrimaryPosition(e.target.value)} className="form-control" style={{ fontSize: '0.85rem' }}>
                    {positions.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                  </select>
                </div>

                {/* Profile Photo (OPTIONAL) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Profile Photo (Optional)</label>
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="form-control" style={{ fontSize: '0.8rem', padding: '6px' }} />
                  {regImageUrl && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={regImageUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>✓ Photo attached</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  Complete Registration
                </button>
              </>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
