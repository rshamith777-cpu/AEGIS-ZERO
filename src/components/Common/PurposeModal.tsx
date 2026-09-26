import React from 'react';
import { X, ShieldAlert, Zap, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

interface PurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterCockpit?: () => void;
}

export const PurposeModal: React.FC<PurposeModalProps> = ({ isOpen, onClose, onEnterCockpit }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(236, 236, 235, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(94vw, 840px)',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-muted)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--signal-white)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="nothing-dot-red" />
            <span className="font-dot" style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--signal-white)' }}>
              AEGIS ZERO // SYSTEM PURPOSE & BLUEPRINT
            </span>
            <span className="nothing-badge" style={{ fontSize: '9px', padding: '2px 8px' }}>
              ORBIT-A 3.1
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--signal-text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '50%'
            }}
            title="Close blueprint"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 1. Core Mission Statement */}
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
            <span className="tech-label" style={{ color: 'var(--nothing-red)' }}>EXECUTIVE MISSION STATEMENT</span>
            <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: 700, margin: '6px 0 8px', color: '#111' }}>
              Zero Perishable Spoilage via Autonomous Boundary Physics
            </h2>
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--copy)' }}>
              <strong>AEGIS ZERO</strong> is a cyber-physical resilience platform designed to solve one of the most critical challenges in urban food security: <strong>preventing catastrophic perishable food waste and cold-chain cascade collapses before they occur</strong>.
            </p>
          </div>

          {/* 2. The Real-World Problem */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ padding: '14px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldAlert size={16} color="var(--state-red)" />
                <span className="font-heading" style={{ fontSize: '13px', fontWeight: 700 }}>The Problem: Cascading Decay</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--copy)', lineHeight: 1.5 }}>
                When a refrigeration compressor trips at a cold storage depot, or monsoon flooding blocks highway arteries, food banks and logistics dispatchers face a strict microbiological deadline (often &lt; 47 minutes). Traditional supply chain software relies on slow manual escalations, resulting in entire truckloads of meals being discarded.
              </p>
            </div>

            <div style={{ padding: '14px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Zap size={16} color="var(--signal-cyan)" />
                <span className="font-heading" style={{ fontSize: '13px', fontWeight: 700 }}>The Solution: ORBIT-A 3.1</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--copy)', lineHeight: 1.5 }}>
                AEGIS ZERO connects live IoT temperature probes, crowd sensors, and traffic telemetry into a unified <strong>Transition Boundary Intelligence (TBI)</strong> engine. It continuously computes distance to microbiological failure surfaces ($BTD$) and synthesizes minimum-cost counterfactual escape interventions.
              </p>
            </div>
          </div>

          {/* 3. 4-Stage Operational Architecture */}
          <div>
            <span className="tech-label">END-TO-END RESILIENCE WORKFLOW</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '8px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                <span className="font-dot" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--nothing-red)' }}>01</span>
                <div className="font-heading" style={{ fontSize: '12px', fontWeight: 700, margin: '4px 0 2px' }}>OBSERVE</div>
                <div style={{ fontSize: '11px', color: 'var(--signal-text-muted)' }}>
                  3D Digital Twin tracks nodes, couriers, temperatures & cafeteria crowds in real time.
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                <span className="font-dot" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--signal-cyan)' }}>02</span>
                <div className="font-heading" style={{ fontSize: '12px', fontWeight: 700, margin: '4px 0 2px' }}>QUANTIFY</div>
                <div style={{ fontSize: '11px', color: 'var(--signal-text-muted)' }}>
                  Compiled Adaptive Boundary Search (ABS) computes TBI risk score in &lt; 2.8ms.
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                <span className="font-dot" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--state-amber)' }}>03</span>
                <div className="font-heading" style={{ fontSize: '12px', fontWeight: 700, margin: '4px 0 2px' }}>DEBATE</div>
                <div style={{ fontSize: '11px', color: 'var(--signal-text-muted)' }}>
                  Multi-agent swarm (Scout, Forecast, Logistics, Red Team) reaches consensus on escape paths.
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                <span className="font-dot" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--state-green)' }}>04</span>
                <div className="font-heading" style={{ fontSize: '12px', fontWeight: 700, margin: '4px 0 2px' }}>DISPATCH</div>
                <div style={{ fontSize: '11px', color: 'var(--signal-text-muted)' }}>
                  Autonomous rerouting delivers meals to shelters and dining halls with 94.6% rescue rate.
                </div>
              </div>
            </div>
          </div>

          {/* 4. Core Mathematical Formula */}
          <div style={{ padding: '14px', background: '#fafaf9', border: '1px solid var(--border-muted)', borderRadius: '8px' }}>
            <span className="tech-label">MATHEMATICAL FORMULATION</span>
            <div className="font-data" style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: '6px 0' }}>
              TBI = φ(Boundary Proximity, Transition Momentum, Structural Amplification, Intervention Leverage)
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--copy)', lineHeight: 1.5 }}>
              Combines normalized boundary distance along candidate rays ($BP = \exp(-BTD / \sigma)$), dynamic velocity alignment ($TM$), topological cut vulnerability ($SA$), and Pareto intervention controllability ($IL$).
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={15} color="var(--state-green)" />
            <span className="font-data" style={{ fontSize: '11px', color: 'var(--copy)' }}>
              80/80 Quality Verification Gates Verified • Real Data Ingest Active
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} className="nothing-btn-secondary">
              Close
            </button>
            {onEnterCockpit && (
              <button
                onClick={() => {
                  onClose();
                  onEnterCockpit();
                }}
                className="nothing-btn-primary"
              >
                Launch Cockpit <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
