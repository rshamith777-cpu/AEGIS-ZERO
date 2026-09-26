import React, { useState } from 'react';
import { EpisodicMemoryEntry } from '../../types/aegis';
import { INITIAL_EPISODIC_MEMORIES } from '../../engine/mockData';
import { Database, Search, GitCommit, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface EpisodicMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIncidentContext?: string;
}

export const EpisodicMemoryModal: React.FC<EpisodicMemoryModalProps> = ({
  isOpen,
  onClose,
  currentIncidentContext
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [memories] = useState<EpisodicMemoryEntry[]>(INITIAL_EPISODIC_MEMORIES);

  if (!isOpen) return null;

  const filtered = memories.filter(
    (m) =>
      m.incidentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lessonLearned.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 11, 0.88)',
        backdropFilter: 'blur(16px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '85vh',
          background: 'var(--bg-space)',
          border: '1px solid #1B2432',
          borderRadius: '12px',
          boxShadow: '0 20px 50px var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #141A24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0C1018'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ad314d' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--signal-white)', fontFamily: "'Space Grotesk', -apple-system, sans-serif", letterSpacing: '0.04em' }}>
                EPISODIC DIGITAL MEMORY & SELF-CRITIC RETROSPECTIVE
              </div>
              <div style={{ fontSize: '13px', color: 'var(--signal-text-muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
                RETRIEVAL-AUGMENTED CRISIS PRECEDENTS & CLOSED-LOOP HEURISTIC TUNING
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid #1B2432',
              color: 'var(--signal-text-muted)',
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            ✕
          </button>
        </div>

        {/* Precedent Similarity Banner */}
        <div
          style={{
            padding: '10px 20px',
            background: 'rgba(173, 49, 77, 0.08)',
            borderBottom: '1px solid rgba(173, 49, 77, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ad314d' }} />
            <span style={{ color: 'var(--signal-text-muted)' }}>ACTIVE CRISIS SIMILARITY MATCH:</span>
            <span style={{ color: 'var(--nothing-red)', fontWeight: 600 }}>INC-2026-0814 (91.4% Vector Overlap)</span>
          </div>
          <span style={{ color: 'var(--state-green)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            HEURISTIC REFINEMENT: WEIGHT +0.5
          </span>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '12px 20px', display: 'flex', gap: '8px', background: 'var(--bg-space)' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#0C1018',
              border: '1px solid #1B2432',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          >
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search historical incidents by trigger, route, or lesson..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--signal-white)',
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace",
                outline: 'none',
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* Memory List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#0C1018',
                border: '1px solid #141A24',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitCommit size={14} color="#ad314d" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--signal-white)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.incidentCode}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--signal-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    • {item.recordedDate}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--state-green)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  +{item.preventedWasteKg} kg Food Saved
                </span>
              </div>

              {/* Trigger & Response */}
              <div style={{ fontSize: '13px', color: 'var(--signal-text-muted)', lineHeight: '1.5', fontFamily: "'Inter', -apple-system, sans-serif" }}>
                <div><strong style={{ color: 'var(--signal-white)' }}>Trigger:</strong> {item.trigger}</div>
                <div style={{ marginTop: '3px' }}><strong style={{ color: 'var(--signal-white)' }}>Autonomous Response:</strong> {item.responseStrategy}</div>
              </div>

              {/* Self-Critic Comparison Box */}
              <div
                style={{
                  background: 'var(--bg-space)',
                  border: '1px solid #1B2432',
                  borderRadius: '6px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '14px',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--state-amber)' }}>
                  <span>SELF-CRITIC DELTA ANALYSIS:</span>
                  <span>PREDICTED: {item.predictedRecoveryTime} ──► ACTUAL: {item.actualRecoveryTime}</span>
                </div>
                <div style={{ color: 'var(--signal-text-muted)' }}>
                  Root Cause: {item.rootCause}
                </div>
                <div style={{ color: 'var(--text-main)', borderTop: '1px solid #141A24', paddingTop: '6px', marginTop: '2px' }}>
                  🧠 Lesson Incorporated: {item.lessonLearned}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
