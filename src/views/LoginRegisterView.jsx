import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemPhase } from '../context/SystemPhaseContext';
import { Shield, User, Key, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';

export function LoginRegisterView({ onLoginSuccess }) {
  const { login, PRESET_ACCOUNTS } = useAuth();
  const { currentPhase } = useSystemPhase();
  const [activeTab, setActiveTab] = useState('LOGIN'); // 'LOGIN' or 'REGISTER'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regPosition, setRegPosition] = useState('ST');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) return;
    const res = login(email, password, selectedRole);
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
    setRegSuccess(true);
    setTimeout(() => {
      login(regEmail || 'newplayer@student.edu', 'pass', 'PLAYER');
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
            Select a quick demo persona or log in with your account credentials.
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
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="TEAM_MANAGER">Team Manager</option>
                  <option value="PODIUM_ADMIN">Podium Admin</option>
                  <option value="PLAYER">Player</option>
                </select>
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
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Full Name</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Student ID</label>
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Primary Position</label>
                  <select
                    value={regPosition}
                    onChange={(e) => setRegPosition(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff'
                    }}
                  >
                    <option value="ST">Striker (ST)</option>
                    <option value="CAM">Central Attacking Mid (CAM)</option>
                    <option value="CM">Central Midfield (CM)</option>
                    <option value="CB">Center Back (CB)</option>
                    <option value="GK">Goalkeeper (GK)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>University Email</label>
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
