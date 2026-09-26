/**
 * ORBIT-A 3.0 Type Definitions
 * 
 * Transition Boundary Intelligence Engine
 * Separates ordinary time-series forecasting from boundary transition intelligence.
 */

import {
  SystemState,
  StateVector,
  Constraint,
  GenericIntervention,
  RegimeType,
  TopologyShock,
  UncertaintyEstimate
} from '../core/types';

export type OperationalRegimeState = 'NORMAL' | 'WATCH' | 'CRITICAL' | 'TRANSITION' | 'SHOCK';

export type ShockClassification = 'GRADUAL' | 'ACCELERATING' | 'SUDDEN' | 'INSTANTANEOUS' | 'UNKNOWN';

export type TransitionEventClass = 'GRADUAL_TRANSITION' | 'ACCELERATING_TRANSITION' | 'SUDDEN_SHOCK';

export type { ScreenedFeature } from './importanceScreening';

export interface FourCoreQuantities {
  /** 1. Boundary Proximity: Dimensionless margin index in [0, 1] (0 = deep safe interior, 1 = touching boundary) */
  boundaryProximity: number;
  /** 2. Transition Momentum: Velocity norm, acceleration, and alignment with boundary normal */
  transitionMomentum: number;
  /** 3. Structural Amplification: Graph spectral amplification and cascade reach multiplier */
  structuralAmplification: number;
  /** 4. Intervention Leverage: Escape controllability index in [0, 1] */
  interventionLeverage: number;
}

export type OrbitCoreQuantities = FourCoreQuantities;

export interface Mei2CandidateEvaluation {
  intervention: GenericIntervention;
  totalCost: number;
  postInterventionBtd: number;
  postInterventionPTrans: number;
  lossAvoided: number;
  timeToEffectTicks: number;
  confidence: number;
  operationalImpact: number; // Disruption to nominal operations
  escapeEfficiency: number; // \Delta BTD / Cost(U)
  isFeasible: boolean;
  paretoRank: number; // 1 = Pareto optimal front
}

export interface Mei2OptimizationResult {
  top5Interventions: Mei2CandidateEvaluation[];
  paretoFrontier: Mei2CandidateEvaluation[];
  bestEscape: Mei2CandidateEvaluation | null;
  overallEscapeEfficiency: number;
  confidenceInterval: [number, number];
}

export interface DirectionProposalDistribution {
  candidateDirections: Array<{
    name: string;
    vector: Float64Array;
    source: 'VELOCITY' | 'CENTRALITY' | 'COVARIANCE' | 'SENSITIVITY' | 'HISTORICAL';
    priorWeight: number;
  }>;
  screenedVariableIndices: number[];
  pairwiseInteractions: Array<{
    varA: string;
    varB: string;
    interactionStrength: number;
  }>;
}

export interface OrbitV3Config {
  safeBtdMargin: number;
  transitionThreshold: number;
  operationalImpactLimit: number;
  maxScreenedVariables: number;
  proposalCount: number;
  temporalEvidenceWindow: number;
  deadbandWidth: number;
  randomSeed: number;
  // TBI composite weights: w_bp + w_tm + w_sa + w_il = 1.0
  wBp: number;
  wTm: number;
  wSa: number;
  wIl: number;
}

export const DEFAULT_ORBIT_V3_CONFIG: OrbitV3Config = {
  safeBtdMargin: 1.25,
  transitionThreshold: 0.40,
  operationalImpactLimit: 60.0,
  maxScreenedVariables: 16,
  proposalCount: 32,
  temporalEvidenceWindow: 3,
  deadbandWidth: 0.12,
  randomSeed: 42,
  wBp: 0.40,
  wTm: 0.30,
  wSa: 0.20,
  wIl: 0.10
};

export interface OrbitV3AnalysisResult {
  timestamp: number;
  currentState: SystemState;
  stateVector: StateVector;
  
  // Four Core Quantities
  coreQuantities: FourCoreQuantities;

  // Composite TBI Score: Transition Boundary Intelligence Score \in [0, 1]
  tbiScore: number;

  // 4-State Regime
  operationalState: OperationalRegimeState;
  stateTransitionEvidence: number; // Cumulative evidence counter

  // Adaptive Boundary Search
  adaptiveBtd: number;
  dominantVulnerabilityDirection: {
    name: string;
    source: string;
    vector: Float64Array;
    involvedVariables: string[];
  };
  rayEvaluationCount: number; // Actual instrumented boundary evaluations along proposal rays
  screenedActiveVariables: string[];
  discoveredInteractions: Array<{ varA: string; varB: string; strength: number }>;

  // MEI-2 Escape Optimization
  mei2Result: Mei2OptimizationResult;

  // ORBIT-A 3.1 Upgrades
  higherOrderInteractions?: import('./interactions/higherOrderInteractions').HigherOrderInteractionGraph;
  shockReport?: import('./shock/shockEngine').ShockAnalysisReport;
  vulnerabilityPriors?: import('./shock/vulnerabilityPrior').VulnerabilityPriorSummary;

  // Diagnostics
  inferenceTimeMs: number;
  memoryEstimatedBytes: number;
  explanation: string;
  stageTimingsMs?: OrbitV3StageTimings;
}

export interface OrbitV3StageTimings {
  stateVectorConstructionMs: number;
  importanceScreeningMs: number;
  interactionDiscoveryMs: number;
  directionalProposalsMs: number;
  adaptiveBoundarySearchMs: number;
  transitionMomentumMs: number;
  structuralAmplificationMs: number;
  mei2OptimizationMs: number;
  tbiAndPolicyMs: number;
  totalMs: number;
}
