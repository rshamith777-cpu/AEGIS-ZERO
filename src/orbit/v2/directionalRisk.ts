/**
 * Directional Risk Profiling Engine for ORBIT-A 2.0
 * 
 * Estimates the *most probable* transition direction rather than solely the
 * worst-case Euclidean boundary ray.
 * 
 * Weights boundary distance along ray \theta by empirical transition density:
 * Risk(\theta) = \frac{P(\theta \mid \dot{X}, \text{History})}{BTD(\theta) + \epsilon}
 */

import { StateVector, DirectionalBoundaryDistance } from '../core/types';
import { DirectionalRiskProfile } from './types';

export class DirectionalRiskEngine {
  /**
   * Computes directional risk profile given raw directional boundary distances
   * and local state velocity drift vector.
   */
  public evaluateDirectionalRisk(
    currentState: StateVector,
    previousState: StateVector | null,
    directionalDistances: DirectionalBoundaryDistance[]
  ): DirectionalRiskProfile {
    const dim = currentState.values.length;
    const velocity = new Float64Array(dim);

    if (previousState && previousState.values.length === dim) {
      for (let i = 0; i < dim; i++) {
        velocity[i] = currentState.values[i] - previousState.values[i];
      }
    }

    let velNorm = 0;
    for (let i = 0; i < dim; i++) velNorm += velocity[i] * velocity[i];
    velNorm = Math.sqrt(velNorm);

    // Profile each direction
    const evaluated: Array<{
      name: string;
      distance: number;
      probability: number;
      riskScore: number;
      vector: Float64Array;
      involvedVariables: string[];
    }> = [];

    let totalLikelihood = 0;

    for (const d of directionalDistances) {
      // Calculate cosine alignment between drift velocity and ray direction
      let dot = 0;
      let dNorm = 0;
      for (let i = 0; i < dim; i++) {
        const val = d.directionVector[i] || 0;
        dot += velocity[i] * val;
        dNorm += val * val;
      }
      dNorm = Math.sqrt(dNorm);

      const cosSim = velNorm > 1e-6 && dNorm > 1e-6 ? dot / (velNorm * dNorm) : 0;

      // Softmax energy formulation for empirical transition probability along ray:
      // Rays aligned with existing state drift have exponentially higher probability of realization.
      // High baseline entropy (temperature T = 0.5) ensures unaligned but close boundaries are not completely ignored.
      const driftAlignment = Math.max(0, cosSim);
      const likelihood = Math.exp(driftAlignment / 0.5);
      totalLikelihood += likelihood;

      evaluated.push({
        name: d.directionName,
        distance: d.distance,
        probability: likelihood,
        riskScore: 0,
        vector: d.directionVector,
        involvedVariables: d.involvedVariables
      });
    }

    // Normalize probabilities and compute directional risk: Risk = P / (Distance + 0.05)
    for (const item of evaluated) {
      item.probability = totalLikelihood > 0 ? item.probability / totalLikelihood : 1 / evaluated.length;
      item.riskScore = item.probability / (item.distance + 0.05);
    }

    // Sort by directional risk score descending
    evaluated.sort((a, b) => b.riskScore - a.riskScore);

    const top = evaluated[0] || {
      name: 'nominal_equilibrium',
      distance: 3.5,
      probability: 1.0,
      riskScore: 0.1,
      vector: new Float64Array(dim),
      involvedVariables: []
    };

    return {
      mostProbableDirectionName: top.name,
      mostProbableDirectionVector: top.vector,
      involvedVariables: top.involvedVariables,
      directionalProbability: Number(top.probability.toFixed(4)),
      directionalDistance: Number(top.distance.toFixed(4)),
      directionalRiskScore: Number(top.riskScore.toFixed(4)),
      profile: evaluated.slice(0, 10).map((e) => ({
        name: e.name,
        distance: Number(e.distance.toFixed(3)),
        probability: Number(e.probability.toFixed(3)),
        riskScore: Number(e.riskScore.toFixed(3))
      }))
    };
  }
}
