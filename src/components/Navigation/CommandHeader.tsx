import React from 'react';
import { sound } from '../../engine/soundEffects';
import { Shield, Volume2, VolumeX, Database, Video, Eye, Radio, Sparkles } from 'lucide-react';

interface CommandHeaderProps {
  disruptionActive: boolean;
  sovereignMode: boolean;
  cameraMode: 'orbit' | 'godseye' | 'tracking';
  onChangeCameraMode: (mode: 'orbit' | 'godseye' | 'tracking') => void;
  onOpenMemory: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  simSpeed: number;
  onChangeSpeed: (spd: number) => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  disruptionActive,
  sovereignMode,
  cameraMode,
  onChangeCameraMode,
  onOpenMemory,
  isMuted,
  onToggleMute,
  simSpeed,
  onChangeSpeed
}) => {
  return (
    <header
      style={{
        height: '52px',
        background: 'rgba(6, 12, 24, 0.95)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        backdropFilter: 'blur(12px)',
        zIndex: 30
      }}
    >
      {/* Brand & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)'
            }}
          >
            <Shield size={17} color="#060911" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '1.5px', color: '#f8fafc', fontFamily: 'monospace' }}>
              AEGIS <span style={{ color: '#00f0ff' }}>ZERO</span>
            </div>
            <div style={{ fontSize: '8.5px', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.8px' }}>
              AUTONOMOUS FOOD RESILIENCE & CASCADE ENGINE
            </div>
          </div>
        </div>

        {/* DEFCON Status */}
        <div
          style={{
            marginLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '4px',
            background: disruptionActive ? 'rgba(255, 0, 85, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${disruptionActive ? '#ff0055' : '#10b981'}`
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: disruptionActive ? '#ff0055' : '#10b981',
              boxShadow: `0 0 8px ${disruptionActive ? '#ff0055' : '#10b981'}`,
              animation: disruptionActive ? 'pulse 1s infinite' : undefined
            }}
          />
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: disruptionActive ? '#ff0055' : '#10b981'
            }}
          >
            {disruptionActive ? 'DEFCON 2: PERISHABILITY CASCADE' : 'DEFCON 5: EQUILIBRIUM'}
          </span>
        </div>
      </div>

      {/* Center Camera Mode Pill Selector */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '6px',
          padding: '2px'
        }}
      >
        <button
          onClick={() => onChangeCameraMode('orbit')}
          style={{
            background: cameraMode === 'orbit' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
            border: 'none',
            color: cameraMode === 'orbit' ? '#00f0ff' : '#94a3b8',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ORBIT 3D
        </button>
        <button
          onClick={() => onChangeCameraMode('godseye')}
          style={{
            background: cameraMode === 'godseye' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
            border: 'none',
            color: cameraMode === 'godseye' ? '#00f0ff' : '#94a3b8',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          GOD'S EYE (TOP)
        </button>
        <button
          onClick={() => onChangeCameraMode('tracking')}
          style={{
            background: cameraMode === 'tracking' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
            border: 'none',
            color: cameraMode === 'tracking' ? '#00f0ff' : '#94a3b8',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          DRONE CHASE
        </button>
      </div>

      {/* Right Controls: Sim Speed, Memory Vault, Audio & Sovereign Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Sim Speed Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'rgba(0,0,0,0.4)',
            padding: '2px 4px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              style={{
                background: simSpeed === spd ? '#0284c7' : 'transparent',
                border: 'none',
                color: simSpeed === spd ? '#fff' : '#64748b',
                fontSize: '8.5px',
                fontFamily: 'monospace',
                padding: '2px 6px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {spd}X
            </button>
          ))}
        </div>

        {/* Sovereign Edge Mode Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '9px',
            fontFamily: 'monospace',
            padding: '3px 8px',
            borderRadius: '4px',
            background: sovereignMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 240, 255, 0.08)',
            border: `1px solid ${sovereignMode ? '#10b981' : 'rgba(0, 240, 255, 0.2)'}`,
            color: sovereignMode ? '#10b981' : '#00f0ff'
          }}
        >
          <Radio size={11} color={sovereignMode ? '#10b981' : '#00f0ff'} />
          <span>{sovereignMode ? 'SOVEREIGN EDGE' : 'HYBRID CLOUD'}</span>
        </div>

        {/* Episodic Memory Button */}
        <button
          onClick={onOpenMemory}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            padding: '4px 8px',
            color: '#cbd5e1',
            fontSize: '9.5px',
            fontFamily: 'monospace',
            cursor: 'pointer'
          }}
        >
          <Database size={12} color="#00f0ff" />
          <span>MEMORY VAULT</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            padding: '5px',
            color: isMuted ? '#64748b' : '#00f0ff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </header>
  );
};
