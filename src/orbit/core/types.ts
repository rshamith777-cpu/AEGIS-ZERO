/**
 * ORBIT — Operational Resilience Boundary & Inference Transform
 * Core Type Definitions
 * 
 * Domain-agnostic mathematical and algorithmic types for regime boundary inference,
 * distance calculation, topology transitions, and minimum intervention optimization.
 */

// ============================================================================
// 1. SYSTEM REPRESENTATION: X_t = (V_t, E_t, S_t, D_t)
// ============================================================================

export type VariableType = 'continuous' | 'discrete' | 'boolean' | 'categorical';

export interface StateVariable {
  name: string;
  type: VariableType;
  value: number;
  min: number;
  max: number;
  nominal: number;
  weight?: number; // Importance weight in normalized distance metric
  unit?: string;
  metadata?: Record<string, unknown>;
}

export interface SystemNode {
  id: string;
  label: string;
  category?: string;
  capacity?: number;
  demand?: number;
  resources?: Record<string, number>;
  state: Record<string, StateVariable>;
  metadata?: Record<string, unknown>;
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  capacity?: number;
  flow?: number;
  latency?: number;
  type?: string;
  active: boolean;
  metadata?: Record<string, unknown>;
}

export interface DependencyInfo {
  sourceNodeId: string;
  targetNodeId: string;
  dependencyType: 'critical' | 'redundant' | 'load_bearing' | 'informational';
  elasticity: number; // sensitivity of target to source disruption [0, 1]
  delayTicks: number; // time delay in propagation
}

export interface Constraint {
  id: string;
  description: string;
  nodeId?: string;
  variableName?: string;
  type: 'min' | 'max' | 'range' | 'conservation' | 'topological';
  threshold: number;
  thresholdUpper?: number;
  isHardConstraint: boolean;
  penaltyWeight: number;
}

export interface SystemState {
  timestamp: number;
  nodes: Map<string, SystemNode>;
  edges: Map<string, SystemEdge>;
  dependencies: DependencyInfo[];
  constraints: Constraint[];
  globalVariables: Record<string, StateVariable>;
  metadata?: Record<string, unknown>;
}

// Flat vector representation for high-speed numerical optimization
export interface StateVector {
  values: Float64Array;
  variableNames: string[];
  nodeMapping: Array<{ nodeId: string; variableName: string }>;
  bounds: Array<{ min: number; max: number }>;
  weights: Float64Array;
}

// ============================================================================
// 2. REGIME & BOUNDARY TYPES
// ============================================================================

export type RegimeType = 
  | 'RECOVERABLE_EQUILIBRIUM' 
  | 'DEGRADED_OPERATIONAL' 
  | 'CRITICAL_CASCADE' 
  | 'COLLAPSED' 
  | 'IRREVERSIBLE_FAILURE';

export interface Regime {
  id: string;
  type: RegimeType;
  label: string;
  description: string;
  stabilityIndex: number; // [0, 1] 1 = perfectly stable
  severityRank: number; // 0 = nominal, higher = worse
  isRecoverable: boolean;
}

export interface PerturbationVector {
  delta: Float64Array;
  direction?: Float64Array; // unit vector
  magnitude: number;
  variableIndices: number[];
  interactionOrder: number;
}

export type DistanceMetric = 'L1' | 'L2' | 'WEIGHTED_L2' | 'MAHALANOBIS' | 'NORMALIZED_WEIGHTED';

export interface DistanceMetricConfig {
  metric: DistanceMetric;
  weights?: Float64Array;
  covarianceMatrix?: Float64Array[]; // for Mahalanobis
}

export interface DirectionalBoundaryDistance {
  directionName: string;
  directionVector: Float64Array;
  involvedVariables: string[];
  interactionOrder: number; // 1 = single variable, 2 = pairwise, 3 = 3-way
  distance: number; // BTD along this direction
  predictedRegime: RegimeType;
  transitionState: StateVector;
  confidence: number;
}

export interface BoundaryEstimate {
  btd: number; // Global minimum Boundary Transition Distance
  safeBtdThreshold: number;
  isNearBoundary: boolean;
  vulnerabilityMargin: number; // btd - safeBtdThreshold
  directionalProfile: DirectionalBoundaryDistance[];
  mostVulnerableDirection: DirectionalBoundaryDistance;
  leastVulnerableDirection: DirectionalBoundaryDistance;
  meanDirectionalDistance: number;
  varianceDirectionalDistance: number;
  confidence: number;
  uncertaintyInterval: [number, number]; // 95% CI [lower, upper]
  computationStats: {
    perturbationCount: number;
    directionsEvaluated: number;
    optimizerIterations: number;
    evaluationTimeMs: number;
  };
}

// ============================================================================
// 3. TOPOLOGY SHOCK
// ============================================================================

export interface GraphDistanceMetrics {
  nodeChangeScore: number; // Jaccard or fraction of altered nodes
  edgeChangeScore: number; // Edge symmetric difference fraction
  degreeCentralityDelta: number;
  connectedComponentDelta: number;
  dependencySeveranceRate: number;
  normalizedTopologyShock: number; // [0, 1]
}

export interface TopologyShock {
  shockMagnitude: number; // [0, 1]
  isStructuralTransition: boolean;
  brokenEdges: string[];
  severedDependencies: DependencyInfo[];
  isolatedNodes: string[];
  metrics: GraphDistanceMetrics;
  description: string;
}

// ============================================================================
// 4. INTERVENTIONS & COUNTERFACTUAL ENGINE
// ============================================================================

export interface ActionPrimitive {
  id: string;
  targetNodeId: string;
  targetVariable: string;
  actionType: 'set' | 'increment' | 'scale' | 'clamp' | 'reroute_edge' | 'toggle_edge';
  value: number;
  cost: number;
  latencyTicks: number;
  feasibilityConstraint?: (state: SystemState) => boolean;
  description: string;
}

export interface GenericIntervention {
  id: string;
  name: string;
  actions: ActionPrimitive[];
  totalCost: number;
  resourceRequirements: Record<string, number>;
  maxExecutionTimeTicks: number;
  tags?: string[];
}

export interface CounterfactualResult {
  intervention: GenericIntervention | null; // null represents baseline (no intervention)
  baselineState: StateVector;
  projectedState: StateVector;
  baselineRegime: RegimeType;
  projectedRegime: RegimeType;
  baselineBtd: number;
  projectedBtd: number;
  deltaBtd: number;
  baselineTopologyShock: number;
  projectedTopologyShock: number;
  deltaTopologyShock: number;
  transitionProbability: number;
  confidence: number;
  cost: number;
  recoveryTimeTicks: number;
  expectedLoss: number;
}

export interface EscapeOptimizationResult {
  recommendedIntervention: GenericIntervention | null;
  candidatesRanked: Array<{
    intervention: GenericIntervention;
    btdGain: number;
    cost: number;
    transitionRiskReduction: number;
    paretoScore: number;
    confidence: number;
  }>;
  meetsSafeBtd: boolean;
  interventionsEvaluated: number;
  optimizationTimeMs: number;
}

// ============================================================================
// 5. UNCERTAINTY
// ============================================================================

export interface UncertaintyEstimate {
  mean: number;
  variance: number;
  standardDeviation: number;
  confidenceInterval95: [number, number];
  sampleCount: number;
  entropy: number;
  observationNoiseSigma: number;
  missingDataFraction: number;
}

// ============================================================================
// 6. BENCHMARK & EXPERIMENTAL EVALUATION
// ============================================================================

export type BenchmarkScenarioFamily =
  | 'STABLE'
  | 'SINGLE_BOUNDARY'
  | 'COUPLED_BOUNDARY'
  | 'HIDDEN_BOUNDARY'
  | 'MOVING_BOUNDARY'
  | 'ADVERSARIAL_BOUNDARY'
  | 'DELAYED_BOUNDARY'
  | 'TOPOLOGY_BOUNDARY'
  | 'MULTI_BOUNDARY'
  | 'RECOVERY_BOUNDARY';

export interface BenchmarkScenario {
  id: string;
  scenarioType: BenchmarkScenarioFamily;
  seed: number;
  dimension: number;
  nodeCount: number;
  edgeCount: number;
  initialState: SystemState;
  observationSequence: SystemState[];
  hiddenVariables: string[];
  noiseLevel: number;
  missingDataRate: number;
  // Ground truth generated strictly by simulation physics
  groundTruth: {
    trueBoundaryDistance: number;
    trueTransitionTimeTicks: number;
    trueTargetRegime: RegimeType;
    trueVulnerableDirection: string[];
    optimalIntervention: GenericIntervention;
    optimalInterventionCost: number;
    futureTopology: { nodes: number; edges: number; connectedComponents: number };
    trueRecoveryPathLength: number;
  };
}

export type BenchmarkGroundTruth = BenchmarkScenario['groundTruth'];

export interface ResearchMetrics {
  btde: number; // Boundary Transition Distance Error: |pred_btd - true_btd|
  bdr: number;  // Boundary Detection Recall
  vda: number;  // Vulnerability Direction Accuracy (cosine or IoU)
  tsa: number;  // Topology Shock Accuracy
  chl: number;  // Constraint/Boundary Horizon Lead: true_time - detection_time
  mir: number;  // Minimum Intervention Regret: (C_orbit - C_optimal) / C_optimal
  rse: number;  // Regime Stability Error
  far: number;  // False Alarm Rate
  oar: number;  // Observation Adaptability Rate
  uce: number;  // Uncertainty Calibration Error
}

export interface BaselineResult {
  baselineName: string;
  description: string;
  metrics: ResearchMetrics;
  runtimeMs: number;
  scenariosEvaluated: number;
}

export type AblationType =
  | 'FULL_ORBIT'
  | 'ORBIT_NO_BOUNDARY'
  | 'ORBIT_NO_DIRECTION'
  | 'ORBIT_NO_TOPOLOGY'
  | 'ORBIT_NO_INTERVENTION'
  | 'ORBIT_NO_UNCERTAINTY'
  | 'ORBIT_NO_COUNTERFACTUAL';

export interface AblationStudyResult {
  ablationType: AblationType;
  description: string;
  metrics: ResearchMetrics;
  deltaVsFullOrbit: Partial<ResearchMetrics>;
}

export interface ExperimentRecord {
  experimentId: string;
  algorithmVersion: string;
  seed: number;
  parameters: OrbitConfig;
  scenarioCount: number;
  scenarioFamilies: BenchmarkScenarioFamily[];
  baselineComparisons: BaselineResult[];
  ablationResults: AblationStudyResult[];
  meanMetrics: ResearchMetrics;
  timestamp: string;
  deviceInfo?: string;
}

// ============================================================================
// 7. CENTRAL CONFIGURATION
// ============================================================================

export interface OrbitObjectiveWeights {
  weightRisk: number;         // alpha: weight on transition risk reduction [0, 1]
  weightMargin: number;       // beta: weight on boundary distance expansion [0, 1]
  weightCost: number;         // lambda: weight on intervention cost penalty [0, 1]
  weightShock: number;        // gamma: weight on structural graph disruption [0, 1]
  weightUncertainty: number;  // mu: weight on uncertainty penalty [0, 1]
  costReference: number;      // Normalization scale for cost
}

export const DEFAULT_OBJECTIVE_WEIGHTS: OrbitObjectiveWeights = {
  weightRisk: 0.35,
  weightMargin: 0.35,
  weightCost: 0.15,
  weightShock: 0.10,
  weightUncertainty: 0.05,
  costReference: 100.0
};

export interface OrbitConfig {
  windowSize: number;
  predictionHorizon: number;
  perturbationsPerState: number;
  maxGraphDepth: number;
  maxInteractionOrder: number;
  topologyShockThreshold: number;
  safeBtdThreshold: number;
  maxInterventions: number;
  monteCarloSamples: number;
  distanceMetric: DistanceMetric;
  randomSeed: number;
  objectiveWeights: OrbitObjectiveWeights;
}

export const DEFAULT_ORBIT_CONFIG: OrbitConfig = {
  windowSize: 32,
  predictionHorizon: 16,
  perturbationsPerState: 128,
  maxGraphDepth: 5,
  maxInteractionOrder: 3,
  topologyShockThreshold: 0.30,
  safeBtdThreshold: 1.25,
  maxInterventions: 3,
  monteCarloSamples: 128,
  distanceMetric: 'NORMALIZED_WEIGHTED',
  randomSeed: 42,
  objectiveWeights: DEFAULT_OBJECTIVE_WEIGHTS
};
