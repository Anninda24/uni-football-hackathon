import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Layers, Plus, Trash2, Edit3, Lock, Star, X } from 'lucide-react';

// The Icon category is a permanently locked system default
const ICON_CAT_FALLBACK = { id: 'cat-icon', name: 'Icon', basePrice: 0, color: '#ef4444' };


const PALETTE_COLORS = [
  '#00d9ff', '#ffb703', '#c0c0c0', '#cd7f32', '#00e699', '#ff4d6d', '#9d4edd', '#ff85a1', '#70e000'
];


export const CategoryManagerView = () => {
  const { systemState, setSystemState, players, teams, addNotification } = useSystem();

  const [showModal, setShowModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);

  
  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catColor, setCatColor] = useState('#00d9ff');

  // Always resolve the Icon category — use locked fallback if not in state
  const iconCat = systemState.categories.find(c => c.id === 'cat-icon') || ICON_CAT_FALLBACK;
  const iconPlayers = players.filter(p => p.categoryId === 'cat-icon');
  const regularCats = systemState.categories.filter(c => c.id !== 'cat-icon');


  const handleOpenAdd = () => {
    setEditingCatId(null);
    setCatName('');
    setCatPrice('');
    setCatColor('#00d9ff');
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatPrice(cat.basePrice);
    setCatColor(cat.color || '#00d9ff');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!catName || !catPrice) {
      addNotification('error', 'Missing Data', 'Please fill in Category Name and Base Price.');
      return;
    }

    if (editingCatId) {
      // Update
      setSystemState(prev => ({
        ...prev,
        categories: prev.categories.map(c => c.id === editingCatId ? {
          ...c,
          name: catName,
          basePrice: Number(catPrice),
          color: catColor
        } : c)
      }));
      addNotification('success', 'Category Updated', `Category '${catName}' updated.`);
    } else {
      // Add
      const newCat = {
        id: 'cat-' + Date.now(),
        name: catName,
        basePrice: Number(catPrice),
        color: catColor
      };
      setSystemState(prev => ({
        ...prev,
        categories: [...prev.categories, newCat]
      }));
      addNotification('success', 'Category Created', `New Tier '${catName}' added with base price $${Number(catPrice).toLocaleString()}.`);
    }

    setShowModal(false);
  };

  const handleDelete = (catId) => {
    // Icon category is permanently locked — never allow deletion
    if (catId === 'cat-icon') {
      addNotification('error', 'Locked Category', 'The Icon tier is a system default and cannot be deleted.');
      return;
    }
    if (regularCats.length <= 1) {
      addNotification('error', 'Cannot Delete', 'At least one regular Category / Tier must remain.');
      return;
    }
    const linkedCount = players.filter(p => p.categoryId === catId).length;
    if (linkedCount > 0) {
      addNotification('warning', 'Category In Use', `Warning: ${linkedCount} players currently assigned to this tier.`);
    }

    setSystemState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== catId)
    }));
    addNotification('info', 'Category Removed', 'Tier deleted successfully.');
  };


  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers color="var(--accent-cyan)" /> Tier &amp; Category Manager (/admin/categories)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Define player tier classifications (Platinum, Gold, Silver, Icon), opening base prices, and badge accent color swatches.
            The <strong style={{ color: '#ef4444' }}>Icon</strong> tier is a system default — always first, no base price, locked.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> + Add Category
        </button>
      </div>

      {/* Category Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>

        {/* ─── ICON CARD — Always First, Always Red, Always Locked ─── */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderTop: '4px solid #ef4444',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(220,38,38,0.05) 100%)',
            boxShadow: '0 0 24px rgba(239,68,68,0.12)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={16} color="#ef4444" fill="#ef4444" />
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>
                  {iconCat.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Locked badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  borderRadius: '20px', padding: '2px 8px', fontSize: '0.68rem',
                  color: '#ef4444', fontWeight: 700, letterSpacing: '0.04em'
                }}>
                  <Lock size={10} /> LOCKED
                </div>
                {/* Color dot */}
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.7)'
                }} />
              </div>
            </div>

            {/* "No Base Price" badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.30)',
              borderRadius: '8px', padding: '6px 14px',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#ef4444' }}>
                No Base Price
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Captain / Vice-Captain: <strong style={{ color: 'var(--text-main)' }}>{iconPlayers.length} Players</strong>
            </div>
          </div>

          {/* Info Footer */}
          <div style={{
            marginTop: '20px', padding: '10px 14px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.20)',
            borderRadius: '8px', fontSize: '0.74rem',
            color: '#f87171', textAlign: 'center', lineHeight: 1.5
          }}>
            ⭐ Auto-assigned to teams &nbsp;•&nbsp; Not in auction pool &nbsp;•&nbsp; Cannot be edited or deleted
          </div>
        </div>

        {/* ─── REGULAR CATEGORY CARDS ─── */}
        {regularCats.map(cat => {
          const captainOrVCIds = new Set();
          teams.forEach(t => {
            if (t.captainId) captainOrVCIds.add(t.captainId);
            if (t.viceCaptainId) captainOrVCIds.add(t.viceCaptainId);
          });
          const playerCount = players.filter(p => p.categoryId === cat.id && !captainOrVCIds.has(p.id)).length;
          return (
            <div
              key={cat.id}
              className="glass-panel"
              style={{
                padding: '24px',
                borderTop: `4px solid ${cat.color || '#00d9ff'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: cat.color }}>
                    {cat.name}
                  </span>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: cat.color,
                    boxShadow: `0 0 10px ${cat.color}`
                  }} />
                </div>

                <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                  ${cat.basePrice.toLocaleString()}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Assigned Players: <strong style={{ color: 'var(--text-main)' }}>{playerCount} Players</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  title="Delete Category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingCatId ? 'Edit Category Tier' : 'Add New Category Tier'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category / Tier Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Platinum, Icon, Marquee"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Base Price ($ Opening Bid) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 15000"
                  value={catPrice}
                  onChange={(e) => setCatPrice(e.target.value)}
                  step="500"
                  min="500"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category Accent Color Swatch</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', width: '120px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PALETTE_COLORS.map(color => (
                    <div
                      key={color}
                      onClick={() => setCatColor(color)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: color,
                        cursor: 'pointer',
                        border: catColor === color ? '2px solid white' : '1px solid transparent',
                        transform: catColor === color ? 'scale(1.1)' : 'none'
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingCatId ? 'Save Category Changes' : 'Create Category Tier'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
