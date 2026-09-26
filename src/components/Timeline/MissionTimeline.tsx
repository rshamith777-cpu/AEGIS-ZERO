import React, { useState } from 'react';
import { sound } from '../../engine/soundEffects';
import { Flame, AlertTriangle, RotateCcw, ChevronUp, ChevronDown, Zap, CloudRain, Users, WifiOff } from 'lucide-react';

interface MissionTimelineProps {
  disruptionActive: boolean;
  onTriggerChaos: (scenarioType: string) => void;
  onResetChaos: () => void;
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({
  disruptionActive,
  onTriggerChaos,
  onResetChaos
}) => {
  const [chaosMenuOpen, setChaosMenuOpen] = useState<boolean>(false);

  const events = disruptionActive
    ? [
        { time: '23:41:02', text: 'Compressor #3 internal thermal envelope breached (+7.4°C)', level: 'crit' },
        { time: '23:41:07', text: 'Cold-chain sentinel: 184 meals at microbiological risk', level: 'crit' },
        { time: '23:41:10', text: 'Multi-agent war room convened by Overwatch', level: 'info' },
        { time: '23:41:13', text: 'Route 2 challenged by Red Team: Arterial waterlogging (+40m)', level: 'warn' },
        { time: '23:41:17', text: 'Nexus-9 calculated Pareto optimal 60/40 dual-split', level: 'success' },
        { time: '23:41:21', text: 'Aegis-Safe: Food safety constraints validated (+25m margin)', level: 'success' },
        { time: '23:41:24', text: 'Commander approval required for execution', level: 'info' }
      ]
    : [
        { time: '23:38:12', text: 'Central Depot Ammonia chiller telemetry nominal (-18.2°C)', level: 'info' },
        { time: '23:39:40', text: 'Tech Quad Cafeteria crowd influx steady (127 persons)', level: 'info' },
        { time: '23:40:05', text: 'Cryo-Fleet #01 en route to Kitchen Alpha (ETA 11 min)', level: 'info' },
        { time: '23:40:48', text: 'All 6 regional nodes operating at optimal resilience', level: 'success' }
      ];

  const handleMasterBreak = () => {
    sound.playBreachAlarm();
    onTriggerChaos('compressor_failure');
    setChaosMenuOpen(false);
  };

  const handleScenario = (type: string) => {
    sound.playBreachAlarm();
    onTriggerChaos(type);
    setChaosMenuOpen(false);
  };

  return (
    <footer
      style={{
        height: '46px',
        minHeight: '46px',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 40,
        position: 'relative'
      }}
    >
      {/* Left: Live Event Stream Ticker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <span className="nothing-dot-red" />
          <span className="tech-label" style={{ color: disruptionActive ? 'var(--nothing-red-bright)' : 'var(--signal-text-muted)' }}>
            EVENT STREAM
          </span>
        </div>

        {/* Scrolling Event Ticker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            fontFamily: 'var(--font-data)',
            fontSize: '9.5px'
          }}
        >
          {events.slice(-3).map((ev, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--signal-text-dim)' }}>[{ev.time}]</span>
              <span
                style={{
                  color:
                    ev.level === 'crit'
                      ? 'var(--state-red)'
                      : ev.level === 'warn'
                      ? 'var(--state-amber)'
                      : ev.level === 'success'
                      ? 'var(--state-green)'
                      : 'var(--signal-white)'
                }}
              >
                {ev.text}
              </span>
              {idx < 2 && <span style={{ color: 'var(--border-strong)' }}>/</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Tactical Chaos Engine Control */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {disruptionActive ? (
          <button
            onClick={onResetChaos}
            style={{
              background: 'transparent',
              border: '1px solid var(--state-green)',
              borderRadius: '2px',
              padding: '6px 12px',
              color: 'var(--state-green)',
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={12} />
            RESTORE EQUILIBRIUM
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* The Consequential Break The World Button */}
            <button
              onClick={handleMasterBreak}
              style={{
                background: 'rgba(255, 42, 75, 0.1)',
                border: '1px solid var(--state-red)',
                borderRadius: '2px 0 0 2px',
                padding: '6px 14px',
                color: 'var(--state-red)',
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Flame size={13} />
              BREAK THE WORLD
            </button>
            <button
              onClick={() => setChaosMenuOpen(!chaosMenuOpen)}
              style={{
                background: 'rgba(255, 42, 75, 0.15)',
                border: '1px solid var(--state-red)',
                borderLeft: 'none',
                borderRadius: '0 2px 2px 0',
                padding: '6px 6px',
                color: 'var(--state-red)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Select Chaos Scenario"
            >
              {chaosMenuOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        )}

        {/* Chaos Scenarios Popout Menu */}
        {chaosMenuOpen && !disruptionActive && (
          <div
            style={{
              position: 'absolute',
              bottom: '52px',
              right: '0',
              width: '260px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-muted)',
              borderRadius: '2px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              zIndex: 60
            }}
          >
            <span className="tech-label" style={{ padding: '4px 6px' }}>
              CHAOS ENGINE • INJECT FAULT
            </span>

            {[
              { id: 'compressor_failure', label: 'Compressor #3 Blowout (47m Spoil)', icon: <Zap size={12} color="var(--state-red)" /> },
              { id: 'monsoon_surge', label: 'Monsoon Flood + Route 2 Block', icon: <CloudRain size={12} color="var(--signal-cyan)" /> },
              { id: 'demand_spike', label: 'Demand Surge ×2.5 (Campus)', icon: <Users size={12} color="var(--state-amber)" /> },
              { id: 'power_outage', label: 'Database Power Failure (Aux Gen)', icon: <WifiOff size={12} color="var(--signal-text-muted)" /> }
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleScenario(sc.id)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '2px',
                  padding: '6px 8px',
                  color: 'var(--signal-white)',
                  fontFamily: 'var(--font-data)',
                  fontSize: '9.5px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {sc.icon}
                <span>{sc.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};
