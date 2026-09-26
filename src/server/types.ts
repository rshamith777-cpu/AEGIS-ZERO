/**
 * ORBIT-A 3.1 HTTP REST API Schemas
 */

import { SystemState, Constraint, GenericIntervention } from '../orbit/core/types';
import { OperationalRegimeState, FourCoreQuantities, Mei2OptimizationResult } from '../orbit/v3/types';
import { HigherOrderInteractionGraph } from '../orbit/v3/interactions/higherOrderInteractions';
import { ShockAnalysisReport } from '../orbit/v3/shock/shockEngine';
import { VulnerabilityPriorSummary } from '../orbit/v3/shock/vulnerabilityPrior';
import { DatasetProvenanceMetadata } from '../data/types';

export interface ApiErrorResponse {
  error: string;
  statusCode: number;
  details?: unknown;
  timestamp: string;
}

export interface HealthResponse {
  status: 'UP' | 'DEGRADED';
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  engine: 'ORBIT-A 3.1';
  scalabilityVerified: boolean;
}

export interface VersionResponse {
  version: '3.1.0';
  buildDate: string;
  capabilities: string[];
  algorithms: {
    core: 'ORBIT-A';
    boundarySearch: 'Compiled Adaptive Boundary Search (ABS)';
    escapeOptimizer: 'MEI-2 Pareto Multi-Action Portfolio';
    interactions: 'Order 1, Order 2, Order 3 Adaptive Information Gain Expansion';
    shockResponse: '5-State Regime Policy (NORMAL, WATCH, CRITICAL, TRANSITION, SHOCK)';
  };
}

export interface AnalyzeRequest {
  dataset?: string;
  timestamp?: number;
  state: SystemState;
  constraints?: Constraint[];
  interventions?: GenericIntervention[];
  referenceState?: SystemState;
  options?: {
    higherOrder?: boolean;
    shockAnalysis?: boolean;
    vulnerabilityPriors?: boolean;
    proposalCount?: number;
  };
}

export interface AnalyzeResponse {
  state: OperationalRegimeState;
  tbi: number;
  boundaryDistance: number;
  coreQuantities: FourCoreQuantities;
  dominantRay: {
    name: string;
    source: string;
    involvedVariables: string[];
  };
  rayEvaluationCount: number;
  shock: boolean;
  shockReport?: ShockAnalysisReport;
  higherOrderInteractions?: HigherOrderInteractionGraph;
  vulnerabilityPriors?: VulnerabilityPriorSummary;
  recommendations: Array<{
    action: string;
    cost: number;
    escapeEfficiency: number;
    postBtd: number;
    lossAvoided: number;
  }>;
  mei2Result: Mei2OptimizationResult;
  provenance: {
    datasetId?: string;
    provenanceCategory: string;
    isLiveTelemetry: false;
  };
  inferenceTimeMs: number;
  explanation: string;
}

export interface BoundaryRequest {
  state: SystemState;
  constraints?: Constraint[];
  proposalCount?: number;
}

export interface BoundaryResponse {
  adaptiveBtd: number;
  boundaryProximity: number;
  dominantDirection: {
    name: string;
    source: string;
    involvedVariables: string[];
  };
  raysEvaluated: number;
  screenedFeatures: string[];
}

export interface InterventionRequest {
  state: SystemState;
  currentBtd?: number;
  interventions: GenericIntervention[];
  constraints?: Constraint[];
}

export interface InterventionResponse {
  bestEscape: Mei2OptimizationResult['bestEscape'];
  paretoFrontier: Mei2OptimizationResult['paretoFrontier'];
  top5Interventions: Mei2OptimizationResult['top5Interventions'];
  overallEscapeEfficiency: number;
}

export interface SimulateRequest {
  dataset: string;
  scenario?: string;
  stepCount?: number;
  noiseLevel?: number;
  sensorDropoutPct?: number;
}

export interface SimulateResponse {
  dataset: string;
  stepsSimulated: number;
  states: SystemState[];
  timestamps: number[];
  eventCount: number;
}

export interface ShockAnalyzeRequest {
  currentState: SystemState;
  previousState?: SystemState;
  priorPreviousState?: SystemState;
  currentBtd?: number;
  candidateInterventions?: GenericIntervention[];
  constraints?: Constraint[];
}

export interface ShockAnalyzeResponse {
  report: ShockAnalysisReport;
}

export interface BatchAnalyzeRequest {
  items: AnalyzeRequest[];
}

export interface BatchAnalyzeResponse {
  results: AnalyzeResponse[];
  batchSize: number;
  totalTimeMs: number;
  meanLatencyMs: number;
}

export interface DatasetListResponse {
  datasets: DatasetProvenanceMetadata[];
  count: number;
}

export interface ProvenanceResponse {
  provenanceBreakdown: Record<string, string[]>;
  provenanceCatalog: DatasetProvenanceMetadata[];
  integrityAudits: {
    zeroLabelLeakage: string;
    chronologicalSplitVerified: string;
    reproducibleHashVerification: string;
  };
}

export interface MetricsResponse {
  fourLeaderboards: {
    nominalPrediction: Record<string, any>;
    boundaryIntelligence: Record<string, any>;
    interventionDecision: Record<string, any>;
    operationalRobustness: Record<string, any>;
  };
  scalabilityN1000Ms: number;
  complexitySlope: number;
}

/**
 * Serializes SystemState for JSON transmission over HTTP REST
 * Converts Maps into serializable arrays
 */
export function serializeStateForTransport(state: SystemState): any {
  if (!state) return state;
  return {
    ...state,
    nodes: state.nodes instanceof Map ? Array.from(state.nodes.values()) : state.nodes,
    edges: state.edges instanceof Map ? Array.from(state.edges.values()) : state.edges
  };
}

/**
 * Rehydrates serialized SystemState back into engine-ready Maps
 */
export function deserializeStateFromTransport(raw: any): SystemState {
  if (!raw) return raw;
  const nodesMap = new Map<string, any>();
  if (raw.nodes instanceof Map) {
    return raw;
  } else if (Array.isArray(raw.nodes)) {
    for (const n of raw.nodes) {
      nodesMap.set(n.id, n);
    }
  } else if (typeof raw.nodes === 'object' && raw.nodes !== null) {
    for (const [k, v] of Object.entries(raw.nodes)) {
      nodesMap.set(k, v);
    }
  }

  const edgesMap = new Map<string, any>();
  if (raw.edges instanceof Map) {
    // Already a Map
  } else if (Array.isArray(raw.edges)) {
    for (const e of raw.edges) {
      edgesMap.set(e.id || `${e.source}->${e.target}`, e);
    }
  } else if (typeof raw.edges === 'object' && raw.edges !== null) {
    for (const [k, v] of Object.entries(raw.edges)) {
      edgesMap.set(k, v);
    }
  }

  return {
    ...raw,
    nodes: nodesMap,
    edges: raw.edges instanceof Map ? raw.edges : edgesMap
  };
}
