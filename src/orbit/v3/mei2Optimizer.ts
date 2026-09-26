/**
 * Minimum Escape Intervention 2 (MEI-2) Optimizer for ORBIT-A 3.0
 * 
 * Formally solves:
 *   min Cost(U)
 *   subject to:
 *     P_trans(X + U) < threshold
 *     BTD(X + U) >= safe_margin
 *     Impact(U) <= operational_limit
 * 
 * Evaluates individual actions and multi-action portfolios, computes the Pareto frontier,
 * Escape Efficiency \eta = \Delta BTD / Cost(U), loss avoided, time to effect, and confidence.
 */

import {
  GenericIntervention,
  SystemState,
  Constraint,
  StateVector
} from '../core/types';
import { systemStateToVector } from '../core/stateVector';
import {
  Mei2CandidateEvaluation,
  Mei2OptimizationResult,
  OrbitV3Config
} from './types';

export interface Mei2PortfolioCandidate extends Mei2CandidateEvaluation {
  constituentInterventionIds?: string[];
  actionCount?: number;
  regret?: number;
  isSynergistic?: boolean;
}

export interface Mei2EscapePortfolio extends Mei2OptimizationResult {
  portfoliosEvaluatedCount?: number;
}

export class Mei2Optimizer {
  public optimizeEscape(
    currentState: SystemState,
    stateVector: StateVector,
    currentBtd: number,
    candidateInterventions: GenericIntervention[],
    constraints: Constraint[],
    config: OrbitV3Config
  ): Mei2OptimizationResult {
    const evaluations: Mei2CandidateEvaluation[] = [];

    // Pre-index variable coordinate mappings once
    const dim = stateVector.values.length;
    const nodeVarMap = new Map<string, number[]>();
    const varMap = new Map<string, number[]>();
    for (let i = 0; i < dim; i++) {
      const varName = stateVector.nodeMapping[i]?.variableName || stateVector.variableNames[i];
      const nodeId = stateVector.nodeMapping[i]?.nodeId;
      if (varName) {
        if (!varMap.has(varName)) varMap.set(varName, []);
        varMap.get(varName)!.push(i);
        if (nodeId) {
          const key = `${nodeId}:${varName}`;
          if (!nodeVarMap.has(key)) nodeVarMap.set(key, []);
          nodeVarMap.get(key)!.push(i);
        }
      }
    }

    const compiledConstraints = constraints.map(c => {
      let targetIndices: number[];
      if (c.nodeId && c.variableName) {
        targetIndices = nodeVarMap.get(`${c.nodeId}:${c.variableName}`) || [];
      } else if (c.variableName) {
        targetIndices = varMap.get(c.variableName) || [];
      } else {
        targetIndices = [];
      }
      return {
        type: c.type,
        threshold: c.threshold,
        targetIndices
      };
    });

    // Evaluate each individual candidate
    for (const candidate of candidateInterventions) {
      const evalItem = this.evaluateCandidate(currentState, stateVector, currentBtd, candidate, compiledConstraints, nodeVarMap, varMap, config);
      evaluations.push(evalItem);
    }

    // Also evaluate 2-action portfolio combinations if multiple candidates exist
    if (candidateInterventions.length >= 2) {
      for (let i = 0; i < candidateInterventions.length; i++) {
        for (let j = i + 1; j < candidateInterventions.length; j++) {
          const combo: GenericIntervention = {
            id: `portfolio_${candidateInterventions[i].id}_${candidateInterventions[j].id}`,
            name: `Portfolio: ${candidateInterventions[i].name} + ${candidateInterventions[j].name}`,
            actions: [...candidateInterventions[i].actions, ...candidateInterventions[j].actions],
            totalCost: candidateInterventions[i].totalCost + candidateInterventions[j].totalCost,
            resourceRequirements: {
              ...candidateInterventions[i].resourceRequirements,
              ...candidateInterventions[j].resourceRequirements
            },
            maxExecutionTimeTicks: Math.max(
              candidateInterventions[i].maxExecutionTimeTicks,
              candidateInterventions[j].maxExecutionTimeTicks
            )
          };
          evaluations.push(this.evaluateCandidate(currentState, stateVector, currentBtd, combo, compiledConstraints, nodeVarMap, varMap, config));
        }
      }
    }

    // Compute Pareto dominance (cost vs BTD gain vs operational impact)
    for (let i = 0; i < evaluations.length; i++) {
      let isDominated = false;
      for (let j = 0; j < evaluations.length; j++) {
        if (i === j) continue;
        // j dominates i if j has lower/equal cost AND higher/equal post-BTD AND lower/equal impact
        if (
          evaluations[j].totalCost <= evaluations[i].totalCost &&
          evaluations[j].postInterventionBtd >= evaluations[i].postInterventionBtd &&
          evaluations[j].operationalImpact <= evaluations[i].operationalImpact &&
          (evaluations[j].totalCost < evaluations[i].totalCost ||
           evaluations[j].postInterventionBtd > evaluations[i].postInterventionBtd)
        ) {
          isDominated = true;
          break;
        }
      }
      evaluations[i].paretoRank = isDominated ? 2 : 1;
    }

    // Rank candidates by composite objective (Feasible first, Pareto rank 1 next, then highest Escape Efficiency)
    const sorted = [...evaluations].sort((a, b) => {
      if (a.isFeasible !== b.isFeasible) return a.isFeasible ? -1 : 1;
      if (a.paretoRank !== b.paretoRank) return a.paretoRank - b.paretoRank;
      return b.escapeEfficiency - a.escapeEfficiency;
    });

    const top5 = sorted.slice(0, 5);
    const paretoFrontier = sorted.filter((e) => e.paretoRank === 1);
    const bestEscape = sorted.length > 0 ? sorted[0] : null;

    const eff = bestEscape ? bestEscape.escapeEfficiency : 0.0;
    const lowerCi = Math.max(0.0, eff * 0.85);
    const upperCi = eff * 1.15;

    return {
      top5Interventions: top5,
      paretoFrontier,
      bestEscape,
      overallEscapeEfficiency: Number(eff.toFixed(4)),
      confidenceInterval: [Number(lowerCi.toFixed(4)), Number(upperCi.toFixed(4))]
    };
  }

  private evaluateCandidate(
    currentState: SystemState,
    stateVector: StateVector,
    currentBtd: number,
    candidate: GenericIntervention,
    compiledConstraints: { type: Constraint['type']; threshold: number; targetIndices: number[] }[],
    nodeVarMap: Map<string, number[]>,
    varMap: Map<string, number[]>,
    config: OrbitV3Config
  ): Mei2CandidateEvaluation {
    // Simulate intervention impact on state vector
    const postValues = new Float64Array(stateVector.values);

    let operationalImpact = 0.0;

    for (const act of candidate.actions) {
      operationalImpact += Math.abs(act.cost) * 1.2;
      const targetIndices = act.targetNodeId && act.targetVariable
        ? (nodeVarMap.get(`${act.targetNodeId}:${act.targetVariable}`) || [])
        : (act.targetVariable ? (varMap.get(act.targetVariable) || []) : []);
      for (const i of targetIndices) {
        if (act.actionType === 'scale') {
          postValues[i] *= act.value;
        } else if (act.actionType === 'increment') {
          postValues[i] += act.value;
        } else if (act.actionType === 'set') {
          postValues[i] = act.value;
        }
      }
    }

    // Compute post-intervention distance to constraint boundaries
    let postBtd = 3.0;
    let preBtd = 3.0;
    for (const c of compiledConstraints) {
      for (const i of c.targetIndices) {
        const val = postValues[i];
        const preVal = stateVector.values[i];
        const margin = c.type === 'max'
          ? (c.threshold - val) / Math.max(1e-5, Math.abs(c.threshold))
          : (val - c.threshold) / Math.max(1e-5, Math.abs(c.threshold));
        const preMargin = c.type === 'max'
          ? (c.threshold - preVal) / Math.max(1e-5, Math.abs(c.threshold))
          : (preVal - c.threshold) / Math.max(1e-5, Math.abs(c.threshold));
        postBtd = Math.min(postBtd, Math.max(0.0, margin * 2.5));
        preBtd = Math.min(preBtd, Math.max(0.0, preMargin * 2.5));
      }
    }

    // Post-intervention transition probability (exponential sigmoid over BTD margin)
    const postPTrans = Number((1.0 / (1.0 + Math.exp(3.5 * (postBtd - 1.0)))).toFixed(4));
    const baselineRef = Math.min(currentBtd, preBtd);
    const deltaBtd = Math.max(0.0, postBtd - baselineRef);
    const cost = Math.max(1.0, candidate.totalCost);
    const escapeEfficiency = Number((deltaBtd / cost).toFixed(4));

    // Expected loss reference = 100k
    const lossAvoided = Number((Math.max(0.0, (1.0 - postPTrans) * 100.0 - cost)).toFixed(2));

    const isFeasible = postPTrans < config.transitionThreshold &&
                       postBtd >= config.safeBtdMargin &&
                       operationalImpact <= config.operationalImpactLimit;

    return {
      intervention: candidate,
      totalCost: cost,
      postInterventionBtd: Number(postBtd.toFixed(4)),
      postInterventionPTrans: postPTrans,
      lossAvoided,
      timeToEffectTicks: candidate.maxExecutionTimeTicks,
      confidence: Number((0.85 + Math.min(0.12, deltaBtd * 0.08)).toFixed(3)),
      operationalImpact: Number(operationalImpact.toFixed(2)),
      escapeEfficiency,
      isFeasible,
      paretoRank: 1
    };
  }
}
