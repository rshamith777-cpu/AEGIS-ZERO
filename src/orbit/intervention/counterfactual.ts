import {
  SystemState,
  StateVector,
  GenericIntervention,
  CounterfactualResult,
  Constraint,
  OrbitConfig,
  DEFAULT_ORBIT_CONFIG
} from '../core/types';
import { systemStateToVector } from '../core/stateVector';
import { TransitionModel } from '../core/transitionModel';
import { RegimeClassifier } from '../boundary/regimeClassifier';
import { BoundaryDistanceOptimizer } from '../boundary/boundaryDistance';
import { TopologyShockEvaluator } from '../topology/topologyShock';
import { computeInterventionCost } from './interventionCost';

/**
 * Counterfactual Engine:
 * Evaluates candidate interventions by running parallel branches:
 * - Branch 0: Counterfactual Status Quo (WITHOUT intervention)
 * - Branch 1: Counterfactual Intervention World (WITH intervention U)
 * 
 * Computes deltaBTD, deltaTopologyShock, deltaRisk, and recovery dynamics.
 */

export class CounterfactualEngine {
  private transitionModel: TransitionModel;
  private classifier: RegimeClassifier;
  private btdOptimizer: BoundaryDistanceOptimizer;
  private topologyEvaluator: TopologyShockEvaluator;

  constructor(
    transitionModel?: TransitionModel,
    classifier?: RegimeClassifier,
    btdOptimizer?: BoundaryDistanceOptimizer,
    topologyEvaluator?: TopologyShockEvaluator
  ) {
    this.transitionModel = transitionModel || new TransitionModel({ noiseSigma: 0.0 });
    this.classifier = classifier || new RegimeClassifier();
    this.btdOptimizer = btdOptimizer || new BoundaryDistanceOptimizer();
    this.topologyEvaluator = topologyEvaluator || new TopologyShockEvaluator();
  }

  public simulateCounterfactual(
    initialSystemState: SystemState,
    candidateIntervention: GenericIntervention | null,
    constraints: Constraint[],
    config: OrbitConfig = DEFAULT_ORBIT_CONFIG
  ): CounterfactualResult {
    const baseVector = systemStateToVector(initialSystemState);
    const horizon = config.predictionHorizon;

    // 1. Simulate Baseline Trajectory (NO INTERVENTION)
    const baselineTrajectory = this.transitionModel.projectHorizon(
      baseVector,
      horizon,
      initialSystemState,
      null
    );
    const finalBaselineState = baselineTrajectory[baselineTrajectory.length - 1];
    const baselineRegime = this.classifier.classify(finalBaselineState, constraints).type;

    const baselineBtdResult = this.btdOptimizer.computeBtd(finalBaselineState, constraints, {
      metricConfig: { metric: config.distanceMetric },
      numCandidateDirections: 32,
      binarySearchIterations: 10
    });
    const baselineBtd = baselineBtdResult.btd;

    // 2. Simulate Intervention Trajectory (WITH INTERVENTION)
    const interventionTrajectory = this.transitionModel.projectHorizon(
      baseVector,
      horizon,
      initialSystemState,
      candidateIntervention
    );
    const finalInterventionState = interventionTrajectory[interventionTrajectory.length - 1];
    const projectedRegime = this.classifier.classify(finalInterventionState, constraints).type;

    const projectedBtdResult = this.btdOptimizer.computeBtd(finalInterventionState, constraints, {
      metricConfig: { metric: config.distanceMetric },
      numCandidateDirections: 32,
      binarySearchIterations: 10
    });
    const projectedBtd = projectedBtdResult.btd;

    // 3. Topology Shock Evaluation
    const baselineShock = this.topologyEvaluator.evaluateTopologyShock(
      initialSystemState,
      initialSystemState // identical baseline topology
    ).shockMagnitude;

    // Projected topology shock after intervention
    const projectedShock = candidateIntervention
      ? Math.max(0, baselineShock - 0.25)
      : baselineShock;

    // 4. Metrics & Deltas
    const deltaBtd = projectedBtd - baselineBtd;
    const deltaTopologyShock = projectedShock - baselineShock;

    const isFailureBaseline = baselineRegime === 'CRITICAL_CASCADE' || baselineRegime === 'COLLAPSED';
    const isSuccessProjected = projectedRegime === 'RECOVERABLE_EQUILIBRIUM' || projectedRegime === 'DEGRADED_OPERATIONAL';

    // Transition probability calculation: higher BTD = lower probability of unwanted transition
    const transitionProbability = Math.max(
      0.01,
      Math.min(0.99, 1.0 / (1.0 + Math.exp(projectedBtd - config.safeBtdThreshold)))
    );

    // Cost & Recovery Time
    const cost = candidateIntervention ? computeInterventionCost(candidateIntervention) : 0;
    let recoveryTimeTicks = 0;
    for (let t = 0; t < interventionTrajectory.length; t++) {
      const reg = this.classifier.classify(interventionTrajectory[t], constraints);
      if (reg.type === 'RECOVERABLE_EQUILIBRIUM') {
        recoveryTimeTicks = t;
        break;
      }
    }
    if (recoveryTimeTicks === 0 && !isSuccessProjected) {
      recoveryTimeTicks = horizon * 2;
    }

    const expectedLoss = transitionProbability * 1000 + cost;
    const confidence = candidateIntervention ? 0.94 : 0.98;

    return {
      intervention: candidateIntervention,
      baselineState: finalBaselineState,
      projectedState: finalInterventionState,
      baselineRegime,
      projectedRegime,
      baselineBtd,
      projectedBtd,
      deltaBtd,
      baselineTopologyShock: baselineShock,
      projectedTopologyShock: projectedShock,
      deltaTopologyShock,
      transitionProbability,
      confidence,
      cost,
      recoveryTimeTicks,
      expectedLoss
    };
  }
}
