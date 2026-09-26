import React, { useState } from 'react';
import { FutureTimelinePlan } from '../../types/aegis';
import { sound } from '../../engine/soundEffects';
import { GitBranch, CheckCircle2, ShieldCheck, Zap, TrendingUp, Package, Clock, Globe } from 'lucide-react';

interface FutureLabProps {
  plans: FutureTimelinePlan[];
  activePlanId: string;
  onDeployPlan: (plan: FutureTimelinePlan) => void;
  disruptionActive: boolean;
}

export const FutureLab: React.FC<FutureLabProps> = ({
  plans,
  activePlanId,
  onDeployPlan,
  disruptionActive
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || 'plan_a');
  const [timelineStep, setTimelineStep] = useState<number>(0);
  const [deployedPlanId, setDeployedPlanId] = useState<string | null>(null);

  const timelineLabels = ['T+0m (Now)', 'T+15m', 'T+30m', 'T+47m (CRITICAL)', 'T+60m'];
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Sync timeline slider with selected plan
  React.useEffect(() => {
    if (plans && plans.length > timelineStep) {
      const planAtStep = plans[timelineStep];
      if (planAtStep && planAtStep.id !== selectedPlanId) {
        setSelectedPlanId(planAtStep.id);
      }
    }
  }, [timelineStep, plans]);

  const handleDeploy = (plan: FutureTimelinePlan) => {
    sound.playDeployChord();
    setDeployedPlanId(plan.id);
    onDeployPlan(plan);
  };

  const getRiskBadge = (risk: FutureTimelinePlan['riskRating']) => {
    switch (risk) {
      case 'OPTIMAL':
        return { bg: 'rgba(5, 150, 105, 0.15)', border: 'var(--state-green)', color: 'var(--state-green)', label: '● OPTIMAL' };
      case 'LOW':
        return { bg: 'rgba(5, 150, 105, 0.1)', border: 'var(--state-green)', color: 'var(--state-green)', label: '● LOW RISK' };
      case 'MODERATE':
        return { bg: 'rgba(217, 119, 6, 0.12)', border: 'var(--state-amber)', color: 'var(--state-amber)', label: '◐ MODERATE' };
      case 'CRITICAL':
      default:
        return { bg: 'rgba(215, 25, 33, 0.12)', border: 'var(--nothing-red)', color: 'var(--nothing-red)', label: '◉ CRITICAL' };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '20px',
      backgroundColor: 'var(--bg-space)',
      padding: '4px 0'
    }}>

      {/* ──── HEADER ──── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GitBranch size={16} color="#ffffff" />
          </div>
          <div>
            <span style={{
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#111111',
              fontFamily: 'var(--font-heading)',
              display: 'block'
            }}>
              FUTURE LAB
            </span>
            <span style={{
              fontSize: '10px',
              color: 'var(--signal-text-muted)',
              fontFamily: 'var(--font-data)',
              letterSpacing: '0.04em'
            }}>
              PARALLEL TIMELINE SIMULATOR
            </span>
          </div>
        </div>
        <div className="nothing-badge">
          MONTE CARLO · N=10,000
        </div>
      </div>

      {/* ──── TEMPORAL PROJECTION SLIDER ──── */}
      <div style={{
        background: '#111111',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          fontFamily: 'var(--font-data)',
          color: 'rgba(255,255,255,0.5)'
        }}>
          <span style={{ letterSpacing: '0.08em' }}>TEMPORAL PROJECTION</span>
          <span style={{
            color: timelineStep === 3 ? '#ff2a4b' : '#ffffff',
            fontWeight: 700,
            fontSize: '12px'
          }}>
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
          style={{
            width: '100%',
            accentColor: timelineStep === 3 ? '#ff2a4b' : '#ffffff',
            cursor: 'pointer',
            height: '4px',
            background: 'rgba(255,255,255,0.15)',
            outline: 'none',
            borderRadius: '2px'
          }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '9px',
          fontFamily: 'var(--font-data)',
          color: 'rgba(255,255,255,0.35)',
          marginTop: '2px'
        }}>
          <span style={{ color: timelineStep >= 0 ? 'rgba(255,255,255,0.8)' : 'inherit' }}>NOW</span>
          <span style={{ color: timelineStep >= 1 ? 'rgba(255,255,255,0.8)' : 'inherit' }}>+15m</span>
          <span style={{ color: timelineStep >= 2 ? 'rgba(255,255,255,0.8)' : 'inherit' }}>+30m</span>
          <span style={{ color: '#ff2a4b', fontWeight: 700 }}>+47m ⚠</span>
          <span style={{ color: timelineStep >= 4 ? 'rgba(255,255,255,0.8)' : 'inherit' }}>+60m</span>
        </div>
      </div>

      {/* ──── PLAN SELECTION CARDS ──── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`,
        gap: '14px'
      }}>
        {plans.map((p) => {
          const isSelected = p.id === selectedPlanId;
          const isDeployed = p.id === deployedPlanId;
          const badge = getRiskBadge(p.riskRating);

          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              style={{
                background: isSelected ? '#111111' : 'var(--bg-elevated)',
                border: isSelected ? '2px solid #111111' : '1px solid var(--border-muted)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              {/* Recommended Tag */}
              {p.recommended && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '12px',
                  background: 'var(--state-green)',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-data)',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  letterSpacing: '0.06em'
                }}>
                  ✦ SWARM CONSENSUS
                </div>
              )}

              {/* Deployed indicator */}
              {isDeployed && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '12px',
                  background: 'var(--signal-cyan)',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-data)',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  letterSpacing: '0.06em'
                }}>
                  ✓ DEPLOYED
                </div>
              )}

              {/* Title + Risk Badge */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isSelected ? '#ffffff' : '#111111',
                    fontFamily: 'var(--font-heading)',
                    lineHeight: '1.3'
                  }}>
                    {p.title}
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-data)',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.02em'
                  }}>
                    {badge.label}
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--signal-text-muted)',
                  marginTop: '6px',
                  lineHeight: '1.5',
                  fontFamily: 'var(--font-body)'
                }}>
                  {p.tagline}
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: isSelected ? 'rgba(255,255,255,0.08)' : 'var(--bg-surface)',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-data)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: isSelected ? 'rgba(255,255,255,0.4)' : 'var(--signal-text-dim)', fontSize: '10px' }}>WASTE</span>
                  <strong style={{ color: p.wastePercent > 10 ? 'var(--nothing-red)' : 'var(--state-green)', marginLeft: 'auto' }}>
                    {p.wastePercent}%
                  </strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: isSelected ? 'rgba(255,255,255,0.4)' : 'var(--signal-text-dim)', fontSize: '10px' }}>RESCUE</span>
                  <strong style={{ color: p.rescuePercent > 85 ? 'var(--state-green)' : 'var(--state-amber)', marginLeft: 'auto' }}>
                    {p.rescuePercent}%
                  </strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: isSelected ? 'rgba(255,255,255,0.4)' : 'var(--signal-text-dim)', fontSize: '10px' }}>COST</span>
                  <span style={{ color: isSelected ? '#ffffff' : '#111111', fontWeight: 600, marginLeft: 'auto' }}>
                    ₹{(p.costINR / 1000).toFixed(1)}k
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: isSelected ? 'rgba(255,255,255,0.4)' : 'var(--signal-text-dim)', fontSize: '10px' }}>CO₂e</span>
                  <span style={{ color: 'var(--state-green)', fontWeight: 600, marginLeft: 'auto' }}>
                    +{p.co2SavedKg}kg
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ──── SELECTED PLAN ACTION BLUEPRINT ──── */}
      {selectedPlan && (
        <div style={{
          background: '#111111',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Blueprint Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="#059669" />
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.04em'
              }}>
                ACTION BLUEPRINT: {selectedPlan.title.toUpperCase()}
              </span>
            </div>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-data)',
              color: '#059669',
              fontWeight: 600,
              background: 'rgba(5, 150, 105, 0.12)',
              padding: '4px 10px',
              borderRadius: '999px',
              letterSpacing: '0.04em'
            }}>
              TARGET: {selectedPlan.divertedTo}
            </span>
          </div>

          {/* Dispatch Details Row */}
          <div style={{
            display: 'flex',
            gap: '20px',
            fontSize: '11px',
            fontFamily: 'var(--font-data)',
            color: 'rgba(255,255,255,0.5)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '12px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Package size={12} color="rgba(255,255,255,0.4)" />
              {selectedPlan.vehiclesAssigned} vehicles
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} color="rgba(255,255,255,0.4)" />
              {selectedPlan.transitMinutes} min transit
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Globe size={12} color="rgba(255,255,255,0.4)" />
              {selectedPlan.co2SavedKg}kg CO₂ saved
            </span>
          </div>

          {/* Action Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedPlan.dispatchSteps.map((step, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.5'
              }}>
                <span style={{
                  color: 'var(--nothing-red)',
                  fontFamily: 'var(--font-data)',
                  fontWeight: 700,
                  fontSize: '11px',
                  minWidth: '24px'
                }}>
                  0{idx + 1}.
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          {/* ──── COMMANDER DEPLOY BUTTON ──── */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => handleDeploy(selectedPlan)}
              disabled={deployedPlanId === selectedPlan.id}
              style={{
                flex: 1,
                background: deployedPlanId === selectedPlan.id
                  ? 'rgba(5, 150, 105, 0.2)'
                  : selectedPlan.id === 'do_nothing'
                    ? 'var(--nothing-red)'
                    : '#ffffff',
                border: deployedPlanId === selectedPlan.id
                  ? '1px solid var(--state-green)'
                  : 'none',
                borderRadius: '999px',
                padding: '14px 24px',
                color: deployedPlanId === selectedPlan.id
                  ? 'var(--state-green)'
                  : selectedPlan.id === 'do_nothing'
                    ? '#ffffff'
                    : '#111111',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.05em',
                cursor: deployedPlanId === selectedPlan.id ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: deployedPlanId === selectedPlan.id
                  ? 'none'
                  : selectedPlan.id === 'do_nothing'
                    ? '0 4px 20px rgba(215, 25, 33, 0.4)'
                    : '0 4px 20px rgba(255,255,255,0.15)',
                opacity: deployedPlanId === selectedPlan.id ? 0.7 : 1
              }}
              onMouseDown={(e) => { if (!deployedPlanId) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <CheckCircle2 size={16} />
              {deployedPlanId === selectedPlan.id
                ? '✓ PLAN DEPLOYED SUCCESSFULLY'
                : selectedPlan.id === 'do_nothing'
                  ? 'ACCEPT HIGH-RISK STATUS QUO'
                  : `AUTHORIZE & DISPATCH ${selectedPlan.id.toUpperCase()}`
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
