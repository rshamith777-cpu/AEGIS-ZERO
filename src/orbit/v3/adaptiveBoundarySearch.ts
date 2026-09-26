/**
 * Guided Adaptive Boundary Search for ORBIT-A 3.0
 * 
 * Uses empirical proposal directions to search for the closest regime boundary (BTD)
 * and assesses the dominant vulnerability direction without uniform random brute-force.
 */

import { StateVector, Constraint } from '../core/types';
import { ProposalDirection } from './directionalProposal';
import { RegimeClassifier } from '../boundary/regimeClassifier';

export interface CompiledConstraint {
  variableIndex: number;
  threshold: number;
  type: 'min' | 'max' | 'range' | 'conservation' | 'topological';
  nodeId?: string;
  variableName?: string;
  isHardConstraint: boolean;
  penaltyWeight: number;
}

export interface AdaptiveBoundarySearchResult {
  adaptiveBtd: number;
  dominantDirection: ProposalDirection;
  involvedVariables: string[];
  rayEvaluationsCount: number;
}

export class AdaptiveBoundarySearchEngine {
  private classifier = new RegimeClassifier();

  /**
   * Compiles high-level Constraint specifications into direct state-vector coordinate indices.
   * Constructed once per boundary search to eliminate O(|C| * D) un-indexed scans.
   */
  public compileConstraints(
    state: StateVector,
    constraints: Constraint[]
  ): CompiledConstraint[] {
    const dim = state.values.length;
    // Map canonical key "nodeId:varName" -> coordinate index
    const keyMap = new Map<string, number>();
    // Map varName -> list of coordinate indices across all nodes (for un-targeted constraints)
    const varMap = new Map<string, number[]>();

    for (let i = 0; i < dim; i++) {
      const mapping = state.nodeMapping[i];
      const varName = mapping?.variableName || state.variableNames[i];
      const nodeId = mapping?.nodeId;
      if (nodeId && varName) {
        keyMap.set(`${nodeId}:${varName}`, i);
      }
      if (varName) {
        let list = varMap.get(varName);
        if (!list) {
          list = [];
          varMap.set(varName, list);
        }
        list.push(i);
      }
    }

    const compiled: CompiledConstraint[] = [];
    for (const c of constraints) {
      if (!c.variableName) continue;
      if (c.nodeId) {
        const idx = keyMap.get(`${c.nodeId}:${c.variableName}`);
        if (idx !== undefined) {
          compiled.push({
            variableIndex: idx,
            threshold: c.threshold,
            type: c.type,
            nodeId: c.nodeId,
            variableName: c.variableName,
            isHardConstraint: c.isHardConstraint,
            penaltyWeight: c.penaltyWeight
          });
        }
      } else {
        const indices = varMap.get(c.variableName);
        if (indices) {
          for (const idx of indices) {
            compiled.push({
              variableIndex: idx,
              threshold: c.threshold,
              type: c.type,
              nodeId: state.nodeMapping[idx]?.nodeId,
              variableName: c.variableName,
              isHardConstraint: c.isHardConstraint,
              penaltyWeight: c.penaltyWeight
            });
          }
        }
      }
    }

    return compiled;
  }

  public searchBoundary(
    state: StateVector,
    proposals: ProposalDirection[],
    constraints: Constraint[]
  ): AdaptiveBoundarySearchResult {
    const dim = state.values.length;
    let minBtd = Infinity;
    let bestProposal = proposals[0];
    let rayEvals = 0;

    // Pre-compile constraints once for all proposal rays and binary search iterations
    const compiled = this.compileConstraints(state, constraints);

    // Reuse a single candidate vector buffer to eliminate GC pressure
    const testVec = new Float64Array(dim);

    for (const proposal of proposals) {
      // Step along proposal ray: test candidate step distances s in [0.1, 4.0]
      let low = 0.0;
      let high = 3.5;
      let breached = false;

      // Quick check at upper bound
      for (let i = 0; i < dim; i++) {
        testVec[i] = state.values[i] + proposal.vector[i] * high;
      }
      rayEvals++;
      if (this.isStateBreached(testVec, compiled)) {
        breached = true;
        // Binary search for exact boundary crossing distance
        for (let iter = 0; iter < 8; iter++) {
          rayEvals++;
          const mid = (low + high) / 2.0;
          for (let i = 0; i < dim; i++) {
            testVec[i] = state.values[i] + proposal.vector[i] * mid;
          }
          if (this.isStateBreached(testVec, compiled)) {
            high = mid;
          } else {
            low = mid;
          }
        }
      }

      const rayBtd = breached ? high : 3.5;
      if (rayBtd < minBtd) {
        minBtd = rayBtd;
        bestProposal = proposal;
      }
    }

    // Extract involved variables (variables with significant weight in best proposal)
    const involved: string[] = [];
    for (let i = 0; i < dim; i++) {
      if (Math.abs(bestProposal.vector[i]) > 0.20) {
        involved.push(`${state.nodeMapping[i]?.nodeId}:${state.variableNames[i]}`);
      }
    }

    return {
      adaptiveBtd: Number(Math.min(3.0, Math.max(0.01, minBtd)).toFixed(4)),
      dominantDirection: bestProposal,
      involvedVariables: involved.slice(0, 5),
      rayEvaluationsCount: rayEvals
    };
  }

  /**
   * High-speed O(|C|) boundary breach evaluation against compiled constraint coordinates.
   */
  public isStateBreached(
    candidateValues: Float64Array,
    compiledConstraints: CompiledConstraint[]
  ): boolean {
    for (let i = 0; i < compiledConstraints.length; i++) {
      const c = compiledConstraints[i];
      const val = candidateValues[c.variableIndex];
      if (c.type === 'max' && val > c.threshold) return true;
      if (c.type === 'min' && val < c.threshold) return true;
    }
    return false;
  }

  /**
   * Reference un-optimized implementation for mathematical equivalence and regression testing.
   */
  public static isStateBreachedReference(
    candidateValues: Float64Array,
    referenceState: StateVector,
    constraints: Constraint[]
  ): boolean {
    for (const c of constraints) {
      for (let i = 0; i < candidateValues.length; i++) {
        const varName = referenceState.nodeMapping[i]?.variableName || referenceState.variableNames[i];
        const nodeId = referenceState.nodeMapping[i]?.nodeId;
        if (varName === c.variableName && (nodeId === c.nodeId || !c.nodeId)) {
          const val = candidateValues[i];
          if (c.type === 'max' && val > c.threshold) return true;
          if (c.type === 'min' && val < c.threshold) return true;
        }
      }
    }
    return false;
  }
}

