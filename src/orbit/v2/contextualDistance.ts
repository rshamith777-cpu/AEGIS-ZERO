/**
 * Contextual Boundary Distance Engine for ORBIT-A 2.0
 * 
 * Replaces static scalar Euclidean distance with contextual geometry:
 * BTD_contextual = \frac{BTD}{\max(\epsilon, 1 + \alpha_v \cdot \langle \hat{v}_{drift}, \hat{v}_{vuln} \rangle \|\dot{X}\|)} \cdot (1 - \gamma_{topo} \cdot TS) - \mu_{uncert} \cdot \sigma_X
 */

import { StateVector } from '../core/types';
import { OrbitV2Config, ContextualDistanceResult } from './types';

export class ContextualDistanceEngine {
  /**
   * Evaluates contextual boundary distance given current state vector,
   * preceding state vector (for velocity estimation), raw BTD, and topology/uncertainty scores.
   */
  public evaluateContextualDistance(
    currentState: StateVector,
    previousState: StateVector | null,
    rawBtd: number,
    vulnerableDirectionVector: Float64Array,
    topologyShockMagnitude: number,
    uncertaintySigma: number,
    config: OrbitV2Config
  ): ContextualDistanceResult {
    const dim = currentState.values.length;

    // 1. Calculate local state velocity: \dot{X} = X_t - X_{t-1}
    let velocityNorm = 0;
    const velocityVector = new Float64Array(dim);

    if (previousState && previousState.values.length === dim) {
      for (let i = 0; i < dim; i++) {
        const diff = currentState.values[i] - previousState.values[i];
        velocityVector[i] = diff;
        velocityNorm += diff * diff;
      }
      velocityNorm = Math.sqrt(velocityNorm);
    } else {
      // Default small nominal stationary velocity
      velocityNorm = 0.05;
    }

    // 2. Velocity-to-vulnerability directional alignment: \cos(\theta) = \frac{\langle v, u \rangle}{\|v\| \|u\|}
    let dotProduct = 0;
    let uNorm = 0;
    for (let i = 0; i < dim; i++) {
      const uVal = vulnerableDirectionVector[i] || 0;
      dotProduct += velocityVector[i] * uVal;
      uNorm += uVal * uVal;
    }
    uNorm = Math.sqrt(uNorm);

    const alignmentCos = velocityNorm > 1e-6 && uNorm > 1e-6 ? dotProduct / (velocityNorm * uNorm) : 0;

    // 3. Dynamic velocity contraction factor:
    // If state is actively drifting TOWARDS the vulnerable boundary (alignmentCos > 0),
    // the effective boundary distance shrinks proportionally to velocity.
    const effectiveAlignment = Math.max(0, alignmentCos);
    const velocityFactor = Math.max(0.1, 1.0 + config.velocityDiscount * effectiveAlignment * velocityNorm);

    // 4. Structural topology coupling discount
    const clampedShock = Math.min(1.0, Math.max(0.0, topologyShockMagnitude));
    const topologyFactor = Math.max(0.05, 1.0 - config.topologyCoupling * clampedShock);

    // 5. Epistemic/aleatoric uncertainty margin subtraction
    const uncertaintyMargin = config.uncertaintyPenalty * Math.max(0.0, uncertaintySigma);

    // Compute final contextual BTD
    const velocityAdjusted = rawBtd / velocityFactor;
    const topologyAdjusted = velocityAdjusted * topologyFactor;
    const contextualBtd = Math.max(0.0, topologyAdjusted - uncertaintyMargin);

    return {
      rawBtd: Number(rawBtd.toFixed(4)),
      velocityNorm: Number(velocityNorm.toFixed(4)),
      velocityAlignmentCos: Number(alignmentCos.toFixed(4)),
      topologyShockScore: Number(clampedShock.toFixed(4)),
      uncertaintyMargin: Number(uncertaintyMargin.toFixed(4)),
      contextualBtd: Number(contextualBtd.toFixed(4))
    };
  }
}
