import { SystemState, StateVector, StateVariable } from './types';

/**
 * StateVector utilities:
 * Converts high-level structured SystemState (V, E, S, D) to flat numerical vectors
 * for fast linear algebra, perturbation generation, and gradient-free optimization,
 * and reconstructs SystemState from StateVector.
 */

export function systemStateToVector(state: SystemState): StateVector {
  const variableNames: string[] = [];
  const nodeMapping: Array<{ nodeId: string; variableName: string }> = [];
  const valuesList: number[] = [];
  const bounds: Array<{ min: number; max: number }> = [];
  const weightsList: number[] = [];

  // 1. Extract node variables (supports Map, Array, and plain Object)
  const rawNodes: any = state.nodes;
  const nodeEntries: Array<[string, any]> = rawNodes instanceof Map
    ? Array.from(rawNodes.entries())
    : Array.isArray(rawNodes)
    ? rawNodes.map((n: any) => [n.id, n])
    : Object.entries(rawNodes || {});

  nodeEntries.forEach(([nodeId, node]) => {
    if (node && node.state) {
      Object.entries(node.state).forEach(([varName, variable]: [string, any]) => {
        variableNames.push(`${nodeId}:${varName}`);
        nodeMapping.push({ nodeId, variableName: varName });
        valuesList.push(variable.value);
        bounds.push({ min: variable.min, max: variable.max });
        weightsList.push(variable.weight ?? 1.0);
      });
    }
  });

  // 2. Extract global state variables if present
  if (state.globalVariables) {
    Object.entries(state.globalVariables).forEach(([varName, variable]) => {
      variableNames.push(`global:${varName}`);
      nodeMapping.push({ nodeId: '__global__', variableName: varName });
      valuesList.push(variable.value);
      bounds.push({ min: variable.min, max: variable.max });
      weightsList.push(variable.weight ?? 1.0);
    });
  }

  return {
    values: new Float64Array(valuesList),
    variableNames,
    nodeMapping,
    bounds,
    weights: new Float64Array(weightsList)
  };
}

export function vectorToSystemState(vector: StateVector, templateState: SystemState): SystemState {
  // Deep clone template nodes and edges
  const newNodes = new Map(templateState.nodes);
  const newEdges = new Map(templateState.edges);
  const newGlobals = { ...templateState.globalVariables };

  for (let i = 0; i < vector.values.length; i++) {
    const val = vector.values[i];
    const mapping = vector.nodeMapping[i];

    if (mapping.nodeId === '__global__') {
      if (newGlobals[mapping.variableName]) {
        newGlobals[mapping.variableName] = {
          ...newGlobals[mapping.variableName],
          value: val
        };
      }
    } else {
      const node = newNodes.get(mapping.nodeId);
      if (node && node.state[mapping.variableName]) {
        const updatedVar: StateVariable = {
          ...node.state[mapping.variableName],
          value: val
        };
        newNodes.set(mapping.nodeId, {
          ...node,
          state: {
            ...node.state,
            [mapping.variableName]: updatedVar
          }
        });
      }
    }
  }

  return {
    ...templateState,
    nodes: newNodes,
    edges: newEdges,
    globalVariables: newGlobals
  };
}

export function cloneVector(v: StateVector): StateVector {
  return {
    values: new Float64Array(v.values),
    variableNames: [...v.variableNames],
    nodeMapping: [...v.nodeMapping],
    bounds: v.bounds.map((b) => ({ ...b })),
    weights: new Float64Array(v.weights)
  };
}

export function addVectors(a: StateVector, delta: Float64Array): StateVector {
  const result = cloneVector(a);
  for (let i = 0; i < result.values.length; i++) {
    result.values[i] += delta[i];
  }
  return result;
}

export function clampVectorToBounds(v: StateVector): StateVector {
  const result = cloneVector(v);
  for (let i = 0; i < result.values.length; i++) {
    const bound = result.bounds[i];
    if (result.values[i] < bound.min) result.values[i] = bound.min;
    if (result.values[i] > bound.max) result.values[i] = bound.max;
  }
  return result;
}

export function computeEuclideanDistance(a: Float64Array, b: Float64Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function computeDotProduct(a: Float64Array, b: Float64Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function normalizeDirection(dir: Float64Array): Float64Array {
  let norm = 0;
  for (let i = 0; i < dir.length; i++) norm += dir[i] * dir[i];
  norm = Math.sqrt(norm);
  if (norm === 0) return new Float64Array(dir.length);

  const normalized = new Float64Array(dir.length);
  for (let i = 0; i < dir.length; i++) {
    normalized[i] = dir[i] / norm;
  }
  return normalized;
}
