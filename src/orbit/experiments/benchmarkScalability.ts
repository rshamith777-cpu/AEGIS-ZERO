/**
 * Scalability & Complexity Benchmark CLI for ORBIT-A 3.0
 * 
 * Execution:
 *   npx tsx src/orbit/experiments/benchmarkScalability.ts
 */

import { ScalabilityBenchmarkRunner, createSyntheticState, createDimensionSafeInterventions } from '../v3/scalabilityBenchmark';
import { OrbitEngineV3 } from '../v3/orbitEngineV3';

console.log('================================================================================');
console.log('ORBIT-A 3.0 EMPIRICAL SCALABILITY BENCHMARK (REAL RAY INSTRUMENTATION)');
console.log('================================================================================\n');

// 1. Single verified run with exact Task 3 output structure
console.log('TASK 3 EXACT OUTPUT FORMAT (Single Verified Run with Live rayEvaluationCount):');
console.log('N | Variables | Latency (ms) | Memory Delta (KB) | Ray Evals | Active Features | Discovered Interactions');
console.log('---|---|---|---|---|---|---');

const dims = [10, 50, 100, 250, 500, 1000];
const singleEngine = new OrbitEngineV3();

for (const n of dims) {
  const state = createSyntheticState(n);
  const interventions = createDimensionSafeInterventions(n);

  // Warm-up once
  singleEngine.analyzeSystem(state, interventions);

  if (typeof (global as any).gc === 'function') {
    (global as any).gc();
  }

  const memBefore = process.memoryUsage().heapUsed;
  const start = performance.now();
  const res = singleEngine.analyzeSystem(state, interventions);
  const dur = performance.now() - start;
  const memAfter = process.memoryUsage().heapUsed;
  const memDeltaKb = Math.max(0, Math.round((memAfter - memBefore) / 1024));

  console.log(
    `${n} | ${res.stateVector.values.length} | ${dur.toFixed(2)} | ${memDeltaKb} | ${res.rayEvaluationCount} | ${res.screenedActiveVariables.length} | ${res.discoveredInteractions.length}`
  );
}

console.log('\n================================================================================');
console.log('TASK 4: STATISTICALLY RIGOROUS SUITE (1 Warm-up + 5 Measured Runs per N)');
console.log('================================================================================\n');

const suite = ScalabilityBenchmarkRunner.runSuite(dims, 5, 1);

console.log('MAIN RESULTS:');
console.log('N | Variables | Mean ms | Median ms | Std ms | Min ms | Max ms | Approx Heap Delta (KB) | Ray Evals | Active Features | Interactions');
console.log('---|---|---|---|---|---|---|---|---|---|---');
for (const p of suite.points) {
  console.log(
    `${p.n} | ${p.variables} | ${p.meanLatencyMs.toFixed(2)} | ${p.medianLatencyMs.toFixed(2)} | ${p.stdLatencyMs.toFixed(2)} | ${p.minLatencyMs.toFixed(2)} | ${p.maxLatencyMs.toFixed(2)} | ${p.meanMemoryDeltaKb.toFixed(1)} | ${p.rayEvaluationCount} | ${p.screenedActiveFeatures} | ${p.discoveredInteractions}`
  );
}

console.log('\nSTAGE-LEVEL TIMING BREAKDOWN (mean ms per stage):');
const stages = [
  'State Vector Construction',
  'Feature Screening',
  'Interaction Discovery',
  'Directional Proposals',
  'Adaptive Boundary Search',
  'Transition Momentum',
  'Structural Amplification',
  'MEI-2 Optimization',
  'TBI & State Policy'
];

console.log(`Stage | ${dims.map((d) => `N=${d}`).join(' | ')}`);
console.log(`---|${dims.map(() => '---').join('|')}`);

const stageRows: Record<string, number[]> = {
  'State Vector Construction': suite.points.map((p) => p.stageTimingsMean.stateVectorConstructionMs),
  'Feature Screening': suite.points.map((p) => p.stageTimingsMean.importanceScreeningMs),
  'Interaction Discovery': suite.points.map((p) => p.stageTimingsMean.interactionDiscoveryMs),
  'Directional Proposals': suite.points.map((p) => p.stageTimingsMean.directionalProposalsMs),
  'Adaptive Boundary Search': suite.points.map((p) => p.stageTimingsMean.adaptiveBoundarySearchMs),
  'Transition Momentum': suite.points.map((p) => p.stageTimingsMean.transitionMomentumMs),
  'Structural Amplification': suite.points.map((p) => p.stageTimingsMean.structuralAmplificationMs),
  'MEI-2 Optimization': suite.points.map((p) => p.stageTimingsMean.mei2OptimizationMs),
  'TBI & State Policy': suite.points.map((p) => p.stageTimingsMean.tbiAndPolicyMs)
};

for (const s of stages) {
  console.log(`${s} | ${stageRows[s].map((v) => v.toFixed(3)).join(' | ')}`);
}

console.log('\nSCALING METRICS & DENSITIES:');
console.log('N | Variables | Feature Reduction | Interaction Density | Ray Eval Density | Latency / Var (us) | Latency Growth (vs N=10)');
console.log('---|---|---|---|---|---|---');
for (const p of suite.points) {
  console.log(
    `${p.n} | ${p.variables} | ${p.featureReductionRatio.toFixed(1)}x | ${p.interactionDensity.toFixed(3)} | ${p.rayEvalDensity.toFixed(4)} | ${p.latencyPerVariableUs.toFixed(2)} | ${p.latencyGrowthRatio.toFixed(2)}x`
  );
}

console.log('\nEMPIRICAL COMPLEXITY & BOTTLENECK ANALYSIS:');
console.log(`- Empirical Log-Log Scaling Slope: ${suite.empiricalComplexity.logLogSlope}`);
console.log(`- Estimated Empirical Complexity: ${suite.empiricalComplexity.estimatedComplexityClass}`);
console.log(`- Dominant Computational Bottleneck at N=1000: ${suite.empiricalComplexity.dominantStage} (${suite.empiricalComplexity.dominantStageSharePct}% of total runtime)`);
console.log(`- Meets Real-time Latency Target (<= 50ms at N=1000): ${suite.meetsRealTimeTarget1000 ? 'YES' : 'NO'} (Measured: ${suite.points[suite.points.length - 1].meanLatencyMs.toFixed(2)}ms vs Target: ${suite.maxRealTimeTargetMs}ms)`);
