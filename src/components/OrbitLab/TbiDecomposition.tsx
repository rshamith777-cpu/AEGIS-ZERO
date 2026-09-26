import React from 'react';
import { OrbitCoreQuantities } from '../../orbit/v3/types';
import { Layers, Activity, TrendingUp, ShieldAlert } from 'lucide-react';

interface TbiDecompositionProps {
  tbiScore: number;
  coreQuantities: OrbitCoreQuantities;
  operationalState: string;
}

export const TbiDecomposition: React.FC<TbiDecompositionProps> = ({
  tbiScore,
  coreQuantities,
  operationalState
}) => {
  const {
    boundaryProximity,
    transitionMomentum,
    structuralAmplification,
    interventionLeverage
  } = coreQuantities;

  // Compute percentage contributions
  const bpWeight = 0.35;
  const tmWeight = 0.25;
  const saWeight = 0.25;
  const ilWeight = 0.15;

  const bpContrib = boundaryProximity * bpWeight;
  const tmContrib = transitionMomentum * tmWeight;
  const saContrib = Math.min(1.0, (structuralAmplification - 1.0) / 2.0) * saWeight;
  const ilContrib = (1.0 - interventionLeverage) * ilWeight;

  const totalWeighted = Math.max(0.001, bpContrib + tmContrib + Math.max(0, saContrib) + Math.max(0, ilContrib));

  const bpPct = Math.round((bpContrib / totalWeighted) * 100);
  const tmPct = Math.round((tmContrib / totalWeighted) * 100);
  const saPct = Math.round((Math.max(0, saContrib) / totalWeighted) * 100);
  const ilPct = Math.max(0, 100 - (bpPct + tmPct + saPct));

  // Determine primary risk factors
  const getExplanation = () => {
    if (tbiScore < 0.35) {
      return 'The system resides deep within safe operational boundaries. Low transition velocity and high escape efficiency offer ample resilience buffer.';
    }
    const factors: string[] = [];
    if (bpPct >= 28) factors.push(`critical proximity to operational constraints (${bpPct}% contribution)`);
    if (tmPct >= 25) factors.push(`rapid directional acceleration toward breach planes (${tmPct}% contribution)`);
    if (saPct >= 20) factors.push(`topological graph stress and bottleneck centrality (${saPct}% contribution)`);
    if (ilPct >= 15) factors.push(`depleted intervention leverage and limited affordable escape pathways (${ilPct}% contribution)`);

    return `The system risk elevation (TBI = ${tbiScore.toFixed(2)}) is primarily driven by ${factors.join(', and ')}.`;
  };

  const getStateColor = (st: string) => {
    switch (st) {
      case 'NORMAL': return '#059669';
      case 'WATCH': return '#d97706';
      case 'CRITICAL': return '#f97316';
      case 'TRANSITION': return '#d71921';
      case 'SHOCK': return '#dc2626';
      default: return '#0284c7';
    }
  };

  const stateColor = getStateColor(operationalState);

  return (
    <div style={{
      background: '#111111',
      borderRadius: '8px',
      padding: '24px',
      color: '#ffffff',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="nothing-dot-red" />
          <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.04em', color: '#ffffff' }}>
            TBI DECOMPOSITION
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>REGIME:</span>
          <div style={{
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '12px',
            fontFamily: 'var(--font-data)',
            fontWeight: 700,
            background: `${stateColor}20`,
            color: stateColor,
            border: `1px solid ${stateColor}`
          }}>
            {operationalState}
          </div>
        </div>
      </div>

      {/* Main Score & Bar Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '24px', alignItems: 'center', marginBottom: '20px' }}>
        {/* TBI Main Dial */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '18px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-data)', fontWeight: 600 }}>TBI COMPOSITE</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: stateColor, margin: '8px 0 4px 0', fontFamily: 'var(--font-data)' }}>
            {tbiScore.toFixed(3)}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-data)' }}>Range [0, 1]</div>
        </div>

        {/* Proportional Contribution Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', fontFamily: 'var(--font-data)' }}>
            <span>Boundary Risk Contribution Breakdown</span>
            <span>Sum = 100%</span>
          </div>

          <div style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', gap: '2px', background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ width: `${bpPct}%`, background: '#d71921', transition: 'width 0.3s ease', borderRadius: '8px 0 0 8px' }} title={`Boundary Proximity: ${bpPct}%`} />
            <div style={{ width: `${tmPct}%`, background: '#d97706', transition: 'width 0.3s ease' }} title={`Transition Momentum: ${tmPct}%`} />
            <div style={{ width: `${saPct}%`, background: '#a855f7', transition: 'width 0.3s ease' }} title={`Structural Amplification: ${saPct}%`} />
            <div style={{ width: `${ilPct}%`, background: '#0284c7', transition: 'width 0.3s ease', borderRadius: '0 8px 8px 0' }} title={`Intervention Leverage: ${ilPct}%`} />
          </div>

          {/* Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '14px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#d71921' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-data)' }}>BP: {bpPct}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#d97706' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-data)' }}>TM: {tmPct}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#a855f7' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-data)' }}>SA: {saPct}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#0284c7' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-data)' }}>IL: {ilPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Cards for Core Quantities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #d71921' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-data)', fontWeight: 600, letterSpacing: '0.04em' }}>BOUNDARY PROXIMITY</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '6px', fontFamily: 'var(--font-data)' }}>{boundaryProximity.toFixed(3)}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontFamily: 'var(--font-data)' }}>1 − BTD</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #d97706' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-data)', fontWeight: 600, letterSpacing: '0.04em' }}>TRANSITION MOMENTUM</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '6px', fontFamily: 'var(--font-data)' }}>{transitionMomentum.toFixed(3)}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontFamily: 'var(--font-data)' }}>||v|| × cos(θ)</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-data)', fontWeight: 600, letterSpacing: '0.04em' }}>STRUCTURAL AMPLIFICATION</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '6px', fontFamily: 'var(--font-data)' }}>{structuralAmplification.toFixed(3)}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontFamily: 'var(--font-data)' }}>Topology shock multiplier</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #0284c7' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-data)', fontWeight: 600, letterSpacing: '0.04em' }}>INTERVENTION LEVERAGE</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '6px', fontFamily: 'var(--font-data)' }}>{interventionLeverage.toFixed(3)}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontFamily: 'var(--font-data)' }}>Escape recovery capacity</div>
        </div>
      </div>

      {/* Verbal Explanation Callout */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '14px 18px',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.65)',
        lineHeight: '1.6',
        fontFamily: 'var(--font-body)'
      }}>
        <strong style={{ color: '#0284c7', fontFamily: 'var(--font-heading)' }}>Causal Attribution Analysis: </strong>
        {getExplanation()}
      </div>
    </div>
  );
};
