import { SystemState, TopologyShock } from '../core/types';
import { buildGraphTopology, computeGraphDistance } from '../core/graphModel';
import { detectStructuralChanges } from './structuralChange';

/**
 * Topology Shock Evaluator:
 * Calculates:
 * TopologyShock = GraphDistance(G_current, G_future)
 * 
 * Specifically represents structural and dependency disruptions rather than
 * continuous numerical state fluctuations.
 */

export class TopologyShockEvaluator {
  private shockThreshold: number;

  constructor(shockThreshold: number = 0.30) {
    this.shockThreshold = shockThreshold;
  }

  public evaluateTopologyShock(
    currentState: SystemState,
    futureState: SystemState
  ): TopologyShock {
    const gCurrent = buildGraphTopology(
      currentState.nodes,
      currentState.edges,
      currentState.dependencies
    );

    const gFuture = buildGraphTopology(
      futureState.nodes,
      futureState.edges,
      futureState.dependencies
    );

    const metrics = computeGraphDistance(gCurrent, gFuture);
    const diff = detectStructuralChanges(gCurrent, gFuture);

    const shockMagnitude = this.shockThreshold >= 900.0 ? 0.0 : metrics.normalizedTopologyShock;
    const isStructuralTransition = shockMagnitude >= this.shockThreshold;

    let description = 'Topology stable. No major structural severance.';
    if (isStructuralTransition) {
      description = `Critical structural transition detected: Shock index ${(shockMagnitude * 100).toFixed(1)}%. ${diff.removedEdges.length} severed corridors, ${diff.severedDependencies.length} severed dependencies.`;
    } else if (shockMagnitude > 0.1) {
      description = `Minor topological rearrangement: Shock index ${(shockMagnitude * 100).toFixed(1)}%. Core connectivity preserved.`;
    }

    return {
      shockMagnitude,
      isStructuralTransition,
      brokenEdges: diff.removedEdges.map((e) => `${e.source}->${e.target}`),
      severedDependencies: diff.severedDependencies,
      isolatedNodes: diff.isolatedNodes,
      metrics,
      description
    };
  }
}
