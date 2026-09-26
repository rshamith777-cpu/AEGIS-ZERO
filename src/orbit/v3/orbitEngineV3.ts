/**
 * ORBIT-A 3.0 — Transition Boundary Intelligence Engine
 * 
 * Core Orchestrator separating ordinary time-series forecasting from
 * transition intelligence across four core quantities:
 * 1. Boundary Proximity
 * 2. Transition Momentum
 * 3. Structural Amplification
 * 4. Intervention Leverage
 */

import {
  SystemState,
  StateVector,
  GenericIntervention
} from '../core/types';
import { systemStateToVector } from '../core/stateVector';
import {
  OrbitV3Config,
  DEFAULT_ORBIT_V3_CONFIG,
  OrbitV3AnalysisResult
} from './types';
import { HighDimensionalImportanceScreener } from './importanceScreening';
import { DirectionalProposalEngine } from './directionalProposal';
import { AdaptiveBoundarySearchEngine } from './adaptiveBoundarySearch';
import { TransitionMomentumEngine } from './transitionMomentum';
import { StructuralAmplificationEngine } from './structuralAmplification';
import { Mei2Optimizer } from './mei2Optimizer';
import { TbiScoreEngine } from './tbiScore';
import { AdaptiveStatePolicyEngine } from './adaptiveStatePolicy';
import { HigherOrderInteractionEngine } from './interactions/higherOrderInteractions';
import { ShockEngine } from './shock/shockEngine';
import { VulnerabilityPriorEngine } from './shock/vulnerabilityPrior';

export class OrbitEngineV3 {
  private config: OrbitV3Config;

  // Sub-modules
  private screener = new HighDimensionalImportanceScreener();
  private proposalEngine = new DirectionalProposalEngine();
  private boundarySearchEngine = new AdaptiveBoundarySearchEngine();
  private momentumEngine = new TransitionMomentumEngine();
  private structuralEngine = new StructuralAmplificationEngine();
  private mei2Optimizer = new Mei2Optimizer();
  private tbiEngine = new TbiScoreEngine();
  private statePolicyEngine = new AdaptiveStatePolicyEngine();
  private higherOrderEngine = new HigherOrderInteractionEngine();
  private shockEngine = new ShockEngine();
  private vulnerabilityPriorEngine = new VulnerabilityPriorEngine();

  // Temporal history buffer
  private previousStateVector: StateVector | null = null;
  private priorPreviousStateVector: StateVector | null = null;

  constructor(config: Partial<OrbitV3Config> = {}) {
    this.config = { ...DEFAULT_ORBIT_V3_CONFIG, ...config };
  }

  public getConfig(): OrbitV3Config {
    return { ...this.config };
  }

  public resetMemory(): void {
    this.previousStateVector = null;
    this.priorPreviousStateVector = null;
    this.statePolicyEngine.reset();
  }

  /**
   * Primary inference step for ORBIT-A 3.0
   */
  public analyzeSystem(
    currentState: SystemState,
    candidateInterventions: GenericIntervention[] = [],
    referenceState?: SystemState
  ): OrbitV3AnalysisResult {
    const startTime = performance.now();
    const t0 = startTime;
    const stateVector = systemStateToVector(currentState);
    // If dimension changed (e.g. evaluating different systems or benchmark scales), reset history
    if (this.previousStateVector && this.previousStateVector.values.length !== stateVector.values.length) {
      this.resetMemory();
    }
    const t1 = performance.now();

    // 1. High-Dimensional Importance Screening & Interaction Discovery
    const { screenedIndices, features } = this.screener.screenVariables(
      stateVector,
      this.previousStateVector,
      currentState.constraints,
      this.config.maxScreenedVariables
    );
    const t2 = performance.now();
    const discoveredInteractions = this.screener.discoverPairwiseInteractions(
      stateVector,
      screenedIndices,
      currentState
    );
    const t3 = performance.now();

    // 2. Empirical Direction Proposal Distribution
    const proposals = this.proposalEngine.generateProposals(
      stateVector,
      this.previousStateVector,
      features,
      currentState.constraints,
      currentState,
      this.config.proposalCount
    );
    const t4 = performance.now();

    // 3. Guided Adaptive Boundary Search (BTD_adaptive)
    const boundaryResult = this.boundarySearchEngine.searchBoundary(
      stateVector,
      proposals,
      currentState.constraints
    );
    const t5 = performance.now();

    // 4. Transition Momentum (Velocity + Acceleration + Alignment)
    const momentumResult = this.momentumEngine.computeMomentum(
      stateVector,
      this.previousStateVector,
      this.priorPreviousStateVector,
      boundaryResult.dominantDirection.vector
    );
    const t6 = performance.now();

    // 5. Structural Amplification (Graph Topology Shock + Bottleneck Centrality)
    const structuralResult = this.structuralEngine.evaluateAmplification(
      currentState,
      referenceState
    );
    const t7 = performance.now();

    // 6. MEI-2 Escape Optimization & Pareto Frontier
    const mei2Result = this.mei2Optimizer.optimizeEscape(
      currentState,
      stateVector,
      boundaryResult.adaptiveBtd,
      candidateInterventions,
      currentState.constraints,
      this.config
    );
    const t8 = performance.now();

    // 7. Four Core Quantities & TBI Score Aggregation
    const { coreQuantities, tbiScore } = this.tbiEngine.computeTbi(
      boundaryResult.adaptiveBtd,
      momentumResult.transitionMomentum,
      structuralResult.structuralAmplification,
      mei2Result,
      this.config
    );

    // 7b. ORBIT-A 3.1: Instantaneous Shock Detection & Post-Shock Recovery Analysis
    const shockReport = this.shockEngine.analyzeShock(
      currentState,
      stateVector,
      this.previousStateVector,
      this.priorPreviousStateVector,
      this.statePolicyEngine.getCurrentState(),
      boundaryResult.adaptiveBtd,
      candidateInterventions,
      currentState.constraints,
      this.config
    );

    // 8. 5-State Operational Regime Policy (NORMAL, WATCH, CRITICAL, TRANSITION, SHOCK)
    const policyResult = this.statePolicyEngine.evaluateState(
      coreQuantities,
      tbiScore,
      this.config,
      shockReport.isShockActive
    );
    const t9 = performance.now();

    // 8b. ORBIT-A 3.1: Higher-Order Interactions (Order 1, Order 2, Order 3)
    const higherOrderInteractions = this.higherOrderEngine.discoverInteractions(
      stateVector,
      features,
      currentState
    );

    // 8c. ORBIT-A 3.1: Pre-Shock Structural Vulnerability Priors
    const vulnerabilityPriors = this.vulnerabilityPriorEngine.computeVulnerabilityPriors(
      stateVector,
      currentState,
      currentState.constraints,
      features
    );

    // Record breach direction if state enters TRANSITION or SHOCK
    if (policyResult.operationalState === 'TRANSITION' || policyResult.operationalState === 'SHOCK') {
      this.proposalEngine.registerBreachDirection(boundaryResult.dominantDirection.vector);
    }

    // Advance historical temporal state
    this.priorPreviousStateVector = this.previousStateVector;
    this.previousStateVector = stateVector;

    const inferenceTimeMs = Number((t9 - startTime).toFixed(2));
    const memoryEstimatedBytes = stateVector.values.length * 8 + proposals.length * stateVector.values.length * 8 + 4096;

    const stageTimingsMs = {
      stateVectorConstructionMs: Number((t1 - t0).toFixed(3)),
      importanceScreeningMs: Number((t2 - t1).toFixed(3)),
      interactionDiscoveryMs: Number((t3 - t2).toFixed(3)),
      directionalProposalsMs: Number((t4 - t3).toFixed(3)),
      adaptiveBoundarySearchMs: Number((t5 - t4).toFixed(3)),
      transitionMomentumMs: Number((t6 - t5).toFixed(3)),
      structuralAmplificationMs: Number((t7 - t6).toFixed(3)),
      mei2OptimizationMs: Number((t8 - t7).toFixed(3)),
      tbiAndPolicyMs: Number((t9 - t8).toFixed(3)),
      totalMs: inferenceTimeMs
    };

    const explanation = `[ORBIT-A 3.1 TBI=${tbiScore.toFixed(3)} | State: ${policyResult.operationalState}] ` +
      `BP=${coreQuantities.boundaryProximity.toFixed(2)} (BTD=${boundaryResult.adaptiveBtd.toFixed(2)}), ` +
      `TM=${coreQuantities.transitionMomentum.toFixed(2)} (${momentumResult.momentumHazardLevel}), ` +
      `SA=${coreQuantities.structuralAmplification.toFixed(2)}x, IL=${coreQuantities.interventionLeverage.toFixed(2)}. ` +
      (shockReport.isShockActive ? `[SHOCK: ${shockReport.classification}] ` : '') +
      `Dominant Ray: ${boundaryResult.dominantDirection.name}. ` +
      `Recommended Action: ${mei2Result.bestEscape ? mei2Result.bestEscape.intervention.name : 'Nominal Monitoring'}.`;

    return {
      timestamp: currentState.timestamp,
      currentState,
      stateVector,
      coreQuantities,
      tbiScore,
      operationalState: policyResult.operationalState,
      stateTransitionEvidence: policyResult.stateTransitionEvidence,
      adaptiveBtd: boundaryResult.adaptiveBtd,
      dominantVulnerabilityDirection: {
        name: boundaryResult.dominantDirection.name,
        source: boundaryResult.dominantDirection.source,
        vector: boundaryResult.dominantDirection.vector,
        involvedVariables: boundaryResult.involvedVariables
      },
      rayEvaluationCount: boundaryResult.rayEvaluationsCount,
      screenedActiveVariables: features.map((f) => `${f.nodeId}:${f.variableName}`),
      discoveredInteractions: discoveredInteractions.map((i) => ({
        varA: i.varA,
        varB: i.varB,
        strength: i.interactionStrength
      })),
      higherOrderInteractions,
      shockReport,
      vulnerabilityPriors,
      mei2Result,
      inferenceTimeMs,
      memoryEstimatedBytes,
      explanation,
      stageTimingsMs
    };
  }
}
