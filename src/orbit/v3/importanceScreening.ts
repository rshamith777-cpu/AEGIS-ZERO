/**
 * High-Dimensional Importance Screening & Pairwise Interaction Discovery
 * 
 * Screens high-dimensional state spaces (100+ variables) to identify the critical
 * active sub-space before boundary inference, and discovers pairwise cross-couplings (x_i * x_j).
 */

import { StateVector, Constraint, SystemState } from '../core/types';

export interface ScreenedFeature {
  index: number;
  variableName: string;
  nodeId: string;
  importanceScore: number;
  normalizedVelocity: number;
  constraintProximity: number;
}

export interface PairwiseInteraction {
  varA: string;
  varB: string;
  interactionStrength: number;
}

export class HighDimensionalImportanceScreener {
  /**
   * Screens top K variables using constraint proximity, state velocity, and structural impact.
   */
  public screenVariables(
    state: StateVector,
    previousState: StateVector | null,
    constraints: Constraint[],
    maxTopFeatures: number = 16
  ): {
    screenedIndices: number[];
    features: ScreenedFeature[];
  } {
    const featureMap = new Map<number, ScreenedFeature>();

    for (let i = 0; i < state.values.length; i++) {
      const varName = state.variableNames[i];
      const val = state.values[i];
      const bound = state.bounds[i];
      const denom = Math.max(1e-5, bound.max - bound.min);

      // 1. Velocity component
      let velocity = 0;
      if (previousState && previousState.values.length === state.values.length) {
        velocity = Math.abs(val - previousState.values[i]) / denom;
      }

      // 2. Constraint proximity component
      let minConstraintMargin = 1.0;
      for (const c of constraints) {
        if (c.variableName === varName) {
          const margin = c.type === 'max'
            ? (c.threshold - val) / Math.max(1e-5, Math.abs(c.threshold))
            : (val - c.threshold) / Math.max(1e-5, Math.abs(c.threshold));
          minConstraintMargin = Math.min(minConstraintMargin, Math.max(0.001, margin));
        }
      }
      const constraintProximity = 1.0 / (minConstraintMargin + 0.1);

      // 3. Combined importance score
      const importanceScore = 0.55 * constraintProximity + 0.45 * (1 + velocity * 10.0);

      featureMap.set(i, {
        index: i,
        variableName: varName,
        nodeId: state.nodeMapping[i]?.nodeId || 'global',
        importanceScore,
        normalizedVelocity: velocity,
        constraintProximity
      });
    }

    const sorted = Array.from(featureMap.values()).sort((a, b) => b.importanceScore - a.importanceScore);
    const topK = sorted.slice(0, Math.min(maxTopFeatures, sorted.length));

    return {
      screenedIndices: topK.map((f) => f.index),
      features: topK
    };
  }

  /**
   * Discovers non-linear pairwise interactions (x_i * x_j) across the screened active subspace.
   */
  public discoverPairwiseInteractions(
    state: StateVector,
    screenedIndices: number[],
    systemState: SystemState
  ): PairwiseInteraction[] {
    const interactions: PairwiseInteraction[] = [];

    // Analyze edges for structural interaction
    systemState.edges.forEach((edge) => {
      const srcNodeId = edge.source;
      const tgtNodeId = edge.target;

      // Find screened variables belonging to source and target
      const srcIndices = screenedIndices.filter((idx) => state.nodeMapping[idx]?.nodeId === srcNodeId);
      const tgtIndices = screenedIndices.filter((idx) => state.nodeMapping[idx]?.nodeId === tgtNodeId);

      for (const sIdx of srcIndices) {
        for (const tIdx of tgtIndices) {
          const valS = state.values[sIdx] / Math.max(1, state.bounds[sIdx].max);
          const valT = state.values[tIdx] / Math.max(1, state.bounds[tIdx].max);
          const strength = Number((valS * valT * (edge.active ? 1.0 : 0.0) * ((edge.capacity || 100) / 100.0)).toFixed(4));

          if (strength > 0.05) {
            interactions.push({
              varA: `${state.nodeMapping[sIdx]?.nodeId}:${state.variableNames[sIdx]}`,
              varB: `${state.nodeMapping[tIdx]?.nodeId}:${state.variableNames[tIdx]}`,
              interactionStrength: strength
            });
          }
        }
      }
    });

    return interactions.sort((a, b) => b.interactionStrength - a.interactionStrength).slice(0, 10);
  }
}
