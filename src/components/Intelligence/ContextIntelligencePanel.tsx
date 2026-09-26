import React, { useState, useEffect } from 'react';
import { NavSection } from '../Navigation/LeftRail';
import { EcosystemNode, CourierTransit, FutureTimelinePlan } from '../../types/aegis';
import { INITIAL_EPISODIC_MEMORIES } from '../../engine/mockData';
import { sound } from '../../engine/soundEffects';
import { DotMatrixText } from '../Common/DotMatrixText';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  Swords,
  GitBranch,
  Database,
  ArrowRight,
  TrendingUp,
  Thermometer,
  ShieldAlert,
  Zap,
  RotateCcw
} from 'lucide-react';

interface ContextIntelligencePanelProps {
  activeSection: NavSection;
  disruptionActive: boolean;
  nodes: EcosystemNode[];
  couriers: CourierTransit[];
  onDeployPlan: (plan: FutureTimelinePlan) => void;
  onTriggerChaos: (type: string) => void;
  onResetChaos: () => void;
  plans: FutureTimelinePlan[];
}

export const ContextIntelligencePanel: React.FC<ContextIntelligencePanelProps> = ({
  activeSection,
  disruptionActive,
  nodes,
  couriers,
  onDeployPlan,
  onTriggerChaos,
  onResetChaos,
  plans
}) => {
  // Countdown timer for 47 minutes during active incident
  const [secondsRemaining, setSecondsRemaining] = useState<number>(47 * 60 + 12);
  const [timelineStep, setTimelineStep] = useState<number>(0);
  const [agentStep, setAgentStep] = useState<number>(3); // 0: Scout, 1: Logistics, 2: Red-Team Challenge, 3: Optimizer Consensus

  useEffect(() => {
    if (!disruptionActive) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [disruptionActive]);

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedPlan = plans.find((p) => p.recommended) || plans[0];

  // --------------------------------------------------------------------------
  // SECTION: AGENT STRATEGIC NETWORK
  // --------------------------------------------------------------------------
  if (activeSection === 'agents') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <span className="tech-label">AUTONOMOUS MULTI-AGENT SWARM</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', color: 'var(--bg-space)', marginTop: '2px' }}>
            STRATEGIC REASONING NETWORK
          </h2>
        </div>

        {/* Globe Hierarchy Visualization */}
        <div
          style={{
            flex: 1,
            background: 'var(--signal-white)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* 1. Commander Overwatch */}
          <div
            style={{
              padding: '6px 14px',
              border: '1px solid var(--signal-cyan)',
              background: 'var(--bg-surface)',
              borderRadius: '2px',
              textAlign: 'center',
              width: '180px'
            }}
          >
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--signal-cyan)' }}>
              OVERWATCH
            </div>
            <div style={{ fontSize: '8px', color: 'var(--signal-text-muted)' }}>Commander Executive</div>
          </div>

          {/* Vertical Link */}
          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-strong)' }} />

          {/* 2. Middle Tier: Scout, Forecast, Logistics */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', width: '100%' }}>
            {[
              { code: 'SCOUT', sub: 'Anomaly Ingest', active: true },
              { code: 'FORECAST', sub: 'Surge + Weather', active: true },
              { code: 'LOGISTICS', sub: 'Route Solver', active: true }
            ].map((ag) => (
              <div
                key={ag.code}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '2px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--bg-space)' }}>
                  {ag.code}
                </div>
                <div style={{ fontSize: '7.5px', color: 'var(--signal-text-muted)' }}>{ag.sub}</div>
              </div>
            ))}
          </div>

          {/* Vertical Link */}
          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-strong)' }} />

          {/* 3. Red Team Adversary - The Critical Challenge Node */}
          <div
            style={{
              padding: '8px 14px',
              border: '1px solid var(--state-red)',
              background: 'rgba(255, 42, 75, 0.08)',
              borderRadius: '2px',
              textAlign: 'center',
              width: '260px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--state-red)' }}>
                NEMESIS-X • RED TEAM
              </span>
            </div>
            <div style={{ fontSize: '8.5px', color: '#ff8090', marginTop: '2px', fontFamily: 'var(--font-data)' }}>
              PLAN A CHALLENGED: ROUTE 2 FLOOD RISK (+40 MIN)
            </div>
          </div>

          {/* Vertical Link */}
          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-strong)' }} />

          {/* 4. Optimizer Agent - The Solution Node */}
          <div
            style={{
              padding: '8px 14px',
              border: '1px solid var(--state-green)',
              background: 'rgba(0, 229, 153, 0.08)',
              borderRadius: '2px',
              textAlign: 'center',
              width: '260px'
            }}
          >
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--state-green)' }}>
              NEXUS-9 • PARETO OPTIMIZER
            </div>
            <div style={{ fontSize: '8.5px', color: '#80ffcc', marginTop: '2px', fontFamily: 'var(--font-data)' }}>
              CONSENSUS: 60/40 SPLIT (110 QUAD / 74 SHELTER)
            </div>
          </div>

          {/* Vertical Link */}
          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-strong)' }} />

          {/* 5. Safety & Constraint Lock */}
          <div
            style={{
              padding: '6px 14px',
              border: '1px solid var(--border-muted)',
              background: 'var(--bg-surface)',
              borderRadius: '2px',
              textAlign: 'center',
              width: '180px'
            }}
          >
            <div style={{ fontSize: '9px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--bg-space)' }}>
              AEGIS-SAFE
            </div>
            <div style={{ fontSize: '8px', color: 'var(--state-green)' }}>✓ 25 MIN SAFETY MARGIN</div>
          </div>
        </div>

        {/* Live Swarm Consensus Banner */}
        <div
          style={{
            background: 'var(--signal-white)',
            border: '1px solid var(--border-subtle)',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div className="tech-label">SWARM CONSENSUS CONFIDENCE</div>
            <div style={{ fontSize: '14px', fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--signal-cyan)' }}>
              94.2% MATHEMATICAL AGREEMENT
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tech-label">EXPECTED RESCUE</div>
            <div style={{ fontSize: '14px', fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--state-green)' }}>
              94.6%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SECTION: FUTURE LAB (PARALLEL TIMELINES)
  // --------------------------------------------------------------------------
  if (activeSection === 'futures') {
    const timelineLabels = ['T+0', 'T+15', 'T+30', 'T+45 (BIO HAZARD)', 'T+60'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <span className="tech-label">PARALLEL WHAT-IF LAB</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', color: 'var(--bg-space)', marginTop: '2px' }}>
            BRANCHING TIMELINES
          </h2>
        </div>

        {/* Temporal Scrubber */}
        <div
          style={{
            background: 'var(--signal-white)',
            border: '1px solid var(--border-subtle)',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="tech-label">TEMPORAL PROJECTION HORIZON</span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', fontWeight: 700, color: timelineStep === 3 ? 'var(--state-red)' : 'var(--signal-cyan)' }}>
              {timelineLabels[timelineStep]}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={timelineStep}
            onChange={(e) => setTimelineStep(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--signal-cyan)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-dim)' }}>
            <span>T+0m</span>
            <span>T+15m</span>
            <span>T+30m</span>
            <span style={{ color: 'var(--state-red)' }}>T+45m</span>
            <span>T+60m</span>
          </div>
        </div>

        {/* Trajectory Comparison Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {plans.map((p) => {
            const isDoNothing = p.id === 'do_nothing';
            return (
              <div
                key={p.id}
                style={{
                  background: 'var(--signal-white)',
                  border: `1px solid ${p.recommended ? 'var(--state-green)' : isDoNothing ? 'var(--state-red)' : 'var(--border-muted)'}`,
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: 'var(--bg-space)' }}>
                    {p.title}
                  </span>
                  <span
                    style={{
                      fontSize: '8px',
                      fontFamily: 'var(--font-data)',
                      color: isDoNothing ? 'var(--state-red)' : 'var(--state-green)',
                      fontWeight: 700
                    }}
                  >
                    {isDoNothing ? 'CRITICAL RISK' : 'SWARM CONSENSUS'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '4px',
                    background: 'var(--bg-surface)',
                    padding: '6px',
                    fontSize: '9px',
                    fontFamily: 'var(--font-data)'
                  }}
                >
                  <div>
                    <div className="tech-label">WASTE</div>
                    <div style={{ color: p.wastePercent > 10 ? 'var(--state-red)' : 'var(--state-green)', fontWeight: 700 }}>
                      {p.wastePercent}%
                    </div>
                  </div>
                  <div>
                    <div className="tech-label">RESCUE</div>
                    <div style={{ color: p.rescuePercent > 80 ? 'var(--state-green)' : 'var(--state-amber)', fontWeight: 700 }}>
                      {p.rescuePercent}%
                    </div>
                  </div>
                  <div>
                    <div className="tech-label">COST</div>
                    <div style={{ color: 'var(--bg-space)' }}>
                      ₹{(p.costINR / 1000).toFixed(1)}k
                    </div>
                  </div>
                  <div>
                    <div className="tech-label">CO2e</div>
                    <div style={{ color: 'var(--signal-cyan)' }}>
                      +{p.co2SavedKg}kg
                    </div>
                  </div>
                </div>

                {p.recommended && (
                  <button
                    onClick={() => onDeployPlan(p)}
                    style={{
                      background: 'var(--state-green)',
                      border: 'none',
                      color: 'var(--bg-space)',
                      fontFamily: 'var(--font-data)',
                      fontWeight: 700,
                      fontSize: '10px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    AUTHORIZE & DISPATCH THIS TRAJECTORY
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SECTION: MEMORY (FLIGHT RECORDER VAULT)
  // --------------------------------------------------------------------------
  if (activeSection === 'memory') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <span className="tech-label">BLACK-BOX FLIGHT RECORDER</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', color: 'var(--bg-space)', marginTop: '2px' }}>
            AEGIS MEMORY VAULT
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
          {INITIAL_EPISODIC_MEMORIES.map((m) => (
            <div
              key={m.id}
              style={{
                background: 'var(--signal-white)',
                border: '1px solid var(--border-muted)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--signal-cyan)' }}>
                  {m.incidentCode}
                </span>
                <span style={{ fontSize: '8px', fontFamily: 'var(--font-data)', color: 'var(--signal-text-muted)' }}>
                  {m.recordedDate}
                </span>
              </div>

              <div style={{ fontSize: '10px', color: 'var(--bg-space)', lineHeight: '1.4' }}>
                {m.trigger}
              </div>

              {/* Error Delta Meter */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                  background: 'var(--bg-surface)',
                  padding: '6px',
                  fontFamily: 'var(--font-data)',
                  fontSize: '9px'
                }}
              >
                <div>
                  <span className="tech-label">PREDICTED</span>
                  <div style={{ color: 'var(--bg-space)' }}>{m.predictedRecoveryTime}</div>
                </div>
                <div>
                  <span className="tech-label">ACTUAL</span>
                  <div style={{ color: 'var(--bg-space)' }}>{m.actualRecoveryTime}</div>
                </div>
                <div>
                  <span className="tech-label">ERROR</span>
                  <div style={{ color: 'var(--state-amber)' }}>+7m (LATENCY)</div>
                </div>
              </div>

              <div style={{ fontSize: '9px', color: 'var(--state-green)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                <strong>LESSON LEARNED:</strong> {m.lessonLearned}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SECTION: MISSION / WORLD (PRIMARY CONTEXTUAL DECK)
  // --------------------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* Deck Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <span className="tech-label">
          {disruptionActive ? 'CRITICAL INCIDENT ACTIVE' : 'SYSTEM SURVEILLANCE'}
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '15px',
            color: disruptionActive ? 'var(--state-red)' : 'var(--signal-white)',
            marginTop: '2px'
          }}
        >
          {disruptionActive ? 'ACTIVE INCIDENT DOSSIER' : 'OPERATIONAL INTELLIGENCE'}
        </h2>
      </div>

      {disruptionActive ? (
        /* ACTIVE INCIDENT STORY (UNIFIED, CINEMATIC, COHERENT) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
          {/* 1. Large Incident Title & Massive Countdown */}
          <div
            style={{
              background: 'var(--signal-white)',
              border: '1px solid var(--state-red)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
            className="critical-pulse"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="tech-label" style={{ color: 'var(--state-red)' }}>
                CASCADE ANOMALY
              </span>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-data)', color: 'var(--state-red)' }}>
                DEPOT CHILLER #3 BLOWOUT
              </span>
            </div>

            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--bg-space)' }}>
              PERISHABILITY CASCADE
            </div>

            {/* Massive Nothing OS Dot-Matrix Countdown */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
              <DotMatrixText
                text={formatCountdown(secondsRemaining)}
                size={34}
                color="var(--nothing-red-bright)"
              />
              <span className="tech-label" style={{ color: 'var(--signal-text-muted)' }}>
                UNTIL MANDATORY CONDEMNATION
              </span>
            </div>

            {/* Affected Inventory */}
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--bg-space)',
                marginTop: '4px'
              }}
            >
              184 MEALS AT IMMEDIATE RISK
            </div>
          </div>

          {/* 2. Cause Breakdown */}
          <div
            style={{
              background: 'var(--signal-white)',
              border: '1px solid var(--border-subtle)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <span className="tech-label">ROOT CAUSE DETERMINATION</span>
            <div style={{ fontSize: '11px', color: 'var(--bg-space)' }}>
              Ammonia Compressor #3 circuit dropped offline. Internal thermal envelope climbed to{' '}
              <strong style={{ color: 'var(--state-red)' }}>+7.4°C</strong>.
            </div>
          </div>

          {/* 3. Cascade Chain */}
          <div
            style={{
              background: 'var(--signal-white)',
              border: '1px solid var(--border-subtle)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <span className="tech-label">CAUSAL CASCADE VECTORS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-data)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bg-space)' }}>
                <span>• Thermal Rise Velocity</span>
                <span style={{ color: 'var(--state-red)' }}>+0.42°C/min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bg-space)' }}>
                <span>• Spoilage Probability</span>
                <span style={{ color: 'var(--state-red)' }}>89.4% (at T+47m)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--bg-space)' }}>
                <span>• Arterial Route 2 Status</span>
                <span style={{ color: 'var(--state-amber)' }}>WATERLOGGED (AVOID)</span>
              </div>
            </div>
          </div>

          {/* 4. Commander Action Docket */}
          <div
            style={{
              background: 'var(--signal-white)',
              border: '1px solid var(--signal-cyan)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="tech-label" style={{ color: 'var(--signal-cyan)' }}>
                RECOMMENDED RESPONSE ACTION
              </span>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-data)', color: 'var(--state-green)', fontWeight: 700 }}>
                CONFIDENCE: 94.2%
              </span>
            </div>

            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--bg-space)' }}>
              DUAL-SPLIT RESCUE DISPATCH
            </div>

            <div style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--bg-space)', lineHeight: '1.4' }}>
              • 110 Meals → Tech Quad via High-Elevation Bypass (ETA 22 min)
              <br />
              • 74 Meals → Annapoorna Shelter via Ring Road (ETA 16 min)
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                background: 'var(--bg-surface)',
                padding: '6px',
                fontSize: '9px',
                fontFamily: 'var(--font-data)'
              }}
            >
              <div>
                <span className="tech-label">RESCUE</span>
                <div style={{ color: 'var(--state-green)', fontWeight: 700 }}>94.6%</div>
              </div>
              <div>
                <span className="tech-label">WASTE</span>
                <div style={{ color: 'var(--state-green)', fontWeight: 700 }}>1.8%</div>
              </div>
              <div>
                <span className="tech-label">SAFETY GAP</span>
                <div style={{ color: 'var(--signal-cyan)', fontWeight: 700 }}>+25 MIN</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button
                onClick={() => onDeployPlan(selectedPlan)}
                style={{
                  flex: 1,
                  background: 'var(--state-green)',
                  border: 'none',
                  color: 'var(--bg-space)',
                  fontFamily: 'var(--font-data)',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={14} />
                APPROVE & DISPATCH
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL OPERATIONAL INTELLIGENCE STREAM */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
          {/* Ecosystem Capacity Summary */}
          <div
            style={{
              background: 'var(--signal-white)',
              border: '1px solid var(--border-subtle)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <span className="tech-label">ECOSYSTEM SURVEILLANCE</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '22px', fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--bg-space)' }}>
                {nodes.reduce((acc, n) => acc + n.inventoryMeals, 0).toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--state-green)' }}>
                98.2% SENSOR ACCURACY
              </span>
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--signal-text-muted)' }}>
              Active storage across 6 monitored regional facilities.
            </div>
          </div>

          {/* Active Fleet Courier Telemetry */}
          <div
            style={{
              background: 'var(--signal-white)',
              border: '1px solid var(--border-subtle)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <span className="tech-label">LOGISTICS FLEET CORRIDORS</span>
            {couriers.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-data)',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '4px'
                }}
              >
                <div>
                  <div style={{ color: 'var(--bg-space)', fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: '8px', color: 'var(--signal-text-muted)' }}>{c.cargoType}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--signal-cyan)' }}>{c.cargoMeals} meals</div>
                  <div style={{ fontSize: '8px', color: 'var(--signal-text-muted)' }}>ETA {c.etaMinutes}m</div>
                </div>
              </div>
            ))}
          </div>

          {/* Cafeteria Computer Vision Intake Status */}
          <div
            style={{
              background: 'var(--signal-white)',
              border: '1px solid var(--border-subtle)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <span className="tech-label">CAMPUS VISION ACCELEROMETER</span>
            <div style={{ fontSize: '11px', color: 'var(--bg-space)' }}>
              Tech Quad Cafeteria crowd intake steady at <strong>127 students</strong>. Velocity nominal.
            </div>
            <div style={{ fontSize: '9px', fontFamily: 'var(--font-data)', color: 'var(--state-green)' }}>
              ✓ ZERO DISRUPTION DETECTED
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
