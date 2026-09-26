import { SystemNode, SystemEdge, DependencyInfo, GraphDistanceMetrics } from './types';

/**
 * Graph Topology Model
 * Represents the structural substrate of the system G = (V, E, D).
 * Computes degree centrality, connected components, and structural distances.
 */

export interface GraphTopology {
  nodeIds: string[];
  edges: SystemEdge[];
  adjacency: Map<string, string[]>;
  degreeCentrality: Map<string, number>;
  connectedComponents: string[][];
  dependencies: DependencyInfo[];
}

export function buildGraphTopology(
  nodes: Map<string, SystemNode>,
  edges: Map<string, SystemEdge>,
  dependencies: DependencyInfo[] = []
): GraphTopology {
  const nodeIds = Array.from(nodes.keys());
  const adjacency = new Map<string, string[]>();
  nodeIds.forEach((id) => adjacency.set(id, []));

  const activeEdges: SystemEdge[] = [];
  edges.forEach((edge) => {
    if (edge.active && nodes.has(edge.source) && nodes.has(edge.target)) {
      activeEdges.push(edge);
      adjacency.get(edge.source)?.push(edge.target);
      adjacency.get(edge.target)?.push(edge.source);
    }
  });

  // Calculate normalized degree centrality: degree / (N - 1)
  const degreeCentrality = new Map<string, number>();
  const n = nodeIds.length;
  const denominator = Math.max(1, n - 1);
  nodeIds.forEach((id) => {
    const deg = adjacency.get(id)?.length || 0;
    degreeCentrality.set(id, deg / denominator);
  });

  // Calculate connected components via BFS
  const visited = new Set<string>();
  const connectedComponents: string[][] = [];

  for (const nodeId of nodeIds) {
    if (!visited.has(nodeId)) {
      const comp: string[] = [];
      const queue: string[] = [nodeId];
      visited.add(nodeId);

      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++];
        comp.push(curr);
        const neighbors = adjacency.get(curr) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      connectedComponents.push(comp);
    }
  }

  return {
    nodeIds,
    edges: activeEdges,
    adjacency,
    degreeCentrality,
    connectedComponents,
    dependencies
  };
}

/**
 * Computes structural topological distance between G_current and G_future.
 * Specifically assesses:
 * - Node additions / removals
 * - Edge modifications / severances
 * - Degree centrality delta
 * - Component fragmentation
 * - Dependency severance
 */
export function computeGraphDistance(
  gCurrent: GraphTopology,
  gFuture: GraphTopology
): GraphDistanceMetrics {
  // 1. Node change score (Jaccard dissimilarity on node sets)
  const currentNodes = new Set(gCurrent.nodeIds);
  const futureNodes = new Set(gFuture.nodeIds);
  const nodeUnion = new Set([...gCurrent.nodeIds, ...gFuture.nodeIds]);
  let nodeIntersectionCount = 0;
  currentNodes.forEach((id) => {
    if (futureNodes.has(id)) nodeIntersectionCount++;
  });
  const nodeChangeScore = nodeUnion.size > 0 
    ? 1 - nodeIntersectionCount / nodeUnion.size 
    : 0;

  // 2. Edge change score (Symmetric difference of edge keys)
  const edgeKey = (e: SystemEdge) => `${e.source}->${e.target}`;
  const currentEdgeKeys = new Set(gCurrent.edges.map(edgeKey));
  const futureEdgeKeys = new Set(gFuture.edges.map(edgeKey));
  const edgeUnion = new Set([...currentEdgeKeys, ...futureEdgeKeys]);
  let commonEdges = 0;
  currentEdgeKeys.forEach((key) => {
    if (futureEdgeKeys.has(key)) commonEdges++;
  });
  const edgeChangeScore = edgeUnion.size > 0 
    ? 1 - commonEdges / edgeUnion.size 
    : 0;

  // 3. Degree Centrality Delta (L1 delta across nodes)
  let centralitySum = 0;
  let count = 0;
  nodeUnion.forEach((id) => {
    const cCurr = gCurrent.degreeCentrality.get(id) || 0;
    const cFut = gFuture.degreeCentrality.get(id) || 0;
    centralitySum += Math.abs(cCurr - cFut);
    count++;
  });
  const degreeCentralityDelta = count > 0 ? centralitySum / count : 0;

  // 4. Connected Component Fragmentation Delta
  const compDiff = Math.abs(gCurrent.connectedComponents.length - gFuture.connectedComponents.length);
  const maxPossibleComps = Math.max(1, Math.max(gCurrent.nodeIds.length, gFuture.nodeIds.length));
  const connectedComponentDelta = Math.min(1.0, compDiff / maxPossibleComps);

  // 5. Dependency Severance Rate
  let severedDeps = 0;
  for (const dep of gCurrent.dependencies) {
    const hasPath = areNodesConnected(gFuture, dep.sourceNodeId, dep.targetNodeId);
    if (!hasPath) severedDeps++;
  }
  const dependencySeveranceRate = gCurrent.dependencies.length > 0 
    ? severedDeps / gCurrent.dependencies.length 
    : 0;

  // Aggregate normalized Topology Shock in [0, 1]
  const normalizedTopologyShock = Math.min(
    1.0,
    0.20 * nodeChangeScore +
    0.35 * edgeChangeScore +
    0.15 * degreeCentralityDelta +
    0.15 * connectedComponentDelta +
    0.15 * dependencySeveranceRate
  );

  return {
    nodeChangeScore,
    edgeChangeScore,
    degreeCentralityDelta,
    connectedComponentDelta,
    dependencySeveranceRate,
    normalizedTopologyShock
  };
}

export function areNodesConnected(g: GraphTopology, start: string, end: string): boolean {
  if (start === end) return true;
  for (const comp of g.connectedComponents) {
    if (comp.includes(start) && comp.includes(end)) return true;
  }
  return false;
}
