/**
 * Higher-Order Interaction Engine for ORBIT-A 3.1
 * 
 * Expands interaction analysis beyond simple pairwise heuristics:
 *   - Order 1: Individual feature vulnerability influence
 *   - Order 2: Pairwise non-linear corridor interactions (A x B)
 *   - Order 3: Tripartite synergistic collapse interactions (A x B x C)
 * 
 * Adaptive Candidate Generation:
 *   Features -> Importance Screening -> Top-K Features ->
 *   Pairwise Discovery -> Top-M Pairs -> Triple Expansion ->
 *   Marginal Information Gain Test -> Pruning / Stopping
 */

import { StateVector, SystemState } from '../../core/types';
import { ScreenedFeature } from '../types';

export interface HigherOrderInteraction {
  order: 1 | 2 | 3;
  features: string[];
  indices: number[];
  effectStrength: number;
  confidence: number;
  direction: 'DESTABILIZING' | 'STABILIZING' | 'NEUTRAL';
  marginalGain: number;
  computationalCostUs: number;
}

export interface HigherOrderInteractionGraph {
  order1Features: HigherOrderInteraction[];
  order2Pairs: HigherOrderInteraction[];
  order3Triples: HigherOrderInteraction[];
  allInteractions: HigherOrderInteraction[];
  totalInformationGain: number;
  totalEvaluationTimeMs: number;
  expansionTerminatedEarly: boolean;
  terminationReason: 'THRESHOLD_MET' | 'MARGINAL_GAIN_DEPLETED' | 'MAX_CANDIDATES_REACHED';
}

export interface HigherOrderInteractionConfig {
  maxOrder1Features: number;
  maxOrder2Pairs: number;
  maxOrder3Triples: number;
  pairwiseThreshold: number;
  tripleMarginalGainThreshold: number;
}

export const DEFAULT_INTERACTION_CONFIG: HigherOrderInteractionConfig = {
  maxOrder1Features: 16,
  maxOrder2Pairs: 10,
  maxOrder3Triples: 5,
  pairwiseThreshold: 0.04,
  tripleMarginalGainThreshold: 0.02
};

export class HigherOrderInteractionEngine {
  constructor(private config: HigherOrderInteractionConfig = DEFAULT_INTERACTION_CONFIG) {}

  public discoverInteractions(
    state: StateVector,
    screenedFeatures: ScreenedFeature[],
    systemState: SystemState
  ): HigherOrderInteractionGraph {
    const startOverall = performance.now();
    const order1: HigherOrderInteraction[] = [];
    const order2: HigherOrderInteraction[] = [];
    const order3: HigherOrderInteraction[] = [];

    // Precompute adjacency map for graph connectivity
    const adjMap = new Map<string, Set<string>>();
    const edgeWeightMap = new Map<string, number>();

    const rawEdges: any = systemState.edges;
    const edgesList: any[] = rawEdges instanceof Map
      ? Array.from(rawEdges.values())
      : Array.isArray(rawEdges)
      ? rawEdges
      : Object.values(rawEdges || {});

    for (const e of edgesList) {
      if (!adjMap.has(e.source)) adjMap.set(e.source, new Set());
      if (!adjMap.has(e.target)) adjMap.set(e.target, new Set());
      adjMap.get(e.source)!.add(e.target);
      adjMap.get(e.target)!.add(e.source);

      const w = (e.active ? 1.0 : 0.0) * ((e.capacity || 100) / 100.0);
      edgeWeightMap.set(`${e.source}<->${e.target}`, w);
      edgeWeightMap.set(`${e.target}<->${e.source}`, w);
    }

    // ------------------------------------------------------------------------
    // STAGE 1: ORDER-1 INDIVIDUAL FEATURE INFLUENCE
    // ------------------------------------------------------------------------
    const topFeatures = screenedFeatures.slice(0, this.config.maxOrder1Features);
    for (const f of topFeatures) {
      const t0 = performance.now();
      const val = Math.abs(state.values[f.index]) / Math.max(1e-4, state.bounds[f.index].max);
      const effect = Number((f.importanceScore * (0.6 + 0.4 * val)).toFixed(4));
      const confidence = Number((0.85 + 0.10 * Math.min(1.0, f.constraintProximity)).toFixed(3));
      const direction = f.constraintProximity > 0.5 ? 'DESTABILIZING' : 'NEUTRAL';
      const costUs = Math.max(1, Math.round((performance.now() - t0) * 1000));

      order1.push({
        order: 1,
        features: [`${f.nodeId}:${f.variableName}`],
        indices: [f.index],
        effectStrength: effect,
        confidence,
        direction,
        marginalGain: effect,
        computationalCostUs: costUs
      });
    }

    // ------------------------------------------------------------------------
    // STAGE 2: ORDER-2 PAIRWISE DISCOVERY ACROSS CONNECTED SUB-SPACES
    // ------------------------------------------------------------------------
    const pairCandidates: Array<{
      fA: ScreenedFeature;
      fB: ScreenedFeature;
      strength: number;
      marginalGain: number;
      costUs: number;
    }> = [];

    for (let i = 0; i < topFeatures.length; i++) {
      for (let j = i + 1; j < topFeatures.length; j++) {
        const t0 = performance.now();
        const fA = topFeatures[i];
        const fB = topFeatures[j];

        // Structural connectivity check
        const isConnected = fA.nodeId === fB.nodeId || 
                            adjMap.get(fA.nodeId)?.has(fB.nodeId) || 
                            fA.nodeId === 'global' || 
                            fB.nodeId === 'global';

        if (!isConnected) continue;

        const valA = Math.abs(state.values[fA.index]) / Math.max(1e-4, state.bounds[fA.index].max);
        const valB = Math.abs(state.values[fB.index]) / Math.max(1e-4, state.bounds[fB.index].max);
        const edgeW = edgeWeightMap.get(`${fA.nodeId}<->${fB.nodeId}`) ?? 0.8;

        const pairStrength = Number((valA * valB * edgeW * (fA.importanceScore + fB.importanceScore) * 0.5).toFixed(4));
        const effectA = order1.find(o => o.indices[0] === fA.index)?.effectStrength || 0.1;
        const effectB = order1.find(o => o.indices[0] === fB.index)?.effectStrength || 0.1;
        const marginalGain = Number((Math.max(0, pairStrength - 0.5 * Math.min(effectA, effectB))).toFixed(4));
        const costUs = Math.max(1, Math.round((performance.now() - t0) * 1000));

        if (pairStrength >= this.config.pairwiseThreshold) {
          pairCandidates.push({ fA, fB, strength: pairStrength, marginalGain, costUs });
        }
      }
    }

    pairCandidates.sort((a, b) => b.marginalGain - a.marginalGain);
    const topPairs = pairCandidates.slice(0, this.config.maxOrder2Pairs);

    for (const p of topPairs) {
      order2.push({
        order: 2,
        features: [`${p.fA.nodeId}:${p.fA.variableName}`, `${p.fB.nodeId}:${p.fB.variableName}`],
        indices: [p.fA.index, p.fB.index],
        effectStrength: p.strength,
        confidence: Number((0.80 + 0.15 * Math.min(1.0, p.marginalGain * 4)).toFixed(3)),
        direction: 'DESTABILIZING',
        marginalGain: p.marginalGain,
        computationalCostUs: p.costUs
      });
    }

    // ------------------------------------------------------------------------
    // STAGE 3: ORDER-3 TRIPLE EXPANSION (EXPAND ONLY TOP PAIRS WITH INFORMATION GAIN)
    // ------------------------------------------------------------------------
    let terminationReason: 'THRESHOLD_MET' | 'MARGINAL_GAIN_DEPLETED' | 'MAX_CANDIDATES_REACHED' = 'THRESHOLD_MET';
    let expansionTerminatedEarly = false;

    for (const pair of topPairs) {
      if (order3.length >= this.config.maxOrder3Triples) {
        terminationReason = 'MAX_CANDIDATES_REACHED';
        expansionTerminatedEarly = true;
        break;
      }

      // Find third candidate features structurally connected to either node A or node B
      for (const fC of topFeatures) {
        if (fC.index === pair.fA.index || fC.index === pair.fB.index) continue;

        const connectsToA = adjMap.get(pair.fA.nodeId)?.has(fC.nodeId);
        const connectsToB = adjMap.get(pair.fB.nodeId)?.has(fC.nodeId);

        if (!connectsToA && !connectsToB && fC.nodeId !== 'global') continue;

        const t0 = performance.now();
        const valC = Math.abs(state.values[fC.index]) / Math.max(1e-4, state.bounds[fC.index].max);
        const tripleStrength = Number((pair.strength * valC * 1.25).toFixed(4));
        const marginalGain = Number((tripleStrength - pair.strength).toFixed(4));
        const costUs = Math.max(2, Math.round((performance.now() - t0) * 1000));

        // STAGE 4: Marginal Information Gain Pruning
        if (marginalGain < this.config.tripleMarginalGainThreshold) {
          terminationReason = 'MARGINAL_GAIN_DEPLETED';
          continue; // Prune branch
        }

        order3.push({
          order: 3,
          features: [
            `${pair.fA.nodeId}:${pair.fA.variableName}`,
            `${pair.fB.nodeId}:${pair.fB.variableName}`,
            `${fC.nodeId}:${fC.variableName}`
          ],
          indices: [pair.fA.index, pair.fB.index, fC.index],
          effectStrength: tripleStrength,
          confidence: Number((0.75 + 0.15 * Math.min(1.0, marginalGain * 5)).toFixed(3)),
          direction: 'DESTABILIZING',
          marginalGain,
          computationalCostUs: costUs
        });

        if (order3.length >= this.config.maxOrder3Triples) break;
      }
    }

    const all = [...order1, ...order2, ...order3];
    const totalGain = Number(all.reduce((acc, i) => acc + i.marginalGain, 0).toFixed(4));
    const totalTimeMs = Number((performance.now() - startOverall).toFixed(2));

    return {
      order1Features: order1,
      order2Pairs: order2,
      order3Triples: order3,
      allInteractions: all,
      totalInformationGain: totalGain,
      totalEvaluationTimeMs: totalTimeMs,
      expansionTerminatedEarly,
      terminationReason
    };
  }
}
