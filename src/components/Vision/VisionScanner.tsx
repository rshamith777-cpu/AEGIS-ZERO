import React, { useState } from 'react';
import { CVPlateAnalysis } from '../../types/aegis';
import { Camera, Eye, AlertCircle, Scan, TrendingUp, Thermometer, Activity } from 'lucide-react';
import { DotMatrixText } from '../Common/DotMatrixText';

interface VisionScannerProps {
  cvData: CVPlateAnalysis;
  disruptionActive: boolean;
}

export const VisionScanner: React.FC<VisionScannerProps> = ({ cvData, disruptionActive }) => {
  const [activeCam, setActiveCam] = useState<'cam1' | 'cam2' | 'cam3'>('cam1');
  const [selectedReading, setSelectedReading] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scan size={18} color="var(--signal-white)" />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--signal-white)', fontFamily: 'var(--font-heading)' }}>
            AUTONOMOUS VISION TRACKER
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['cam1', 'cam2', 'cam3'] as const).map((cam, idx) => (
            <button
              key={cam}
              onClick={() => setActiveCam(cam)}
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-data)',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '4px',
                border: activeCam === cam ? '1px solid var(--signal-white)' : '1px solid var(--border-subtle)',
                background: activeCam === cam ? 'var(--signal-white)' : 'var(--bg-elevated)',
                color: activeCam === cam ? 'var(--bg-surface)' : 'var(--signal-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              CAM-0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Live Viewport */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: '300px',
          background: activeCam === 'cam2' && disruptionActive ? 'var(--nothing-red-dim)' : 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.02)'
        }}
      >
        {/* Subtle dot pattern background for camera lens effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.5,
            pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--border-muted) 1px, transparent 0)',
            backgroundSize: '12px 12px'
          }}
        />

        {/* Corner viewfinder brackets */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', width: '20px', height: '20px', borderTop: '2px solid var(--signal-white)', borderLeft: '2px solid var(--signal-white)' }} />
        <div style={{ position: 'absolute', top: '16px', right: '16px', width: '20px', height: '20px', borderTop: '2px solid var(--signal-white)', borderRight: '2px solid var(--signal-white)' }} />
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '20px', height: '20px', borderBottom: '2px solid var(--signal-white)', borderLeft: '2px solid var(--signal-white)' }} />
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '20px', height: '20px', borderBottom: '2px solid var(--signal-white)', borderRight: '2px solid var(--signal-white)' }} />

        {/* Scan line effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--nothing-red), transparent)',
            opacity: 0.6,
            animation: 'scanline 4s linear infinite', pointerEvents: 'none'
          }}
        />

        {/* Viewport Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-overlay)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--nothing-red)', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', color: 'var(--signal-white)', fontWeight: 700, letterSpacing: '0.05em' }}>
              REC • {activeCam === 'cam1' ? 'QUAD_INTAKE_01' : activeCam === 'cam2' ? 'DEPOT_THERMAL_02' : 'BATCH_KITCHEN_03'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-overlay)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-muted)' }}>
              LAST FRAME: {cvData.lastScanTime}
            </span>
          </div>
        </div>

        {/* Viewport Center Bounding Boxes / HUD */}
        <div style={{ position: 'relative', flex: 1, margin: '16px 0', zIndex: 2 }}>
          {activeCam === 'cam1' && (
            <>
              {/* Bounding box 1 */}
              <div
                onClick={() => setSelectedReading(selectedReading === 'bb1' ? null : 'bb1')}
                style={{
                  position: 'absolute',
                  top: '10%',
                  left: '10%',
                  width: '35%',
                  height: '50%',
                  border: selectedReading === 'bb1' ? '2px solid var(--nothing-red)' : '1px dashed var(--border-strong)',
                  background: selectedReading === 'bb1' ? 'var(--nothing-red-dim)' : 'rgba(0,0,0,0.02)',
                  padding: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--bg-surface)', background: selectedReading === 'bb1' ? 'var(--nothing-red)' : 'var(--signal-white)', padding: '2px 8px', width: 'fit-content', fontWeight: 600 }}>
                  STEAM TABLE #2 • 98.2%
                </div>
                {selectedReading === 'bb1' && (
                  <div style={{ marginTop: '8px', fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--signal-white)', background: 'var(--bg-overlay)', padding: '8px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <strong>ALERT:</strong> Thermal variance detected. Core temp elevated by 1.2°C.
                  </div>
                )}
              </div>

              {/* Bounding box 2 */}
              <div
                onClick={() => setSelectedReading(selectedReading === 'bb2' ? null : 'bb2')}
                style={{
                  position: 'absolute',
                  top: '25%',
                  right: '10%',
                  width: '35%',
                  height: '45%',
                  border: selectedReading === 'bb2' ? '2px solid var(--signal-white)' : '1px dashed var(--border-strong)',
                  background: selectedReading === 'bb2' ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)',
                  padding: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--bg-surface)', background: 'var(--signal-white)', padding: '2px 8px', width: 'fit-content', fontWeight: 600 }}>
                  DISCARD CHUTE: 4.2%
                </div>
                {selectedReading === 'bb2' && (
                  <div style={{ marginTop: '8px', fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--signal-text-muted)', background: 'var(--bg-overlay)', padding: '8px', border: '1px solid var(--border-subtle)' }}>
                    Discard rate within nominal threshold limits. No anomaly detected.
                  </div>
                )}
              </div>
            </>
          )}

          {activeCam === 'cam2' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <div
                onClick={() => setSelectedReading(selectedReading === 'cam2-temp' ? null : 'cam2-temp')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 24px',
                  background: 'var(--bg-elevated)',
                  border: disruptionActive ? '2px solid var(--nothing-red)' : '1px solid var(--border-strong)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transform: selectedReading === 'cam2-temp' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s',
                  boxShadow: disruptionActive ? '0 8px 30px rgba(215,25,33,0.15)' : '0 4px 15px rgba(0,0,0,0.05)'
                }}
              >
                <Thermometer size={24} color={disruptionActive ? 'var(--nothing-red)' : 'var(--signal-white)'} />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--signal-text-dim)', fontFamily: 'var(--font-data)', letterSpacing: '0.1em' }}>CHILLER #3 CORE TEMP</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-data)', color: disruptionActive ? 'var(--nothing-red)' : 'var(--signal-white)' }}>
                    {disruptionActive ? '+7.4°C [CRITICAL]' : '-18.2°C [STABLE]'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-data)', color: disruptionActive ? 'var(--nothing-red)' : 'var(--signal-text-muted)', fontWeight: 600 }}>
                {disruptionActive ? '⚠️ SPOILAGE CASCADE DETECTED: 184 MEALS AT RISK' : 'THERMAL ENVELOPE VERIFIED (NOMINAL)'}
              </div>
              {selectedReading === 'cam2-temp' && (
                <div style={{ padding: '12px 16px', background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--signal-text-muted)', textAlign: 'center', maxWidth: '80%' }}>
                  <strong>DIAGNOSTIC RUNNING:</strong> Estimated 47 minutes until irreversible bacterial log-growth threshold is reached across all stored batches. Immediate diversion recommended.
                </div>
              )}
            </div>
          )}

          {activeCam === 'cam3' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', minWidth: '60%' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-dim)' }}>CONVEYOR BATCH LINE</span>
                <span style={{ fontSize: '14px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--state-green)' }}>140 MEALS/HR</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', minWidth: '60%' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-dim)' }}>ACTIVE BATCH</span>
                <span style={{ fontSize: '14px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--signal-white)' }}>B-488 (High Protein Khichdi)</span>
              </div>
            </div>
          )}
        </div>

        {/* Viewport Bottom Ticker: Crowd Acceleration */}
        <div
          style={{
            background: 'var(--bg-overlay)',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            fontFamily: 'var(--font-data)',
            zIndex: 2,
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp size={14} color="var(--signal-white)" />
            <span style={{ color: 'var(--signal-text-dim)' }}>CROWD DELTA:</span>
            <span style={{ color: 'var(--signal-text-muted)' }}>T-10m: {cvData.crowdCountTMinus10}</span>
            <span style={{ color: 'var(--signal-text-muted)' }}>→ T-5m: {cvData.crowdCountTMinus5}</span>
            <span style={{ color: 'var(--signal-white)', fontWeight: 700 }}>→ NOW: {disruptionActive ? 186 : cvData.crowdCountNow}</span>
          </div>
          <span
            style={{
              color: disruptionActive ? 'var(--nothing-red)' : 'var(--signal-white)',
              fontWeight: 700,
              background: disruptionActive ? 'var(--nothing-red-dim)' : 'var(--bg-surface)',
              border: `1px solid ${disruptionActive ? 'var(--nothing-red)' : 'var(--border-strong)'}`,
              padding: '4px 10px',
              borderRadius: '2px'
            }}
          >
            {disruptionActive ? 'VELOCITY: +18.4/min (SURGE)' : 'STEADY INFLOW (NOMINAL)'}
          </span>
        </div>
      </div>
    </div>
  );
};
