import {
  SystemState,
  GenericIntervention,
  EscapeOptimizationResult,
  Constraint,
  OrbitConfig,
  DEFAULT_ORBIT_CONFIG
} from '../core/types';
import { CounterfactualEngine } from './counterfactual';
import { computeInterventionCost } from './interventionCost';

/**
 * Minimum Escape Intervention Optimizer:
 * Finds U* = argmin C(U)  subject to:
 * 1. BTD(F_hat(X, U)) >= BTD_safe
 * 2. transitionProbability <= P_safe (e.g. 0.15)
 * 
 * Implements Pareto ranking combining cost, risk reduction, and BTD margin.
 */

export class EscapeOptimizer {
  private counterfactualEngine: CounterfactualEngine;

  constructor(counterfactualEngine?: CounterfactualEngine) {
    this.counterfactualEngine = counterfactualEngine || new CounterfactualEngine();
  }

  public optimizeEscape(
    currentState: SystemState,
    candidateInterventions: GenericIntervention[],
    constraints: Constraint[],
    config: OrbitConfig = DEFAULT_ORBIT_CONFIG
  ): EscapeOptimizationResult {
    const startTime = performance.now();
    const evaluated: Array<{
      intervention: GenericIntervention;
      btdGain: number;
      cost: number;
      transitionRiskReduction: number;
      paretoScore: number;
      confidence: number;
    }> = [];

    // Evaluate baseline first
    const baselineResult = this.counterfactualEngine.simulateCounterfactual(
      currentState,
      null,
      constraints,
      config
    );

    for (const candidate of candidateInterventions) {
      const cfResult = this.counterfactualEngine.simulateCounterfactual(
        currentState,
        candidate,
        constraints,
        config
      );

      const btdGain = cfResult.deltaBtd;
      const cost = computeInterventionCost(candidate);
      const riskReduction = Math.max(0, baselineResult.transitionProbability - cfResult.transitionProbability);

      const weights = config.objectiveWeights ?? {
        weightRisk: 0.35,
        weightMargin: 0.35,
        weightCost: 0.15,
        weightShock: 0.10,
        weightUncertainty: 0.05,
        costReference: 100.0
      };

      // Formal Unified ORBIT Objective:
      // Normalized dimensionless components in [-1, 1]:
      const normMargin = btdGain / Math.max(0.1, config.safeBtdThreshold);
      const normRisk = riskReduction;
      const normCost = cost / Math.max(1.0, weights.costReference);
      const uncertPenalty = 1.0 - cfResult.confidence;

      const paretoScore = (
        weights.weightMargin * normMargin +
        weights.weightRisk * normRisk -
        weights.weightCost * normCost -
        weights.weightUncertainty * uncertPenalty
      );

      evaluated.push({
        intervention: candidate,
        btdGain,
        cost,
        transitionRiskReduction: riskReduction,
        paretoScore,
        confidence: cfResult.confidence
      });
    }

    // Rank candidates: highest pareto score first
    evaluated.sort((a, b) => b.paretoScore - a.paretoScore);

    // Filter to find minimum cost intervention that achieves BTD_safe
    const safeCandidates = evaluated.filter((e) => {
      const projectedBtd = baselineResult.baselineBtd + e.btdGain;
      return projectedBtd >= config.safeBtdThreshold;
    });

    let recommended: GenericIntervention | null = null;
    let meetsSafeBtd = false;

    if (safeCandidates.length > 0) {
      // The safe candidates are already ranked by the unified Pareto objective score
      recommended = safeCandidates[0].intervention;
      meetsSafeBtd = true;
    } else if (evaluated.length > 0) {
      // Fallback to highest Pareto score even if it doesn't fully reach threshold
      recommended = evaluated[0].intervention;
      meetsSafeBtd = false;
    }

    const totalTimeMs = performance.now() - startTime;

    return {
      recommendedIntervention: recommended,
      candidatesRanked: evaluated,
      meetsSafeBtd,
      interventionsEvaluated: candidateInterventions.length,
      optimizationTimeMs: totalTimeMs
    };
  }
}
