import React, { useState, useEffect, useRef } from 'react';
import { AgentProfile, AgentDebateMessage } from '../../types/aegis';
import { AGENT_PROFILES } from '../../engine/mockData';
import { sound } from '../../engine/soundEffects';
import { Bot, ShieldAlert, Swords, CheckCircle2, Flame, RefreshCw, Activity } from 'lucide-react';

interface AgentWarRoomProps {
  disruptionActive: boolean;
  onConsensusReached?: () => void;
}

export const AgentWarRoom: React.FC<AgentWarRoomProps> = ({ disruptionActive, onConsensusReached }) => {
  const [messages, setMessages] = useState<AgentDebateMessage[]>([]);
  const [isDebating, setIsDebating] = useState<boolean>(false);
  const [consensusAchieved, setConsensusAchieved] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const debateScript: Omit<AgentDebateMessage, 'id' | 'timestamp'>[] = [
    {
      agentId: 'scout',
      agentName: 'Scout Agent',
      callsign: 'CYPHER-1',
      stance: 'observation',
      confidenceScore: 0.98,
      content: '🚨 ANOMALY: Depot Chiller #3 failure confirmed via telemetry. Temperature climbed to +7.4°C. 184 dairy/protein meal packs at immediate risk.'
    },
    {
      agentId: 'coldchain',
      agentName: 'Cold-Chain Sentinel',
      callsign: 'KRYOS-4',
      stance: 'observation',
      confidenceScore: 0.96,
      content: 'Microbiological thermal model predicts rapid pathogen proliferation curve. Critical shelf-life deadline: 47 minutes before mandatory discard.'
    },
    {
      agentId: 'logistics',
      agentName: 'Routing & Fleet',
      callsign: 'VECTOR-7',
      stance: 'proposal',
      confidenceScore: 0.88,
      content: 'PROPOSAL 1: Dispatch Cryo-Fleet #01 with all 184 meals direct to Tech Quad Dining Hall via Arterial Highway 2.'
    },
    {
      agentId: 'redteam',
      agentName: 'Red-Team Adversary',
      callsign: 'NEMESIS-X',
      stance: 'attack',
      confidenceScore: 0.94,
      content: '⚡ REJECT PROPOSAL 1! Real-time Doppler indicates flash rain along Highway 2. Arterial underpass is waterlogged (+40m delay). Food will perish in transit!'
    },
    {
      agentId: 'forecast',
      agentName: 'Forecast Agent',
      callsign: 'PROPHET-2',
      stance: 'observation',
      confidenceScore: 0.91,
      content: 'Weather fusion: Quad dinner surge is accelerating (+18/min). However, Annapoorna Shelter in South Sector is only 16 minutes away via elevated Ring Road.'
    },
    {
      agentId: 'optimizer',
      agentName: 'Pareto Optimizer',
      callsign: 'NEXUS-9',
      stance: 'proposal',
      confidenceScore: 0.95,
      content: 'PARETO OPTIMAL SPLIT CALCULATED: Split cargo 60/40! Route 110 meals to Tech Quad via High-Elevation Bypass (ETA 22 min), and redirect 74 meals to Annapoorna Shelter (ETA 16 min).'
    },
    {
      agentId: 'safety',
      agentName: 'Safety & Compliance',
      callsign: 'AEGIS-SAFE',
      stance: 'rebuttal',
      confidenceScore: 0.99,
      content: 'Safety constraints validated. Both delivery vectors arrive with >25 min safety margin ahead of the 47 min FSSAI threshold. Zero bacterial risk.'
    },
    {
      agentId: 'commander',
      agentName: 'Commander Executive',
      callsign: 'OVERWATCH',
      stance: 'consensus',
      confidenceScore: 0.94,
      content: 'CONSENSUS ESTABLISHED: Plan A (Dual-Split Dispatch) approved by Swarm. Expected Food Rescue: 94.6%. Waste Cut: -89%. Transmitting to Human Commander for execution.'
    }
  ];

  const runDebate = () => {
    setIsDebating(true);
    setMessages([]);
    setConsensusAchieved(false);

    let step = 0;
    const interval = setInterval(() => {
      if (step < debateScript.length) {
        const item = debateScript[step];
        const newMsg: AgentDebateMessage = {
          ...item,
          id: `msg-${Date.now()}-${step}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        };
        setMessages((prev) => [...prev, newMsg]);
        sound.playAgentChirp();

        if (item.stance === 'consensus') {
          setConsensusAchieved(true);
          sound.playDeployChord();
          if (onConsensusReached) onConsensusReached();
        }

        step++;
      } else {
        clearInterval(interval);
        setIsDebating(false);
      }
    }, 1200);
  };

  useEffect(() => {
    if (disruptionActive && messages.length === 0 && !isDebating) {
      runDebate();
    }
  }, [disruptionActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getStanceBadge = (stance: AgentDebateMessage['stance']) => {
    switch (stance) {
      case 'attack':
        return { label: '⚔️ ADVERSARIAL ATTACK', bg: 'var(--nothing-red-dim)', border: 'var(--nothing-red)', text: 'var(--nothing-red)' };
      case 'proposal':
        return { label: '💡 TACTICAL PROPOSAL', bg: 'rgba(0,0,0,0.05)', border: 'var(--signal-white)', text: 'var(--signal-white)' };
      case 'rebuttal':
        return { label: '🛡️ CONSTRAINT LOCK', bg: 'rgba(5, 150, 105, 0.1)', border: 'var(--state-green)', text: 'var(--state-green)' };
      case 'consensus':
        return { label: '👑 CONSENSUS REACHED', bg: 'rgba(217, 119, 6, 0.1)', border: 'var(--state-amber)', text: 'var(--state-amber)' };
      default:
        return { label: '👁️ TELEMETRY FACT', bg: 'rgba(0,0,0,0.02)', border: 'var(--border-strong)', text: 'var(--signal-text-muted)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', backgroundColor: 'var(--bg-space)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Swords size={20} color="var(--signal-white)" />
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--bg-space)', fontFamily: 'var(--font-heading)' }}>
            AUTONOMOUS AGENT WAR ROOM (ADVERSARIAL CONSENSUS)
          </span>
        </div>
        <button
          onClick={runDebate}
          disabled={isDebating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontFamily: 'var(--font-data)',
            fontWeight: 600,
            padding: '6px 16px',
            borderRadius: '4px',
            background: isDebating ? 'var(--bg-surface)' : 'var(--signal-white)',
            border: `1px solid ${isDebating ? 'var(--border-muted)' : 'var(--signal-white)'}`,
            color: isDebating ? 'var(--signal-text-muted)' : 'var(--bg-elevated)',
            cursor: isDebating ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <RefreshCw size={14} className={isDebating ? 'spin' : ''} />
          {isDebating ? 'DEBATING...' : 'FORCE SWARM DEBATE'}
        </button>
      </div>

      {/* Agent Roster Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px 0',
          scrollbarWidth: 'none'
        }}
      >
        {AGENT_PROFILES.map((agent) => {
          const isActive = messages.some((m) => m.agentId === agent.id);
          return (
            <div
              key={agent.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '4px',
                background: isActive ? 'var(--signal-white)' : 'var(--bg-elevated)',
                border: `1px solid ${isActive ? 'var(--signal-white)' : 'var(--border-subtle)'}`,
                fontSize: '11px',
                fontFamily: 'var(--font-data)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--bg-elevated)' : 'var(--signal-text-muted)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isActive ? 'var(--bg-elevated)' : agent.avatarColor }} />
              <span>{agent.callsign}</span>
            </div>
          );
        })}
      </div>

      {/* Live Debate Stream */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: '280px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--signal-text-dim)', fontSize: '13px', fontFamily: 'var(--font-data)' }}>
            <div style={{ marginBottom: '8px' }}><Activity size={32} opacity={0.5} style={{ margin: '0 auto' }} /></div>
            <div>● SWARM LISTENING ON CAUSAL BUS ●</div>
            <div style={{ fontSize: '11px', marginTop: '8px' }}>Inject chaos or click "FORCE SWARM DEBATE" to observe adversarial fight</div>
          </div>
        ) : (
          messages.map((msg) => {
            const badge = getStanceBadge(msg.stance);
            const agent = AGENT_PROFILES.find((a) => a.id === msg.agentId);

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: 'var(--signal-white)',
                  border: `1px solid ${msg.stance === 'attack' ? 'var(--nothing-red)' : msg.stance === 'consensus' ? 'var(--state-amber)' : 'var(--border-subtle)'}`,
                  borderRadius: '4px',
                  padding: '12px 16px',
                  animation: 'fadeIn 0.3s ease-out',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                {/* Message Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: agent?.avatarColor || 'var(--signal-white)'
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--bg-space)', fontFamily: 'var(--font-data)' }}>
                      {msg.agentName} ({msg.callsign})
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-data)',
                        padding: '2px 8px',
                        borderRadius: '2px',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.text,
                        fontWeight: 600
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--signal-text-dim)', fontFamily: 'var(--font-data)' }}>
                    {msg.timestamp} • {(msg.confidenceScore * 100).toFixed(0)}% CONF
                  </div>
                </div>

                {/* Message Content */}
                <div style={{ fontSize: '14px', color: 'var(--bg-surface)', lineHeight: '1.5', fontFamily: 'var(--font-body)' }}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Consensus Summary Banner */}
      {consensusAchieved && (
        <div
          style={{
            background: 'var(--signal-white)',
            border: '2px solid var(--state-amber)',
            borderRadius: '4px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-data)',
            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="var(--state-amber)" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--state-amber)' }}>
                GAME-THEORETIC CONSENSUS: DUAL-SPLIT DISPATCH
              </div>
              <div style={{ fontSize: '11px', color: 'var(--signal-text-dim)', marginTop: '4px' }}>
                Campus Quad: 60% • Annapoorna Shelter: 40% • Biological Safety Margin: +25 min
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--state-green)' }}>94.6% RESCUE</div>
            <div style={{ fontSize: '11px', color: 'var(--signal-text-dim)' }}>-89% WASTE CASCADE</div>
          </div>
        </div>
      )}
    </div>
  );
};
