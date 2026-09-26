import { StateVector, UncertaintyEstimate, Constraint } from '../core/types';
import { cloneVector, addVectors } from '../core/stateVector';
import { TransitionModel } from '../core/transitionModel';
import { BoundaryDistanceOptimizer } from '../boundary/boundaryDistance';
import { computeCalibratedConfidence } from './confidence';

/**
 * Uncertainty Estimator:
 * Employs Monte Carlo sampling (default 128 samples, configurable)
 * to estimate epistemic and aleatoric uncertainty from:
 * 1. Observation noise (\sigma)
 * 2. Missing data rate
 * 3. Model disturbance propagation
 * 
 * Returns mean, variance, 95% confidence interval, and information entropy.
 */

export interface UncertaintyOptions {
  sampleCount: number; // default 128
  noiseSigma: number;
  missingDataRate: number;
  randomSeed?: number;
}

export class UncertaintyEstimator {
  private transitionModel: TransitionModel;
  private btdOptimizer: BoundaryDistanceOptimizer;

  constructor(transitionModel?: TransitionModel, btdOptimizer?: BoundaryDistanceOptimizer) {
    this.transitionModel = transitionModel || new TransitionModel();
    this.btdOptimizer = btdOptimizer || new BoundaryDistanceOptimizer();
  }

  public estimateBtdUncertainty(
    state: StateVector,
    constraints: Constraint[],
    options: Partial<UncertaintyOptions> = {}
  ): {
    estimate: UncertaintyEstimate;
    btdSamples: Float64Array;
    confidence: number;
  } {
    const sampleCount = options.sampleCount ?? 128;
    const noiseSigma = options.noiseSigma ?? 0.05;
    const missingDataRate = options.missingDataRate ?? 0.0;
    const dim = state.values.length;

    let seed = options.randomSeed ?? 101;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const btdSamples = new Float64Array(sampleCount);

    for (let s = 0; s < sampleCount; s++) {
      // Create noisy / missing data perturbation
      const perturbedState = cloneVector(state);

      for (let i = 0; i < dim; i++) {
        // Missing data simulation: imputation with mean nominal
        if (rng() < missingDataRate) {
          perturbedState.values[i] = (state.bounds[i].min + state.bounds[i].max) * 0.5;
        } else {
          // Add observation noise
          const u1 = Math.max(1e-6, rng());
          const u2 = rng();
          const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          const range = state.bounds[i].max - state.bounds[i].min;
          perturbedState.values[i] += z * noiseSigma * range;
        }
      }

      // Compute quick BTD on perturbed sample
      const res = this.btdOptimizer.computeBtd(perturbedState, constraints, {
        numCandidateDirections: 16,
        binarySearchIterations: 8
      });
      btdSamples[s] = res.btd;
    }

    // Compute Sample Statistics
    let sum = 0;
    for (let s = 0; s < sampleCount; s++) sum += btdSamples[s];
    const mean = sum / sampleCount;

    let varSum = 0;
    for (let s = 0; s < sampleCount; s++) {
      const diff = btdSamples[s] - mean;
      varSum += diff * diff;
    }
    const variance = sampleCount > 1 ? varSum / (sampleCount - 1) : 0;
    const standardDeviation = Math.sqrt(variance);

    // Sort to extract empirical 95% confidence interval [2.5%, 97.5%]
    const sorted = new Float64Array(btdSamples).sort();
    const lowerIdx = Math.floor(sampleCount * 0.025);
    const upperIdx = Math.min(sampleCount - 1, Math.ceil(sampleCount * 0.975));
    const confidenceInterval95: [number, number] = [sorted[lowerIdx], sorted[upperIdx]];

    // Differential Entropy for Gaussian approximation: 0.5 * ln(2 * pi * e * var)
    const safeVar = Math.max(1e-6, variance);
    const entropy = 0.5 * Math.log(2 * Math.PI * Math.E * safeVar);

    const confidence = computeCalibratedConfidence(variance, missingDataRate, noiseSigma);

    return {
      estimate: {
        mean,
        variance,
        standardDeviation,
        confidenceInterval95,
        sampleCount,
        entropy,
        observationNoiseSigma: noiseSigma,
        missingDataFraction: missingDataRate
      },
      btdSamples,
      confidence
    };
  }
}
