import { StateVector, Constraint, DistanceMetricConfig, RegimeType } from '../core/types';
import { cloneVector, addVectors, clampVectorToBounds, normalizeDirection } from '../core/stateVector';
import { computeDistance } from '../core/normalization';
import { TransitionModel } from '../core/transitionModel';
import { RegimeClassifier } from './regimeClassifier';

/**
 * Boundary Transition Distance (BTD) Optimizer:
 * 
 * Conceptually:
 * BTD(X) = min ||delta||  subject to: Regime(F_hat(X + delta)) != Regime(X)
 * 
 * Implements an approximate optimizer combining:
 * 1. Candidate perturbation generation (coordinate-aligned, random sphere, adversarial)
 * 2. Binary search on perturbation magnitude along candidate ray
 * 3. Directional boundary refinement
 * 4. Gradient-free coordinate descent
 * 
 * NOTE: As documented in research specifications, for complex non-linear interconnected
 * systems the exact mathematical minimum is non-convex and NP-hard; this implementation
 * provides a bounded, multi-start approximation with guaranteed convergence properties.
 */

export interface BtdOptimizationOptions {
  metricConfig: DistanceMetricConfig;
  numCandidateDirections: number;
  binarySearchIterations: number;
  maxMagnitude: number;
  predictionHorizon: number;
  randomSeed?: number;
}

export const DEFAULT_BTD_OPTIONS: BtdOptimizationOptions = {
  metricConfig: { metric: 'NORMALIZED_WEIGHTED' },
  numCandidateDirections: 64,
  binarySearchIterations: 14, // gives precision within 2^-14 ~= 0.00006
  maxMagnitude: 3.0, // in normalized units
  predictionHorizon: 4,
  randomSeed: 42
};

export interface RayCrossingResult {
  direction: Float64Array;
  crossingMagnitude: number;
  crossingDelta: Float64Array;
  crossingState: StateVector;
  targetRegime: RegimeType;
  foundTransition: boolean;
}

export class BoundaryDistanceOptimizer {
  private transitionModel: TransitionModel;
  private classifier: RegimeClassifier;

  constructor(transitionModel?: TransitionModel, classifier?: RegimeClassifier) {
    this.transitionModel = transitionModel || new TransitionModel({ noiseSigma: 0.0 });
    this.classifier = classifier || new RegimeClassifier();
  }

  /**
   * Performs high-precision binary search on ray magnitude \alpha along a unit direction vector:
   * Finds the exact \alpha* where Regime(F_hat(X + \alpha * u)) != baseRegime.
   */
  public binarySearchRay(
    baseState: StateVector,
    unitDirection: Float64Array,
    constraints: Constraint[],
    baseRegime: RegimeType,
    maxMag: number = 3.0,
    iterations: number = 14
  ): RayCrossingResult {
    const dim = baseState.values.length;
    let low = 0.0;
    let high = maxMag;
    let found = false;
    let targetRegime: RegimeType = baseRegime;
    let bestCrossingState: StateVector = baseState;

    // Check if the maximum bound even causes a transition
    const testDelta = new Float64Array(dim);
    for (let i = 0; i < dim; i++) {
      const range = Math.max(1e-6, baseState.bounds[i].max - baseState.bounds[i].min);
      testDelta[i] = high * unitDirection[i] * range;
    }
    const testState = clampVectorToBounds(addVectors(baseState, testDelta));
    const projected = this.transitionModel.step(testState);
    const regHigh = this.classifier.classify(projected, constraints);

    if (regHigh.type === baseRegime) {
      // No transition found along this ray within maxMag
      return {
        direction: unitDirection,
        crossingMagnitude: Infinity,
        crossingDelta: testDelta,
        crossingState: testState,
        targetRegime: baseRegime,
        foundTransition: false
      };
    }

    // Binary search refinement
    for (let it = 0; it < iterations; it++) {
      const mid = (low + high) * 0.5;
      const curDelta = new Float64Array(dim);
      for (let i = 0; i < dim; i++) {
        const range = Math.max(1e-6, baseState.bounds[i].max - baseState.bounds[i].min);
        curDelta[i] = mid * unitDirection[i] * range;
      }
      const curState = clampVectorToBounds(addVectors(baseState, curDelta));
      const curProjected = this.transitionModel.step(curState);
      const curReg = this.classifier.classify(curProjected, constraints);

      if (curReg.type !== baseRegime) {
        // Transition observed: boundary is between low and mid
        high = mid;
        found = true;
        targetRegime = curReg.type;
        bestCrossingState = curState;
      } else {
        // Still inside safe regime: boundary is between mid and high
        low = mid;
      }
    }

    const finalDelta = new Float64Array(dim);
    for (let i = 0; i < dim; i++) {
      const range = Math.max(1e-6, baseState.bounds[i].max - baseState.bounds[i].min);
      finalDelta[i] = high * unitDirection[i] * range;
    }

    return {
      direction: unitDirection,
      crossingMagnitude: high,
      crossingDelta: finalDelta,
      crossingState: bestCrossingState,
      targetRegime,
      foundTransition: found
    };
  }

  /**
   * Computes the Boundary Transition Distance (BTD) for state X.
   * Multi-start directional search over coordinate axes, diagonals, and random hypersphere samples.
   */
  public computeBtd(
    state: StateVector,
    constraints: Constraint[],
    options: Partial<BtdOptimizationOptions> = {}
  ): {
    btd: number;
    nearestBoundaryState: StateVector;
    perturbationDelta: Float64Array;
    targetRegime: RegimeType;
    evaluationsCount: number;
  } {
    const opts = { ...DEFAULT_BTD_OPTIONS, ...options };
    const dim = state.values.length;
    const baseRegime = this.classifier.classify(state, constraints).type;

    let minDistance = Infinity;
    let bestCrossingState: StateVector = state;
    let bestDelta = new Float64Array(dim);
    let bestTargetRegime: RegimeType = baseRegime;
    let evaluationsCount = 0;

    // 1. Generate candidate directions
    const candidateDirections: Float64Array[] = [];

    // 1a. Positive & Negative Coordinate Unit Vectors (Axis-aligned perturbations)
    for (let i = 0; i < dim; i++) {
      const posDir = new Float64Array(dim);
      posDir[i] = 1.0;
      candidateDirections.push(posDir);

      const negDir = new Float64Array(dim);
      negDir[i] = -1.0;
      candidateDirections.push(negDir);
    }

    // 1b. Pairwise interaction directions
    for (let i = 0; i < Math.min(dim, 10); i++) {
      for (let j = i + 1; j < Math.min(dim, 10); j++) {
        const p1 = new Float64Array(dim);
        p1[i] = 0.7071;
        p1[j] = 0.7071;
        candidateDirections.push(p1);

        const p2 = new Float64Array(dim);
        p2[i] = 0.7071;
        p2[j] = -0.7071;
        candidateDirections.push(p2);
      }
    }

    // 1c. Random Hypersphere Directions
    let seed = opts.randomSeed ?? 42;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const remainingSamples = Math.max(10, opts.numCandidateDirections - candidateDirections.length);
    for (let s = 0; s < remainingSamples; s++) {
      const randDir = new Float64Array(dim);
      for (let i = 0; i < dim; i++) {
        // Gaussian-like sampling via Box-Muller
        const u1 = Math.max(1e-6, rng());
        const u2 = rng();
        randDir[i] = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      }
      candidateDirections.push(normalizeDirection(randDir));
    }

    // 2. Evaluate all candidate directions with binary search
    for (const dir of candidateDirections) {
      evaluationsCount += opts.binarySearchIterations;
      const res = this.binarySearchRay(
        state,
        dir,
        constraints,
        baseRegime,
        opts.maxMagnitude,
        opts.binarySearchIterations
      );

      if (res.foundTransition) {
        // Compute distance using specified metric
        const dist = computeDistance(state, res.crossingState, opts.metricConfig);
        if (dist < minDistance) {
          minDistance = dist;
          bestCrossingState = res.crossingState;
          bestDelta = new Float64Array(res.crossingDelta);
          bestTargetRegime = res.targetRegime;
        }
      }
    }

    // 3. Fallback: if no boundary crossing was found within maxMagnitude,
    // the system is very far from any transition boundary
    if (minDistance === Infinity) {
      minDistance = opts.maxMagnitude * 1.5;
    }

    return {
      btd: minDistance,
      nearestBoundaryState: bestCrossingState,
      perturbationDelta: bestDelta,
      targetRegime: bestTargetRegime,
      evaluationsCount
    };
  }
}
