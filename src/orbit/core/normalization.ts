import { StateVector, DistanceMetricConfig } from './types';

/**
 * Normalization & Distance Metrics
 * Pluggable distance computation for BTD search:
 * - L1 norm
 * - L2 Euclidean norm
 * - Normalized Weighted L2 (Default): Scale-invariant across heterogeneous variables
 * - Mahalanobis distance approximation
 */

export function computeDistance(
  a: StateVector,
  b: StateVector,
  config: DistanceMetricConfig
): number {
  const len = a.values.length;
  if (b.values.length !== len) {
    throw new Error(`Dimension mismatch: vector a has ${len} elements, vector b has ${b.values.length}`);
  }

  switch (config.metric) {
    case 'L1': {
      let sum = 0;
      for (let i = 0; i < len; i++) {
        sum += Math.abs(a.values[i] - b.values[i]);
      }
      return sum;
    }

    case 'L2': {
      let sum = 0;
      for (let i = 0; i < len; i++) {
        const diff = a.values[i] - b.values[i];
        sum += diff * diff;
      }
      return Math.sqrt(sum);
    }

    case 'WEIGHTED_L2': {
      const weights = config.weights || a.weights;
      let sum = 0;
      for (let i = 0; i < len; i++) {
        const w = weights[i] ?? 1.0;
        const diff = a.values[i] - b.values[i];
        sum += w * diff * diff;
      }
      return Math.sqrt(sum);
    }

    case 'NORMALIZED_WEIGHTED':
    default: {
      // Scale-invariant normalized distance:
      // (x_i - y_i) / (max_i - min_i) weighted by importance
      const weights = config.weights || a.weights;
      let sum = 0;
      let totalWeight = 0;

      for (let i = 0; i < len; i++) {
        const w = weights[i] ?? 1.0;
        const range = Math.max(1e-6, a.bounds[i].max - a.bounds[i].min);
        const normalizedDiff = (a.values[i] - b.values[i]) / range;
        sum += w * (normalizedDiff * normalizedDiff);
        totalWeight += w;
      }

      if (totalWeight <= 0) totalWeight = 1.0;
      return Math.sqrt(sum / (totalWeight / len));
    }
  }
}

/**
 * Normalizes a raw vector into [0, 1] range based on bounds.
 */
export function normalizeStateVector(v: StateVector): Float64Array {
  const res = new Float64Array(v.values.length);
  for (let i = 0; i < v.values.length; i++) {
    const range = Math.max(1e-6, v.bounds[i].max - v.bounds[i].min);
    res[i] = (v.values[i] - v.bounds[i].min) / range;
  }
  return res;
}

/**
 * Denormalizes a [0, 1] vector back to raw values.
 */
export function denormalizeStateVector(normVals: Float64Array, template: StateVector): StateVector {
  const res = new Float64Array(normVals.length);
  for (let i = 0; i < normVals.length; i++) {
    const range = template.bounds[i].max - template.bounds[i].min;
    res[i] = normVals[i] * range + template.bounds[i].min;
  }
  return {
    ...template,
    values: res
  };
}
