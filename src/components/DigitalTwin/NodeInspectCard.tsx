import React from 'react';
import { EcosystemNode } from '../../types/aegis';
import { Thermometer, Package, Users, Clock, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface NodeInspectCardProps {
  node: EcosystemNode | null;
  onClose: () => void;
}

export const NodeInspectCard: React.FC<NodeInspectCardProps> = ({ node, onClose }) => {
  if (!node) return null;

  const isCritical = node.status === 'critical';
  const isWarning = node.status === 'warning';

  return (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        left: '16px',
        width: '320px',
        background: 'var(--bg-surface)',
        border: `1px solid ${isCritical ? 'var(--nothing-red)' : isWarning ? 'var(--state-amber)' : 'var(--border-muted)'}`,
        borderRadius: '4px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: isCritical ? '0 0 20px rgba(173, 49, 77, 0.3)' : '0 4px 16px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        zIndex: 25
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isCritical ? 'var(--nothing-red)' : isWarning ? 'var(--state-amber)' : 'var(--state-green)'
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--signal-white)', fontFamily: 'var(--font-heading)' }}>
              {node.name}
            </span>
          </div>
          <span style={{ fontSize: '9px', color: 'var(--signal-cyan)', fontFamily: 'var(--font-data)' }}>
            NODE ID: {node.code} • TYPE: {node.type.toUpperCase()}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--signal-text-muted)', cursor: 'pointer', fontSize: '13px' }}
        >
          ✕
        </button>
      </div>

      <p style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
        {node.description}
      </p>

      {/* Database of Key Telemetry */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '8px',
          borderRadius: '6px',
          fontSize: '9.5px',
          fontFamily: 'monospace'
        }}
      >
        {/* Inventory */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Package size={12} color="#00f0ff" />
          <div>
            <div style={{ color: '#64748b' }}>INVENTORY</div>
            <div style={{ color: '#fff', fontWeight: 'bold' }}>
              {node.inventoryMeals.toLocaleString()} / {node.maxCapacity.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Temperature if applicable */}
        {node.temperatureC !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Thermometer size={12} color={isCritical ? '#ff0055' : '#38bdf8'} />
            <div>
              <div style={{ color: '#64748b' }}>CORE TEMP</div>
              <div style={{ color: isCritical ? '#ff0055' : '#38bdf8', fontWeight: 'bold' }}>
                {node.temperatureC}°C (Max {node.tempThresholdMax}°C)
              </div>
            </div>
          </div>
        )}

        {/* Shelf Life Remaining */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={12} color={isCritical ? '#ff0055' : '#10b981'} />
          <div>
            <div style={{ color: '#64748b' }}>BIO LIMIT</div>
            <div style={{ color: isCritical ? '#ff0055' : '#10b981', fontWeight: 'bold' }}>
              {node.shelfLifeRemainingMin > 0 ? `${node.shelfLifeRemainingMin} min` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Crowd Density if cafeteria */}
        {node.crowdDensityPct !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={12} color="#f59e0b" />
            <div>
              <div style={{ color: '#64748b' }}>CROWD OCCUPANCY</div>
              <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                {node.crowdDensityPct}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Warning Banner if Critical */}
      {isCritical && (
        <div
          style={{
            background: 'rgba(255, 0, 85, 0.15)',
            border: '1px solid #ff0055',
            borderRadius: '4px',
            padding: '6px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            color: '#ff80a0'
          }}
        >
          <AlertTriangle size={14} color="#ff0055" />
          <span>THERMAL COMPRESSOR FAILURE: EMERGENCY REBALANCING REQUIRED</span>
        </div>
      )}
    </div>
  );
};
