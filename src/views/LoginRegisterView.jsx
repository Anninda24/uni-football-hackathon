import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { Shield, User, Key, ArrowRight, UserPlus, CheckCircle2, UploadCloud, LogIn, Sparkles, UserCheck, Crown, Gavel, Eye } from 'lucide-react';

export function LoginRegisterView({ onLoginSuccess, initialTab = 'SIGN_IN' }) {
  const { login, PRESET_ACCOUNTS, setCurrentUser } = useAuth();
  const { systemState, setPlayers, addNotification } = useSystem();
  
  // 3 Tabs: 'SIGN_IN' | 'REGISTER' | 'DEMO'
  const [activeTab, setActiveTab] = useState(initialTab === 'REGISTER' ? 'REGISTER' : (initialTab === 'DEMO' ? 'DEMO' : 'SIGN_IN'));

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Player Registration Form States
  const [regName, setRegName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSession, setRegSession] = useState(systemState.academicSessions[0] || '2025/2026');
  const [regJerseyName, setRegJerseyName] = useState('');
  const [regJerseyNumber, setRegJerseyNumber] = useState('10');
  const [regPrimaryPosition, setRegPrimaryPosition] = useState('ST');
  const [regSecondaryPositions, setRegSecondaryPositions] = useState([]);
  const [regImageUrl, setRegImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const POSITIONS = [
    { code: 'GK', name: 'Goalkeeper' },
    { code: 'CB', name: 'Center Back' },
    { code: 'LB', name: 'Left Back' },
    { code: 'RB', name: 'Right Back' },
    { code: 'CDM', name: 'Defensive Midfielder' },
    { code: 'CM', name: 'Central Midfielder' },
    { code: 'CAM', name: 'Attacking Midfielder' },
    { code: 'LW', name: 'Left Wing' },
    { code: 'RW', name: 'Right Wing' },
    { code: 'ST', name: 'Striker' }
  ];

  const sessions = systemState.academicSessions || ['2024/2025', '2025/2026', '2026/2027'];

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRegImageUrl(event.target.result);
      setUploadingImage(false);
      addNotification('success', 'Image Uploaded', 'Optional profile photo attached.');
    };
    reader.onerror = () => {
      setUploadingImage(false);
      addNotification('error', 'Upload Failed', 'Could not read image file.');
    };
    reader.readAsDataURL(file);
  };

  const toggleSecondaryPosition = (code) => {
    if (code === regPrimaryPosition) return;
    setRegSecondaryPositions(prev => {
      const exists = prev.includes(code);
      return exists ? prev.filter(p => p !== code) : [...prev, code];
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!username || !password) {
      setLoginError('Please enter both your email/username and password.');
      return;
    }
    const res = await login(username, password);
    if (res?.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setLoginError(res?.error || 'Invalid credentials. Only authorized role accounts can sign in.');
    }
  };

  const handlePresetSelect = async (roleKey) => {
    const acc = PRESET_ACCOUNTS[roleKey];
    if (acc) {
      const res = await login(acc.email, '123456', roleKey);
      if (res?.success && onLoginSuccess) {
        onLoginSuccess();
      }
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!regName || !regStudentId || !regEmail || !regPassword || !regSession || !regJerseyName || !regJerseyNumber || !regPrimaryPosition) {
      addNotification('error', 'Missing Fields', 'Please complete all required text fields.');
      return;
    }

    const defaultAvatar = 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80';

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
      categoryId: null, // Automatically registered to Unallocated (no category option)
      basePrice: 0,
      status: 'APPROVED',
      soldToTeamId: null,
      soldAmount: 0
    };

    setPlayers(prev => [newPlayer, ...prev]);
    addNotification('success', 'Player Registered', `${newPlayer.name} registered to draft pool (Unallocated).`);

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
    <div style={{ maxWidth: '560px', margin: '30px auto', width: '100%' }}>
      {/* Auth Container */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Top Header Branding */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)' }}>
              <Shield style={{ color: '#fff', width: '22px', height: '22px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Authentication & Registration Portal</h2>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>UniLeague Tournament System</div>
            </div>
          </div>
        </div>

        {/* ── 3 SEPARATED TABS HEADER ─────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr 1fr',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* TAB 1: Sign In */}
          <button
            type="button"
            onClick={() => setActiveTab('SIGN_IN')}
            style={{
              padding: '10px 8px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'SIGN_IN' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(37, 99, 235, 0.25) 100%)' : 'transparent',
              color: activeTab === 'SIGN_IN' ? '#60a5fa' : '#94a3b8',
              fontWeight: activeTab === 'SIGN_IN' ? 800 : 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === 'SIGN_IN' ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>

          {/* TAB 2: Player Registration */}
          <button
            type="button"
            onClick={() => setActiveTab('REGISTER')}
            style={{
              padding: '10px 8px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'REGISTER' ? 'linear-gradient(135deg, rgba(0, 230, 153, 0.25) 0%, rgba(0, 179, 119, 0.15) 100%)' : 'transparent',
              color: activeTab === 'REGISTER' ? '#00e699' : '#94a3b8',
              fontWeight: activeTab === 'REGISTER' ? 800 : 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === 'REGISTER' ? '2px solid #00e699' : '2px solid transparent'
            }}
          >
            <UserPlus size={15} />
            <span>Player Registration</span>
          </button>

          {/* TAB 3: Quick Demo Switcher */}
          <button
            type="button"
            onClick={() => setActiveTab('DEMO')}
            style={{
              padding: '10px 8px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'DEMO' ? 'linear-gradient(135deg, rgba(255, 183, 3, 0.25) 0%, rgba(255, 157, 0, 0.15) 100%)' : 'transparent',
              color: activeTab === 'DEMO' ? '#ffb703' : '#94a3b8',
              fontWeight: activeTab === 'DEMO' ? 800 : 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === 'DEMO' ? '2px solid #ffb703' : '2px solid transparent'
            }}
          >
            <Sparkles size={15} />
            <span>Demo Switcher</span>
          </button>
        </div>

        {/* ── TAB 1 CONTENT: SIGN IN ───────────────────────────────────── */}
        {activeTab === 'SIGN_IN' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Sign In to Platform</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0 0' }}>Enter your role credentials (or use the Demo Switcher tab).</p>
            </div>

            {loginError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️ {loginError}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Email / Username / Role</label>
              <input
                type="text"
                placeholder="e.g. admin@gmail.com, subadmin, manager, player..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (loginError) setLoginError('');
                }}
                required
                className="form-control"
                style={{ padding: '11px 14px', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Password</label>
              <input
                type="password"
                placeholder="Password (e.g. 123)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError) setLoginError('');
                }}
                required
                className="form-control"
                style={{ padding: '11px 14px', fontSize: '0.88rem' }}
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
                marginTop: '4px',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
              }}
            >
              <span>Sign In to Platform</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>or zero-friction access</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            </div>

            {/* Zero-Friction Guest Spectator Access */}
            <button
              type="button"
              onClick={() => {
                setCurrentUser({
                  id: 'usr-guest-' + Date.now(),
                  name: 'Guest Spectator',
                  email: 'spectator@unileague.live',
                  role: 'SPECTATOR',
                  avatar: '👀',
                  teamId: null
                });
                addNotification('info', 'Guest Entry', 'Entered as public spectator with zero authentication friction.');
                if (onLoginSuccess) onLoginSuccess();
              }}
              style={{
                padding: '11px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 217, 255, 0.35)',
                background: 'rgba(0, 217, 255, 0.1)',
                color: '#00d9ff',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Eye size={16} />
              <span>Continue as Guest Spectator (No Password Needed)</span>
            </button>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.74rem', color: '#64748b' }}>
              💡 <strong>Demo Credentials (password: <code style={{ color: '#f8fafc' }}>123</code>):</strong> <code style={{ color: '#60a5fa' }}>admin@gmail.com</code> (Super Admin) · <code style={{ color: '#ff4d6d' }}>subadmin@gmail.com</code> (Sub-Admin) · <code style={{ color: '#a855f7' }}>podium@gmail.com</code> (Podium Admin) · <code style={{ color: '#ffb703' }}>manager@gmail.com</code> (Manager) · <code style={{ color: '#00e699' }}>player@gmail.com</code> (Player)
            </div>
          </form>
        )}

        {/* ── TAB 2 CONTENT: PLAYER REGISTRATION ───────────────────────── */}
        {activeTab === 'REGISTER' && (
          <div>
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Player Registration (Join Draft Pool)</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                Register your profile for the auction pool. New athletes are placed into <strong>Unallocated</strong> until assigned a tier by the league administrator.
              </p>
            </div>

            {regSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#4ade80' }}>
                <CheckCircle2 size={48} style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem' }}>Registration Successful!</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Added to draft pool. Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Liam Smith"
                    className="form-control"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Student ID *</label>
                    <input
                      type="text"
                      required
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      placeholder="ST-2026-101"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Academic Session *</label>
                    <select
                      value={regSession}
                      onChange={(e) => setRegSession(e.target.value)}
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    >
                      {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="student@univ.edu"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Password *</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Jersey Name *</label>
                    <input
                      type="text"
                      required
                      value={regJerseyName}
                      onChange={(e) => setRegJerseyName(e.target.value)}
                      placeholder="SMITH"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>Jersey # *</label>
                    <input
                      type="number"
                      required
                      value={regJerseyNumber}
                      onChange={(e) => setRegJerseyNumber(e.target.value)}
                      placeholder="10"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Primary Position Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                    Primary Position * (Pick Exactly 1)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POSITIONS.map(p => {
                      const isSelected = regPrimaryPosition === p.code;
                      return (
                        <button
                          type="button"
                          key={p.code}
                          onClick={() => setRegPrimaryPosition(p.code)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #00e699' : '1px solid rgba(255, 255, 255, 0.1)',
                            background: isSelected ? 'rgba(0, 230, 153, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                            color: isSelected ? '#00e699' : '#94a3b8'
                          }}
                        >
                          {p.code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Positions Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                    Secondary Positions (Optional)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POSITIONS.map(p => {
                      const isPri = regPrimaryPosition === p.code;
                      const isSec = regSecondaryPositions.includes(p.code);
                      return (
                        <button
                          type="button"
                          key={p.code}
                          disabled={isPri}
                          onClick={() => toggleSecondaryPosition(p.code)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: isPri ? 'not-allowed' : 'pointer',
                            opacity: isPri ? 0.35 : 1,
                            border: isSec ? '1px solid #00d9ff' : '1px solid rgba(255, 255, 255, 0.08)',
                            background: isSec ? 'rgba(0, 217, 255, 0.2)' : 'rgba(15, 23, 42, 0.4)',
                            color: isSec ? '#00d9ff' : '#64748b'
                          }}
                        >
                          + {p.code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Photo Upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>
                    Profile Photo (Optional)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                      color: '#94a3b8',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}>
                      <UploadCloud size={16} />
                      <span>{uploadingImage ? 'Uploading...' : 'Choose Photo...'}</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: 'none' }} />
                    </label>
                    {regImageUrl && (
                      <img src={regImageUrl} alt="" style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover' }} />
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #00e699 0%, #00b377 100%)',
                    color: '#031710',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 230, 153, 0.35)'
                  }}
                >
                  Complete Player Registration
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── TAB 3 CONTENT: QUICK DEMO SWITCHER ───────────────────────── */}
        {activeTab === 'DEMO' && (
          <div>
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Quick Demo Switcher</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                Instant one-click access to test all administrative, manager, player, and spectator roles.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.keys(PRESET_ACCOUNTS)
                .filter(key => !['ICON_PLAYER'].includes(key))
                .map(key => {
                const acc = PRESET_ACCOUNTS[key];
                const isSuperAdmin = key === 'SUPER_ADMIN';
                const isSubAdmin = key === 'SUB_ADMIN';
                const isManager = key === 'TEAM_MANAGER';
                const isPlayer = key === 'PLAYER';
                const isPodium = key === 'PODIUM_ADMIN';
                const isSpectator = key === 'SPECTATOR';

                const roleBadgeColor = isSuperAdmin ? '#ef4444' : isSubAdmin ? '#ff4d6d' : isPodium ? '#a855f7' : isManager ? '#3b82f6' : isPlayer ? '#22c55e' : isSpectator ? '#00d9ff' : '#94a3b8';

                const roleLabel = isSuperAdmin ? 'Super Admin' : isSubAdmin ? 'Sub Admin' : isPodium ? 'Podium Admin' : isManager ? 'Team Manager' : isPlayer ? 'Player' : isSpectator ? 'Guest Spectator' : acc.role.replace(/_/g, ' ');

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetSelect(key)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                      e.currentTarget.style.borderColor = roleBadgeColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{acc.avatar}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>{acc.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{acc.email} · pass: 123</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: `${roleBadgeColor}20`,
                        color: roleBadgeColor,
                        border: `1px solid ${roleBadgeColor}40`
                      }}>
                        {roleLabel}
                      </span>
                      <ArrowRight size={14} color="#64748b" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

