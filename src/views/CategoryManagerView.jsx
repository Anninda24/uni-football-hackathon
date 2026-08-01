import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Layers, Plus, Trash2, Edit3, Shield, Palette, X } from 'lucide-react';

const PALETTE_COLORS = [
  '#00d9ff', '#ffb703', '#c0c0c0', '#cd7f32', '#00e699', '#ff4d6d', '#9d4edd', '#ff85a1', '#70e000'
];

export const CategoryManagerView = () => {
  const { systemState, setSystemState, players, addNotification } = useSystem();

  const [showModal, setShowModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  
  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catColor, setCatColor] = useState('#00d9ff');

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
    if (systemState.categories.length <= 1) {
      addNotification('error', 'Cannot Delete', 'At least one Category / Tier must remain.');
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
            <Layers color="var(--accent-cyan)" /> Tier & Category Manager (/admin/categories)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Define player tier classifications (Platinum, Gold, Silver, Icon), opening base prices, and badge accent color swatches.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> + Add Category
        </button>
      </div>

      {/* Category Cards Display Format */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {systemState.categories.map(cat => {
          const playerCount = players.filter(p => p.categoryId === cat.id).length;
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
                  }}></div>
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
