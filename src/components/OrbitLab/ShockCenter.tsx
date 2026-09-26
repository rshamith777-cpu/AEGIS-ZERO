import React from 'react';
import { ShockAnalysisReport } from '../../orbit/v3/shock/shockEngine';
import { AlertOctagon, Zap, ShieldAlert, RotateCcw, Activity } from 'lucide-react';
import { ArrowUpRight } from './icons';

interface ShockCenterProps {
  shockReport?: ShockAnalysisReport;
  onSimulateShock?: (magnitude: number) => void;
}

export const ShockCenter: React.FC<ShockCenterProps> = ({
  shockReport,
  onSimulateShock
}) => {
  // Demo fallback if no live report passed
  const report: ShockAnalysisReport = shockReport || {
    isShockActive: true,
    classification: 'INSTANTANEOUS',
    shockMagnitude: 0.742,
    detectionLatencyTicks: 1,
    preShockWarningStatus: 'NONE',
    affectedNodes: ['node_substation_3', 'node_feeder_7', 'node_transformer_12'],
    topologyImpact: {
      severedCorridorsCount: 4,
      severedEdges: ['bus_3->bus_4', 'bus_7->bus_8', 'bus_7->bus_9', 'bus_12->bus_13'],
      capacityLossPct: 28.5
    },
    postShockBtd: 0.124,
    fastestRecoveryDirection: {
      name: 'Inverse Shock Recovery Gradient',
      vector: new Float64Array([0.15, -0.42, 0.78])
    },
    postShockEscapeResult: null,
    postShockEscapeProbability: 0.72,
    expectedLossAvoided: 145000,
    recoveryEstimateTicks: 2,
    explanation: 'Shock detected [INSTANTANEOUS] with magnitude 0.742. Pre-shock warning: NONE. Detection latency: 1 tick(s). Immediate MEI-2 escape portfolio deployed.'
  };

  const isShock = report.isShockActive;
  const isInstantaneous = report.classification === 'INSTANTANEOUS';

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: isShock ? '1px solid var(--state-red)' : '1px solid var(--border-subtle)',
      borderRadius: '4px',
      padding: '20px',
      color: 'var(--signal-white)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Shock Alert Banner */}
      {isShock ? (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.15))',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertOctagon size={28} color="#ef4444" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#fca5a5', letterSpacing: '0.02em' }}>
                ⚠ OPERATIONAL REGIME 5: INSTANTANEOUS SHOCK ACTIVE
              </div>
              <div style={{ fontSize: '12px', color: '#fecaca', marginTop: '2px' }}>
                State displacement $\Delta state = {report.shockMagnitude.toFixed(3)}$ exceeded shock threshold without observable precursor warning.
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            color: '#fecaca',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700
          }}>
            {report.classification} SHOCK
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <Zap size={18} color="#10b981" />
          <div style={{ fontSize: '13px', color: '#6ee7b7' }}>
            Nominal Operational State. Shock detection monitors for unheralded physical discontinuities.
          </div>
        </div>
      )}

      {/* Distinction Callout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          borderLeft: '3px solid #38bdf8',
          padding: '12px 16px',
          borderRadius: '0 6px 6px 0'
        }}>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            PREDICTABLE TRANSITION
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.4' }}>
            Precursor signatures are observable. ORBIT computes advance warning lead time (typically 30–60m prior).
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          borderLeft: '3px solid #ef4444',
          padding: '12px 16px',
          borderRadius: '0 6px 6px 0'
        }}>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, textTransform: 'uppercase' }}>
            INSTANTANEOUS SHOCK
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.4' }}>
            Mathematically unobservable prior to occurrence. ORBIT reports zero advance warning, sub-tick detection latency, and post-shock escape recovery.
          </div>
        </div>
      </div>

      {/* Quantitative Shock Telemetry Database */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>PRE-SHOCK WARNING</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isInstantaneous ? '#f87171' : '#34d399', marginTop: '4px' }}>
            {report.preShockWarningStatus}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Honest observation limit</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>DETECTION LATENCY</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {report.detectionLatencyTicks} tick(s)
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Post-event verification</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>CAPACITY LOSS</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>
            {report.topologyImpact.capacityLossPct}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{report.topologyImpact.severedCorridorsCount} severed corridors</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>POST-SHOCK ESCAPE PROB</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
            {(report.postShockEscapeProbability * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Recovery estimate {report.recoveryEstimateTicks} ticks</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>EXPECTED LOSS AVOIDED</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
            ${(report.expectedLossAvoided / 1000).toFixed(0)}k
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Via MEI-2 portfolio</div>
        </div>
      </div>

      {/* Affected Nodes & Topology Damage */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
          AFFECTED TOPOLOGICAL INFRASTRUCTURE
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {report.affectedNodes.map((n, i) => (
            <span key={i} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
              ⚠ {n}
            </span>
          ))}
          {report.topologyImpact.severedEdges.map((e, i) => (
            <span key={i} style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fcd34d', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
              ✕ Severed: {e}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive Shock Trigger Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Simulate Shock Magnitude:</span>
        <button
          onClick={() => onSimulateShock?.(0.35)}
          style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
        >
          Sudden Step (0.35)
        </button>
        <button
          onClick={() => onSimulateShock?.(0.85)}
          style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
        >
          Instantaneous Discontinuity (0.85)
        </button>
        <button
          onClick={() => onSimulateShock?.(0.0)}
          style={{ background: 'rgba(148, 163, 184, 0.1)', border: '1px solid #64748b', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
        >
          Reset to Nominal
        </button>
      </div>
    </div>
  );
};
