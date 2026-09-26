/**
 * Structural Amplification Engine for ORBIT-A 3.0
 * 
 * Quantifies topological shock and cascade propagation along directed dependencies:
 * SA = 1.0 + \gamma_topo * TS + \beta_cascade * CascadeReach
 */

import { SystemState } from '../core/types';
import { TopologyShockEvaluator } from '../topology/topologyShock';

export interface StructuralAmplificationResult {
  structuralAmplification: number;
  topologyShockScore: number;
  cascadeReachFactor: number;
  criticalCorridorsSevered: number;
  bottleneckNodeId: string;
}

export class StructuralAmplificationEngine {
  private topologyEvaluator = new TopologyShockEvaluator(0.30);

  public evaluateAmplification(
    currentState: SystemState,
    referenceState?: SystemState
  ): StructuralAmplificationResult {
    const ref = referenceState || currentState;
    const shock = this.topologyEvaluator.evaluateTopologyShock(currentState, ref);

    // Evaluate dependency cascade reach
    let cascadeReach = 0.0;
    let criticalSevered = 0;
    let maxDegree = 0;
    let bottleneckNodeId = 'none';

    const activeDegreeMap = new Map<string, number>();
    currentState.edges.forEach((edge) => {
      if (edge.active) {
        activeDegreeMap.set(edge.source, (activeDegreeMap.get(edge.source) || 0) + 1);
        activeDegreeMap.set(edge.target, (activeDegreeMap.get(edge.target) || 0) + 1);
      }
    });

    currentState.nodes.forEach((node, nodeId) => {
      const degree = activeDegreeMap.get(nodeId) || 0;
      if (degree > maxDegree) {
        maxDegree = degree;
        bottleneckNodeId = nodeId;
      }
    });

    currentState.dependencies.forEach((dep) => {
      // Check if source node is near failure or severed
      const srcNode = currentState.nodes.get(dep.sourceNodeId);
      const cap = srcNode?.capacity || 100;
      const dem = srcNode?.demand || 0;
      if (srcNode && cap > 0 && dem / cap > 0.85) {
        cascadeReach += dep.elasticity;
      }
    });

    // Check severed inactive edges
    currentState.edges.forEach((edge) => {
      if (!edge.active) criticalSevered++;
    });

    const sa = 1.0 + shock.shockMagnitude * 1.5 + cascadeReach * 0.8 + criticalSevered * 0.25;

    return {
      structuralAmplification: Number(Math.max(1.0, sa).toFixed(4)),
      topologyShockScore: Number(shock.shockMagnitude.toFixed(4)),
      cascadeReachFactor: Number(cascadeReach.toFixed(4)),
      criticalCorridorsSevered: criticalSevered,
      bottleneckNodeId
    };
  }
}
