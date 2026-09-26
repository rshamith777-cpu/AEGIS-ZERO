/**
 * Intervention Value & Minimum Escape Optimizer for ORBIT-A 2.0
 * 
 * 1. Intervention Value:
 *    \Delta Value(U) = \mathbb{E}[Loss \mid Unmitigated] - (\mathbb{E}[Loss \mid U] + Cost(U))
 *    Where \mathbb{E}[Loss \mid U] = L_{collapse} \cdot P_{cross}(X + \Delta(U), H)
 * 
 * 2. Minimum Escape Intervention:
 *    Lowest-cost action that restores safe operating margin P_cross <= \tau_safe.
 */

import {
  SystemState,
  StateVector,
  Constraint,
  GenericIntervention
} from '../core/types';
import { CounterfactualEngine } from '../intervention/counterfactual';
import { ProbabilisticBoundaryEngine } from './probabilisticBoundary';
import { ContextualDistanceEngine } from './contextualDistance';
import { OrbitV2Config, InterventionEvaluationV2 } from './types';

export class InterventionValueEngine {
  private counterfactualEngine: CounterfactualEngine;
  private probEngine: ProbabilisticBoundaryEngine;
  private contextualEngine: ContextualDistanceEngine;

  constructor() {
    this.counterfactualEngine = new CounterfactualEngine();
    this.probEngine = new ProbabilisticBoundaryEngine();
    this.contextualEngine = new ContextualDistanceEngine();
  }

  /**
   * Evaluates candidate interventions and ranks them by net expected intervention value.
   */
  public evaluateInterventions(
    currentState: SystemState,
    stateVector: StateVector,
    previousStateVector: StateVector | null,
    candidateInterventions: GenericIntervention[],
    constraints: Constraint[],
    vulnerableDirectionVector: Float64Array,
    currentPCross: number,
    config: OrbitV2Config
  ): {
    recommendedEscape: GenericIntervention | null;
    rankedCandidates: InterventionEvaluationV2[];
    netExpectedValue: number;
  } {
    const unmitigatedLoss = config.unmitigatedLossReference * currentPCross;

    const evaluated: InterventionEvaluationV2[] = [];

    for (const candidate of candidateInterventions) {
      // 1. Counterfactual forward simulation of candidate action
      const cfResult = this.counterfactualEngine.simulateCounterfactual(
        currentState,
        candidate,
        constraints,
        {
          predictionHorizon: config.predictionHorizon,
          safeBtdThreshold: config.safeBtdThreshold
        } as any
      );

      // 2. Evaluate post-intervention contextual BTD and crossing probability
      const postContextual = this.contextualEngine.evaluateContextualDistance(
        cfResult.projectedState,
        stateVector,
        cfResult.projectedBtd,
        vulnerableDirectionVector,
        cfResult.projectedTopologyShock,
        0.04,
        config
      );

      // Estimated post-intervention boundary crossing probability
      const postProb = this.probEngine.estimateCrossingProbability(
        postContextual.contextualBtd,
        -0.10, // post-intervention stabilizing negative velocity
        config
      );

      const cost = candidate.totalCost;
      const expectedLossMitigated = config.unmitigatedLossReference * postProb.pCross;

      // Net intervention value = Avoided Loss - Cost
      const netValue = (unmitigatedLoss - expectedLossMitigated) - (cost * (config.unmitigatedLossReference / config.costReference) * 0.15);

      const isFeasibleEscape = postProb.pCross <= 0.20 && postContextual.contextualBtd >= config.safeBtdThreshold * 0.8;

      evaluated.push({
        intervention: candidate,
        cost,
        postInterventionPCross: postProb.pCross,
        postInterventionContextualBtd: postContextual.contextualBtd,
        expectedLossUnmitigated: Number(unmitigatedLoss.toFixed(2)),
        expectedLossMitigated: Number(expectedLossMitigated.toFixed(2)),
        netInterventionValue: Number(netValue.toFixed(2)),
        isFeasibleEscape,
        confidence: cfResult.confidence
      });
    }

    // Rank candidates:
    // Primary criterion: Feasible escape actions that satisfy safety threshold ranked by lowest cost.
    // Secondary criterion: Net intervention value if no candidate fully escapes.
    const feasibleEscapes = evaluated.filter((e) => e.isFeasibleEscape);

    let recommended: GenericIntervention | null = null;
    let bestNetValue = 0;

    if (feasibleEscapes.length > 0) {
      // Pick minimum cost among feasible escapes
      feasibleEscapes.sort((a, b) => a.cost - b.cost);
      recommended = feasibleEscapes[0].intervention;
      bestNetValue = feasibleEscapes[0].netInterventionValue;
    } else if (evaluated.length > 0) {
      // Pick candidate maximizing net expected value
      evaluated.sort((a, b) => b.netInterventionValue - a.netInterventionValue);
      if (evaluated[0].netInterventionValue > 0) {
        recommended = evaluated[0].intervention;
        bestNetValue = evaluated[0].netInterventionValue;
      }
    }

    // Overall sort for reporting: highest net value first
    evaluated.sort((a, b) => b.netInterventionValue - a.netInterventionValue);

    return {
      recommendedEscape: recommended,
      rankedCandidates: evaluated,
      netExpectedValue: Number(bestNetValue.toFixed(2))
    };
  }
}
