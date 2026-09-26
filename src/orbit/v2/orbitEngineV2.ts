/**
 * ORBIT-A 2.0 Core Operational Resilience Engine
 * 
 * Orchestrates:
 * 1. Contextual Boundary Distance
 * 2. Probabilistic Boundary Risk P_cross(X, H)
 * 3. Directional Risk Analysis
 * 4. Boundary Risk Score Calculation
 * 5. Adaptive Alarm Policy with Deadband Hysteresis and Temporal Persistence
 * 6. Expected Intervention Value & Minimum Escape Optimization
 */

import {
  SystemState,
  StateVector,
  GenericIntervention
} from '../core/types';
import { systemStateToVector } from '../core/stateVector';
import { BoundaryInferenceEngine } from '../boundary/boundaryInference';
import { TopologyShockEvaluator } from '../topology/topologyShock';
import { UncertaintyEstimator } from '../uncertainty/uncertaintyEstimator';
import { RegimeClassifier } from '../boundary/regimeClassifier';

import {
  OrbitV2Config,
  DEFAULT_ORBIT_V2_CONFIG,
  OrbitV2AnalysisResult
} from './types';
import { ProbabilisticBoundaryEngine } from './probabilisticBoundary';
import { ContextualDistanceEngine } from './contextualDistance';
import { DirectionalRiskEngine } from './directionalRisk';
import { AlarmPolicyEngine } from './alarmPolicy';
import { InterventionValueEngine } from './interventionValue';

export class OrbitEngineV2 {
  private config: OrbitV2Config;
  private boundaryEngine: BoundaryInferenceEngine;
  private topologyEvaluator: TopologyShockEvaluator;
  private uncertaintyEstimator: UncertaintyEstimator;
  private regimeClassifier: RegimeClassifier;

  private probEngine: ProbabilisticBoundaryEngine;
  private contextualEngine: ContextualDistanceEngine;
  private directionalRiskEngine: DirectionalRiskEngine;
  private alarmPolicyEngine: AlarmPolicyEngine;
  private interventionValueEngine: InterventionValueEngine;

  private previousStateVector: StateVector | null = null;

  constructor(config: Partial<OrbitV2Config> = {}) {
    this.config = { ...DEFAULT_ORBIT_V2_CONFIG, ...config };
    this.boundaryEngine = new BoundaryInferenceEngine();
    this.topologyEvaluator = new TopologyShockEvaluator(0.30);
    this.uncertaintyEstimator = new UncertaintyEstimator();
    this.regimeClassifier = new RegimeClassifier();

    this.probEngine = new ProbabilisticBoundaryEngine();
    this.contextualEngine = new ContextualDistanceEngine();
    this.directionalRiskEngine = new DirectionalRiskEngine();
    this.alarmPolicyEngine = new AlarmPolicyEngine(this.config.alarmThreshold);
    this.interventionValueEngine = new InterventionValueEngine();
  }

  public getConfig(): OrbitV2Config {
    return { ...this.config };
  }

  public setAlarmThreshold(threshold: number): void {
    this.config.alarmThreshold = threshold;
    this.alarmPolicyEngine.setCalibratedThreshold(threshold);
  }

  public resetMemory(): void {
    this.previousStateVector = null;
    this.alarmPolicyEngine.resetState();
  }

  /**
   * Main inference step for ORBIT-A 2.0
   */
  public analyzeSystem(
    currentState: SystemState,
    candidateInterventions: GenericIntervention[] = [],
    futureStateReference?: SystemState
  ): OrbitV2AnalysisResult {
    const startTime = performance.now();
    const stateVector = systemStateToVector(currentState);

    // 1. Raw BTD & Directional Boundary Inference
    const boundaryEstimate = this.boundaryEngine.inferBoundary(
      stateVector,
      currentState.constraints,
      {
        predictionHorizon: this.config.predictionHorizon,
        safeBtdThreshold: this.config.safeBtdThreshold,
        perturbationsPerState: 16,
        distanceMetric: 'NORMALIZED_WEIGHTED'
      } as any
    );

    // 2. Topology Shock & Uncertainty Estimation
    const refState = futureStateReference || currentState;
    const topologyShock = this.topologyEvaluator.evaluateTopologyShock(currentState, refState);
    const uncertainty = this.uncertaintyEstimator.estimateBtdUncertainty(
      stateVector,
      currentState.constraints,
      { sampleCount: 4, noiseSigma: this.config.diffusionSigma }
    );

    // 3. Directional Risk Analysis (empirical drift vs worst-case ray)
    const directionalRisk = this.directionalRiskEngine.evaluateDirectionalRisk(
      stateVector,
      this.previousStateVector,
      boundaryEstimate.directionalProfile
    );

    // 4. Contextual Boundary Distance
    const contextualDistance = this.contextualEngine.evaluateContextualDistance(
      stateVector,
      this.previousStateVector,
      boundaryEstimate.btd,
      directionalRisk.mostProbableDirectionVector,
      topologyShock.shockMagnitude,
      uncertainty.estimate.standardDeviation,
      this.config
    );

    // 5. Probabilistic Boundary Risk: P_cross(X, H)
    const velocityTowardBoundary = contextualDistance.velocityNorm * Math.max(0, contextualDistance.velocityAlignmentCos);
    const probabilisticBoundary = this.probEngine.estimateCrossingProbability(
      contextualDistance.contextualBtd,
      velocityTowardBoundary,
      this.config
    );

    // 6. Boundary Risk Score (BR)
    const boundaryRiskScore = this.alarmPolicyEngine.computeBoundaryRiskScore(
      probabilisticBoundary.pCross,
      contextualDistance.contextualBtd
    );

    // 7. Adaptive Alarm Policy with Deadband Hysteresis and Persistence
    const alarmPolicy = this.alarmPolicyEngine.evaluateAlarmPolicy(
      boundaryRiskScore,
      this.config
    );

    // 8. Expected Intervention Value & Minimum Escape Action
    const interventionResult = this.interventionValueEngine.evaluateInterventions(
      currentState,
      stateVector,
      this.previousStateVector,
      candidateInterventions,
      currentState.constraints,
      directionalRisk.mostProbableDirectionVector,
      probabilisticBoundary.pCross,
      this.config
    );

    // 9. Regime Classification
    const predictedRegime = this.regimeClassifier.classify(stateVector, currentState.constraints).type;

    // Cache state vector for velocity estimation in the next time frame
    this.previousStateVector = stateVector;

    const inferenceTimeMs = Number((performance.now() - startTime).toFixed(1));

    const summary = `ORBIT-A 2.0 | Contextual BTD: ${contextualDistance.contextualBtd.toFixed(3)} | P_cross(${this.config.predictionHorizon}h): ${(probabilisticBoundary.pCross * 100).toFixed(1)}% | Risk: ${(boundaryRiskScore * 100).toFixed(1)}% [${alarmPolicy.alarmLevel}] | Top Vulnerable: ${directionalRisk.mostProbableDirectionName} | Net Intervention Value: $${interventionResult.netExpectedValue}k`;

    return {
      timestamp: currentState.timestamp,
      currentState,
      stateVector,
      contextualDistance,
      probabilisticBoundary,
      directionalRisk,
      boundaryRiskScore,
      alarmPolicy,
      recommendedEscape: interventionResult.recommendedEscape,
      interventionCandidatesRanked: interventionResult.rankedCandidates,
      netInterventionValueExpected: interventionResult.netExpectedValue,
      topologyShock,
      uncertainty: uncertainty.estimate,
      predictedRegime,
      inferenceTimeMs,
      summary
    };
  }
}
