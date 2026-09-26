/**
 * ORBIT-A 3.0 Comprehensive Regression & Property Test Suite
 * 
 * Tests:
 * 1. Boundary calculation (adaptive BTD)
 * 2. Directional search proposals & diversity
 * 3. Feature importance screening
 * 4. Pairwise interaction discovery
 * 5. TBI composite formula & bounds [0, 1]
 * 6. State transitions (NORMAL -> WATCH -> CRITICAL -> TRANSITION)
 * 7. Deadband hysteresis holding
 * 8. Asymmetric fast de-escalation on clear recovery
 * 9. MEI-2 portfolio escape optimization
 * 10. Pareto frontier dominance ranking
 * 11. Topology shock amplification
 * 12. Missing sensor data robustness
 * 13. Observation delay resistance
 * 14. Sudden shock detection
 * 15. Operational recovery behavior
 */

import { OrbitEngineV3 } from '../v3/orbitEngineV3';
import { HighDimensionalImportanceScreener } from '../v3/importanceScreening';
import { DirectionalProposalEngine } from '../v3/directionalProposal';
import { AdaptiveBoundarySearchEngine } from '../v3/adaptiveBoundarySearch';
import { TransitionMomentumEngine } from '../v3/transitionMomentum';
import { StructuralAmplificationEngine } from '../v3/structuralAmplification';
import { Mei2Optimizer } from '../v3/mei2Optimizer';
import { TbiScoreEngine } from '../v3/tbiScore';
import { AdaptiveStatePolicyEngine } from '../v3/adaptiveStatePolicy';
import { SystemState, SystemNode, Constraint, GenericIntervention, StateVector } from '../core/types';
import { systemStateToVector } from '../core/stateVector';
import { DEFAULT_ORBIT_V3_CONFIG } from '../v3/types';

export interface V3TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runAllOrbitV3Tests(): {
  results: V3TestResult[];
  passedCount: number;
  totalCount: number;
} {
  const results: V3TestResult[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err?.message || String(err) });
    }
  }

  function assert(cond: boolean, msg: string) {
    if (!cond) throw new Error(msg);
  }

  // Helper to create test system state
  function createTestState(scale: number = 1.0, activeEdges: boolean = true): SystemState {
    const nodes = new Map<string, SystemNode>();
    const edges = new Map<string, any>();
    const constraints: Constraint[] = [];

    for (let i = 1; i <= 6; i++) {
      const id = `node_${i}`;
      nodes.set(id, {
        id,
        label: `Substation ${i}`,
        capacity: 100,
        demand: 40 * scale,
        status: 'nominal',
        state: {
          voltage: { value: 1.02 / scale, min: 0.85, max: 1.15, nominal: 1.0 },
          power: { value: 30.0 * scale, min: 0.0, max: 100.0, nominal: 30.0 }
        }
      });

      if (i > 1) {
        edges.set(`edge_${i - 1}_${i}`, {
          source: `node_${i - 1}`,
          target: id,
          capacity: 100,
          flow: 25 * scale,
          active: activeEdges,
          type: 'transmission_line'
        });
      }

      constraints.push({
        variableName: 'voltage',
        nodeId: id,
        threshold: 0.90,
        type: 'min',
        priority: 'hard',
        penaltyWeight: 10.0
      });
    }

    return {
      timestamp: 1710244800000,
      nodes,
      edges,
      dependencies: [],
      constraints
    };
  }

  const sampleInterventions: GenericIntervention[] = [
    {
      id: 'inj_power',
      name: 'Power Injection (+15MW)',
      actions: [{ targetNodeId: 'node_2', targetVariable: 'voltage', actionType: 'increment', value: 0.08, cost: 10.0, latencyTicks: 1 }],
      totalCost: 10.0,
      resourceRequirements: {},
      maxExecutionTimeTicks: 1
    },
    {
      id: 'cap_bank',
      name: 'Capacitor Bank (+10MVAR)',
      actions: [{ targetNodeId: 'node_4', targetVariable: 'voltage', actionType: 'increment', value: 0.05, cost: 5.0, latencyTicks: 1 }],
      totalCost: 5.0,
      resourceRequirements: {},
      maxExecutionTimeTicks: 1
    }
  ];

  // --------------------------------------------------------------------------
  // TEST 1: Adaptive Boundary Calculation
  // --------------------------------------------------------------------------
  test('V3-01: Adaptive boundary search calculates finite non-negative BTD', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const screener = new HighDimensionalImportanceScreener();
    const proposalEngine = new DirectionalProposalEngine();
    const boundaryEngine = new AdaptiveBoundarySearchEngine();

    const { features } = screener.screenVariables(vec, null, state.constraints, 8);
    const proposals = proposalEngine.generateProposals(vec, null, features, state.constraints, state, 16);
    const res = boundaryEngine.searchBoundary(vec, proposals, state.constraints);

    assert(res.adaptiveBtd > 0, `BTD must be strictly positive, got ${res.adaptiveBtd}`);
    assert(res.rayEvaluationsCount > 0, `Ray evaluations must be positive, got ${res.rayEvaluationsCount}`);
    assert(res.dominantDirection.vector.length === vec.values.length, 'Dominant direction must match dimension');
  });

  // --------------------------------------------------------------------------
  // TEST 2: Directional Proposal Diversity
  // --------------------------------------------------------------------------
  test('V3-02: Directional proposals produce diverse sources (VELOCITY, CENTRALITY, SENSITIVITY)', () => {
    const s1 = createTestState(1.0);
    const s2 = createTestState(1.05);
    const vec1 = systemStateToVector(s1);
    const vec2 = systemStateToVector(s2);
    const screener = new HighDimensionalImportanceScreener();
    const proposalEngine = new DirectionalProposalEngine();

    const { features } = screener.screenVariables(vec2, vec1, s2.constraints, 8);
    const proposals = proposalEngine.generateProposals(vec2, vec1, features, s2.constraints, s2, 24);

    const sources = new Set(proposals.map((p) => p.source));
    assert(sources.has('VELOCITY'), 'Must generate VELOCITY proposal');
    assert(sources.has('SENSITIVITY'), 'Must generate SENSITIVITY proposal');
    assert(sources.has('CENTRALITY'), 'Must generate CENTRALITY proposal');
  });

  // --------------------------------------------------------------------------
  // TEST 3: High-Dimensional Importance Screening
  // --------------------------------------------------------------------------
  test('V3-03: Importance screening bounds active subspace to maxScreenedVariables', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const screener = new HighDimensionalImportanceScreener();

    const maxK = 4;
    const { screenedIndices, features } = screener.screenVariables(vec, null, state.constraints, maxK);

    assert(screenedIndices.length <= maxK, `Expected at most ${maxK} features, got ${screenedIndices.length}`);
    assert(features.length === screenedIndices.length, 'Features and indices count must match');
    assert(features[0].importanceScore >= features[features.length - 1].importanceScore, 'Must be sorted by score descending');
  });

  // --------------------------------------------------------------------------
  // TEST 4: Pairwise Interaction Discovery
  // --------------------------------------------------------------------------
  test('V3-04: Discovers pairwise non-linear interactions across active corridors', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const screener = new HighDimensionalImportanceScreener();

    const { screenedIndices } = screener.screenVariables(vec, null, state.constraints, 8);
    const interactions = screener.discoverPairwiseInteractions(vec, screenedIndices, state);

    assert(interactions.length > 0, 'Must discover at least one interaction along active edges');
    assert(interactions[0].interactionStrength > 0, 'Interaction strength must be positive');
  });

  // --------------------------------------------------------------------------
  // TEST 5: TBI Composite Formulation & Bounds
  // --------------------------------------------------------------------------
  test('V3-05: TBI composite score strictly adheres to [0, 1] bounds', () => {
    const tbiEngine = new TbiScoreEngine();
    const dummyMei2 = {
      top5Interventions: [],
      paretoFrontier: [],
      bestEscape: null,
      overallEscapeEfficiency: 0.8,
      confidenceInterval: [0.7, 0.9] as [number, number]
    };

    const resSafe = tbiEngine.computeTbi(2.5, 0.05, 1.0, dummyMei2, DEFAULT_ORBIT_V3_CONFIG);
    assert(resSafe.tbiScore >= 0.0 && resSafe.tbiScore <= 1.0, `Safe TBI must be in [0, 1], got ${resSafe.tbiScore}`);

    const resExtreme = tbiEngine.computeTbi(0.01, 2.5, 3.0, dummyMei2, DEFAULT_ORBIT_V3_CONFIG);
    assert(resExtreme.tbiScore >= 0.0 && resExtreme.tbiScore <= 1.0, `Extreme TBI must be clamped to [0, 1], got ${resExtreme.tbiScore}`);
    assert(resExtreme.tbiScore > resSafe.tbiScore, 'Extreme hazard TBI must be strictly higher than safe TBI');
  });

  // --------------------------------------------------------------------------
  // TEST 6: 4-State Transition Progression
  // --------------------------------------------------------------------------
  test('V3-06: State policy progresses through NORMAL -> WATCH -> CRITICAL -> TRANSITION', () => {
    const policy = new AdaptiveStatePolicyEngine();
    const config = { ...DEFAULT_ORBIT_V3_CONFIG, temporalEvidenceWindow: 1 };

    // 1. Normal
    const sNorm = policy.evaluateState({ boundaryProximity: 0.1, transitionMomentum: 0.05, structuralAmplification: 1.0, interventionLeverage: 0.8 }, 0.15, config);
    assert(sNorm.operationalState === 'NORMAL', `Expected NORMAL, got ${sNorm.operationalState}`);

    // 2. Watch
    const sWatch = policy.evaluateState({ boundaryProximity: 0.45, transitionMomentum: 0.35, structuralAmplification: 1.0, interventionLeverage: 0.7 }, 0.38, config);
    assert(sWatch.operationalState === 'WATCH', `Expected WATCH, got ${sWatch.operationalState}`);

    // 3. Critical
    const sCrit = policy.evaluateState({ boundaryProximity: 0.75, transitionMomentum: 0.50, structuralAmplification: 1.4, interventionLeverage: 0.5 }, 0.65, config);
    assert(sCrit.operationalState === 'CRITICAL', `Expected CRITICAL, got ${sCrit.operationalState}`);

    // 4. Transition
    const sTrans = policy.evaluateState({ boundaryProximity: 0.98, transitionMomentum: 1.2, structuralAmplification: 2.0, interventionLeverage: 0.2 }, 0.90, config);
    assert(sTrans.operationalState === 'TRANSITION', `Expected TRANSITION, got ${sTrans.operationalState}`);
  });

  // --------------------------------------------------------------------------
  // TEST 7: Hysteresis Deadband Suppression
  // --------------------------------------------------------------------------
  test('V3-07: Deadband suppresses state chattering when TBI drop is within deadbandWidth', () => {
    const policy = new AdaptiveStatePolicyEngine();
    const config = { ...DEFAULT_ORBIT_V3_CONFIG, temporalEvidenceWindow: 1, deadbandWidth: 0.15 };

    // Escalate to WATCH
    policy.evaluateState({ boundaryProximity: 0.45, transitionMomentum: 0.35, structuralAmplification: 1.0, interventionLeverage: 0.6 }, 0.38, config);

    // Minor drop in TBI targeting NORMAL (0.38 -> 0.29, drop = 0.09 < 0.15 deadband)
    // boundaryProximity = 0.31 (not clear recovery since > 0.30, and TM = 0.20 > 0.15)
    const res = policy.evaluateState({ boundaryProximity: 0.31, transitionMomentum: 0.20, structuralAmplification: 1.0, interventionLeverage: 0.6 }, 0.29, config);

    assert(res.suppressedByDeadband === true, 'Minor drop must be suppressed by deadband');
    assert(res.operationalState === 'WATCH', 'State must hold in WATCH during minor drop');
  });

  // --------------------------------------------------------------------------
  // TEST 8: Asymmetric Fast Recovery De-escalation
  // --------------------------------------------------------------------------
  test('V3-08: Asymmetric de-escalation immediately resets state when boundary hazard collapses', () => {
    const policy = new AdaptiveStatePolicyEngine();
    const config = { ...DEFAULT_ORBIT_V3_CONFIG, temporalEvidenceWindow: 3 };

    // Escalate to CRITICAL
    policy.evaluateState({ boundaryProximity: 0.8, transitionMomentum: 0.9, structuralAmplification: 1.5, interventionLeverage: 0.4 }, 0.75, config);

    // Threat clears completely: BP drops to 0.10, TM to 0.02
    const res = policy.evaluateState({ boundaryProximity: 0.10, transitionMomentum: 0.02, structuralAmplification: 1.0, interventionLeverage: 0.9 }, 0.12, config);

    assert(res.operationalState === 'NORMAL', `Asymmetric fast recovery must reset to NORMAL immediately, got ${res.operationalState}`);
    assert(res.stateTransitionEvidence === 0, 'Evidence ticks must be reset to 0');
  });

  // --------------------------------------------------------------------------
  // TEST 9: MEI-2 Portfolio Optimization
  // --------------------------------------------------------------------------
  test('V3-09: MEI-2 generates 2-action portfolios with higher Escape Efficiency than single action', () => {
    const state = createTestState(1.0);
    state.nodes.get('node_2')!.state.voltage.value = 0.86;
    state.nodes.get('node_4')!.state.voltage.value = 0.88;
    const vec = systemStateToVector(state);
    const mei2 = new Mei2Optimizer();

    const res = mei2.optimizeEscape(state, vec, 0.0, sampleInterventions, state.constraints, DEFAULT_ORBIT_V3_CONFIG);

    assert(res.top5Interventions.length >= 2, 'Must evaluate multiple candidates including portfolios');
    assert(res.bestEscape !== null, 'Must select best escape candidate');
    assert(res.overallEscapeEfficiency > 0, `Escape efficiency must be positive, got ${res.overallEscapeEfficiency}`);
    assert(res.bestEscape.intervention.actions.length === 2, 'Best escape should be the 2-action portfolio');
  });

  // --------------------------------------------------------------------------
  // TEST 10: Pareto Frontier Dominance Ranking
  // --------------------------------------------------------------------------
  test('V3-10: MEI-2 identifies non-dominated candidates on Pareto frontier (Rank 1)', () => {
    const state = createTestState(1.0);
    state.nodes.get('node_2')!.state.voltage.value = 0.86;
    state.nodes.get('node_4')!.state.voltage.value = 0.88;
    const vec = systemStateToVector(state);
    const mei2 = new Mei2Optimizer();

    const res = mei2.optimizeEscape(state, vec, 0.0, sampleInterventions, state.constraints, DEFAULT_ORBIT_V3_CONFIG);

    assert(res.paretoFrontier.length > 0, 'Pareto frontier must contain at least 1 non-dominated candidate');
    for (const cand of res.paretoFrontier) {
      assert(cand.paretoRank === 1, `All frontier candidates must have Pareto rank 1, got ${cand.paretoRank}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 11: Structural Amplification on Severed Edges
  // --------------------------------------------------------------------------
  test('V3-11: Severed corridors strictly increase Structural Amplification (SA > 1.0)', () => {
    const sIntact = createTestState(1.0, true);
    const sSevered = createTestState(1.0, false);
    const structEngine = new StructuralAmplificationEngine();

    const resIntact = structEngine.evaluateAmplification(sIntact, sIntact);
    const resSevered = structEngine.evaluateAmplification(sSevered, sIntact);

    assert(resSevered.structuralAmplification > resIntact.structuralAmplification, 'Severed graph must have higher structural amplification');
    assert(resSevered.criticalCorridorsSevered > 0, 'Must record severed corridors');
  });

  // --------------------------------------------------------------------------
  // TEST 12: Missing Sensor Data Robustness
  // --------------------------------------------------------------------------
  test('V3-12: Engine gracefully executes and maintains stability under missing sensor nodes', () => {
    const engine = new OrbitEngineV3();
    const fullState = createTestState(1.0);

    // Create partial state with 50% missing nodes
    const partialNodes = new Map<string, SystemNode>();
    Array.from(fullState.nodes.entries()).slice(0, 3).forEach(([k, v]) => partialNodes.set(k, v));
    const partialState: SystemState = { ...fullState, nodes: partialNodes };

    const res = engine.analyzeSystem(partialState, sampleInterventions);

    assert(res.adaptiveBtd > 0, 'Must compute valid BTD on partial telemetry');
    assert(res.screenedActiveVariables.length > 0, 'Must screen available active features');
  });

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // TEST 13: Full End-to-End Analysis Cycle
  // --------------------------------------------------------------------------
  test('V3-13: Full OrbitEngineV3 end-to-end scorecard analysis executes within 50ms', () => {
    const engine = new OrbitEngineV3();
    const state = createTestState(1.0);

    const start = performance.now();
    const res = engine.analyzeSystem(state, sampleInterventions);
    const dur = performance.now() - start;

    assert(dur < 50, `Latency must be < 50ms, took ${dur.toFixed(2)}ms`);
    assert(res.tbiScore >= 0 && res.tbiScore <= 1, 'TBI score must be valid');
    assert(typeof res.explanation === 'string' && res.explanation.length > 10, 'Must provide structured explanation');
  });

  // --------------------------------------------------------------------------
  // TEST 14: Minimum Constraint Semantics
  // --------------------------------------------------------------------------
  test('V3-14: Minimum constraint breaches when value < threshold, safe when value >= threshold', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const engine = new AdaptiveBoundarySearchEngine();
    const c: Constraint = {
      id: 'c_min',
      description: 'min test',
      nodeId: 'node_1',
      variableName: 'voltage',
      type: 'min',
      threshold: 0.90,
      isHardConstraint: true,
      penaltyWeight: 10.0
    };
    const compiled = engine.compileConstraints(vec, [c]);

    const safeVec = new Float64Array(vec.values);
    safeVec[compiled[0].variableIndex] = 0.95;
    assert(!engine.isStateBreached(safeVec, compiled), 'Value 0.95 must not breach threshold 0.90');

    const breachVec = new Float64Array(vec.values);
    breachVec[compiled[0].variableIndex] = 0.85;
    assert(engine.isStateBreached(breachVec, compiled), 'Value 0.85 must breach threshold 0.90');
  });

  // --------------------------------------------------------------------------
  // TEST 15: Maximum Constraint Semantics
  // --------------------------------------------------------------------------
  test('V3-15: Maximum constraint breaches when value > threshold, safe when value <= threshold', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const engine = new AdaptiveBoundarySearchEngine();
    const c: Constraint = {
      id: 'c_max',
      description: 'max test',
      nodeId: 'node_1',
      variableName: 'voltage',
      type: 'max',
      threshold: 1.10,
      isHardConstraint: true,
      penaltyWeight: 10.0
    };
    const compiled = engine.compileConstraints(vec, [c]);

    const safeVec = new Float64Array(vec.values);
    safeVec[compiled[0].variableIndex] = 1.05;
    assert(!engine.isStateBreached(safeVec, compiled), 'Value 1.05 must not breach max threshold 1.10');

    const breachVec = new Float64Array(vec.values);
    breachVec[compiled[0].variableIndex] = 1.15;
    assert(engine.isStateBreached(breachVec, compiled), 'Value 1.15 must breach max threshold 1.10');
  });

  // --------------------------------------------------------------------------
  // TEST 16: Multiple Constraints and Multiple Nodes
  // --------------------------------------------------------------------------
  test('V3-16: Correctly handles multiple constraints across multiple nodes simultaneously', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const engine = new AdaptiveBoundarySearchEngine();
    const constraints: Constraint[] = [
      { id: 'c1', description: 'n1 min', nodeId: 'node_1', variableName: 'voltage', type: 'min', threshold: 0.90, isHardConstraint: true, penaltyWeight: 10 },
      { id: 'c2', description: 'n2 max', nodeId: 'node_2', variableName: 'power', type: 'max', threshold: 50.0, isHardConstraint: true, penaltyWeight: 10 },
      { id: 'c3', description: 'n3 min', nodeId: 'node_3', variableName: 'voltage', type: 'min', threshold: 0.88, isHardConstraint: true, penaltyWeight: 10 }
    ];
    const compiled = engine.compileConstraints(vec, constraints);
    assert(compiled.length === 3, 'Must compile exactly 3 constraints');

    const testVec = new Float64Array(vec.values);
    // Safe values
    testVec[compiled[0].variableIndex] = 0.95;
    testVec[compiled[1].variableIndex] = 40.0;
    testVec[compiled[2].variableIndex] = 0.92;
    assert(!engine.isStateBreached(testVec, compiled), 'All within limits must be safe');

    // Breach on node 2 only
    testVec[compiled[1].variableIndex] = 55.0;
    assert(engine.isStateBreached(testVec, compiled), 'Exceeding power on node 2 must breach');
  });

  // --------------------------------------------------------------------------
  // TEST 17: Un-targeted Constraints (nodeId undefined)
  // --------------------------------------------------------------------------
  test('V3-17: Un-targeted constraints match all nodes containing the variable', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const engine = new AdaptiveBoundarySearchEngine();
    const c: Constraint = {
      id: 'c_all_voltage',
      description: 'all nodes voltage min',
      variableName: 'voltage',
      type: 'min',
      threshold: 0.90,
      isHardConstraint: true,
      penaltyWeight: 10
    };
    const compiled = engine.compileConstraints(vec, [c]);
    // 6 substation nodes in createTestState, all having 'voltage'
    assert(compiled.length === 6, `Un-targeted constraint must expand to all 6 nodes, got ${compiled.length}`);
  });

  // --------------------------------------------------------------------------
  // TEST 18: Missing or Invalid Variables
  // --------------------------------------------------------------------------
  test('V3-18: Non-existent variable names are safely ignored during constraint compilation', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const engine = new AdaptiveBoundarySearchEngine();
    const c: Constraint = {
      id: 'c_invalid',
      description: 'non-existent',
      nodeId: 'node_1',
      variableName: 'non_existent_metric',
      type: 'min',
      threshold: 0.90,
      isHardConstraint: true,
      penaltyWeight: 10
    };
    const compiled = engine.compileConstraints(vec, [c]);
    assert(compiled.length === 0, 'Invalid variable constraint must yield 0 compiled constraints');
    assert(!engine.isStateBreached(vec.values, compiled), 'Empty compiled constraints must never breach');
  });

  // --------------------------------------------------------------------------
  // TEST 19: Boundary Exactly Equal to Threshold
  // --------------------------------------------------------------------------
  test('V3-19: Values exactly equal to threshold do not breach strict inequalities', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const engine = new AdaptiveBoundarySearchEngine();
    const constraints: Constraint[] = [
      { id: 'c_min', description: 'exact min', nodeId: 'node_1', variableName: 'voltage', type: 'min', threshold: 0.90, isHardConstraint: true, penaltyWeight: 10 },
      { id: 'c_max', description: 'exact max', nodeId: 'node_2', variableName: 'power', type: 'max', threshold: 50.0, isHardConstraint: true, penaltyWeight: 10 }
    ];
    const compiled = engine.compileConstraints(vec, constraints);

    const testVec = new Float64Array(vec.values);
    testVec[compiled[0].variableIndex] = 0.90; // exactly threshold
    testVec[compiled[1].variableIndex] = 50.0; // exactly threshold
    assert(!engine.isStateBreached(testVec, compiled), 'Exact equality must not trigger breach');
  });

  // --------------------------------------------------------------------------
  // TEST 20: Floating-Point Tolerance
  // --------------------------------------------------------------------------
  test('V3-20: Sub-microscopic floating point perturbations resolve strictly and stably', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const engine = new AdaptiveBoundarySearchEngine();
    const c: Constraint = {
      id: 'c_eps',
      description: 'epsilon test',
      nodeId: 'node_1',
      variableName: 'voltage',
      type: 'min',
      threshold: 1.000000000000,
      isHardConstraint: true,
      penaltyWeight: 10
    };
    const compiled = engine.compileConstraints(vec, [c]);

    const testVec = new Float64Array(vec.values);
    testVec[compiled[0].variableIndex] = 1.000000000001; // just above
    assert(!engine.isStateBreached(testVec, compiled), 'Epsilon above threshold must not breach');

    testVec[compiled[0].variableIndex] = 0.999999999999; // just below
    assert(engine.isStateBreached(testVec, compiled), 'Epsilon below threshold must breach');
  });

  // --------------------------------------------------------------------------
  // TEST 21: Mixed Min and Max Constraints
  // --------------------------------------------------------------------------
  test('V3-21: Mixed min and max constraints on the same node operate independently', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const engine = new AdaptiveBoundarySearchEngine();
    const constraints: Constraint[] = [
      { id: 'c_low', description: 'voltage min', nodeId: 'node_1', variableName: 'voltage', type: 'min', threshold: 0.90, isHardConstraint: true, penaltyWeight: 10 },
      { id: 'c_high', description: 'voltage max', nodeId: 'node_1', variableName: 'voltage', type: 'max', threshold: 1.10, isHardConstraint: true, penaltyWeight: 10 }
    ];
    const compiled = engine.compileConstraints(vec, constraints);
    assert(compiled.length === 2, 'Must compile both min and max');

    const testVec = new Float64Array(vec.values);
    testVec[compiled[0].variableIndex] = 1.00;
    assert(!engine.isStateBreached(testVec, compiled), 'Value inside range must not breach');

    testVec[compiled[0].variableIndex] = 0.88;
    assert(engine.isStateBreached(testVec, compiled), 'Value below min must breach');

    testVec[compiled[0].variableIndex] = 1.12;
    assert(engine.isStateBreached(testVec, compiled), 'Value above max must breach');
  });

  // --------------------------------------------------------------------------
  // TEST 22: Hard vs Soft Constraint Metadata Preservation
  // --------------------------------------------------------------------------
  test('V3-22: Compiled constraints faithfully preserve isHardConstraint and penaltyWeight', () => {
    const state = createTestState(1.0);
    const vec = systemStateToVector(state);
    const engine = new AdaptiveBoundarySearchEngine();
    const cSoft: Constraint = {
      id: 'c_soft',
      description: 'soft constraint',
      nodeId: 'node_1',
      variableName: 'voltage',
      type: 'min',
      threshold: 0.95,
      isHardConstraint: false,
      penaltyWeight: 2.5
    };
    const compiled = engine.compileConstraints(vec, [cSoft]);
    assert(compiled[0].isHardConstraint === false, 'Must preserve soft constraint flag');
    assert(compiled[0].penaltyWeight === 2.5, 'Must preserve penalty weight');
  });

  // --------------------------------------------------------------------------
  // TEST 23: 100% Equivalence Between Compiled and Reference Implementation
  // --------------------------------------------------------------------------
  test('V3-23: Compiled constraint check produces 100% identical decisions to Reference across N=10, 50, 100, 250', () => {
    const testDimensions = [10, 50, 100, 250];
    const engine = new AdaptiveBoundarySearchEngine();

    for (const n of testDimensions) {
      const state = createTestState(1.0);
      // Add extra nodes for larger N
      for (let i = 7; i <= n; i++) {
        const id = `node_${i}`;
        state.nodes.set(id, {
          id,
          label: `Substation ${i}`,
          capacity: 100,
          demand: 40,
          status: 'nominal',
          state: {
            voltage: { name: 'voltage', type: 'continuous', value: 1.02, min: 0.85, max: 1.15, nominal: 1.0 },
            power: { name: 'power', type: 'continuous', value: 30.0, min: 0.0, max: 100.0, nominal: 30.0 }
          }
        });
        if (i % 3 === 0) {
          state.constraints.push({
            id: `c_v_${id}`,
            description: `Voltage min ${id}`,
            nodeId: id,
            variableName: 'voltage',
            threshold: 0.90,
            type: 'min',
            isHardConstraint: true,
            penaltyWeight: 10.0
          });
        }
      }

      const vec = systemStateToVector(state);
      const compiled = engine.compileConstraints(vec, state.constraints);

      // Test 50 pseudo-random perturbation vectors per dimension
      let rngSeed = 42 + n;
      const pseudoRng = () => {
        rngSeed = (rngSeed * 16807 + 11) % 2147483647;
        return (rngSeed - 1) / 2147483646;
      };

      for (let trial = 0; trial < 50; trial++) {
        const candidate = new Float64Array(vec.values.length);
        for (let j = 0; j < candidate.length; j++) {
          // Perturb values within +/- 0.30
          candidate[j] = vec.values[j] + (pseudoRng() - 0.5) * 0.60;
        }

        const refDecision = AdaptiveBoundarySearchEngine.isStateBreachedReference(candidate, vec, state.constraints);
        const optDecision = engine.isStateBreached(candidate, compiled);

        assert(
          refDecision === optDecision,
          `Mismatch at N=${n}, trial=${trial}: Reference=${refDecision}, Optimized=${optDecision}`
        );
      }
    }
  });

  return {
    results,
    passedCount: results.filter((r) => r.passed).length,
    totalCount: results.length
  };
}

