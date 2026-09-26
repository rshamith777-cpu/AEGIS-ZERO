import React, { useMemo } from 'react';
import { Target, GitBranch } from './icons';
import { AlertCircle, ShieldCheck } from 'lucide-react';

interface BoundaryRayInfo {
  directionName: string;
  distance: number;
  breached: boolean;
  binarySearchIterations: number;
}

interface BoundaryRadarProps {
  btd: number;
  dominantDirectionName: string;
  testedRays: BoundaryRayInfo[];
  raysEvaluatedCount: number;
  breachedRaysCount: number;
  uncertainty: number;
}

export const BoundaryRadar: React.FC<BoundaryRadarProps> = ({
  btd,
  dominantDirectionName,
  testedRays,
  raysEvaluatedCount,
  breachedRaysCount,
  uncertainty
}) => {
  // SVG Radar Dimensions
  const size = 340;
  const center = size / 2;
  const maxRadius = center - 30;

  // Calculate ray coordinates
  const rayCoords = useMemo(() => {
    if (!testedRays || testedRays.length === 0) return [];
    const count = testedRays.length;
    return testedRays.map((ray, index) => {
      const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
      const normalizedDist = Math.min(1.0, Math.max(0.1, ray.distance));
      const r = normalizedDist * maxRadius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      const isDominant = ray.directionName === dominantDirectionName;

      return {
        ...ray,
        x,
        y,
        angle,
        radius: r,
        isDominant
      };
    });
  }, [testedRays, dominantDirectionName, maxRadius, center]);

  const breachRatio = raysEvaluatedCount > 0 ? breachedRaysCount / raysEvaluatedCount : 0;
  const riskColor = btd < 0.25 ? '#d71921' : btd < 0.5 ? '#d97706' : '#059669';

  return (
    <div style={{
      background: '#111111',
      borderRadius: '8px',
      padding: '24px',
      color: '#ffffff',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="nothing-dot-red" />
          <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.04em', color: '#ffffff' }}>
            BTD RADAR
          </h3>
        </div>
        <div style={{
          borderRadius: '999px',
          padding: '4px 12px',
          fontSize: '12px',
          fontFamily: 'var(--font-data)',
          fontWeight: 700,
          background: riskColor === '#d71921' ? 'rgba(215,25,33,0.15)' : riskColor === '#d97706' ? 'rgba(217,119,6,0.15)' : 'rgba(5,150,105,0.15)',
          color: riskColor,
          border: `1px solid ${riskColor}`
        }}>
          BTD = {btd.toFixed(3)}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
        {/* Radar SVG Canvas */}
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ overflow: 'visible' }}>
            {/* Concentric Safety Rings */}
            {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={frac * maxRadius}
                fill="none"
                stroke={idx === 0 ? 'rgba(215, 25, 33, 0.4)' : 'rgba(255, 255, 255, 0.1)'}
                strokeWidth={idx === 0 ? '1.5' : '1'}
                strokeDasharray={idx === 0 ? '4 2' : undefined}
              />
            ))}

            {/* Radar Crosshairs */}
            <line x1={center} y1={20} x2={center} y2={size - 20} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1={20} y1={center} x2={size - 20} y2={center} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* Boundary Uncertainty Envelope */}
            <circle
              cx={center}
              cy={center}
              r={Math.max(10, (btd + uncertainty) * maxRadius)}
              fill="rgba(2, 132, 199, 0.08)"
              stroke="rgba(2, 132, 199, 0.3)"
              strokeDasharray="3 3"
            />

            {/* Tested Ray Vectors */}
            {rayCoords.map((ray, i) => (
              <g key={i}>
                <line
                  x1={center}
                  y1={center}
                  x2={ray.x}
                  y2={ray.y}
                  stroke={ray.isDominant ? '#ff2a4b' : ray.breached ? 'rgba(217, 119, 6, 0.7)' : 'rgba(2, 132, 199, 0.4)'}
                  strokeWidth={ray.isDominant ? 2.5 : 1.2}
                />
                <circle
                  cx={ray.x}
                  cy={ray.y}
                  r={ray.isDominant ? 5 : 3.5}
                  fill={ray.isDominant ? '#ff2a4b' : ray.breached ? '#d97706' : '#0284c7'}
                  stroke="#111111"
                  strokeWidth={1.5}
                />
              </g>
            ))}

            {/* Center State Point */}
            <circle cx={center} cy={center} r={6} fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          </svg>

          {/* Radar Labels */}
          <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-data)', letterSpacing: '0.06em' }}>
            NORTH
          </div>
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-data)', letterSpacing: '0.06em' }}>
            SOUTH
          </div>
        </div>

        {/* Instrumentation Readout Panel */}
        <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-data)', fontWeight: 600 }}>DOMINANT HAZARD DIRECTION</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ff2a4b', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>{dominantDirectionName}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontFamily: 'var(--font-data)' }}>Empirical Search Ray with Minimal Breach Distance</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', fontFamily: 'var(--font-data)', fontWeight: 600 }}>RAYS TESTED</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{raysEvaluatedCount}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', fontFamily: 'var(--font-data)', fontWeight: 600 }}>RAYS BREACHED</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: breachedRaysCount > 0 ? '#d97706' : '#059669', marginTop: '4px' }}>
                {breachedRaysCount} ({((breachRatio) * 100).toFixed(0)}%)
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', fontFamily: 'var(--font-data)', fontWeight: 600 }}>UNCERTAINTY</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>±{(uncertainty).toFixed(3)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', fontFamily: 'var(--font-data)', fontWeight: 600 }}>METHOD</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>Guided Binary Ray</div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.5', fontFamily: 'var(--font-data)' }}>
            * BTD = normalized L₂ distance from current state to closest operational constraint breach along empirically guided directional rays.
          </div>
        </div>
      </div>
    </div>
  );
};
