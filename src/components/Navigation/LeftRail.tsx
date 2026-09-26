import React from 'react';
import { Activity, Globe, Zap, Swords, GitBranch, Flame, Database } from 'lucide-react';

const CompassIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export type NavSection = 'overview' | 'world' | 'cascade' | 'agents' | 'futures' | 'orbit' | 'memory';

interface LeftRailProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenPurpose?: () => void;
  disruptionActive: boolean;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  activeSection,
  onSelectSection,
  onOpenPurpose,
  disruptionActive
}) => {
  const items: Array<{ id: NavSection; label: string; icon: React.ReactNode; alertBadge?: boolean }> = [
    { id: 'overview', label: 'OVERVIEW', icon: <Database size={17} /> },
    { id: 'world', label: 'WORLD', icon: <Globe size={17} /> },
    { id: 'cascade', label: 'CASCADE', icon: <Zap size={17} />, alertBadge: disruptionActive },
    { id: 'agents', label: 'AGENTS', icon: <Swords size={17} /> },
    { id: 'futures', label: 'FUTURES', icon: <GitBranch size={17} /> },
    { id: 'orbit', label: 'ORBIT LAB', icon: <CompassIcon size={17} /> },
    { id: 'memory', label: 'MEMORY', icon: <Database size={17} /> }
  ];

  return (
    <aside
      style={{
        width: '68px',
        minWidth: '68px',
        height: '100%',
        backgroundColor: 'var(--bg-space)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        zIndex: 40,
        userSelect: 'none'
      }}
    >
      {/* Brand Icon */}
      <button
        onClick={() => onSelectSection('overview')}
        style={{
          width: '38px',
          height: '38px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          border: '1px solid var(--border-muted)',
          borderRadius: '4px',
          background: 'var(--bg-elevated)',
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)'
        }}
        title="Return to System Overview"
      >
        <span className="font-dot" style={{ fontWeight: 900, fontSize: '12px', color: 'var(--signal-white)', letterSpacing: '-0.5px' }}>
          AZ
        </span>
        <span className="font-dot" style={{ fontSize: '7px', color: 'var(--nothing-red)', letterSpacing: '0.5px', fontWeight: 800 }}>
          ZERO
        </span>
      </button>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              style={{
                position: 'relative',
                width: '100%',
                height: '48px',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                color: isActive ? 'var(--signal-white)' : 'var(--signal-text-muted)',
                transition: 'all 0.15s ease'
              }}
              title={item.label}
            >
              {/* Active Left Indicator Notch */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '8px',
                    bottom: '8px',
                    width: '3px',
                    backgroundColor: item.alertBadge ? 'var(--state-red)' : 'var(--nothing-red)'
                  }}
                />
              )}

              {/* Icon Container with subtle Nothing Red alert dot */}
              <div style={{ position: 'relative' }}>
                <span style={{ color: isActive ? (item.alertBadge ? 'var(--state-red)' : 'var(--nothing-red)') : 'inherit' }}>
                  {item.icon}
                </span>
                {item.alertBadge && (
                  <span
                    className="nothing-dot-red"
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-3px'
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '8px',
                  fontFamily: 'var(--font-data)',
                  letterSpacing: '0.06em',
                  fontWeight: isActive ? 700 : 500
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions: Purpose / Blueprint Button + Live Status */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
        {onOpenPurpose && (
          <button
            onClick={onOpenPurpose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border-muted)',
              background: 'var(--bg-elevated)',
              color: 'var(--nothing-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
            title="System Purpose & Blueprint"
          >
            <Zap size={16} />
          </button>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: disruptionActive ? 'var(--state-red)' : 'var(--state-green)',
              boxShadow: disruptionActive ? '0 0 6px var(--state-red)' : '0 0 4px var(--state-green)'
            }}
          />
          <span style={{ fontSize: '7px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-dim)', fontWeight: 600 }}>
            LIVE
          </span>
        </div>
      </div>
    </aside>
  );
};
