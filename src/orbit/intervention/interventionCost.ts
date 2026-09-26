import { GenericIntervention } from '../core/types';

/**
 * Intervention Cost Calculator:
 * Computes non-negative composite cost C(U):
 * - Direct execution cost
 * - Resource consumption penalties
 * - Execution latency penalty
 * - Complexity penalty (number of coordinated actions)
 */

export function computeInterventionCost(intervention: GenericIntervention): number {
  let cost = intervention.totalCost;

  // Add resource utilization costs
  if (intervention.resourceRequirements) {
    Object.values(intervention.resourceRequirements).forEach((amt) => {
      cost += Math.max(0, amt * 1.5);
    });
  }

  // Action complexity penalty: more moving pieces = higher failure risk
  const actionCount = intervention.actions.length;
  if (actionCount > 1) {
    cost += (actionCount - 1) * 10;
  }

  // Latency penalty
  cost += Math.max(0, intervention.maxExecutionTimeTicks * 0.5);

  return Math.max(0, cost);
}
