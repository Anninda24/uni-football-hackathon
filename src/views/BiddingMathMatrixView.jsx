import React, { useState, useRef } from 'react';
import { useSystem } from '../context/SystemContext';
import { Percent, Plus, X, Trash2 } from 'lucide-react';

export const BiddingMathMatrixView = () => {
  const { systemState, setSystemState, addNotification } = useSystem();

  const [segments, setSegments] = useState(() => {
    const initial = systemState.raiseTiers || [];
    if (initial.length === 0) {
      return [{ id: 'seg-1', minPct: 0, maxPct: 100, raisePct: 0.5 }];
    }
    return initial.map((t, i) => ({
      id: t.id || `seg-${i + 1}`,
      minPct: t.minBudgetPct,
      maxPct: t.maxBudgetPct,
      raisePct: t.raisePct
    }));
  });

  const [addingMode, setAddingMode] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [hoverPct, setHoverPct] = useState(null);
  const [dragHoverPct, setDragHoverPct] = useState(null);
  const barRef = useRef(null);
  const [draggingBoundary, setDraggingBoundary] = useState(null); // { boundaryIndex } where boundaryIndex is the index in sortedSegments

  const getPctFromMouse = (e) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.round((x / rect.width) * 100);
  };

  const handleBarClick = (e) => {
    if (draggingBoundary) return;
    if (!barRef.current) return;
    const pct = getPctFromMouse(e);

    if (addingMode) {
      const sorted = [...segments].sort((a, b) => a.minPct - b.minPct);
      let targetIdx = -1;
      for (let i = 0; i < sorted.length; i++) {
        if (pct > sorted[i].minPct && pct < sorted[i].maxPct) {
          targetIdx = i;
          break;
        }
      }
      if (targetIdx < 0) {
        addNotification('warning', 'Invalid Position', 'Click inside an existing tier to split it.');
        return;
      }

      const target = sorted[targetIdx];
      const newId = `seg-${Date.now()}`;
      const newSeg = {
        id: newId,
        minPct: pct,
        maxPct: target.maxPct,
        raisePct: target.raisePct
      };
      target.maxPct = pct;

      setSegments(prev => {
        const next = [...prev];
        const idx = next.findIndex(s => s.id === target.id);
        if (idx >= 0) {
          next[idx] = { ...target };
          next.splice(idx + 1, 0, newSeg);
        }
        return next;
      });

      setSelectedSegmentId(newId);
      setAddingMode(false);
      setHoverPct(null);
    } else {
      const sorted = [...segments].sort((a, b) => a.minPct - b.minPct);
      for (const seg of sorted) {
        if (pct >= seg.minPct && pct <= seg.maxPct) {
          setSelectedSegmentId(seg.id);
          break;
        }
      }
    }
  };

  const handleBarMouseMove = (e) => {
    if (!addingMode || !barRef.current) return;
    const pct = getPctFromMouse(e);
    setHoverPct(pct);
  };

  const handleBarMouseLeave = () => {
    setHoverPct(null);
  };

  const handleBoundaryMouseDown = (e, boundaryIndex) => {
    e.stopPropagation();
    setDraggingBoundary(boundaryIndex);
    const sorted = [...segments].sort((a, b) => a.minPct - b.minPct);
    if (sorted[boundaryIndex]) {
      setSelectedSegmentId(sorted[boundaryIndex].id);
    }
  };

  const handleMouseMove = (e) => {
    if (draggingBoundary === null) return;
    const pct = getPctFromMouse(e);
    const clamped = Math.max(0, Math.min(100, pct));
    setDragHoverPct(clamped);

    setSegments(prev => {
      const sorted = [...prev].sort((a, b) => a.minPct - b.minPct);
      const leftSeg = sorted[draggingBoundary];
      const rightSeg = sorted[draggingBoundary + 1];

      if (!leftSeg || !rightSeg) return prev;

      // Ensure at least 1% width for each segment
      const minAllowed = leftSeg.minPct + 1;
      const maxAllowed = rightSeg.maxPct - 1;
      const newBoundary = Math.max(minAllowed, Math.min(maxAllowed, clamped));

      return prev.map(s => {
        if (s.id === leftSeg.id) {
          return { ...s, maxPct: newBoundary };
        }
        if (s.id === rightSeg.id) {
          return { ...s, minPct: newBoundary };
        }
        return s;
      });
    });
  };

  const handleMouseUp = () => {
    setDraggingBoundary(null);
    setDragHoverPct(null);
  };

  React.useEffect(() => {
    if (draggingBoundary !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingBoundary]);

  const handleRemoveSegment = (id) => {
    if (segments.length <= 1) {
      addNotification('warning', 'Cannot Remove', 'At least one tier must remain.');
      return;
    }
    setSegments(prev => {
      const sorted = [...prev].sort((a, b) => a.minPct - b.minPct);
      const idx = sorted.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const target = sorted[idx];
      const updated = [...sorted];

      if (idx === 0 && updated[idx + 1]) {
        updated[idx + 1] = { ...updated[idx + 1], minPct: 0 };
      } else if (idx === updated.length - 1 && updated[idx - 1]) {
        updated[idx - 1] = { ...updated[idx - 1], maxPct: 100 };
      } else if (updated[idx - 1]) {
        updated[idx - 1] = { ...updated[idx - 1], maxPct: target.maxPct };
      }

      return updated.filter(s => s.id !== id).map(s => ({ ...s }));
    });
    if (selectedSegmentId === id) setSelectedSegmentId(null);
  };

  const handleSegmentChange = (id, field, value) => {
    const num = Number(value);
    if (isNaN(num)) return;

    setSegments(prev => {
      const sorted = [...prev].sort((a, b) => a.minPct - b.minPct);
      const idx = sorted.findIndex(s => s.id === id);
      if (idx < 0) return prev;

      const seg = sorted[idx];
      const prevSeg = sorted[idx - 1];
      const nextSeg = sorted[idx + 1];

      let newMin = seg.minPct;
      let newMax = seg.maxPct;

      if (field === 'minPct') {
        newMin = Math.max(0, Math.min(num, seg.maxPct - 1));
      } else if (field === 'maxPct') {
        newMax = Math.min(100, Math.max(num, seg.minPct + 1));
      }

      const updated = prev.map(s => {
        if (s.id === id) {
          return { ...s, [field]: field === 'minPct' ? newMin : newMax };
        }
        if (prevSeg && s.id === prevSeg.id && field === 'minPct') {
          return { ...s, maxPct: newMin };
        }
        if (nextSeg && s.id === nextSeg.id && field === 'maxPct') {
          return { ...s, minPct: newMax };
        }
        return s;
      });

      return updated;
    });
  };

  const handleSaveTiers = (e) => {
    e.preventDefault();
    const sorted = [...segments].sort((a, b) => a.minPct - b.minPct);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].maxPct !== sorted[i + 1].minPct) {
        addNotification('error', 'Invalid Tiers', 'Tier ranges must be contiguous with no gaps.');
        return;
      }
    }
    if (sorted[0].minPct !== 0 || sorted[sorted.length - 1].maxPct !== 100) {
      addNotification('error', 'Invalid Range', 'Tiers must cover 0% to 100%.');
      return;
    }
    const formatted = sorted.map((s, i) => ({
      id: s.id,
      minBudgetPct: s.minPct,
      maxBudgetPct: s.maxPct,
      raisePct: s.raisePct
    }));
    setSystemState(prev => ({ ...prev, raiseTiers: formatted }));
    addNotification('success', 'Bidding Matrix Locked', 'Percentage raise tiers successfully updated.');
  };

  const sortedSegments = [...segments].sort((a, b) => a.minPct - b.minPct);
  const selectedSegment = segments.find(s => s.id === selectedSegmentId) || null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.12) 0%, rgba(157, 78, 221, 0.08) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Percent color="var(--accent-cyan)" /> Bidding Math Matrix
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Click + then click the bar to split a tier. Drag the arrows below the bar to adjust boundaries between tiers.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Percent color="var(--accent-cyan)" /> Visual Tier Editor
        </h3>

        <form onSubmit={handleSaveTiers}>
          
          {/* Segment Modals above bar - Grid View */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '18px' }}>
            {sortedSegments.map((seg, idx) => {
              const color = ['var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-gold)', 'var(--accent-red)', 'var(--accent-purple)'][idx % 5];
              return (
                <div key={seg.id} style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: `1px solid ${selectedSegmentId === seg.id ? 'var(--accent-green)' : 'var(--border-color)'}`, display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }} onClick={() => setSelectedSegmentId(seg.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color }}>Tier {idx + 1}</span>
                    {segments.length > 1 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveSegment(seg.id); }} className="btn btn-danger" style={{ padding: '3px 7px', fontSize: '0.7rem' }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={seg.minPct}
                      onChange={(e) => handleSegmentChange(seg.id, 'minPct', Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '60px', background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'inherit', padding: '3px 6px', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <span>–</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={seg.maxPct}
                      onChange={(e) => handleSegmentChange(seg.id, 'maxPct', Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '60px', background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'inherit', padding: '3px 6px', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <span style={{ fontSize: '0.8rem' }}>%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Raise %</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="10"
                      value={seg.raisePct}
                      onChange={(e) => handleSegmentChange(seg.id, 'raisePct', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ flex: 1, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', padding: '5px 8px', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Horizontal Bar */}
          <div style={{ position: 'relative', marginBottom: '40px' }}>
            {/* Add button */}
            <button
              type="button"
              onClick={() => {
                if (addingMode) return;
                if (segments.length >= 10) {
                  addNotification('warning', 'Limit Reached', 'Maximum 10 tiers allowed.');
                  return;
                }
                setAddingMode(true);
                setSelectedSegmentId(null);
              }}
              style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', background: 'var(--accent-green)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#000', zIndex: 2, opacity: addingMode ? 0.5 : 1 }}
              title="Add Tier"
            >
              <Plus size={14} />
            </button>

            {/* Cancel button beside add */}
            <button
              type="button"
              onClick={() => {
                setAddingMode(false);
                setSelectedSegmentId(null);
              }}
              style={{ position: 'absolute', left: '28px', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', zIndex: 2, opacity: addingMode ? 1 : 0.3 }}
              title="Cancel adding"
            >
              <X size={14} />
            </button>

            {/* Bar and arrows wrapper with left padding for buttons */}
            <div style={{ paddingLeft: '68px' }}>
              <div
                ref={barRef}
                onClick={handleBarClick}
                onMouseMove={handleBarMouseMove}
                onMouseLeave={handleBarMouseLeave}
                style={{ position: 'relative', width: '100%', height: '40px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'visible', cursor: addingMode ? 'crosshair' : 'pointer' }}
              >
                {sortedSegments.map((seg, idx) => {
                  const left = (seg.minPct / 100) * 100;
                  const width = ((seg.maxPct - seg.minPct) / 100) * 100;
                  const color = ['var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-gold)', 'var(--accent-red)', 'var(--accent-purple)'][idx % 5];
                  const isSelected = selectedSegmentId === seg.id;
                  const isLast = idx === sortedSegments.length - 1;
                  return (
                    <div
                      key={seg.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: `${left}%`,
                        width: `${width}%`,
                        height: '100%',
                        background: color,
                        opacity: isSelected ? 0.6 : 0.35,
                        borderRight: isLast ? 'none' : '2px solid rgba(255,255,255,0.4)',
                        transition: draggingBoundary === null ? 'all 0.2s ease' : 'none'
                      }}
                    >
                      {/* Boundary handle at segment join */}
                      {!isLast && (() => {
                        const boundaryIdx = idx;
                        const isActive = draggingBoundary === boundaryIdx;
                        return (
                          <div
                            onMouseDown={(e) => handleBoundaryMouseDown(e, boundaryIdx)}
                            style={{
                              position: 'absolute',
                              right: '-1.5px',
                              top: '-10px',
                              bottom: '-10px',
                              width: '3px',
                              background: '#ffffff',
                              opacity: 0.95,
                              cursor: 'ew-resize',
                              boxShadow: isActive ? '0 0 12px rgba(255,255,255,0.9)' : '0 0 6px rgba(255,255,255,0.5)'
                            }}
                          >
                            {/* Percentage tooltip on drag */}
                            {isActive && dragHoverPct !== null && (
                              <div style={{
                                position: 'absolute',
                                top: '-28px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#ffffff',
                                color: '#000000',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                zIndex: 10
                              }}>
                                {dragHoverPct}%
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}

                {/* Hover split indicator */}
                {addingMode && hoverPct !== null && (
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${hoverPct}%`, transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 4 }}>
                    <div style={{ width: '2px', height: '100%', background: 'var(--accent-red)', boxShadow: '0 0 6px var(--accent-red)' }}></div>
                    <div style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-red)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      {hoverPct}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '18px' }}>
            Lock & Apply Bidding Math Tiers
          </button>
        </form>
      </div>

    </div>
  );
};
