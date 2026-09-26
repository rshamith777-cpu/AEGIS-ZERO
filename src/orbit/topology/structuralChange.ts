import { GraphTopology } from '../core/graphModel';
import { DependencyInfo, SystemEdge } from '../core/types';

/**
 * Structural Change Detector:
 * Isolates exact topology transitions:
 * - Broken/severed edges
 * - Severed critical dependencies
 * - Isolated or disconnected nodes
 */

export interface StructuralDiff {
  addedEdges: SystemEdge[];
  removedEdges: SystemEdge[];
  severedDependencies: DependencyInfo[];
  isolatedNodes: string[];
  fragmentedComponents: string[][];
}

export function detectStructuralChanges(
  current: GraphTopology,
  future: GraphTopology
): StructuralDiff {
  const currentEdgeMap = new Map(current.edges.map((e) => [`${e.source}->${e.target}`, e]));
  const futureEdgeMap = new Map(future.edges.map((e) => [`${e.source}->${e.target}`, e]));

  const addedEdges: SystemEdge[] = [];
  const removedEdges: SystemEdge[] = [];

  // Detect removed edges
  currentEdgeMap.forEach((edge, key) => {
    if (!futureEdgeMap.has(key)) {
      removedEdges.push(edge);
    }
  });

  // Detect added edges
  futureEdgeMap.forEach((edge, key) => {
    if (!currentEdgeMap.has(key)) {
      addedEdges.push(edge);
    }
  });

  // Detect severed dependencies
  const severedDependencies: DependencyInfo[] = [];
  for (const dep of current.dependencies) {
    const isStillConnected = future.connectedComponents.some(
      (comp) => comp.includes(dep.sourceNodeId) && comp.includes(dep.targetNodeId)
    );
    if (!isStillConnected) {
      severedDependencies.push(dep);
    }
  }

  // Detect isolated nodes (degree = 0 in future topology)
  const isolatedNodes: string[] = [];
  future.degreeCentrality.forEach((deg, nodeId) => {
    if (deg === 0 && (current.degreeCentrality.get(nodeId) || 0) > 0) {
      isolatedNodes.push(nodeId);
    }
  });

  return {
    addedEdges,
    removedEdges,
    severedDependencies,
    isolatedNodes,
    fragmentedComponents: future.connectedComponents
  };
}
