import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio } from 'lucide-react';

interface MinimalHeaderProps {
  systemState: 'EQUILIBRIUM' | 'ANOMALY' | 'CASCADE' | 'RESPONSE';
  cameraMode: 'orbit' | 'godseye' | 'tracking';
  onChangeCameraMode: (mode: 'orbit' | 'godseye' | 'tracking') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  simSpeed: number;
  onChangeSpeed: (spd: number) => void;
  sovereignMode: boolean;
  researchMode?: boolean;
  onToggleResearchMode?: () => void;
  onReturnToOverview?: () => void;
  onOpenPurpose?: () => void;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  systemState,
  cameraMode,
  onChangeCameraMode,
  isMuted,
  onToggleMute,
  simSpeed,
  onChangeSpeed,
  sovereignMode,
  researchMode = false,
  onToggleResearchMode,
  onReturnToOverview,
  onOpenPurpose
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStateColor = () => {
    switch (systemState) {
      case 'CASCADE':
        return 'var(--state-red)';
      case 'ANOMALY':
        return 'var(--state-amber)';
      case 'RESPONSE':
        return 'var(--state-green)';
      case 'EQUILIBRIUM':
      default:
        return 'var(--signal-cyan)';
    }
  };

  return (
    <header
      style={{
        height: '44px',
        minHeight: '44px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 50,
        userSelect: 'none'
      }}
    >
      {/* Left: Brand Identity & Current System State */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="nothing-dot-red" />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.08em',
              color: 'var(--signal-white)'
            }}
          >
            AEGIS ZERO
          </span>
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '9px',
              letterSpacing: '0.08em',
              color: 'var(--signal-text-muted)',
              textTransform: 'uppercase'
            }}
          >
            CASCADE ENGINE
          </span>
        </div>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-muted)' }} />

        {/* State Badge */}
        <div className="nothing-badge" style={{ borderColor: getStateColor(), color: getStateColor() }}>
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: getStateColor(),
              boxShadow: systemState === 'CASCADE' ? '0 0 6px var(--state-red)' : 'none'
            }}
          />
          <span>
            {systemState === 'CASCADE' ? 'DEFCON 2 • PERISHABILITY CASCADE' : systemState === 'RESPONSE' ? 'RESPONSE ACTIVE • TIMELINE HEALING' : 'EQUILIBRIUM • SURVEILLANCE ACTIVE'}
          </span>
        </div>
      </div>

      {/* Center: Camera Perspectives (Nothing OS Pill Segment) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '999px',
          padding: '2px'
        }}
      >
        {(
          [
            { id: 'orbit', label: 'ORBIT' },
            { id: 'godseye', label: "GOD'S EYE" },
            { id: 'tracking', label: 'DRONE CHASE' }
          ] as const
        ).map((cam) => {
          const isActive = cameraMode === cam.id;
          return (
            <button
              key={cam.id}
              onClick={() => onChangeCameraMode(cam.id)}
              style={{
                background: isActive ? 'var(--nothing-red)' : 'transparent',
                border: 'none',
                color: isActive ? '#ffffff' : 'var(--signal-text-muted)',
                fontFamily: 'var(--font-data)',
                fontSize: '8.5px',
                letterSpacing: '0.08em',
                fontWeight: isActive ? 600 : 400,
                padding: '4px 10px',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cam.label}
            </button>
          );
        })}
      </div>

      {/* Right: Operational Controls & UTC Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Sim Speed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              style={{
                background: simSpeed === spd ? 'var(--border-strong)' : 'transparent',
                border: 'none',
                color: simSpeed === spd ? 'var(--signal-white)' : 'var(--signal-text-dim)',
                fontFamily: 'var(--font-data)',
                fontSize: '8px',
                padding: '2px 5px',
                borderRadius: '1px',
                cursor: 'pointer'
              }}
            >
              {spd}X
            </button>
          ))}
        </div>

        {/* Research Mode Toggle */}
        {onToggleResearchMode && (
          <button
            onClick={onToggleResearchMode}
            style={{
              background: researchMode ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              border: `1px solid ${researchMode ? 'var(--signal-cyan)' : 'var(--border-muted)'}`,
              color: researchMode ? 'var(--signal-cyan)' : 'var(--signal-text-dim)',
              fontFamily: 'var(--font-data)',
              fontSize: '8px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {researchMode ? 'RESEARCH MODE' : 'DEMO MODE'}
          </button>
        )}

        {/* Return to Landing Overview */}
        {onReturnToOverview && (
          <button
            onClick={onReturnToOverview}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-muted)',
              color: 'var(--signal-white)',
              fontFamily: 'var(--font-data)',
              fontSize: '8.5px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Return to System Overview Landing"
          >
            ← OVERVIEW
          </button>
        )}

        {/* Project Purpose & Architecture */}
        {onOpenPurpose && (
          <button
            onClick={onOpenPurpose}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-muted)',
              color: 'var(--nothing-red)',
              fontFamily: 'var(--font-data)',
              fontSize: '8.5px',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="What is AEGIS ZERO? Project Purpose & Blueprint"
          >
            ? PURPOSE
          </button>
        )}

        {/* Globe / Sovereign Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Radio size={11} color={sovereignMode ? 'var(--state-green)' : 'var(--signal-text-dim)'} />
          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-data)', color: sovereignMode ? 'var(--state-green)' : 'var(--signal-text-dim)' }}>
            {sovereignMode ? 'SOVEREIGN EDGE' : 'HYBRID CLOUD'}
          </span>
        </div>

        {/* Audio Mute */}
        <button
          onClick={onToggleMute}
          style={{
            background: 'transparent',
            border: 'none',
            color: isMuted ? 'var(--signal-text-dim)' : 'var(--signal-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px'
          }}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        {/* Tactical Clock */}
        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: '9.5px',
            color: 'var(--signal-text-muted)',
            letterSpacing: '0.05em'
          }}
        >
          {timeStr}
        </span>
      </div>
    </header>
  );
};
