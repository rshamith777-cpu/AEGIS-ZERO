/**
 * ORBIT-A 2.0 Mathematical & Algorithmic Type Specifications
 * 
 * Formal definitions for:
 * 1. Probabilistic Boundary Crossing: P_cross(X, H)
 * 2. Contextual Boundary Distance: BTD_contextual(X, \dot{X}, \theta, TS, \sigma)
 * 3. Directional Risk Profiling: Risk(\theta) = P(\theta) / (BTD(\theta) + \epsilon)
 * 4. Boundary Risk Score: BR = P_cross * (1 / (BTD_contextual + \epsilon))
 * 5. Adaptive Alarm Policy with Validation Calibration
 * 6. Deadband Hysteresis Filter
 * 7. Temporal Evidence Persistence Filter
 * 8. Expected Intervention Value Calculus
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

export interface OrbitV2Config {
  predictionHorizon: number; // H ticks
  diffusionSigma: number; // Stochastic noise intensity
  velocityDiscount: number; // \alpha_vel in contextual distance
  topologyCoupling: number; // \gamma_topo in contextual distance
  uncertaintyPenalty: number; // \mu_uncert in contextual distance
  safeBtdThreshold: number; // \tau_safe
  alarmThreshold: number; // \tau_alarm (calibrated on validation data)
  hysteresisDeadband: number; // \Delta_hyst (de-escalation threshold gap)
  persistenceWindow: number; // k consecutive frames required to alarm
  unmitigatedLossReference: number; // L_collapse financial / operational loss
  costReference: number; // C_ref normalizer
}

export const DEFAULT_ORBIT_V2_CONFIG: OrbitV2Config = {
  predictionHorizon: 8,
  diffusionSigma: 0.05,
  velocityDiscount: 0.40,
  topologyCoupling: 0.35,
  uncertaintyPenalty: 0.25,
  safeBtdThreshold: 1.0,
  alarmThreshold: 0.45,
  hysteresisDeadband: 0.15,
  persistenceWindow: 2,
  unmitigatedLossReference: 100.0,
  costReference: 25.0
};

export interface ProbabilisticBoundaryResult {
  pCross: number; // P_cross(X, H) \in [0, 1]
  expectedTimeToCross: number; // Expected first passage time in ticks
  hazardRate: number; // Instantaneous crossing hazard \lambda(t)
  diffusionVariance: number;
}

export interface ContextualDistanceResult {
  rawBtd: number;
  velocityNorm: number;
  velocityAlignmentCos: number;
  topologyShockScore: number;
  uncertaintyMargin: number;
  contextualBtd: number; // BTD adjusted for velocity, topology, and uncertainty
}

export interface DirectionalRiskProfile {
  mostProbableDirectionName: string;
  mostProbableDirectionVector: Float64Array;
  involvedVariables: string[];
  directionalProbability: number;
  directionalDistance: number;
  directionalRiskScore: number;
  profile: Array<{
    name: string;
    distance: number;
    probability: number;
    riskScore: number;
  }>;
}

export interface AlarmPolicyResult {
  alarmTriggered: boolean;
  rawRiskScore: number; // BR \in [0, 1]
  alarmLevel: 'NORMAL' | 'ADVISORY' | 'ELEVATED' | 'CRITICAL_ESCAPE';
  consecutiveAlertsCount: number;
  persistenceSatisfied: boolean;
  inHysteresisDeadband: boolean;
  calibratedThreshold: number;
}

export interface InterventionEvaluationV2 {
  intervention: GenericIntervention;
  cost: number;
  postInterventionPCross: number;
  postInterventionContextualBtd: number;
  expectedLossUnmitigated: number;
  expectedLossMitigated: number;
  netInterventionValue: number; // Expected Loss Saved - Cost
  isFeasibleEscape: boolean;
  confidence: number;
}

export interface OrbitV2AnalysisResult {
  timestamp: number;
  currentState: SystemState;
  stateVector: StateVector;
  contextualDistance: ContextualDistanceResult;
  probabilisticBoundary: ProbabilisticBoundaryResult;
  directionalRisk: DirectionalRiskProfile;
  boundaryRiskScore: number; // BR = P_cross / (BTD_contextual + \epsilon)
  alarmPolicy: AlarmPolicyResult;
  recommendedEscape: GenericIntervention | null;
  interventionCandidatesRanked: InterventionEvaluationV2[];
  netInterventionValueExpected: number;
  topologyShock: TopologyShock;
  uncertainty: UncertaintyEstimate;
  predictedRegime: RegimeType;
  inferenceTimeMs: number;
  summary: string;
}
