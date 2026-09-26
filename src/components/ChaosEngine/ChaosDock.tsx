import React from 'react';
import { sound } from '../../engine/soundEffects';
import { Flame, CloudRain, Zap, Users, WifiOff, AlertOctagon, RotateCcw } from 'lucide-react';

interface ChaosDockProps {
  disruptionActive: boolean;
  onTriggerChaos: (scenarioType: string) => void;
  onResetChaos: () => void;
  sovereignMode: boolean;
  onToggleSovereign: () => void;
}

export const ChaosDock: React.FC<ChaosDockProps> = ({
  disruptionActive,
  onTriggerChaos,
  onResetChaos,
  sovereignMode,
  onToggleSovereign
}) => {
  const handleMasterBreak = () => {
    sound.playBreachAlarm();
    onTriggerChaos('compressor_failure');
  };

  const handleScenario = (type: string) => {
    sound.playBreachAlarm();
    onTriggerChaos(type);
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        backdropFilter: 'blur(12px)',
        zIndex: 20
      }}
    >
      {/* Master Chaos Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={disruptionActive ? onResetChaos : handleMasterBreak}
          style={{
            background: disruptionActive ? 'var(--state-green)' : 'var(--nothing-red)',
            border: 'none',
            borderRadius: '999px',
            padding: '7px 18px',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: disruptionActive ? '0 0 15px rgba(16, 185, 129, 0.4)' : '0 0 20px rgba(255, 0, 85, 0.5)',
            animation: disruptionActive ? undefined : 'pulse 2s infinite'
          }}
        >
          {disruptionActive ? (
            <>
              <RotateCcw size={15} />
              RESTORE EQUILIBRIUM
            </>
          ) : (
            <>
              <Flame size={15} />
              BREAK THE WORLD
            </>
          )}
        </button>
        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748b' }}>
          {disruptionActive ? '⚠️ CASCADE SIMULATION RUNNING' : 'SYSTEM HEALTH: OPTIMAL'}
        </span>
      </div>

      {/* Discrete Fault Injectors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
        <button
          onClick={() => handleScenario('compressor_failure')}
          style={{
            background: 'rgba(255, 0, 85, 0.1)',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            borderRadius: '4px',
            padding: '5px 10px',
            color: '#ff80a0',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Zap size={12} color="#ff0055" />
          CHILLER #3 BLOWOUT
        </button>

        <button
          onClick={() => handleScenario('monsoon_flood')}
          style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '4px',
            padding: '5px 10px',
            color: '#38bdf8',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <CloudRain size={12} color="#38bdf8" />
          MONSOON + ROUTE B FLOOD
        </button>

        <button
          onClick={() => handleScenario('demand_spike')}
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '4px',
            padding: '5px 10px',
            color: '#fbbf24',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Users size={12} color="#f59e0b" />
          +250% CAMPUS SPIKE
        </button>

        {/* Sovereign Offline Mode Toggle */}
        <button
          onClick={onToggleSovereign}
          style={{
            background: sovereignMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${sovereignMode ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '4px',
            padding: '5px 10px',
            color: sovereignMode ? '#10b981' : '#94a3b8',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <WifiOff size={12} color={sovereignMode ? '#10b981' : '#94a3b8'} />
          {sovereignMode ? 'SOVEREIGN MODE: ACTIVE' : 'TEST INTERNET SEVER'}
        </button>
      </div>
    </div>
  );
};
