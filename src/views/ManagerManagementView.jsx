import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  UserCog, 
  Plus, 
  Grid, 
  List, 
  Search, 
  Edit3, 
  Trash2, 
  Key, 
  Ban, 
  UploadCloud, 
  X, 
  Eye, 
  CheckCircle2, 
  ShieldAlert, 
  Mail, 
  Lock
} from 'lucide-react';

export const ManagerManagementView = ({ initialEditManager = null }) => {
  const { 
    managers, 
    addManager, 
    updateManager, 
    deleteManager, 
    toggleBanManager, 
    resetManagerPassword, 
    teams, 
    addNotification 
  } = useSystem();

  const [viewMode, setViewMode] = useState('CARD'); // 'CARD' or 'TABLE'
  const [sortBy, setSortBy] = useState('NAME_ASC');
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(Boolean(initialEditManager));
  const [editingManager, setEditingManager] = useState(initialEditManager);
  const [selectedManagerDetail, setSelectedManagerDetail] = useState(null);
  const [assigningTeamId, setAssigningTeamId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    teamId: '',
    imageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenAdd = () => {
    setEditingManager(null);
    const autoPass = 'pass_' + Math.random().toString(36).substring(2, 8);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: autoPass,
      imageUrl: ''
    });
    setImagePreview('');
    setShowModal(true);
  };

  const handleOpenEdit = (mgr) => {
    setEditingManager(mgr);
    setFormData({
      name: mgr.name,
      email: mgr.email,
      mobile: mgr.mobile || '',
      password: mgr.password || '********',
      teamId: mgr.teamId || '',
      imageUrl: mgr.imageUrl
    });
    setImagePreview(mgr.imageUrl);
    setShowModal(true);
  };

  const handleGeneratePassword = () => {
    const generated = 'pass_' + Math.random().toString(36).substring(2, 8);
    setFormData(prev => ({ ...prev, password: generated }));
    addNotification('info', 'Credentials Generated', `New initial password: ${generated}`);
  };

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setIsUploading(false);
      addNotification('success', 'Cloud Media Uploaded', 'Manager photo uploaded to Cloudinary.');
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addNotification('error', 'Missing Data', 'Full Name and Email are required.');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

    if (editingManager) {
      updateManager(editingManager.id, {
        ...formData,
        imageUrl: formData.imageUrl || editingManager.imageUrl || defaultImg
      });
    } else {
      addManager({
        ...formData,
        imageUrl: formData.imageUrl || defaultImg,
        cloudPublicId: 'cld_mgr_' + Date.now()
      });
    }

    setShowModal(false);
  };

  const handleAssignTeam = (mgrId, teamId) => {
    updateManager(mgrId, { teamId: teamId || null });
    if (teamId) {
      const team = teams.find(t => t.id === teamId);
      const mgr = managers.find(m => m.id === mgrId);
      addNotification('success', 'Team Assigned', `${mgr?.name || 'Manager'} assigned to ${team?.name || 'team'}.`);
    }
    setAssigningTeamId(null);
  };

  // Search & Filter
  const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.username && m.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.mobile && m.mobile.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedManagers = [...filteredManagers].sort((a, b) => {
    if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
    if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
    if (sortBy === 'TEAM') return (a.teamId || '').localeCompare(b.teamId || '');
    if (sortBy === 'DATE') return (a.createdAt || '').localeCompare(b.createdAt || '');
    return 0;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Controls Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCog color="var(--accent-cyan)" /> Manager Management Module (/admin/managers)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Manage team manager credentials, auto-generate initial login passwords, reassign franchise teams, and lock bidding tokens ({managers.length} Total).
            </p>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} /> + Add Manager
          </button>
        </div>

        {/* Search, Sort & View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-card-solid)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px', background: 'var(--bg-input)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Search size={16} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by Manager Name, Email, Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--accent-gold)', fontWeight: 700, padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="NAME_ASC">Sort: Name (A-Z)</option>
            <option value="NAME_DESC">Sort: Name (Z-A)</option>
            <option value="TEAM">Sort: Assigned Team</option>
            <option value="DATE">Sort: Creation Date</option>
          </select>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('CARD')}
              className="btn"
              style={{
                padding: '5px 10px',
                fontSize: '0.8rem',
                background: viewMode === 'CARD' ? 'var(--accent-cyan)' : 'transparent',
                color: viewMode === 'CARD' ? '#000' : 'var(--text-muted)',
                borderRadius: '6px'
              }}
            >
              <Grid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className="btn"
              style={{
                padding: '5px 10px',
                fontSize: '0.8rem',
                background: viewMode === 'TABLE' ? 'var(--accent-cyan)' : 'transparent',
                color: viewMode === 'TABLE' ? '#000' : 'var(--text-muted)',
                borderRadius: '6px'
              }}
            >
              <List size={16} /> Table
            </button>
          </div>

        </div>

      </div>

      {/* Main View Area */}
      {viewMode === 'CARD' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {sortedManagers.map(mgr => {
            const teamObj = teams.find(t => t.id === mgr.teamId || t.managerId === mgr.id);
            const isBanned = mgr.status === 'BANNED';
            return (
              <div
                key={mgr.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  border: isBanned ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
                  opacity: isBanned ? 0.75 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <img
                      src={mgr.imageUrl}
                      alt={mgr.name}
                      style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{mgr.name}</h3>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{mgr.email}</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: '10px', fontSize: '0.78rem', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Mobile: <strong style={{ color: 'var(--accent-cyan)' }}>{mgr.mobile || 'N/A'}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Assigned Franchise:</span>
                      <select
                        value={mgr.teamId || ''}
                        onChange={(e) => handleAssignTeam(mgr.id, e.target.value)}
                        style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', padding: '2px 6px', fontSize: '0.75rem', outline: 'none' }}
                      >
                        <option value="">Unassigned</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>Bidding Token Status: <span className={`badge ${isBanned ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>{isBanned ? 'LOCKED (BANNED)' : 'ACTIVE'}</span></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setSelectedManagerDetail(mgr)} className="btn btn-secondary" style={{ flex: 1, padding: '6px 8px', fontSize: '0.75rem' }}><Eye size={14} /> Details</button>
                  <button onClick={() => resetManagerPassword(mgr.id)} className="btn btn-secondary" style={{ padding: '6px 8px', fontSize: '0.75rem' }} title="Reset Password"><Key size={14} color="var(--accent-gold)" /></button>
                  <button onClick={() => toggleBanManager(mgr.id)} className={`btn ${isBanned ? 'btn-gold' : 'btn-danger'}`} style={{ padding: '6px 8px', fontSize: '0.75rem' }} title={isBanned ? 'Unban Manager' : 'Ban Manager'}><Ban size={14} /></button>
                  <button onClick={() => deleteManager(mgr.id)} className="btn btn-danger" style={{ padding: '6px 8px', fontSize: '0.75rem' }}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 16px' }}>MANAGER</th>
                  <th style={{ padding: '14px 16px' }}>MOBILE / CONTACT</th>
                  <th style={{ padding: '14px 16px' }}>LINKED FRANCHISE</th>
                  <th style={{ padding: '14px 16px' }}>TOKEN STATUS</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
              {sortedManagers.map(mgr => {
                const teamObj = teams.find(t => t.id === mgr.teamId || t.managerId === mgr.id);
                const isBanned = mgr.status === 'BANNED';
                return (
                  <tr key={mgr.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={mgr.imageUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{mgr.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{mgr.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{mgr.mobile || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={mgr.teamId || ''}
                        onChange={(e) => handleAssignTeam(mgr.id, e.target.value)}
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', color: teamObj ? 'var(--accent-green)' : 'var(--text-dim)', padding: '4px 8px', fontSize: '0.8rem', outline: 'none' }}
                      >
                        <option value="">Unassigned</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${isBanned ? 'badge-red' : 'badge-green'}`}>{isBanned ? 'LOCKED' : 'ACTIVE'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setSelectedManagerDetail(mgr)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Eye size={14} /></button>
                        <button onClick={() => resetManagerPassword(mgr.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Key size={14} color="var(--accent-gold)" /></button>
                        <button onClick={() => toggleBanManager(mgr.id)} className={`btn ${isBanned ? 'btn-gold' : 'btn-danger'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Ban size={14} /></button>
                        <button onClick={() => deleteManager(mgr.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Manager Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingManager ? 'Edit Manager Profile' : '+ Add Franchise Manager Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

             <form onSubmit={handleSubmit}>
               <div className="form-group">
                 <label className="form-label">Full Name *</label>
                 <input
                   type="text"
                   className="form-control"
                   placeholder="e.g. Alex Mercer"
                   value={formData.name}
                   onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                   required
                 />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                 <div className="form-group">
                   <label className="form-label">Email Address *</label>
                   <input
                     type="email"
                     className="form-control"
                     placeholder="e.g. alex@thunderbolts.com"
                     value={formData.email}
                     onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                     required
                   />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Mobile Number</label>
                   <input
                     type="tel"
                     className="form-control"
                     placeholder="e.g. +1-555-0101"
                     value={formData.mobile}
                     onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                   />
                 </div>
               </div>

               {/* Login Credentials Auto-Generator */}
               <div className="form-group">
                 <label className="form-label">Initial Password Credentials Generator</label>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <input
                     type="text"
                     className="form-control"
                     value={formData.password}
                     onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                     style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                   />
                   <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                     <Key size={14} color="var(--accent-gold)" /> Generate
                   </button>
                 </div>
               </div>

               {/* Cloudinary Profile Photo Dropzone */}
               <div className="form-group">
                 <label className="form-label">Profile Image (Cloudinary Dropzone)</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                   <div style={{ width: '50px', height: '50px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {imagePreview ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UploadCloud size={20} color="var(--text-dim)" />}
                   </div>
                   <div style={{ flex: 1 }}>
                     <label className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', cursor: 'pointer' }}>
                       <UploadCloud size={14} /> {isUploading ? 'Uploading...' : 'Upload Image'}
                       <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
                     </label>
                   </div>
                 </div>
               </div>

               <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                   {editingManager ? 'Save Changes' : 'Create Manager Account'}
                 </button>
                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                   Cancel
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedManagerDetail && (
        <div className="modal-overlay" onClick={() => setSelectedManagerDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Manager Account Details</h3>
              <button onClick={() => setSelectedManagerDetail(null)} className="btn btn-secondary" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

             <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
               <img src={selectedManagerDetail.imageUrl} alt="" style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
               <div>
                 <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedManagerDetail.name}</h4>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedManagerDetail.email}</div>
                 <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Mobile: <strong>{selectedManagerDetail.mobile || 'N/A'}</strong></div>
               </div>
             </div>

            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>Assigned Team: <span className="badge badge-green">{teams.find(t => t.id === selectedManagerDetail.teamId)?.name || 'Unassigned'}</span></div>
              <div>Password Credentials: <code style={{ color: 'var(--accent-gold)' }}>{selectedManagerDetail.password || '********'}</code></div>
              <div>Login Token Status: <span className={`badge ${selectedManagerDetail.status === 'BANNED' ? 'badge-red' : 'badge-green'}`}>{selectedManagerDetail.status === 'BANNED' ? 'DEACTIVATED' : 'ACTIVE'}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => resetManagerPassword(selectedManagerDetail.id)} className="btn btn-gold" style={{ flex: 1 }}>
                <Key size={14} /> Reset Password
              </button>
              <button onClick={() => toggleBanManager(selectedManagerDetail.id)} className="btn btn-danger">
                <Ban size={14} /> {selectedManagerDetail.status === 'BANNED' ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
