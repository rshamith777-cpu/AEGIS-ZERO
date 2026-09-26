import { GraphTopology, computeGraphDistance } from '../core/graphModel';
import { GraphDistanceMetrics } from '../core/types';

/**
 * Graph Distance Calculator
 * Wraps graph distance algorithms and supports customized weighting.
 */

export function calculateGraphDistance(
  current: GraphTopology,
  future: GraphTopology
): GraphDistanceMetrics {
  return computeGraphDistance(current, future);
}
