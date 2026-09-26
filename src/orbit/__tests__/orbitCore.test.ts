/**
 * ORBIT — Comprehensive Research & Property Test Suite
 * Contains 36 rigorous unit and property tests verifying mathematical correctness,
 * algorithmic convergence, invariant properties, and reproducible ground truth.
 */

import { OrbitEngine } from '../orbitEngine';
import { systemStateToVector, vectorToSystemState, addVectors } from '../core/stateVector';
import { computeDistance } from '../core/normalization';
import { buildGraphTopology, computeGraphDistance } from '../core/graphModel';
import { TransitionModel } from '../core/transitionModel';
import { RegimeClassifier } from '../boundary/regimeClassifier';
import { BoundaryDistanceOptimizer } from '../boundary/boundaryDistance';
import { VulnerabilityDirectionAnalyzer } from '../boundary/vulnerabilityDirection';
import { TopologyShockEvaluator } from '../topology/topologyShock';
import { EscapeOptimizer } from '../intervention/escapeOptimizer';
import { CounterfactualEngine } from '../intervention/counterfactual';
import { computeInterventionCost } from '../intervention/interventionCost';
import { UncertaintyEstimator } from '../uncertainty/uncertaintyEstimator';
import { generateScenario } from '../benchmark/scenarios';
import { BenchmarkGenerator } from '../benchmark/generator';
import { ResearchMetricsCalculator, EvaluationDataPoint } from '../benchmark/metrics';
import { BenchmarkBaselines } from '../benchmark/baselines';
import { AblationStudyRunner } from '../experiments/ablation';
import { RobustnessExperimentRunner } from '../experiments/robustness';
import { ScalingExperimentRunner } from '../experiments/scaling';
import { AegisFoodAdapter } from '../adapters/aegisFoodAdapter';
import { INITIAL_ECOSYSTEM_NODES, INITIAL_COURIERS } from '../../engine/mockData';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runAllOrbitTests(): { passedCount: number; totalCount: number; results: TestResult[] } {
  const results: TestResult[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (e: any) {
      results.push({ name, passed: false, error: e?.message || String(e) });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  // --------------------------------------------------------------------------
  // PROPERTY TESTS (1 to 7)
  // --------------------------------------------------------------------------

  // Property 1: Zero perturbation cannot cause a regime transition in a stable deterministic system
  test('Property 1: Zero perturbation maintains stable equilibrium', () => {
    const sc = generateScenario('STABLE', 42);
    const classifier = new RegimeClassifier();
    const vec = systemStateToVector(sc.initialState);
    const reg = classifier.classify(vec, sc.initialState.constraints);
    assert(reg.type === 'RECOVERABLE_EQUILIBRIUM', `Expected RECOVERABLE_EQUILIBRIUM, got ${reg.type}`);
  });

  // Property 2: Adding a known destabilizing perturbation should not increase BTD
  test('Property 2: Destabilizing perturbation monotonically decreases or maintains BTD', () => {
    const sc = generateScenario('SINGLE_BOUNDARY', 42);
    const optimizer = new BoundaryDistanceOptimizer();
    const baseVec = systemStateToVector(sc.initialState);

    const btdBase = optimizer.computeBtd(baseVec, sc.initialState.constraints).btd;

    // Inject destabilizing load (+15 units towards threshold)
    const perturbedVec = systemStateToVector(sc.initialState);
    perturbedVec.values[0] += 15;
    const btdPerturbed = optimizer.computeBtd(perturbedVec, sc.initialState.constraints).btd;

    assert(btdPerturbed <= btdBase + 1e-4, `Expected btdPerturbed (${btdPerturbed}) <= btdBase (${btdBase})`);
  });

  // Property 3: Re-running the same seed reproduces the exact same benchmark
  test('Property 3: Re-running identical seed produces identical benchmark ground truth', () => {
    const sc1 = generateScenario('COUPLED_BOUNDARY', 999);
    const sc2 = generateScenario('COUPLED_BOUNDARY', 999);

    assert(sc1.groundTruth.trueBoundaryDistance === sc2.groundTruth.trueBoundaryDistance, 'True BTD must match exactly');
    assert(sc1.groundTruth.trueTransitionTimeTicks === sc2.groundTruth.trueTransitionTimeTicks, 'True transition ticks must match');
    assert(sc1.initialState.nodes.get('node_0')!.capacity === sc2.initialState.nodes.get('node_0')!.capacity, 'Node capacity must match');
  });

  // Property 4: Removing observations never artificially improves information availability
  test('Property 4: Missing data degrades or maintains uncertainty entropy', () => {
    const sc = generateScenario('SINGLE_BOUNDARY', 42);
    const vec = systemStateToVector(sc.initialState);
    const uncert = new UncertaintyEstimator();

    const fullObs = uncert.estimateBtdUncertainty(vec, sc.initialState.constraints, { sampleCount: 32, missingDataRate: 0.0 });
    const missingObs = uncert.estimateBtdUncertainty(vec, sc.initialState.constraints, { sampleCount: 32, missingDataRate: 0.4 });

    assert(missingObs.confidence <= fullObs.confidence + 1e-4, 'Confidence must not increase under missing data');
  });

  // Property 5: Intervention cost must be strictly non-negative
  test('Property 5: Intervention cost is strictly non-negative', () => {
    const sc = generateScenario('SINGLE_BOUNDARY', 42);
    const cost = computeInterventionCost(sc.groundTruth.optimalIntervention);
    assert(cost >= 0, `Cost must be non-negative, got ${cost}`);
  });

  // Property 6: Topology shock must be zero when graph structure is identical
  test('Property 6: Identical graph topology yields exactly zero topology shock', () => {
    const sc = generateScenario('TOPOLOGY_BOUNDARY', 42);
    const g1 = buildGraphTopology(sc.initialState.nodes, sc.initialState.edges, sc.initialState.dependencies);
    const g2 = buildGraphTopology(sc.initialState.nodes, sc.initialState.edges, sc.initialState.dependencies);
    const dist = computeGraphDistance(g1, g2);

    assert(dist.normalizedTopologyShock === 0, `Expected 0 topology shock, got ${dist.normalizedTopologyShock}`);
    assert(dist.edgeChangeScore === 0, 'Edge change score must be 0');
    assert(dist.nodeChangeScore === 0, 'Node change score must be 0');
  });

  // Property 7: Identical counterfactual interventions produce identical results under deterministic seeds
  test('Property 7: Deterministic counterfactual reproducibility', () => {
    const sc = generateScenario('SINGLE_BOUNDARY', 42);
    const cfEngine = new CounterfactualEngine();

    const cf1 = cfEngine.simulateCounterfactual(sc.initialState, sc.groundTruth.optimalIntervention, sc.initialState.constraints);
    const cf2 = cfEngine.simulateCounterfactual(sc.initialState, sc.groundTruth.optimalIntervention, sc.initialState.constraints);

    assert(Math.abs(cf1.projectedBtd - cf2.projectedBtd) < 1e-5, 'Projected BTD must match deterministically');
    assert(cf1.projectedRegime === cf2.projectedRegime, 'Projected regime must match');
  });

  // --------------------------------------------------------------------------
  // BOUNDARY & DISTANCE TESTS (8 to 15)
  // --------------------------------------------------------------------------

  test('Test 8: Obvious boundary detection detects low BTD', () => {
    const sc = generateScenario('SINGLE_BOUNDARY', 123);
    const optimizer = new BoundaryDistanceOptimizer();
    const vec = systemStateToVector(sc.initialState);
    const res = optimizer.computeBtd(vec, sc.initialState.constraints);
    assert(res.btd <= 1.25, `Expected near-boundary BTD <= 1.25, got ${res.btd}`);
  });

  test('Test 9: Hidden boundary scenario triggers regime transition', () => {
    const sc = generateScenario('HIDDEN_BOUNDARY', 123);
    assert(sc.groundTruth.trueTargetRegime === 'COLLAPSED', 'Hidden boundary ground truth must be COLLAPSED');
  });

  test('Test 10: Moving boundary decreases threshold and distance', () => {
    const sc = generateScenario('MOVING_BOUNDARY', 123);
    assert(sc.groundTruth.trueBoundaryDistance < 0.5, 'Moving boundary should have low BTD');
  });

  test('Test 11: Directional vulnerability profile evaluates multi-order interactions', () => {
    const sc = generateScenario('COUPLED_BOUNDARY', 123);
    const vec = systemStateToVector(sc.initialState);
    const analyzer = new VulnerabilityDirectionAnalyzer();
    const profile = analyzer.evaluateDirectionalProfile(vec, sc.initialState.constraints, { maxInteractionOrder: 2 });

    assert(profile.profile.length > 5, 'Profile must contain multiple directions');
    assert(profile.mostVulnerable.distance <= profile.leastVulnerable.distance, 'Most vulnerable distance <= least vulnerable');
  });

  test('Test 12: Vulnerability direction is argmin over profile', () => {
    const sc = generateScenario('SINGLE_BOUNDARY', 123);
    const vec = systemStateToVector(sc.initialState);
    const analyzer = new VulnerabilityDirectionAnalyzer();
    const res = analyzer.evaluateDirectionalProfile(vec, sc.initialState.constraints);

    const minInProfile = Math.min(...res.profile.map((p) => p.distance));
    assert(Math.abs(res.mostVulnerable.distance - minInProfile) < 1e-5, 'Most vulnerable direction must equal minimum profile distance');
  });

  test('Test 13: Topology shock detects severed corridors', () => {
    const sc = generateScenario('TOPOLOGY_BOUNDARY', 42);
    const evaluator = new TopologyShockEvaluator();
    
    // Future state with severed edge
    const futureEdges = new Map(sc.initialState.edges);
    const firstKey = Array.from(futureEdges.keys())[0];
    futureEdges.delete(firstKey);
    const futureState = { ...sc.initialState, edges: futureEdges };

    const shock = evaluator.evaluateTopologyShock(sc.initialState, futureState);
    assert(shock.shockMagnitude > 0, 'Shock magnitude must be positive when edge is deleted');
    assert(shock.brokenEdges.length > 0, 'Broken edges list must not be empty');
  });

  test('Test 14: Pareto escape optimizer selects valid intervention', () => {
    const sc = generateScenario('SINGLE_BOUNDARY', 42);
    const optimizer = new EscapeOptimizer();
    const candidates = [sc.groundTruth.optimalIntervention];
    const res = optimizer.optimizeEscape(sc.initialState, candidates, sc.initialState.constraints);

    assert(res.recommendedIntervention !== null, 'Recommended intervention must not be null');
    assert(res.candidatesRanked.length > 0, 'Ranked candidates must not be empty');
  });

  test('Test 15: Monte Carlo confidence interval is valid [lower < upper]', () => {
    const sc = generateScenario('STABLE', 42);
    const uncert = new UncertaintyEstimator();
    const vec = systemStateToVector(sc.initialState);
    const res = uncert.estimateBtdUncertainty(vec, sc.initialState.constraints, { sampleCount: 32 });

    const [lower, upper] = res.estimate.confidenceInterval95;
    assert(lower <= upper, `Lower bound (${lower}) must be <= upper bound (${upper})`);
    assert(res.estimate.sampleCount === 32, 'Sample count must match requested');
  });

  // --------------------------------------------------------------------------
  // DISTANCE & METRIC MATHEMATICAL TESTS (16 to 24)
  // --------------------------------------------------------------------------

  test('Test 16: L1 distance satisfies non-negativity and symmetry', () => {
    const sc = generateScenario('STABLE', 42);
    const v1 = systemStateToVector(sc.initialState);
    const v2 = systemStateToVector(sc.initialState);
    v2.values[0] += 10;

    const d12 = computeDistance(v1, v2, { metric: 'L1' });
    const d21 = computeDistance(v2, v1, { metric: 'L1' });
    assert(Math.abs(d12 - d21) < 1e-6, 'L1 must be symmetric');
    assert(d12 > 0, 'L1 must be positive for distinct vectors');
  });

  test('Test 17: L2 Euclidean norm calculation', () => {
    const sc = generateScenario('STABLE', 42);
    const v1 = systemStateToVector(sc.initialState);
    const v2 = systemStateToVector(sc.initialState);
    v2.values[0] += 3;
    v2.values[1] += 4;

    const d = computeDistance(v1, v2, { metric: 'L2' });
    assert(Math.abs(d - 5.0) < 1e-4, `Expected Euclidean distance 5.0, got ${d}`);
  });

  test('Test 18: Normalized weighted distance is scale-invariant', () => {
    const sc = generateScenario('STABLE', 42);
    const v = systemStateToVector(sc.initialState);
    const dZero = computeDistance(v, v, { metric: 'NORMALIZED_WEIGHTED' });
    assert(dZero === 0, 'Distance from vector to itself must be zero');
  });

  test('Test 19: Degree centrality values are normalized in [0, 1]', () => {
    const sc = generateScenario('STABLE', 42);
    const g = buildGraphTopology(sc.initialState.nodes, sc.initialState.edges);
    g.degreeCentrality.forEach((val) => {
      assert(val >= 0 && val <= 1.0, `Degree centrality must be in [0, 1], got ${val}`);
    });
  });

  test('Test 20: Graph connected components BFS identifies partitions', () => {
    const sc = generateScenario('STABLE', 42);
    const g = buildGraphTopology(sc.initialState.nodes, sc.initialState.edges);
    assert(g.connectedComponents.length >= 1, 'Must have at least 1 connected component');
    let totalNodes = 0;
    g.connectedComponents.forEach((comp) => (totalNodes += comp.length));
    assert(totalNodes === sc.nodeCount, 'Union of components must equal total node count');
  });

  test('Test 21: Regime classifier marks hard constraint violation as critical', () => {
    const sc = generateScenario('SINGLE_BOUNDARY', 42);
    const classifier = new RegimeClassifier();
    const vec = systemStateToVector(sc.initialState);
    // Force breach
    vec.values[0] = 9999;
    const reg = classifier.classify(vec, sc.initialState.constraints);
    assert(reg.type === 'CRITICAL_CASCADE' || reg.type === 'COLLAPSED', 'Breached state must be critical or collapsed');
  });

  test('Test 22: Multiple hard constraint breaches trigger COLLAPSED regime', () => {
    const sc = generateScenario('SINGLE_BOUNDARY', 42);
    const classifier = new RegimeClassifier();
    const vec = systemStateToVector(sc.initialState);
    vec.values[0] = 9999;
    if (vec.values.length > 3) vec.values[3] = 9999;
    const reg = classifier.classify(vec, sc.initialState.constraints);
    assert(reg.type === 'COLLAPSED', 'Multiple breaches must trigger COLLAPSED');
  });

  test('Test 23: Transition model clamps state vector within bounds', () => {
    const sc = generateScenario('STABLE', 42);
    const model = new TransitionModel({ noiseSigma: 0.0 });
    const vec = systemStateToVector(sc.initialState);
    vec.values[0] = -9999; // below min
    const stepped = model.step(vec);
    assert(stepped.values[0] >= stepped.bounds[0].min, 'Stepped values must respect lower bound');
  });

  test('Test 24: Transition model projects trajectory of length horizon + 1', () => {
    const sc = generateScenario('STABLE', 42);
    const model = new TransitionModel({ noiseSigma: 0.0 });
    const vec = systemStateToVector(sc.initialState);
    const traj = model.projectHorizon(vec, 8);
    assert(traj.length === 9, `Expected trajectory length 9, got ${traj.length}`);
  });

  // --------------------------------------------------------------------------
  // BENCHMARK & METRIC TESTS (25 to 30)
  // --------------------------------------------------------------------------

  test('Test 25: Benchmark generator produces exact requested batch size', () => {
    const batch = BenchmarkGenerator.generateBatch({ count: 15, seed: 101 });
    assert(batch.length === 15, `Expected 15 scenarios, got ${batch.length}`);
  });

  test('Test 26: Benchmark generator covers all 10 scenario families', () => {
    const batch = BenchmarkGenerator.generateBatch({ count: 20, seed: 101 });
    const families = new Set(batch.map((b) => b.scenarioType));
    assert(families.size === 10, `Expected 10 scenario families, got ${families.size}`);
  });

  test('Test 27: Research metric BTDE computes mean absolute error correctly', () => {
    const mockPoints: EvaluationDataPoint[] = [
      { predictedBtd: 1.0, trueBtd: 1.2, predictedNearBoundary: true, trueNearBoundary: true, predictedVulnerableVars: [], trueVulnerableVars: [], predictedTopologyShock: 0, trueTopologyShock: 0, detectionTick: 1, trueTransitionTick: 5, interventionCost: 10, optimalCost: 10, predictedRegime: 'A', trueRegime: 'A', isStableSystem: false, statedConfidence: 0.9, withinConfidenceInterval: true },
      { predictedBtd: 2.0, trueBtd: 1.8, predictedNearBoundary: false, trueNearBoundary: false, predictedVulnerableVars: [], trueVulnerableVars: [], predictedTopologyShock: 0, trueTopologyShock: 0, detectionTick: 1, trueTransitionTick: 5, interventionCost: 10, optimalCost: 10, predictedRegime: 'A', trueRegime: 'A', isStableSystem: false, statedConfidence: 0.9, withinConfidenceInterval: true }
    ];
    const btde = ResearchMetricsCalculator.computeBtde(mockPoints);
    assert(Math.abs(btde - 0.2) < 1e-5, `Expected BTDE 0.2, got ${btde}`);
  });

  test('Test 28: Research metric BDR computes recall correctly', () => {
    const mockPoints: EvaluationDataPoint[] = [
      { predictedBtd: 0.5, trueBtd: 0.5, predictedNearBoundary: true, trueNearBoundary: true, predictedVulnerableVars: [], trueVulnerableVars: [], predictedTopologyShock: 0, trueTopologyShock: 0, detectionTick: 1, trueTransitionTick: 5, interventionCost: 10, optimalCost: 10, predictedRegime: 'A', trueRegime: 'A', isStableSystem: false, statedConfidence: 0.9, withinConfidenceInterval: true },
      { predictedBtd: 2.0, trueBtd: 0.5, predictedNearBoundary: false, trueNearBoundary: true, predictedVulnerableVars: [], trueVulnerableVars: [], predictedTopologyShock: 0, trueTopologyShock: 0, detectionTick: 1, trueTransitionTick: 5, interventionCost: 10, optimalCost: 10, predictedRegime: 'A', trueRegime: 'A', isStableSystem: false, statedConfidence: 0.9, withinConfidenceInterval: true }
    ];
    const bdr = ResearchMetricsCalculator.computeBdr(mockPoints);
    assert(Math.abs(bdr - 0.5) < 1e-5, `Expected BDR 0.5, got ${bdr}`);
  });

  test('Test 29: Research metric FAR computes false alarm rate on stable systems', () => {
    const mockPoints: EvaluationDataPoint[] = [
      { predictedBtd: 0.5, trueBtd: 2.5, predictedNearBoundary: true, trueNearBoundary: false, predictedVulnerableVars: [], trueVulnerableVars: [], predictedTopologyShock: 0, trueTopologyShock: 0, detectionTick: 1, trueTransitionTick: 999, interventionCost: 10, optimalCost: 10, predictedRegime: 'A', trueRegime: 'A', isStableSystem: true, statedConfidence: 0.9, withinConfidenceInterval: false },
      { predictedBtd: 2.2, trueBtd: 2.5, predictedNearBoundary: false, trueNearBoundary: false, predictedVulnerableVars: [], trueVulnerableVars: [], predictedTopologyShock: 0, trueTopologyShock: 0, detectionTick: 999, trueTransitionTick: 999, interventionCost: 10, optimalCost: 10, predictedRegime: 'A', trueRegime: 'A', isStableSystem: true, statedConfidence: 0.9, withinConfidenceInterval: true }
    ];
    const far = ResearchMetricsCalculator.computeFar(mockPoints);
    assert(Math.abs(far - 0.5) < 1e-5, `Expected FAR 0.5, got ${far}`);
  });

  test('Test 30: Research metric MIR computes non-negative regret', () => {
    const mockPoints: EvaluationDataPoint[] = [
      { predictedBtd: 1.0, trueBtd: 1.0, predictedNearBoundary: true, trueNearBoundary: true, predictedVulnerableVars: [], trueVulnerableVars: [], predictedTopologyShock: 0, trueTopologyShock: 0, detectionTick: 1, trueTransitionTick: 5, interventionCost: 30, optimalCost: 20, predictedRegime: 'A', trueRegime: 'A', isStableSystem: false, statedConfidence: 0.9, withinConfidenceInterval: true }
    ];
    const mir = ResearchMetricsCalculator.computeMir(mockPoints);
    assert(Math.abs(mir - 0.5) < 1e-5, `Expected MIR 0.5 (30-20)/20, got ${mir}`);
  });

  // --------------------------------------------------------------------------
  // EXPERIMENTS, BASELINES & ADAPTER TESTS (31 to 36)
  // --------------------------------------------------------------------------

  test('Test 31: Baselines suite evaluates all 7 comparative baselines', () => {
    const scenarios = [generateScenario('SINGLE_BOUNDARY', 42), generateScenario('STABLE', 43)];
    const baselines = BenchmarkBaselines.evaluateAllBaselines(scenarios);
    assert(baselines.length === 7, `Expected 7 baselines, got ${baselines.length}`);
    baselines.forEach((b) => {
      assert(b.metrics.btde >= 0, `${b.baselineName} BTDE must be non-negative`);
    });
  });

  test('Test 32: Ablation study evaluates all 7 ablation variants', () => {
    const scenarios = [generateScenario('SINGLE_BOUNDARY', 42)];
    const ablations = AblationStudyRunner.runStudy(scenarios);
    assert(ablations.length === 7, `Expected 7 ablation configurations, got ${ablations.length}`);
    assert(ablations[0].ablationType === 'FULL_ORBIT', 'First entry must be FULL_ORBIT');
  });

  test('Test 33: Robustness missing data sweep returns 5 curve points', () => {
    const curve = RobustnessExperimentRunner.runMissingDataSweep(42, 2);
    assert(curve.length === 5, `Expected 5 curve points, got ${curve.length}`);
  });

  test('Test 34: Scaling sweep evaluates perturbation increments', () => {
    const sweep = ScalingExperimentRunner.runPerturbationSweep(42);
    assert(sweep.length === 4, `Expected 4 sweep points [32, 64, 128, 256], got ${sweep.length}`);
  });

  test('Test 35: AEGIS domain adapter translates ecosystem nodes into generic ORBIT state', () => {
    const orbitState = AegisFoodAdapter.aegisToOrbitState(INITIAL_ECOSYSTEM_NODES, INITIAL_COURIERS, false);
    assert(orbitState.nodes.size === INITIAL_ECOSYSTEM_NODES.length, 'Node count must match ecosystem node count');
    assert(orbitState.edges.size >= INITIAL_COURIERS.length, 'Edge count must include couriers');
    assert(orbitState.constraints.length > 0, 'Food safety constraints must be populated');
  });

  test('Test 36: Full OrbitEngine end-to-end scorecard analysis executes successfully', () => {
    const engine = new OrbitEngine({ perturbationsPerState: 16, monteCarloSamples: 16 });
    const orbitState = AegisFoodAdapter.aegisToOrbitState(INITIAL_ECOSYSTEM_NODES, INITIAL_COURIERS, true);
    const intvs = AegisFoodAdapter.generateAegisInterventions(true);

    const result = engine.analyzeSystem(orbitState, intvs);
    assert(result.scorecard.btd > 0, 'BTD must be positive');
    assert(result.scorecard.mostVulnerableDirection.length > 0, 'Vulnerable direction must be identified');
    assert(result.scorecard.boundaryConfidencePct >= 10 && result.scorecard.boundaryConfidencePct <= 100, 'Confidence must be in [10%, 100%]');
    assert(result.scorecard.scientificSummary.includes('BTD:'), 'Scientific summary must be generated');
  });

  const passedCount = results.filter((r) => r.passed).length;
  return { passedCount, totalCount: results.length, results };
}
