import React, { useState, useRef, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { Percent, Plus, X, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const DEFAULT_TIERS = [
  { id: 'rt-1', minPct: 0, maxPct: 3, raisePct: 0.15 },
  { id: 'rt-2', minPct: 3, maxPct: 10, raisePct: 0.5 },
  { id: 'rt-3', minPct: 10, maxPct: 100, raisePct: 1.0 }
];

export const BiddingMathMatrixView = () => {
  const { systemState, setSystemState, addNotification } = useSystem();

  // Helper to normalize any segments to strictly contiguous 0-100%
  const normalizeTiers = (rawTiers) => {
    if (!rawTiers || rawTiers.length === 0) {
      return DEFAULT_TIERS.map(t => ({ ...t }));
    }
    const sorted = [...rawTiers].sort((a, b) => (a.minBudgetPct ?? a.minPct) - (b.minBudgetPct ?? b.minPct));
    const result = [];
    let currentMin = 0;
    
    for (let i = 0; i < sorted.length; i++) {
      const t = sorted[i];
      const isLast = i === sorted.length - 1;
      const rawMax = t.maxBudgetPct ?? t.maxPct ?? 100;
      const maxPct = isLast ? 100 : Math.max(currentMin + 1, Math.min(99, rawMax));
      result.push({
        id: t.id || `seg-${i + 1}`,
        minPct: currentMin,
        maxPct: maxPct,
        raisePct: Number(t.raisePct) || 0.5
      });
      currentMin = maxPct;
    }
    return result;
  };

  const [segments, setSegments] = useState(() => {
    const initial = systemState.raiseTiers || [];
    return normalizeTiers(initial);
  });

  const [addingMode, setAddingMode] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [hoverPct, setHoverPct] = useState(null);
  const [dragHoverPct, setDragHoverPct] = useState(null);
  const barRef = useRef(null);
  const [draggingBoundary, setDraggingBoundary] = useState(null); // boundaryIndex between sorted[boundaryIndex] and sorted[boundaryIndex+1]

  const getPctFromMouse = (e) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const rawPct = Math.round((x / rect.width) * 100);
    return Math.max(0, Math.min(100, rawPct));
  };

  const handleBarClick = (e) => {
    if (draggingBoundary !== null) return;
    if (!barRef.current) return;
    const pct = getPctFromMouse(e);

    if (addingMode) {
      const sorted = [...segments].sort((a, b) => a.minPct - b.minPct);
      let targetIdx = -1;
      for (let i = 0; i < sorted.length; i++) {
        // Must be strictly inside a tier with room to split (at least 1% on each side)
        if (pct >= sorted[i].minPct + 1 && pct <= sorted[i].maxPct - 1) {
          targetIdx = i;
          break;
        }
      }

      if (targetIdx < 0) {
        addNotification('warning', 'Invalid Split Point', 'Please click inside a tier range with at least 1% padding on both sides.');
        return;
      }

      const target = sorted[targetIdx];
      const newId = `seg-${Date.now()}`;
      const oldMax = target.maxPct;

      const newLeft = {
        ...target,
        maxPct: pct
      };

      const newRight = {
        id: newId,
        minPct: pct,
        maxPct: oldMax,
        raisePct: target.raisePct
      };

      setSegments(prev => {
        const next = [...prev];
        const idx = next.findIndex(s => s.id === target.id);
        if (idx >= 0) {
          next.splice(idx, 1, newLeft, newRight);
        }
        return next;
      });

      setSelectedSegmentId(newId);
      setAddingMode(false);
      setHoverPct(null);
      addNotification('success', 'Tier Split', `New boundary created at ${pct}%. Total range 0%–100% maintained.`);
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

    setSegments(prev => {
      const sorted = [...prev].sort((a, b) => a.minPct - b.minPct);
      const leftSeg = sorted[draggingBoundary];
      const rightSeg = sorted[draggingBoundary + 1];

      if (!leftSeg || !rightSeg) return prev;

      // Ensure at least 1% width for each segment, never overlap
      const minAllowed = leftSeg.minPct + 1;
      const maxAllowed = rightSeg.maxPct - 1;
      const newBoundary = Math.max(minAllowed, Math.min(maxAllowed, pct));

      setDragHoverPct(newBoundary);

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

  useEffect(() => {
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
      addNotification('warning', 'Cannot Remove', 'At least one tier covering 0%–100% must remain.');
      return;
    }

    setSegments(prev => {
      const sorted = [...prev].sort((a, b) => a.minPct - b.minPct);
      const idx = sorted.findIndex(s => s.id === id);
      if (idx < 0) return prev;

      const updated = [...sorted];

      if (idx === 0) {
        // If removing the first tier, expand next tier's minPct to 0
        updated[1] = { ...updated[1], minPct: 0 };
      } else if (idx === updated.length - 1) {
        // If removing the last tier, expand previous tier's maxPct to 100
        updated[idx - 1] = { ...updated[idx - 1], maxPct: 100 };
      } else {
        // Removing middle tier: merge boundary with previous tier
        updated[idx - 1] = { ...updated[idx - 1], maxPct: updated[idx].maxPct };
      }

      return updated.filter(s => s.id !== id);
    });

    if (selectedSegmentId === id) setSelectedSegmentId(null);
    addNotification('info', 'Tier Removed', 'Tier removed and adjacent range expanded to preserve 0%–100%.');
  };

  const handleSegmentChange = (id, field, value) => {
    if (field === 'raisePct') {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return;
      setSegments(prev => prev.map(s => s.id === id ? { ...s, raisePct: num } : s));
      return;
    }

    const num = Math.round(Number(value));
    if (isNaN(num)) return;

    setSegments(prev => {
      const sorted = [...prev].sort((a, b) => a.minPct - b.minPct);
      const idx = sorted.findIndex(s => s.id === id);
      if (idx < 0) return prev;

      if (field === 'minPct') {
        // Tier 0 cannot have minPct changed from 0
        if (idx === 0) return prev;

        const prevSeg = sorted[idx - 1];
        const currentSeg = sorted[idx];

        // Clamp between prevSeg.minPct + 1 and currentSeg.maxPct - 1
        const minAllowed = prevSeg.minPct + 1;
        const maxAllowed = currentSeg.maxPct - 1;
        const clampedMin = Math.max(minAllowed, Math.min(maxAllowed, num));

        return prev.map(s => {
          if (s.id === currentSeg.id) return { ...s, minPct: clampedMin };
          if (s.id === prevSeg.id) return { ...s, maxPct: clampedMin };
          return s;
        });
      } else if (field === 'maxPct') {
        // Last tier cannot have maxPct changed from 100
        if (idx === sorted.length - 1) return prev;

        const currentSeg = sorted[idx];
        const nextSeg = sorted[idx + 1];

        // Clamp between currentSeg.minPct + 1 and nextSeg.maxPct - 1
        const minAllowed = currentSeg.minPct + 1;
        const maxAllowed = nextSeg.maxPct - 1;
        const clampedMax = Math.max(minAllowed, Math.min(maxAllowed, num));

        return prev.map(s => {
          if (s.id === currentSeg.id) return { ...s, maxPct: clampedMax };
          if (s.id === nextSeg.id) return { ...s, minPct: clampedMax };
          return s;
        });
      }

      return prev;
    });
  };

  const handleResetDefaults = () => {
    setSegments(DEFAULT_TIERS.map(t => ({ ...t })));
    addNotification('info', 'Defaults Restored', 'Standard 3-tier bidding math matrix restored (0-3%, 3-10%, 10-100%).');
  };

  const handleSaveTiers = (e) => {
    e.preventDefault();
    const sorted = [...segments].sort((a, b) => a.minPct - b.minPct);

    // Validation checks
    if (sorted[0].minPct !== 0 || sorted[sorted.length - 1].maxPct !== 100) {
      addNotification('error', 'Invalid Range', 'Tiers must strictly begin at 0% and end at 100%.');
      return;
    }

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].maxPct !== sorted[i + 1].minPct) {
        addNotification('error', 'Invalid Tiers', `Tier ${i + 1} and Tier ${i + 2} have a gap or overlap.`);
        return;
      }
      if (sorted[i].minPct >= sorted[i].maxPct) {
        addNotification('error', 'Invalid Tier Range', `Tier ${i + 1} range is invalid.`);
        return;
      }
    }

    const formatted = sorted.map((s, i) => ({
      id: s.id || `rt-${i + 1}`,
      minBudgetPct: s.minPct,
      maxBudgetPct: s.maxPct,
      raisePct: s.raisePct
    }));

    setSystemState(prev => ({ ...prev, raiseTiers: formatted }));
    addNotification('success', 'Bidding Matrix Locked', 'Percentage raise tiers successfully updated with strict 0–100% contiguity.');
  };

  const sortedSegments = [...segments].sort((a, b) => a.minPct - b.minPct);

  // Validate state
  const isZeroHundredValid = sortedSegments.length > 0 &&
    sortedSegments[0].minPct === 0 &&
    sortedSegments[sortedSegments.length - 1].maxPct === 100 &&
    sortedSegments.every((s, i) => i === 0 || s.minPct === sortedSegments[i - 1].maxPct);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.12) 0%, rgba(157, 78, 221, 0.08) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Percent color="var(--accent-cyan)" /> Bidding Math Matrix
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px', margin: 0 }}>
            Configure percentage-based raise tiers based on the total team budget ($100,000 allowance).
            Guarantees strict <strong>0% to 100%</strong> contiguity with zero overlaps or gaps.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent color="var(--accent-cyan)" /> Visual Tier Editor
          </h3>

          {/* Live Validation Badge */}
          {isZeroHundredValid ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 230, 153, 0.12)',
              border: '1px solid rgba(0, 230, 153, 0.35)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.78rem',
              color: 'var(--accent-green)',
              fontWeight: 700
            }}>
              <CheckCircle2 size={14} /> 0% – 100% Contiguous (No Overlaps)
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.78rem',
              color: '#ef4444',
              fontWeight: 700
            }}>
              <AlertTriangle size={14} /> Range Incomplete or Overlapped
            </div>
          )}
        </div>

        <form onSubmit={handleSaveTiers}>
          
          {/* Segment Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            {sortedSegments.map((seg, idx) => {
              const color = ['var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-gold)', 'var(--accent-purple)', '#ff4d6d'][idx % 5];
              const isFirst = idx === 0;
              const isLast = idx === sortedSegments.length - 1;
              const isSelected = selectedSegmentId === seg.id;
              const totalBudget = systemState.totalBudget || 100000;
              const minDollar = (totalBudget * seg.minPct) / 100;
              const maxDollar = (totalBudget * seg.maxPct) / 100;
              const raiseDollar = (totalBudget * (seg.raisePct / 100));

              return (
                <div
                  key={seg.id}
                  style={{
                    background: 'var(--bg-input)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${isSelected ? 'var(--accent-green)' : 'var(--border-color)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'border 0.2s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(0, 230, 153, 0.15)' : 'none'
                  }}
                  onClick={() => setSelectedSegmentId(seg.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color }}>Tier {idx + 1}</span>
                    </div>
                    {segments.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveSegment(seg.id); }}
                        className="btn btn-danger"
                        style={{ padding: '3px 7px', fontSize: '0.7rem' }}
                        title="Delete this Tier"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Percentage Range Inputs */}
                  <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={seg.minPct}
                        disabled={isFirst}
                        onChange={(e) => handleSegmentChange(seg.id, 'minPct', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '64px',
                          background: isFirst ? 'rgba(255,255,255,0.05)' : 'var(--bg-card-solid)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: isFirst ? 'var(--text-muted)' : 'inherit',
                          padding: '4px 6px',
                          fontSize: '0.85rem',
                          outline: 'none',
                          cursor: isFirst ? 'not-allowed' : 'text'
                        }}
                        title={isFirst ? 'Start bound is locked at 0%' : 'Editing minPct adjusts preceding tier maxPct'}
                      />
                      {isFirst && <span style={{ position: 'absolute', right: '4px', fontSize: '0.65rem', color: 'var(--text-dim)' }}>🔒</span>}
                    </div>

                    <span>–</span>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={seg.maxPct}
                        disabled={isLast}
                        onChange={(e) => handleSegmentChange(seg.id, 'maxPct', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '64px',
                          background: isLast ? 'rgba(255,255,255,0.05)' : 'var(--bg-card-solid)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: isLast ? 'var(--text-muted)' : 'inherit',
                          padding: '4px 6px',
                          fontSize: '0.85rem',
                          outline: 'none',
                          cursor: isLast ? 'not-allowed' : 'text'
                        }}
                        title={isLast ? 'End bound is locked at 100%' : 'Editing maxPct adjusts succeeding tier minPct'}
                      />
                      {isLast && <span style={{ position: 'absolute', right: '4px', fontSize: '0.65rem', color: 'var(--text-dim)' }}>🔒</span>}
                    </div>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>%</span>
                  </div>

                  {/* Dollar range display */}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    ${minDollar.toLocaleString()} – ${maxDollar.toLocaleString()}
                  </div>

                  {/* Raise Percentage */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', fontWeight: 600 }}>Min Raise %:</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="10"
                      value={seg.raisePct}
                      onChange={(e) => handleSegmentChange(seg.id, 'raisePct', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        flex: 1,
                        background: 'var(--bg-card-solid)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '4px 8px',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      (+${raiseDollar.toLocaleString()})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Range Slider Bar */}
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            {/* Add / Split Button */}
            <button
              type="button"
              onClick={() => {
                if (addingMode) return;
                if (segments.length >= 8) {
                  addNotification('warning', 'Limit Reached', 'Maximum 8 bidding tiers allowed.');
                  return;
                }
                setAddingMode(true);
                setSelectedSegmentId(null);
                addNotification('info', 'Split Mode Active', 'Click anywhere on the horizontal bar to split that tier.');
              }}
              style={{
                position: 'absolute',
                left: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                background: addingMode ? 'rgba(0, 230, 153, 0.3)' : 'var(--accent-green)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#000',
                zIndex: 2,
                boxShadow: '0 0 10px rgba(0, 230, 153, 0.4)'
              }}
              title="Add / Split Tier"
            >
              <Plus size={16} />
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => {
                setAddingMode(false);
                setSelectedSegmentId(null);
              }}
              style={{
                position: 'absolute',
                left: '34px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)',
                zIndex: 2,
                opacity: addingMode ? 1 : 0.3
              }}
              title="Cancel adding"
            >
              <X size={14} />
            </button>

            {/* Bar with padding for action buttons */}
            <div style={{ paddingLeft: '76px' }}>
              <div
                ref={barRef}
                onClick={handleBarClick}
                onMouseMove={handleBarMouseMove}
                onMouseLeave={handleBarMouseLeave}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '44px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  overflow: 'visible',
                  cursor: addingMode ? 'crosshair' : 'pointer'
                }}
              >
                {sortedSegments.map((seg, idx) => {
                  const left = (seg.minPct / 100) * 100;
                  const width = ((seg.maxPct - seg.minPct) / 100) * 100;
                  const color = ['var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-gold)', 'var(--accent-purple)', '#ff4d6d'][idx % 5];
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
                        opacity: isSelected ? 0.75 : 0.4,
                        borderRight: isLast ? 'none' : '2px solid rgba(255,255,255,0.4)',
                        transition: draggingBoundary === null ? 'all 0.15s ease' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        userSelect: 'none',
                        overflow: 'hidden'
                      }}
                    >
                      <span>T{idx + 1} ({seg.minPct}%–{seg.maxPct}%)</span>

                      {/* Boundary Draggable Handle */}
                      {!isLast && (() => {
                        const boundaryIdx = idx;
                        const isActive = draggingBoundary === boundaryIdx;
                        return (
                          <div
                            onMouseDown={(e) => handleBoundaryMouseDown(e, boundaryIdx)}
                            style={{
                              position: 'absolute',
                              right: '-6px',
                              top: '-8px',
                              bottom: '-8px',
                              width: '12px',
                              cursor: 'ew-resize',
                              zIndex: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Drag boundary to resize"
                          >
                            <div style={{
                              width: '3px',
                              height: '100%',
                              background: isActive ? 'var(--accent-green)' : '#ffffff',
                              boxShadow: isActive ? '0 0 10px var(--accent-green)' : '0 0 4px rgba(0,0,0,0.6)',
                              borderRadius: '2px'
                            }} />

                            {/* Percentage Tooltip during drag */}
                            {isActive && dragHoverPct !== null && (
                              <div style={{
                                position: 'absolute',
                                top: '-28px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'var(--accent-green)',
                                color: '#031710',
                                fontSize: '0.72rem',
                                fontWeight: 900,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                                zIndex: 20
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

                {/* Hover Split Indicator */}
                {addingMode && hoverPct !== null && (
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${hoverPct}%`, transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 15 }}>
                    <div style={{ width: '2px', height: '100%', background: 'var(--accent-red)', boxShadow: '0 0 8px var(--accent-red)' }}></div>
                    <div style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-red)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      Split at {hoverPct}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.92rem', fontWeight: 800 }}
          >
            <ShieldCheck size={18} /> Lock &amp; Apply Bidding Math Tiers
          </button>
        </form>
      </div>

    </div>
  );
};
