/**
 * Empirical Direction Proposal Distribution
 * 
 * Replaces pure uniform random perturbations with structured direction proposals
 * derived from:
 * 1. State velocity (\dot{X})
 * 2. Structural graph centrality
 * 3. Covariance / empirical variation
 * 4. Constraint gradient sensitivity
 * 5. Historical transition boundary vectors
 */

import { StateVector, Constraint, SystemState } from '../core/types';
import { ScreenedFeature } from './importanceScreening';

export interface ProposalDirection {
  name: string;
  vector: Float64Array;
  source: 'VELOCITY' | 'CENTRALITY' | 'COVARIANCE' | 'SENSITIVITY' | 'HISTORICAL';
  priorWeight: number;
}

export class DirectionalProposalEngine {
  private historicalBreachDirections: Float64Array[] = [];

  public registerBreachDirection(direction: Float64Array): void {
    if (this.historicalBreachDirections.length > 8) {
      this.historicalBreachDirections.shift();
    }
    this.historicalBreachDirections.push(new Float64Array(direction));
  }

  /**
   * Generates prioritized direction proposal distribution.
   */
  public generateProposals(
    state: StateVector,
    previousState: StateVector | null,
    screenedFeatures: ScreenedFeature[],
    constraints: Constraint[],
    systemState: SystemState,
    proposalCount: number = 32
  ): ProposalDirection[] {
    const dim = state.values.length;
    const proposals: ProposalDirection[] = [];

    // 1. Velocity-Aligned Direction (State Momentum Ray)
    if (previousState && previousState.values.length === dim) {
      const velVec = new Float64Array(dim);
      let velNorm = 0;
      for (let i = 0; i < dim; i++) {
        const diff = state.values[i] - previousState.values[i];
        velVec[i] = diff;
        velNorm += diff * diff;
      }
      velNorm = Math.sqrt(velNorm);
      if (velNorm > 1e-6) {
        for (let i = 0; i < dim; i++) velVec[i] /= velNorm;
        proposals.push({
          name: 'Empirical State Velocity Ray',
          vector: velVec,
          source: 'VELOCITY',
          priorWeight: 1.8
        });
      }
    }

    // 2. Constraint Sensitivity Rays (Direct gradient toward nearest constraint)
    for (const feat of screenedFeatures.slice(0, 4)) {
      const sensVec = new Float64Array(dim);
      sensVec[feat.index] = 1.0;
      proposals.push({
        name: `Sensitivity Axis [${feat.nodeId}:${feat.variableName}]`,
        vector: sensVec,
        source: 'SENSITIVITY',
        priorWeight: 1.5
      });
    }

    // 3. Structural Centrality Direction (Weighted by graph degrees)
    const centralityVec = new Float64Array(dim);
    let centNorm = 0;
    const degreeMap = new Map<string, number>();
    systemState.edges.forEach((edge) => {
      degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
      degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
    });

    for (let i = 0; i < dim; i++) {
      const nodeId = state.nodeMapping[i]?.nodeId;
      const degree = nodeId ? (degreeMap.get(nodeId) || 0) : 0;
      centralityVec[i] = degree;
      centNorm += degree * degree;
    }

    centNorm = Math.sqrt(centNorm);
    if (centNorm > 1e-6) {
      for (let i = 0; i < dim; i++) centralityVec[i] /= centNorm;
      proposals.push({
        name: 'Graph Structural Centrality Vector',
        vector: centralityVec,
        source: 'CENTRALITY',
        priorWeight: 1.4
      });
    }

    // 4. Historical Breach Directions (Empirical recurrence)
    for (let h = 0; h < this.historicalBreachDirections.length; h++) {
      proposals.push({
        name: `Historical Observed Breach #${h + 1}`,
        vector: this.historicalBreachDirections[h],
        source: 'HISTORICAL',
        priorWeight: 1.3
      });
    }

    // 5. Screened Sub-space Rotations (Pairwise combinations of top screened features)
    const topIndices = screenedFeatures.map((f) => f.index);
    let seed = 42;
    const rng = () => {
      seed = (seed * 16807 + 7) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    while (proposals.length < proposalCount) {
      const rotVec = new Float64Array(dim);
      let norm = 0;
      // Perturb only screened high-importance dimensions
      for (const idx of topIndices) {
        const val = (rng() - 0.5) * 2.0;
        rotVec[idx] = val;
        norm += val * val;
      }
      norm = Math.sqrt(norm);
      if (norm > 1e-6) {
        for (const idx of topIndices) rotVec[idx] /= norm;
        proposals.push({
          name: `Screened Sub-Space Combination #${proposals.length + 1}`,
          vector: rotVec,
          source: 'COVARIANCE',
          priorWeight: 1.0
        });
      }
    }

    return proposals;
  }
}
