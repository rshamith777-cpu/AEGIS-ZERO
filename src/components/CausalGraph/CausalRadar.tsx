import React, { useState } from 'react';
import { CausalGraphNode, CausalGraphEdge } from '../../types/aegis';
import { ShieldAlert, Zap, Activity, Info, Globe } from 'lucide-react';
import { DotMatrixText } from '../Common/DotMatrixText';

interface CausalRadarProps {
  nodes: CausalGraphNode[];
  edges: CausalGraphEdge[];
  disruptionActive: boolean;
}

export const CausalRadar: React.FC<CausalRadarProps> = ({
  nodes,
  edges,
  disruptionActive
}) => {
  const [selectedNode, setSelectedNode] = useState<CausalGraphNode | null>(null);

  // Layout node positions in SVG coordinates
  const nodePositions: Record<string, { x: number; y: number }> = {
    c1: { x: 60, y: 110 },
    c2: { x: 180, y: 70 },
    c3: { x: 300, y: 70 },
    c4: { x: 420, y: 110 },
    c5: { x: 180, y: 150 },
    c6: { x: 300, y: 150 },
    c7: { x: 420, y: 190 }
  };

  const getSeverityColor = (sev: CausalGraphNode['severity'], active: boolean) => {
    if (!active) return '#aaaaaa';
    switch (sev) {
      case 'catastrophic':
        return 'var(--nothing-red-bright)';
      case 'severe':
        return 'var(--nothing-red)';
      case 'moderate':
        return '#374151'; // Dark ink
      default:
        return '#777777';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="var(--signal-white)" />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--signal-white)', fontFamily: 'var(--font-heading)' }}>
            CAUSAL CASCADE RADAR (DAG)
          </span>
        </div>
        <div className="nothing-badge" style={{ borderColor: disruptionActive ? 'var(--state-red)' : 'var(--signal-text-dim)', color: disruptionActive ? 'var(--state-red)' : 'var(--signal-text-dim)' }}>
          {disruptionActive ? 'CASCADE IN PROGRESS' : 'EQUILIBRIUM'}
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: '300px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}
      >
        {/* Radar grid background */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border-strong)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg width="100%" height="100%" viewBox="0 0 500 250" style={{ display: 'block', position: 'relative', zIndex: 1 }}>
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#aaaaaa" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--nothing-red)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e, idx) => {
            const fromPos = nodePositions[e.from];
            const toPos = nodePositions[e.to];
            if (!fromPos || !toPos) return null;
            const isEdgeActive = e.active || (disruptionActive && ['c1', 'c2', 'c3', 'c4', 'c7'].includes(e.to));

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isEdgeActive ? 'var(--nothing-red)' : 'var(--border-strong)'}
                  strokeWidth={isEdgeActive ? 2 : 1}
                  strokeDasharray={isEdgeActive ? 'none' : '4 4'}
                  markerEnd={isEdgeActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const pos = nodePositions[n.id];
            if (!pos) return null;
            const isActive = n.active || (disruptionActive && ['c2', 'c3', 'c4', 'c7'].includes(n.id));
            const color = getSeverityColor(isActive ? (n.id === 'c7' ? 'catastrophic' : 'severe') : n.severity, isActive);
            const isSelected = selectedNode?.id === n.id;

            return (
              <g
                key={n.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNode(n)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow ring if active */}
                {isActive && (
                  <circle
                    r="22"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    opacity="0.3"
                    strokeDasharray="2 4"
                  />
                )}
                {/* Main circle */}
                <circle
                  r={isSelected ? 16 : 14}
                  fill={isSelected ? 'var(--signal-white)' : 'var(--bg-surface)'}
                  stroke={isSelected ? 'var(--signal-white)' : 'var(--signal-white)'}
                  strokeWidth="2"
                />
                {/* Center dot */}
                <circle r="4" fill={isSelected ? '#fff' : color} />

                {/* Node Label */}
                <text
                  x="0"
                  y="30"
                  textAnchor="middle"
                  fill='var(--signal-white)'
                  fontSize="9"
                  fontFamily="var(--font-data)"
                  fontWeight={isActive ? '700' : '400'}
                  letterSpacing="0.05em"
                >
                  {n.label.length > 20 ? n.label.slice(0, 18) + '..' : n.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Causal Node Detail Modal/Card inside radar */}
        {selectedNode && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backdropFilter: 'blur(12px)',
              zIndex: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="var(--signal-white)" />
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--signal-white)', fontFamily: 'var(--font-heading)' }}>
                  {selectedNode.label.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--signal-text-muted)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-dim)' }}>CATEGORY</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--signal-white)' }}>{selectedNode.category.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-dim)' }}>CONFIDENCE</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--state-green)' }}>{(selectedNode.confidence * 100).toFixed(1)}%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-dim)' }}>UPDATED</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--signal-text-muted)' }}>{selectedNode.timestamp}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-dim)' }}>EVIDENCE STREAM</span>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-body)', color: 'var(--signal-white)', background: 'var(--bg-surface)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                {selectedNode.evidence}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
