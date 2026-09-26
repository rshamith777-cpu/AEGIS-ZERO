import React, { useState } from 'react';
import { Mei2EscapePortfolio, Mei2PortfolioCandidate } from '../../orbit/v3/mei2Optimizer';
import { ShieldCheck, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GitBranch, DollarSign, Award } from './icons';

interface InterventionWarRoomProps {
  mei2Result?: Mei2EscapePortfolio;
}

export const InterventionWarRoom: React.FC<InterventionWarRoomProps> = ({
  mei2Result
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Mei2PortfolioCandidate | null>(null);

  // Fallback demo candidates if none provided
  const candidates: Mei2PortfolioCandidate[] = mei2Result?.top5Interventions || [
    {
      intervention: {
        id: 'portfolio_1',
        name: 'Coordinated Ingress Diversion + Adaptive Substation Throttling',
        actions: [],
        totalCost: 25.0,
        resourceRequirements: {},
        maxExecutionTimeTicks: 2
      },
      constituentInterventionIds: ['intv_diversion', 'intv_substation'],
      actionCount: 2,
      totalCost: 25.0,
      postInterventionBtd: 0.78,
      postInterventionPTrans: 0.12,
      escapeEfficiency: 1.48,
      lossAvoided: 84500,
      regret: 0.0,
      paretoRank: 1,
      isSynergistic: true,
      timeToEffectTicks: 2,
      confidence: 0.94,
      operationalImpact: 0.18,
      isFeasible: true
    },
    {
      intervention: {
        id: 'portfolio_2',
        name: 'Single Arterial Traffic Signal Cycle Extension',
        actions: [],
        totalCost: 10.0,
        resourceRequirements: {},
        maxExecutionTimeTicks: 1
      },
      constituentInterventionIds: ['intv_signal'],
      actionCount: 1,
      totalCost: 10.0,
      postInterventionBtd: 0.52,
      postInterventionPTrans: 0.38,
      escapeEfficiency: 0.95,
      lossAvoided: 35000,
      regret: 0.18,
      paretoRank: 2,
      isSynergistic: false,
      timeToEffectTicks: 1,
      confidence: 0.91,
      operationalImpact: 0.08,
      isFeasible: true
    },
    {
      intervention: {
        id: 'portfolio_3',
        name: 'Emergency Bus Corridor Reservation',
        actions: [],
        totalCost: 18.0,
        resourceRequirements: {},
        maxExecutionTimeTicks: 2
      },
      constituentInterventionIds: ['intv_bus'],
      actionCount: 1,
      totalCost: 18.0,
      postInterventionBtd: 0.61,
      postInterventionPTrans: 0.28,
      escapeEfficiency: 1.12,
      lossAvoided: 52000,
      regret: 0.09,
      paretoRank: 2,
      isSynergistic: false,
      timeToEffectTicks: 2,
      confidence: 0.88,
      operationalImpact: 0.14,
      isFeasible: true
    }
  ];

  const active = selectedCandidate || candidates[0];

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '4px',
      padding: '20px',
      color: 'var(--signal-white)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="nothing-dot-red" />
          <h3 style={{ margin: 0, fontSize: '15px', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.04em' }}>
            MEI-2 MULTI-ELEMENT INTERVENTION WAR ROOM
          </h3>
        </div>
        <div className="nothing-badge">
          PORTFOLIOS SCREENED: {mei2Result?.portfoliosEvaluatedCount || 15}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Candidates List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Pareto Frontier Candidates
          </div>

          {candidates.map((c, i) => {
            const isRank1 = c.paretoRank === 1;
            const isSelected = active.intervention.id === c.intervention.id;

            return (
              <div
                key={i}
                onClick={() => setSelectedCandidate(c)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: isSelected ? '1px solid #38bdf8' : isRank1 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '8px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: isRank1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                      border: isRank1 ? '1px solid #10b981' : '1px solid #64748b',
                      color: isRank1 ? '#34d399' : '#94a3b8',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 700
                    }}>
                      PARETO RANK {c.paretoRank}
                    </span>
                    {c.isSynergistic && (
                      <span style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', color: '#c084fc', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>
                        2-ACTION SYNERGY
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399' }}>
                    EE = {c.escapeEfficiency.toFixed(2)}
                  </div>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>
                  {c.intervention.name}
                </div>

                {/* Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '11px', background: 'rgba(30, 41, 59, 0.4)', padding: '8px', borderRadius: '6px' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>COST:</span> <strong style={{ color: '#f8fafc' }}>${c.totalCost}k</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>POST-BTD:</span> <strong style={{ color: '#38bdf8' }}>{c.postInterventionBtd.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>P_TRANS:</span> <strong style={{ color: c.postInterventionPTrans < 0.2 ? '#34d399' : '#f59e0b' }}>{(c.postInterventionPTrans * 100).toFixed(0)}%</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>AVOIDED:</span> <strong style={{ color: '#34d399' }}>${(c.lossAvoided / 1000).toFixed(0)}k</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Candidate Inspector */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '8px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '4px' }}>
              Decision Inspector
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
              {active.intervention.name}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Pareto Optimality Rank:</span>
                <strong style={{ color: active.paretoRank === 1 ? '#34d399' : '#f8fafc' }}>Rank {active.paretoRank} (Non-Dominated)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Escape Efficiency ($\Delta BTD / Cost$):</span>
                <strong style={{ color: '#38bdf8' }}>{active.escapeEfficiency.toFixed(3)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Transition Collapse Probability:</span>
                <strong style={{ color: active.postInterventionPTrans < 0.2 ? '#34d399' : '#f59e0b' }}>
                  {(active.postInterventionPTrans * 100).toFixed(1)}% (was 85.0%)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Expected Economic Loss Avoided:</span>
                <strong style={{ color: '#34d399' }}>${active.lossAvoided.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Post-Intervention BTD:</span>
                <strong style={{ color: '#38bdf8' }}>{active.postInterventionBtd.toFixed(3)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Time to Operational Effect:</span>
                <strong style={{ color: '#cbd5e1' }}>{active.timeToEffectTicks} tick(s)</strong>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderLeft: '3px solid #10b981',
            padding: '10px 14px',
            borderRadius: '0 6px 6px 0',
            fontSize: '11px',
            color: '#cbd5e1',
            marginTop: '16px'
          }}>
            <strong>Recommendation Rationale: </strong>
            {active.paretoRank === 1
              ? `Selected as primary escape portfolio because it maximizes Escape Efficiency (${active.escapeEfficiency.toFixed(2)}) while reducing transition probability to ${(active.postInterventionPTrans * 100).toFixed(0)}% at acceptable operational cost.`
              : `Alternative candidate on Pareto boundary providing localized relief.`}
          </div>
        </div>
      </div>
    </div>
  );
};
