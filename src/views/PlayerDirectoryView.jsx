import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { useSystemPhase } from '../context/SystemPhaseContext';
import {
  UserCheck,
  Plus,
  Grid,
  List,
  Search,
  Filter,
  Edit3,
  Trash2,
  Ban,
  UploadCloud,
  CheckCircle2,
  X,
  AlertCircle,
  FileSpreadsheet,
  ShieldAlert,
  Eye,
  ArrowUpFromLine
} from 'lucide-react';

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

export const PlayerDirectoryView = ({ initialEditPlayer = null, readOnly = false, scope = 'all', onSendToPodium }) => {
  const {
    systemState,
    players,
    setPlayers,
    toggleBanPlayer,
    deletePlayer,
    bulkImportPlayers,
    addNotification,
    teams,
    pullPlayerToPodium,
    auctionState
  } = useSystem();
  const { currentUser } = useAuth();
  const { isTournament } = useSystemPhase();

  const isAdmin = ['SUPER_ADMIN', 'SUB_ADMIN', 'PODIUM_ADMIN'].includes(currentUser.role);

  const resolveAssignedTeamId = () => {
    if (currentUser?.role === 'TEAM_MANAGER') {
      const managed = teams.find(t => t.managerId === currentUser.id) ||
                      teams.find(t => t.id === currentUser.teamId) ||
                      teams.find(t => t.managerEmail && t.managerEmail.toLowerCase() === currentUser?.email?.toLowerCase());
      return managed?.id || teams[0]?.id || null;
    }
    const myPlayer = players.find(p => p.id === currentUser?.id || (p.email && p.email.toLowerCase() === currentUser?.email?.toLowerCase()) || (currentUser?.studentId && p.studentId === currentUser.studentId));
    return myPlayer?.soldToTeamId || currentUser?.teamId || teams[0]?.id || null;
  };

  const assignedTeamId = resolveAssignedTeamId();
  const assignedTeam = teams.find(t => t.id === assignedTeamId);
  const restrictToAssignedTeam = scope === 'assignedTeam' && isTournament;

  const visiblePlayers = restrictToAssignedTeam
    ? players.filter(p => p.soldToTeamId === assignedTeamId || assignedTeam?.roster?.includes(p.id))
    : players;

  // Top Bar States
  const [viewMode, setViewMode] = useState('CARD'); // 'TABLE' or 'CARD'
  const [sortBy, setSortBy] = useState('NAME_ASC');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterSession, setFilterSession] = useState('ALL');

  // Modals & Active Detail Selection
  const [showFormModal, setShowFormModal] = useState(Boolean(initialEditPlayer));
  const [editingPlayer, setEditingPlayer] = useState(initialEditPlayer);
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState(null);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [confirmDeletePlayer, setConfirmDeletePlayer] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    session: systemState.academicSessions[0] || '2025/2026',
    jerseyName: '',
    jerseyNumber: '10',
    primaryPosition: 'ST',
    secondaryPositions: [],
    categoryId: '',
    imageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setFormData({
      name: '',
      studentId: '',
      session: systemState.academicSessions[0] || '2025/2026',
      jerseyName: '',
      jerseyNumber: '10',
      primaryPosition: 'ST',
      secondaryPositions: [],
      categoryId: '',
      imageUrl: ''
    });
    setImagePreview('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      studentId: player.studentId,
      session: player.session,
      jerseyName: player.jerseyName,
      jerseyNumber: player.jerseyNumber || '10',
      primaryPosition: player.primaryPosition,
      secondaryPositions: player.secondaryPositions || [],
      categoryId: player.categoryId || '',
      imageUrl: player.imageUrl
    });
    setImagePreview(player.imageUrl);
    setShowFormModal(true);
  };

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target.result;
      setImagePreview(url);
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setIsUploading(false);
      addNotification('success', 'Cloud Media Uploaded', 'Cloudinary public ID asset generated.');
    };
    reader.onerror = () => {
      setIsUploading(false);
      addNotification('error', 'Upload Failed', 'Could not read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.studentId || !formData.jerseyName) {
      addNotification('error', 'Missing Data', 'Please fill in Name, Student ID, and Jersey Name.');
      return;
    }

    const category = formData.categoryId ? systemState.categories.find(c => c.id === formData.categoryId) : null;
    const defaultImg = 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80';

    if (editingPlayer) {
      setPlayers(prev => prev.map(p => p.id === editingPlayer.id ? {
        ...p,
        ...formData,
        categoryId: formData.categoryId || null,
        imageUrl: formData.imageUrl || p.imageUrl || defaultImg,
        basePrice: category ? category.basePrice : 0
      } : p));
      addNotification('success', 'Player Profile Saved', `${formData.name} profile updated.`);
    } else {
      const newP = {
        id: 'ply-' + Date.now(),
        ...formData,
        categoryId: formData.categoryId || null,
        imageUrl: formData.imageUrl || defaultImg,
        cloudPublicId: 'cld_ply_' + Date.now(),
        basePrice: category ? category.basePrice : 0,
        status: 'APPROVED',
        soldToTeamId: null,
        soldAmount: 0
      };
      setPlayers(prev => [newP, ...prev]);
      addNotification('success', 'Player Registered', `${formData.name} added to ${category ? category.name : 'Unallocated'}.`);
    }

    setShowFormModal(false);
  };

  const handleAssignCategory = (playerId, categoryId) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const cat = categoryId ? systemState.categories.find(c => c.id === categoryId) : null;
        return {
          ...p,
          categoryId: categoryId || null,
          basePrice: cat ? cat.basePrice : 0
        };
      }
      return p;
    }));
    const cat = categoryId ? systemState.categories.find(c => c.id === categoryId) : null;
    const player = players.find(p => p.id === playerId);
    if (cat && player) {
      addNotification('success', 'Category Assigned', `${player.name} moved to ${cat.name}.`);
    } else if (player && !categoryId) {
      addNotification('success', 'Category Unassigned', `${player.name} moved to Unallocated.`);
    }
  };

  // Bulk CSV Simulation
  const handleSimulateBulkImport = () => {
    const sampleBulk = [
      { name: 'Gabriel Jesus', studentId: 'ST-2025-901', jerseyName: 'GABRIEL', primaryPosition: 'ST', secondaryPositions: ['RW'] },
      { name: 'Federico Valverde', studentId: 'ST-2025-902', jerseyName: 'VALVERDE', primaryPosition: 'CM', secondaryPositions: ['RM', 'RB'] },
      { name: 'Alphonso Davies', studentId: 'ST-2025-903', jerseyName: 'DAVIES', primaryPosition: 'LB', secondaryPositions: ['LM', 'LW'] },
      { name: 'Gianluigi Donnarumma', studentId: 'ST-2025-904', jerseyName: 'DONNARUMMA', primaryPosition: 'GK', secondaryPositions: [] }
    ];
    bulkImportPlayers(sampleBulk);
    setShowBulkImportModal(false);
  };

  // Filter & Sort Logic
  const filteredPlayers = visiblePlayers.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jerseyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPos = filterPosition === 'ALL' || p.primaryPosition === filterPosition;
    const matchCat = filterCategory === 'ALL' || (filterCategory === 'UNALLOCATED' ? (!p.categoryId || p.categoryId === 'unallocated') : p.categoryId === filterCategory);
    const matchSess = filterSession === 'ALL' || p.session === filterSession;
    return matchSearch && matchPos && matchCat && matchSess;
  });

  const categoryOrder = {
    'cat-icon': 5,
    'cat-plat': 4,
    'cat-gold': 3,
    'cat-silver': 2,
    'cat-bronze': 1
  };

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
    if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
    if (sortBy === 'JERSEY') return Number(a.jerseyNumber || 0) - Number(b.jerseyNumber || 0);
    if (sortBy === 'SESSION') return a.session.localeCompare(b.session);
    if (sortBy === 'CATEGORY') {
      const aOrder = a.categoryId ? (categoryOrder[a.categoryId] || 0) : -1;
      const bOrder = b.categoryId ? (categoryOrder[b.categoryId] || 0) : -1;
      return aOrder - bOrder || a.name.localeCompare(b.name);
    }
    return 0;
  });

  const groupedPlayers = sortedPlayers.reduce((acc, player) => {
    const isCaptainOrVC = teams.some(t => t.captainId === player.id || t.viceCaptainId === player.id);
    const key = isCaptainOrVC ? 'cat-icon' : (player.categoryId || 'unallocated');
    if (!acc[key]) acc[key] = [];
    acc[key].push(player);
    return acc;
  }, {});

  const groupOrder = [
    'unallocated',
    'cat-icon',
    ...systemState.categories.filter(c => c.id !== 'cat-icon').map(c => c.id)
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top Header Controls Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck color="var(--accent-green)" /> {readOnly ? 'Players' : 'Player Directory (/admin/players)'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {readOnly
                ? (restrictToAssignedTeam
                  ? `Players assigned to your team (${visiblePlayers.length} Total).`
                  : `All registered players (${visiblePlayers.length} Total).`)
                : `Manage registered athletes, profile metadata, position tags, Cloudinary photos, and ban statuses (${players.length} Total).`}
            </p>
          </div>

          {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          </div>
          )}
        </div>

        {/* Controls: Search, Filters, Sort, View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-card-solid)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>

          {/* Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px', background: 'var(--bg-input)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Search size={16} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by Name, Student ID, Jersey..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          {/* Position Filter */}
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="ALL">All Positions</option>
            {POSITIONS.map(p => (
              <option key={p.code} value={p.code}>{p.code} - {p.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="ALL">All Tiers</option>
            <option value="UNALLOCATED">Unallocated</option>
            {systemState.categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Session Filter */}
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="ALL">All Sessions</option>
            {systemState.academicSessions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--accent-gold)', fontWeight: 700, padding: '6px 10px', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="NAME_ASC">Sort: Name (A-Z)</option>
            <option value="NAME_DESC">Sort: Name (Z-A)</option>
            <option value="JERSEY">Sort: Jersey Number</option>
            <option value="SESSION">Sort: Session</option>
            <option value="CATEGORY">Sort: Tier Category</option>
          </select>

          {/* View Switcher Toggle Buttons */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('CARD')}
              className="btn"
              style={{
                padding: '5px 10px',
                fontSize: '0.8rem',
                background: viewMode === 'CARD' ? 'var(--accent-green)' : 'transparent',
                color: viewMode === 'CARD' ? '#000' : 'var(--text-muted)',
                borderRadius: '6px'
              }}
              title="Large Icon View (Card Grid)"
            >
              <Grid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className="btn"
              style={{
                padding: '5px 10px',
                fontSize: '0.8rem',
                background: viewMode === 'TABLE' ? 'var(--accent-green)' : 'transparent',
                color: viewMode === 'TABLE' ? '#000' : 'var(--text-muted)',
                borderRadius: '6px'
              }}
              title="Detail View (Data Table)"
            >
              <List size={16} /> Table
            </button>
          </div>

        </div>

      </div>

      {/* Main Content Area: Card Grid or Data Table */}
      {viewMode === 'CARD' ? (
        /* Large Icon View / Card Grid */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {groupOrder.map(groupKey => {
            const groupPlayers = groupedPlayers[groupKey];
            if (!groupPlayers || groupPlayers.length === 0) return null;
            const groupLabel = groupKey === 'unallocated' ? 'Unallocated' : systemState.categories.find(c => c.id === groupKey)?.name || groupKey;
            const groupColor = groupKey === 'unallocated' ? 'var(--text-muted)' : systemState.categories.find(c => c.id === groupKey)?.color || 'var(--text-muted)';
            const groupBasePrice = groupKey === 'unallocated' ? null : (groupKey === 'cat-icon' ? null : systemState.categories.find(c => c.id === groupKey)?.basePrice);
            return (
              <div key={groupKey}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '0 4px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: groupColor }}></div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: groupColor }}>{groupLabel}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>({groupPlayers.length})</span>
                  {groupBasePrice && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Base: ${groupBasePrice.toLocaleString()}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                  {groupPlayers.map(player => {
                    const category = systemState.categories.find(c => c.id === player.categoryId);
                    const categoryColor = category ? category.color : 'var(--accent-green)';
                    return (
                      <div
                        key={player.id}
                        className="glass-panel"
                        style={{
                          padding: '18px',
                          borderTop: `4px solid ${categoryColor}`,
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >

                        <div>
                          {/* Player Avatar & Badges Header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                            <img
                              src={player.imageUrl}
                              alt={player.name}
                              style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                            />
                            <div>
                              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{player.name}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                  #{player.jerseyNumber || '10'} {player.jerseyName}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-input)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                            <div>Student ID: <strong style={{ color: 'var(--text-main)' }}>{player.studentId}</strong></div>
                            <div>Session: <strong style={{ color: 'var(--text-main)' }}>{player.session}</strong></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                              <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>PRI: {player.primaryPosition}</span>
                              {player.secondaryPositions?.map(sec => (
                                <span key={sec} className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>SEC: {sec}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions Bar */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', alignItems: 'center' }}>
                          <button
                            onClick={() => setSelectedPlayerDetail(player)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                            title="Detail"
                          >
                            <Eye size={14} />
                          </button>
                          {!readOnly && isAdmin && (
                            <>
                              <select
                                value={player.categoryId || ''}
                                onChange={(e) => handleAssignCategory(player.id, e.target.value)}
                                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', color: categoryColor, padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                              >
                                <option value="">Unallocated</option>
                                {systemState.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <button
                                onClick={() => setConfirmDeletePlayer(player)}
                                className="btn btn-danger"
                                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                title="Delete Player"
                              >
                                <Trash2 size={14} />
                              </button>
                              <button
                                onClick={() => toggleBanPlayer(player.id)}
                                className={`btn ${player.status === 'BANNED' ? 'btn-gold' : 'btn-danger'}`}
                                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                title={player.status === 'BANNED' ? 'Unban Player' : 'Ban / Disqualify'}
                              >
                                <Ban size={14} />
                              </button>
                            </>
                          )}
                          {['SUPER_ADMIN', 'PODIUM_ADMIN'].includes(currentUser.role) && player.status === 'APPROVED' && (
                            <button
                              onClick={() => {
                                pullPlayerToPodium(player.id);
                                addNotification('success', 'Sent to Podium', `${player.name} is now on the live auction stage.`);
                                onSendToPodium?.();
                              }}
                              className="btn"
                              style={{
                                padding: '6px 10px', fontSize: '0.75rem',
                                background: auctionState?.activePlayerId === player.id ? 'rgba(255,183,3,0.2)' : 'rgba(0,230,153,0.12)',
                                border: `1px solid ${auctionState?.activePlayerId === player.id ? 'var(--accent-gold)' : 'var(--accent-green)'}`,
                                color: auctionState?.activePlayerId === player.id ? 'var(--accent-gold)' : 'var(--accent-green)',
                              }}
                              title={auctionState?.activePlayerId === player.id ? 'Currently on stage' : 'Send to Podium'}
                            >
                              <ArrowUpFromLine size={14} />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detail View / Data Table */
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>PLAYER</th>
                <th style={{ padding: '14px 16px' }}>STUDENT ID</th>
                <th style={{ padding: '14px 16px' }}>SESSION</th>
                <th style={{ padding: '14px 16px' }}>POSITIONS</th>
                <th style={{ padding: '14px 16px' }}>CATEGORY TIER</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {groupOrder.map(groupKey => {
                const groupPlayers = groupedPlayers[groupKey];
                if (!groupPlayers || groupPlayers.length === 0) return null;
                const groupLabel = groupKey === 'unallocated' ? 'Unallocated' : systemState.categories.find(c => c.id === groupKey)?.name || groupKey;
                const groupColor = groupKey === 'unallocated' ? 'var(--text-muted)' : systemState.categories.find(c => c.id === groupKey)?.color || 'var(--text-muted)';
                return (
                  <React.Fragment key={groupKey}>
                    <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <td colSpan="6" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 800, color: groupColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: groupColor }}></div>
                          {groupLabel} ({groupPlayers.length})
                        </div>
                      </td>
                    </tr>
                    {groupPlayers.map(player => {
                      const category = systemState.categories.find(c => c.id === player.categoryId);
                      return (
                        <tr key={player.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={player.imageUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                              <div>
                                <div style={{ fontWeight: 700 }}>{player.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>#{player.jerseyNumber || '10'} {player.jerseyName}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{player.studentId}</td>
                          <td style={{ padding: '12px 16px' }}>{player.session}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge badge-green" style={{ fontSize: '0.7rem', marginRight: '4px' }}>{player.primaryPosition}</span>
                            {player.secondaryPositions?.map(s => (
                              <span key={s} className="badge badge-cyan" style={{ fontSize: '0.65rem', marginRight: '2px' }}>{s}</span>
                            ))}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {!readOnly && isAdmin ? (
                              <select
                                value={player.categoryId || ''}
                                onChange={(e) => handleAssignCategory(player.id, e.target.value)}
                                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', color: category ? category.color : 'var(--accent-green)', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 700, outline: 'none' }}
                              >
                                <option value="">Unallocated</option>
                                {systemState.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            ) : (
                              <span className="badge" style={{ fontSize: '0.7rem', background: category ? category.color + '20' : 'rgba(255,255,255,0.1)', color: category ? category.color : 'var(--text-muted)', border: `1px solid ${category ? category.color + '40' : 'var(--border-color)'}` }}>
                                {systemState.categories.find(c => c.id === player.categoryId)?.name || 'Unallocated'}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button onClick={() => setSelectedPlayerDetail(player)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Eye size={14} /></button>
                              {!readOnly && isAdmin && <button onClick={() => toggleBanPlayer(player.id)} className={`btn ${player.status === 'BANNED' ? 'btn-gold' : 'btn-danger'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Ban size={14} /></button>}
                              {!readOnly && isAdmin && <button onClick={() => setConfirmDeletePlayer(player)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Trash2 size={14} /></button>}
                              {!readOnly && ['SUPER_ADMIN', 'PODIUM_ADMIN'].includes(currentUser.role) && player.status === 'APPROVED' && (
                                <button
                                  onClick={() => { pullPlayerToPodium(player.id); addNotification('success', 'Sent to Podium', `${player.name} is now on the live auction stage.`); onSendToPodium?.(); }}
                                  className="btn"
                                  style={{
                                    padding: '4px 8px', fontSize: '0.75rem',
                                    background: auctionState?.activePlayerId === player.id ? 'rgba(255,183,3,0.2)' : 'rgba(0,230,153,0.12)',
                                    border: `1px solid ${auctionState?.activePlayerId === player.id ? 'var(--accent-gold)' : 'var(--accent-green)'}`,
                                    color: auctionState?.activePlayerId === player.id ? 'var(--accent-gold)' : 'var(--accent-green)',
                                  }}
                                  title="Send to Podium"
                                >
                                  <ArrowUpFromLine size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Player Modal Form */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {editingPlayer ? 'Edit Player Profile' : '+ Add New Player Record'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="btn btn-secondary" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Julian Sterling"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Student ID *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ST-2025-881"
                    value={formData.studentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Session *</label>
                  <select
                    className="form-control"
                    value={formData.session}
                    onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value }))}
                  >
                    {systemState.academicSessions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Jersey Display Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. STERLING"
                    value={formData.jerseyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, jerseyName: e.target.value.toUpperCase() }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jersey #</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.jerseyNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Tier / Category</label>
                  <select
                    className="form-control"
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  >
                    <option value="">Unallocated (No Tier Assigned)</option>
                    {systemState.categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.basePrice ? `($${c.basePrice.toLocaleString()})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Positions Radio & Checkboxes */}
              <div className="form-group">
                <label className="form-label">Primary Position * (Pick Exactly 1)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {POSITIONS.map(p => (
                    <button
                      type="button"
                      key={p.code}
                      onClick={() => setFormData(prev => ({ ...prev, primaryPosition: p.code, secondaryPositions: prev.secondaryPositions.filter(s => s !== p.code) }))}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: formData.primaryPosition === p.code ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                        background: formData.primaryPosition === p.code ? 'rgba(0, 230, 153, 0.2)' : 'var(--bg-input)',
                        color: formData.primaryPosition === p.code ? 'var(--accent-green)' : 'var(--text-muted)'
                      }}
                    >
                      {p.code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Secondary Positions (Multi-Select Checkboxes)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {POSITIONS.map(p => {
                    const isPri = formData.primaryPosition === p.code;
                    const isSec = formData.secondaryPositions.includes(p.code);
                    return (
                      <button
                        type="button"
                        key={p.code}
                        disabled={isPri}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          secondaryPositions: isSec ? prev.secondaryPositions.filter(s => s !== p.code) : [...prev.secondaryPositions, p.code]
                        }))}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: isPri ? 'not-allowed' : 'pointer',
                          opacity: isPri ? 0.4 : 1,
                          border: isSec ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          background: isSec ? 'rgba(0, 217, 255, 0.2)' : 'var(--bg-input)',
                          color: isSec ? 'var(--accent-cyan)' : 'var(--text-dim)'
                        }}
                      >
                        + {p.code}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cloudinary Profile Photo Dropzone */}
              <div className="form-group">
                <label className="form-label">Profile Image Dropzone (Pushes to Cloudinary)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imagePreview ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UploadCloud size={24} color="var(--text-dim)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="btn btn-secondary" style={{ width: '100%', fontSize: '0.82rem', cursor: 'pointer' }}>
                      <UploadCloud size={16} /> {isUploading ? 'Uploading to Cloud Media...' : 'Upload Image to Cloudinary'}
                      <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingPlayer ? 'Save Changes' : 'Create Player Record'}
                </button>
                <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Player Detail Panel / Modal */}
      {selectedPlayerDetail && (
        <div className="modal-overlay" onClick={() => setSelectedPlayerDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Player Profile Metadata</h3>
              <button onClick={() => setSelectedPlayerDetail(null)} className="btn btn-secondary" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <img src={selectedPlayerDetail.imageUrl} alt="" style={{ width: '90px', height: '90px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedPlayerDetail.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{selectedPlayerDetail.jerseyNumber || '10'} {selectedPlayerDetail.jerseyName}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                  Student ID: <strong>{selectedPlayerDetail.studentId}</strong>
                </div>
                <div style={{ fontSize: '0.8rem' }}>
                  Academic Session: <strong>{selectedPlayerDetail.session}</strong>
                </div>
              </div>
            </div>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                {(() => {
                  const cat = systemState.categories.find(c => c.id === selectedPlayerDetail.categoryId);
                  return (
                    <div>
                      Tier Classification: <span className="badge" style={{
                        marginLeft: '4px',
                        background: cat ? `${cat.color}25` : 'rgba(255,255,255,0.1)',
                        color: cat ? cat.color : '#94a3b8',
                        border: `1px solid ${cat ? `${cat.color}50` : 'rgba(255,255,255,0.2)'}`
                      }}>
                        {cat ? cat.name : 'Unallocated'} {cat?.basePrice ? `($${cat.basePrice.toLocaleString()})` : ''}
                      </span>
                    </div>
                  );
                })()}
                <div>Primary Position: <span className="badge badge-green">{selectedPlayerDetail.primaryPosition}</span></div>
                <div>Secondary Positions: {selectedPlayerDetail.secondaryPositions?.length > 0 ? selectedPlayerDetail.secondaryPositions.map(s => <span key={s} className="badge badge-cyan" style={{ marginRight: '4px' }}>{s}</span>) : <span style={{ color: 'var(--text-dim)' }}>None</span>}</div>
                <div>Cloud Asset ID: <code style={{ color: 'var(--accent-cyan)' }}>{selectedPlayerDetail.cloudPublicId}</code></div>
              </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!readOnly && isAdmin && (
                <button
                  onClick={() => {
                    const p = selectedPlayerDetail;
                    setSelectedPlayerDetail(null);
                    handleOpenEdit(p);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="modal-overlay" onClick={() => setShowBulkImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet color="var(--accent-cyan)" /> Bulk CSV/Excel Importer Dropzone
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Drop your formatted `.csv` or `.xlsx` file containing player candidate rosters.
            </p>

            <div style={{ border: '2px dashed var(--accent-cyan)', padding: '30px', borderRadius: '16px', textAlign: 'center', background: 'rgba(0, 217, 255, 0.05)', marginBottom: '20px' }}>
              <UploadCloud size={36} color="var(--accent-cyan)" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Drag & Drop Spreadsheet File Here</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Supports Name, Student ID, Session, Jersey Name, Primary Position</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {isAdmin && (
                <button onClick={handleSimulateBulkImport} className="btn btn-primary" style={{ flex: 1 }}>
                  Import Sample Roster (4 Players)
                </button>
              )}
              <button onClick={() => setShowBulkImportModal(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeletePlayer && (
        <div className="modal-overlay" onClick={() => setConfirmDeletePlayer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert color="var(--accent-red)" /> Confirm Deletion
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Are you sure you want to permanently delete <strong>{confirmDeletePlayer.name}</strong>? This action cannot be undone. The player record and associated Cloudinary asset will be wiped.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {isAdmin && (
                <button
                  onClick={() => {
                    deletePlayer(confirmDeletePlayer.id);
                    setConfirmDeletePlayer(null);
                    setSelectedPlayerDetail(null);
                  }}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  <Trash2 size={14} /> Yes, Delete Permanently
                </button>
              )}
              <button onClick={() => setConfirmDeletePlayer(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
