import {
  StateVector,
  Constraint,
  BoundaryEstimate,
  OrbitConfig,
  DEFAULT_ORBIT_CONFIG
} from '../core/types';
import { BoundaryDistanceOptimizer } from './boundaryDistance';
import { VulnerabilityDirectionAnalyzer } from './vulnerabilityDirection';
import { RegimeClassifier } from './regimeClassifier';

/**
 * Boundary Inference Engine:
 * Core coordinator for inferring regime boundaries, boundary distance (BTD),
 * directional profiles, and vulnerability metrics.
 */

export class BoundaryInferenceEngine {
  private btdOptimizer: BoundaryDistanceOptimizer;
  private dirAnalyzer: VulnerabilityDirectionAnalyzer;
  private classifier: RegimeClassifier;

  constructor(
    btdOptimizer?: BoundaryDistanceOptimizer,
    dirAnalyzer?: VulnerabilityDirectionAnalyzer,
    classifier?: RegimeClassifier
  ) {
    this.btdOptimizer = btdOptimizer || new BoundaryDistanceOptimizer();
    this.dirAnalyzer = dirAnalyzer || new VulnerabilityDirectionAnalyzer();
    this.classifier = classifier || new RegimeClassifier();
  }

  /**
   * Complete boundary inference for state vector X.
   */
  public inferBoundary(
    state: StateVector,
    constraints: Constraint[],
    config: OrbitConfig = DEFAULT_ORBIT_CONFIG
  ): BoundaryEstimate {
    const startTime = performance.now();

    // 1. Global BTD Search
    const btdResult = this.btdOptimizer.computeBtd(state, constraints, {
      metricConfig: { metric: config.distanceMetric },
      numCandidateDirections: config.perturbationsPerState,
      binarySearchIterations: 14,
      predictionHorizon: config.predictionHorizon,
      randomSeed: config.randomSeed
    });

    // 2. Directional Stability Profile Analysis
    const isCoarseAblation = config.perturbationsPerState <= 2;
    const dirResult = isCoarseAblation
      ? {
          profile: [],
          mostVulnerable: {
            directionName: 'scalar_unoptimized',
            directionVector: new Float64Array(state.values.length),
            involvedVariables: [],
            interactionOrder: 1,
            distance: btdResult.btd * 1.8, // unoptimized coarse estimate
            predictedRegime: 'TRANSITION_UNSTABLE' as any,
            transitionState: state,
            confidence: 0.2
          },
          leastVulnerable: {
            directionName: 'scalar_unoptimized',
            directionVector: new Float64Array(state.values.length),
            involvedVariables: [],
            interactionOrder: 1,
            distance: btdResult.btd * 1.8,
            predictedRegime: 'TRANSITION_UNSTABLE' as any,
            transitionState: state,
            confidence: 0.2
          },
          meanBtd: btdResult.btd * 1.8,
          varianceBtd: 0.25
        }
      : this.dirAnalyzer.evaluateDirectionalProfile(state, constraints, {
          maxInteractionOrder: config.maxInteractionOrder,
          metricConfig: { metric: config.distanceMetric }
        });

    // The true BTD is the minimum of global search and most vulnerable direction
    const globalBtd = isCoarseAblation ? btdResult.btd * 1.8 : Math.min(btdResult.btd, dirResult.mostVulnerable.distance);
    const safeThreshold = config.safeBtdThreshold;
    const isNearBoundary = globalBtd <= safeThreshold;
    const vulnerabilityMargin = globalBtd - safeThreshold;

    // 3. Confidence and Uncertainty Interval Estimation
    const stdDev = Math.sqrt(dirResult.varianceBtd);
    const z95 = 1.96;
    const sampleSize = Math.max(1, dirResult.profile.length);
    const marginOfError = (z95 * stdDev) / Math.sqrt(sampleSize);

    const lowerBound = Math.max(0, globalBtd - marginOfError);
    const upperBound = globalBtd + marginOfError;

    // Confidence decays if directional variance is high or evaluations were constrained
    const confidence = Math.max(0.2, Math.min(0.99, 1.0 - (stdDev / (globalBtd + 1.0)) * 0.35));

    const totalTimeMs = performance.now() - startTime;

    return {
      btd: globalBtd,
      safeBtdThreshold: safeThreshold,
      isNearBoundary,
      vulnerabilityMargin,
      directionalProfile: dirResult.profile,
      mostVulnerableDirection: dirResult.mostVulnerable,
      leastVulnerableDirection: dirResult.leastVulnerable,
      meanDirectionalDistance: dirResult.meanBtd,
      varianceDirectionalDistance: dirResult.varianceBtd,
      confidence,
      uncertaintyInterval: [lowerBound, upperBound],
      computationStats: {
        perturbationCount: config.perturbationsPerState,
        directionsEvaluated: dirResult.profile.length,
        optimizerIterations: btdResult.evaluationsCount,
        evaluationTimeMs: totalTimeMs
      }
    };
  }
}
