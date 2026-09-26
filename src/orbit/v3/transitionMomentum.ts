/**
 * Transition Momentum Engine for ORBIT-A 3.0
 * 
 * Quantifies dynamic kinetic push toward regime transition:
 * TM = ||\dot{X}|| * max(0, cos\theta) + 0.5 * ||\ddot{X}|| * max(0, cos\theta)
 */

import { StateVector } from '../core/types';

export interface TransitionMomentumResult {
  transitionMomentum: number;
  velocityNorm: number;
  accelerationNorm: number;
  alignmentCosTheta: number;
  momentumHazardLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

export class TransitionMomentumEngine {
  public computeMomentum(
    currentState: StateVector,
    previousState: StateVector | null,
    priorPreviousState: StateVector | null,
    vulnerableDirectionVector: Float64Array
  ): TransitionMomentumResult {
    const dim = currentState.values.length;

    if (!previousState || previousState.values.length !== dim) {
      return {
        transitionMomentum: 0.0,
        velocityNorm: 0.0,
        accelerationNorm: 0.0,
        alignmentCosTheta: 0.0,
        momentumHazardLevel: 'LOW'
      };
    }

    // 1. Velocity vector \dot{X}
    const vel = new Float64Array(dim);
    let velSq = 0;
    for (let i = 0; i < dim; i++) {
      const denom = Math.max(1e-5, currentState.bounds[i].max - currentState.bounds[i].min);
      vel[i] = (currentState.values[i] - previousState.values[i]) / denom;
      velSq += vel[i] * vel[i];
    }
    const velocityNorm = Math.sqrt(velSq);

    // 2. Acceleration vector \ddot{X}
    let accelSq = 0;
    if (priorPreviousState && priorPreviousState.values.length === dim) {
      for (let i = 0; i < dim; i++) {
        const denom = Math.max(1e-5, currentState.bounds[i].max - currentState.bounds[i].min);
        const prevVel = (previousState.values[i] - priorPreviousState.values[i]) / denom;
        const accel = vel[i] - prevVel;
        accelSq += accel * accel;
      }
    }
    const accelerationNorm = Math.sqrt(accelSq);

    // 3. Directional Alignment cos\theta with vulnerability ray
    let dot = 0;
    let vulnNormSq = 0;
    for (let i = 0; i < dim; i++) {
      dot += vel[i] * vulnerableDirectionVector[i];
      vulnNormSq += vulnerableDirectionVector[i] * vulnerableDirectionVector[i];
    }
    const vulnNorm = Math.sqrt(vulnNormSq);
    const alignmentCosTheta = (velocityNorm > 1e-6 && vulnNorm > 1e-6)
      ? Math.max(-1.0, Math.min(1.0, dot / (velocityNorm * vulnNorm)))
      : 0.0;

    // 4. Transition Momentum
    const positiveAlignment = Math.max(0.0, alignmentCosTheta);
    const tm = Number((velocityNorm * positiveAlignment * 5.0 + 0.5 * accelerationNorm * positiveAlignment * 10.0).toFixed(4));

    let momentumHazardLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (tm > 1.2) momentumHazardLevel = 'CRITICAL';
    else if (tm > 0.6) momentumHazardLevel = 'HIGH';
    else if (tm > 0.25) momentumHazardLevel = 'ELEVATED';

    return {
      transitionMomentum: tm,
      velocityNorm: Number(velocityNorm.toFixed(4)),
      accelerationNorm: Number(accelerationNorm.toFixed(4)),
      alignmentCosTheta: Number(alignmentCosTheta.toFixed(4)),
      momentumHazardLevel
    };
  }
}
