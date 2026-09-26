import React, { useState, useEffect } from 'react';
import { MinimalHeader } from './components/Navigation/MinimalHeader';
import { LeftRail, NavSection } from './components/Navigation/LeftRail';
import { ThreeWorld } from './components/DigitalTwin/ThreeWorld';
import { ContextIntelligencePanel } from './components/Intelligence/ContextIntelligencePanel';
import { MissionTimeline } from './components/Timeline/MissionTimeline';
import { NodeInspectCard } from './components/DigitalTwin/NodeInspectCard';
import { OrbitLab } from './components/OrbitLab/OrbitLab';
import { AgentWarRoom } from './components/AgentSwarm/AgentWarRoom';
import { CausalRadar } from './components/CausalGraph/CausalRadar';
import { VisionScanner } from './components/Vision/VisionScanner';
import { FutureLab } from './components/FutureLab/FutureLab';
import { ChaosDock } from './components/ChaosEngine/ChaosDock';
import { EpisodicMemoryModal } from './components/Memory/EpisodicMemoryModal';
import { PhysicalDigitalTwin } from './components/DigitalTwin/PhysicalDigitalTwin';
import { NothingLanding } from './components/Landing/NothingLanding';

import {
  INITIAL_ECOSYSTEM_NODES,
  INITIAL_COURIERS,
  MOCK_FUTURE_PLANS,
  INITIAL_CAUSAL_NODES,
  INITIAL_CAUSAL_EDGES,
  INITIAL_CV_DATA
} from './engine/mockData';
import { EcosystemNode, CourierTransit, FutureTimelinePlan } from './types/aegis';
import { sound } from './engine/soundEffects';

export function App() {
  // GitBranch & System State
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [systemState, setSystemState] = useState<'EQUILIBRIUM' | 'ANOMALY' | 'CASCADE' | 'RESPONSE'>('EQUILIBRIUM');

  // Digital Twin Entities
  const [nodes, setNodes] = useState<EcosystemNode[]>(INITIAL_ECOSYSTEM_NODES);
  const [couriers, setCouriers] = useState<CourierTransit[]>(INITIAL_COURIERS);
  const [selectedNode, setSelectedNode] = useState<EcosystemNode | null>(null);

  // Operational Simulation Settings
  const [disruptionActive, setDisruptionActive] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'godseye' | 'tracking'>('orbit');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sovereignMode, setSovereignMode] = useState<boolean>(false);
  const [researchMode, setResearchMode] = useState<boolean>(false);
  const [memoryModalOpen, setMemoryModalOpen] = useState<boolean>(false);

  // Future Plans
  const plans = disruptionActive ? MOCK_FUTURE_PLANS.compressor_failure : MOCK_FUTURE_PLANS.default;

  // Courier Continuous Transit Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCouriers((prev) =>
        prev.map((c) => {
          let nextProgress = c.progress + c.speed * simSpeed;
          if (nextProgress >= 1) {
            nextProgress = 0;
          }
          return { ...c, progress: nextProgress };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [simSpeed]);

  // Audio Toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // Chaos Trigger: Incident Initiation
  const handleTriggerChaos = (scenarioType: string) => {
    setDisruptionActive(true);
    setSystemState('CASCADE');

    // Mutate Cold Depot Chiller to Critical State
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === 'node-depot') {
          return {
            ...n,
            status: 'critical',
            temperatureC: 7.4,
            shelfLifeRemainingMin: 47,
            description: 'Compressor #3 circuit offline. Thermal rise to +7.4°C. Spoilage countdown: 47 min.'
          };
        }
        if (n.id === 'node-campus-north') {
          return { ...n, crowdDensityPct: 94, status: 'warning' };
        }
        return n;
      })
    );
  };

  // Reset to Equilibrium
  const handleResetChaos = () => {
    setDisruptionActive(false);
    setSystemState('EQUILIBRIUM');
    setNodes(INITIAL_ECOSYSTEM_NODES);
    setCouriers(INITIAL_COURIERS);
  };

  // Commander Approves & Dispatches Solution
  const handleDeployPlan = (plan: FutureTimelinePlan) => {
    sound.playDeployChord();
    setSystemState('RESPONSE');

    if (plan.id === 'plan_a') {
      // Re-route couriers on screen
      setCouriers([
        {
          id: 'courier-01',
          name: 'Cryo-Fleet #01 [EXPRESS BYPASS]',
          fromNodeId: 'node-depot',
          toNodeId: 'node-campus-north',
          progress: 0.1,
          speed: 0.007,
          cargoMeals: 110,
          cargoType: 'Chilled Batch Meals',
          status: 'rerouted',
          etaMinutes: 22
        },
        {
          id: 'courier-02',
          name: 'Express Van #04 [RESCUE DISPATCH]',
          fromNodeId: 'node-depot',
          toNodeId: 'node-shelter',
          progress: 0.2,
          speed: 0.008,
          cargoMeals: 74,
          cargoType: 'Flash-Chilled Packs',
          status: 'rerouted',
          etaMinutes: 16
        }
      ]);

      // Alleviate Depot Critical Status
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === 'node-depot') {
            return {
              ...n,
              status: 'warning',
              inventoryMeals: n.inventoryMeals - 184,
              description: '184 compromised meals evacuated via High-Elevation Bypass.'
            };
          }
          if (n.id === 'node-campus-north') {
            return { ...n, inventoryMeals: n.inventoryMeals + 110, status: 'nominal' };
          }
          if (n.id === 'node-shelter') {
            return { ...n, inventoryMeals: n.inventoryMeals + 74, status: 'nominal' };
          }
          return n;
        })
      );
    }
  };

  // Return to Nothing OS Overview Landing
  const handleReturnToOverview = () => {
    setActiveSection('overview');
  };

  if (activeSection === 'overview') {
    return (
      <NothingLanding
        onEnterCockpit={(sec) => setActiveSection(sec || 'world')}
        onOpenPurpose={() => {}}
        disruptionActive={disruptionActive}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-space)'
      }}
    >
      {/* 1. Minimal Command Bar (Top) */}
      <MinimalHeader
        systemState={systemState}
        cameraMode={cameraMode}
        onChangeCameraMode={setCameraMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        simSpeed={simSpeed}
        onChangeSpeed={setSimSpeed}
        sovereignMode={sovereignMode}
        researchMode={researchMode}
        onToggleResearchMode={() => setResearchMode(!researchMode)}
        onReturnToOverview={handleReturnToOverview}
      />

      {/* 2. Main Center Body: Left Rail + Center Work Area + Right Intelligence Deck */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left GitBranch Rail */}
        <LeftRail
          activeSection={activeSection}
          onSelectSection={(sec) => {
            if (sec === 'memory') {
              setMemoryModalOpen(true);
            }
            setActiveSection(sec);
          }}
          disruptionActive={disruptionActive}
        />

        {/* Center Workspace */}
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* ORBIT LAB SECTION */}
          {activeSection === 'orbit' && (
            <OrbitLab
              nodes={nodes}
              couriers={couriers}
              disruptionActive={disruptionActive}
              researchMode={researchMode}
              onToggleResearchMode={() => setResearchMode(!researchMode)}
            />
          )}

          {/* CASCADE RADAR & VISION SCANNER SECTION */}
          {activeSection === 'cascade' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', height: '100%', padding: '16px', backgroundColor: 'var(--bg-space)', overflowY: 'auto' }}>
              <CausalRadar
                nodes={INITIAL_CAUSAL_NODES}
                edges={INITIAL_CAUSAL_EDGES}
                disruptionActive={disruptionActive}
              />
              <VisionScanner
                cvData={INITIAL_CV_DATA}
                disruptionActive={disruptionActive}
              />
            </div>
          )}

          {/* MULTI-AGENT SWARM SECTION */}
          {activeSection === 'agents' && (
            <div style={{ height: '100%', padding: '16px', backgroundColor: 'var(--bg-space)', overflowY: 'auto' }}>
              <AgentWarRoom
                disruptionActive={disruptionActive}
                onConsensusReached={() => setSystemState('RESPONSE')}
              />
            </div>
          )}

          {/* FUTURE LAB TIMELINES SECTION */}
          {activeSection === 'futures' && (
            <div style={{ height: '100%', padding: '16px', backgroundColor: 'var(--bg-space)', overflowY: 'auto' }}>
              <FutureLab
                plans={plans}
                activePlanId="plan_a"
                onDeployPlan={handleDeployPlan}
                disruptionActive={disruptionActive}
              />
            </div>
          )}



          {/* DIGITAL TWIN / WORLD */}
          {activeSection === 'world' && (
            <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
              <div style={{ flex: 1, position: 'relative', height: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-space)' }}>
                <ThreeWorld
                  nodes={nodes}
                  couriers={couriers}
                  selectedNodeId={selectedNode?.id || null}
                  onSelectNode={setSelectedNode}
                  disruptionActive={disruptionActive}
                  cameraMode={cameraMode}
                />
                <NodeInspectCard node={selectedNode} onClose={() => setSelectedNode(null)} />
              </div>
            </div>
          )}
          {/* MEMORY */}
          {(activeSection === 'memory') && (
            <div style={{ flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>
              <ThreeWorld
                nodes={nodes}
                couriers={couriers}
                selectedNodeId={selectedNode?.id || null}
                onSelectNode={setSelectedNode}
                disruptionActive={disruptionActive}
                cameraMode={cameraMode}
              />
              <NodeInspectCard node={selectedNode} onClose={() => setSelectedNode(null)} />
            </div>
          )}
        </main>

        {/* Right Intelligence Deck (Visible in Mission, World, Cascade, Futures) */}
        {activeSection !== 'orbit' && (
          <aside
            style={{
              width: '380px',
              minWidth: '360px',
              maxWidth: '420px',
              height: '100%',
              backgroundColor: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-subtle)',
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 30
            }}
          >
            <ContextIntelligencePanel
              activeSection={activeSection}
              disruptionActive={disruptionActive}
              nodes={nodes}
              couriers={couriers}
              onDeployPlan={handleDeployPlan}
              onTriggerChaos={handleTriggerChaos}
              onResetChaos={handleResetChaos}
              plans={plans}
            />
          </aside>
        )}
      </div>

      {/* 3. Bottom Mission Timeline & Event Stream */}
      <MissionTimeline
        disruptionActive={disruptionActive}
        onTriggerChaos={handleTriggerChaos}
        onResetChaos={handleResetChaos}
      />

      {/* 4. Episodic Memory Modal */}
      <EpisodicMemoryModal
        isOpen={memoryModalOpen}
        onClose={() => setMemoryModalOpen(false)}
        currentIncidentContext="Depot Chiller #3 failure"
      />
    </div>
  );
}

export default App;
