import {
  SystemState,
  GenericIntervention,
  BoundaryEstimate,
  TopologyShock,
  EscapeOptimizationResult,
  CounterfactualResult,
  UncertaintyEstimate,
  OrbitConfig,
  DEFAULT_ORBIT_CONFIG
} from './core/types';
import { systemStateToVector } from './core/stateVector';
import { BoundaryInferenceEngine } from './boundary/boundaryInference';
import { TopologyShockEvaluator } from './topology/topologyShock';
import { EscapeOptimizer } from './intervention/escapeOptimizer';
import { CounterfactualEngine } from './intervention/counterfactual';
import { UncertaintyEstimator } from './uncertainty/uncertaintyEstimator';

/**
 * ORBIT Scorecard:
 * Clear, scientific, rigorously rounded metrics summary for researchers and judges.
 */
export interface OrbitScorecard {
  btd: number;
  btdUnit: string;
  isNearBoundary: boolean;
  boundaryConfidencePct: number;
  vulnerabilityMargin: number;
  mostVulnerableDirection: string;
  leastVulnerableDirection: string;
  topologyShockScore: number;
  isStructuralTransition: boolean;
  transitionProbabilityPct: number;
  minimumInterventionCost: number;
  recommendedInterventionName: string;
  recoveryTimeTicks: number;
  uncertaintyInterval: [number, number];
  computationTimeMs: number;
  scientificSummary: string;
}

export class OrbitEngine {
  private config: OrbitConfig;
  private boundaryEngine: BoundaryInferenceEngine;
  private topologyEvaluator: TopologyShockEvaluator;
  private escapeOptimizer: EscapeOptimizer;
  private counterfactualEngine: CounterfactualEngine;
  private uncertaintyEstimator: UncertaintyEstimator;

  constructor(config: Partial<OrbitConfig> = {}) {
    this.config = { ...DEFAULT_ORBIT_CONFIG, ...config };
    this.boundaryEngine = new BoundaryInferenceEngine();
    this.topologyEvaluator = new TopologyShockEvaluator(this.config.topologyShockThreshold);
    this.escapeOptimizer = new EscapeOptimizer();
    this.counterfactualEngine = new CounterfactualEngine();
    this.uncertaintyEstimator = new UncertaintyEstimator();
  }

  public getConfig(): OrbitConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<OrbitConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.topologyEvaluator = new TopologyShockEvaluator(this.config.topologyShockThreshold);
  }

  /**
   * Primary inference step:
   * Assesses Boundary Distance, Directional Profile, Structural Stability,
   * Minimum Escape Interventions, and Uncertainty.
   */
  public analyzeSystem(
    currentState: SystemState,
    candidateInterventions: GenericIntervention[] = [],
    futureStateReference?: SystemState
  ): {
    boundary: BoundaryEstimate;
    topologyShock: TopologyShock;
    escapePlan: EscapeOptimizationResult;
    counterfactual: CounterfactualResult;
    uncertainty: UncertaintyEstimate;
    scorecard: OrbitScorecard;
  } {
    const startTime = performance.now();
    const stateVector = systemStateToVector(currentState);

    // 1. Boundary Inference
    const boundary = this.boundaryEngine.inferBoundary(
      stateVector,
      currentState.constraints,
      this.config
    );

    // 2. Topology Shock Evaluation
    const refState = futureStateReference || currentState;
    const topologyShock = this.topologyEvaluator.evaluateTopologyShock(currentState, refState);

    // 3. Escape Intervention Optimization
    const escapePlan = this.escapeOptimizer.optimizeEscape(
      currentState,
      candidateInterventions,
      currentState.constraints,
      this.config
    );

    // 4. Counterfactual Simulation of top candidate
    const counterfactual = this.counterfactualEngine.simulateCounterfactual(
      currentState,
      escapePlan.recommendedIntervention,
      currentState.constraints,
      this.config
    );

    // 5. Uncertainty Quantification
    const uncertaintyRes = this.uncertaintyEstimator.estimateBtdUncertainty(
      stateVector,
      currentState.constraints,
      {
        sampleCount: this.config.monteCarloSamples,
        noiseSigma: 0.04,
        missingDataRate: 0.0
      }
    );

    const totalTimeMs = performance.now() - startTime;

    // 6. Build Scientific Scorecard
    const scorecard: OrbitScorecard = {
      btd: Number(boundary.btd.toFixed(3)),
      btdUnit: 'normalized L2',
      isNearBoundary: boundary.isNearBoundary,
      boundaryConfidencePct: Number((boundary.confidence * 100).toFixed(1)),
      vulnerabilityMargin: Number(boundary.vulnerabilityMargin.toFixed(3)),
      mostVulnerableDirection: boundary.mostVulnerableDirection.directionName,
      leastVulnerableDirection: boundary.leastVulnerableDirection.directionName,
      topologyShockScore: Number(topologyShock.shockMagnitude.toFixed(3)),
      isStructuralTransition: topologyShock.isStructuralTransition,
      transitionProbabilityPct: Number((counterfactual.transitionProbability * 100).toFixed(1)),
      minimumInterventionCost: escapePlan.recommendedIntervention ? Number(escapePlan.recommendedIntervention.totalCost.toFixed(1)) : 0,
      recommendedInterventionName: escapePlan.recommendedIntervention?.name || 'Status Quo (No Feasible Escape)',
      recoveryTimeTicks: counterfactual.recoveryTimeTicks,
      uncertaintyInterval: [
        Number(uncertaintyRes.estimate.confidenceInterval95[0].toFixed(3)),
        Number(uncertaintyRes.estimate.confidenceInterval95[1].toFixed(3))
      ],
      computationTimeMs: Number(totalTimeMs.toFixed(1)),
      scientificSummary: `BTD: ${boundary.btd.toFixed(3)} [CI95: ${uncertaintyRes.estimate.confidenceInterval95[0].toFixed(2)}-${uncertaintyRes.estimate.confidenceInterval95[1].toFixed(2)}]. Vulnerable vector: ${boundary.mostVulnerableDirection.directionName}. Topology Shock: ${(topologyShock.shockMagnitude * 100).toFixed(1)}%.`
    };

    return {
      boundary,
      topologyShock,
      escapePlan,
      counterfactual,
      uncertainty: uncertaintyRes.estimate,
      scorecard
    };
  }
}
