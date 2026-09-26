import {
  BenchmarkScenario,
  AblationType,
  AblationStudyResult,
  ResearchMetrics,
  DEFAULT_ORBIT_CONFIG
} from '../core/types';
import { BenchmarkEvaluator } from '../benchmark/evaluator';

/**
 * Ablation Study Suite:
 * Systematically isolates the empirical contribution of each ORBIT algorithmic component:
 * 
 * 1. FULL_ORBIT: Full system with all components enabled
 * 2. ORBIT_NO_BOUNDARY: Disables dynamic BTD optimization (falls back to static threshold)
 * 3. ORBIT_NO_DIRECTION: Disables multi-order directional profiling (evaluates scalar BTD only)
 * 4. ORBIT_NO_TOPOLOGY: Disables structural GraphDistance / Topology Shock detection
 * 5. ORBIT_NO_INTERVENTION: Disables Pareto-optimal escape search
 * 6. ORBIT_NO_UNCERTAINTY: Disables Monte Carlo sampling and calibration
 * 7. ORBIT_NO_COUNTERFACTUAL: Disables branching what-if trajectory projection
 */

export class AblationStudyRunner {
  public static runStudy(scenarios: BenchmarkScenario[]): AblationStudyResult[] {
    const evaluator = new BenchmarkEvaluator();

    // 1. Full ORBIT baseline
    const fullResult = evaluator.evaluateBatch(scenarios, DEFAULT_ORBIT_CONFIG);
    const fullMetrics = fullResult.metrics;

    const results: AblationStudyResult[] = [
      {
        ablationType: 'FULL_ORBIT',
        description: 'Full ORBIT framework with all mathematical components active.',
        metrics: fullMetrics,
        deltaVsFullOrbit: {}
      }
    ];

    // Helper to compute delta vs full ORBIT
    const computeDelta = (abMetrics: ResearchMetrics): Partial<ResearchMetrics> => ({
      btde: Number((abMetrics.btde - fullMetrics.btde).toFixed(4)),
      bdr: Number((abMetrics.bdr - fullMetrics.bdr).toFixed(4)),
      vda: Number((abMetrics.vda - fullMetrics.vda).toFixed(4)),
      tsa: Number((abMetrics.tsa - fullMetrics.tsa).toFixed(4)),
      mir: Number((abMetrics.mir - fullMetrics.mir).toFixed(4)),
      chl: Number((abMetrics.chl - fullMetrics.chl).toFixed(2)),
      far: Number((abMetrics.far - fullMetrics.far).toFixed(4)),
      uce: Number((abMetrics.uce - fullMetrics.uce).toFixed(4))
    });

    // 2. ORBIT_NO_BOUNDARY (Disables BTD ray search; single coarse step)
    const noBoundaryConfig = { ...DEFAULT_ORBIT_CONFIG, perturbationsPerState: 2 };
    const noBoundaryRes = new BenchmarkEvaluator(noBoundaryConfig).evaluateBatch(scenarios, noBoundaryConfig);
    results.push({
      ablationType: 'ORBIT_NO_BOUNDARY',
      description: 'Disables dynamic BTD search; reverts to point-wise distance heuristics.',
      metrics: noBoundaryRes.metrics,
      deltaVsFullOrbit: computeDelta(noBoundaryRes.metrics)
    });

    // 3. ORBIT_NO_DIRECTION (Disables multi-order vulnerability search; 1st order only)
    const noDirConfig = { ...DEFAULT_ORBIT_CONFIG, maxInteractionOrder: 1 };
    const noDirRes = new BenchmarkEvaluator(noDirConfig).evaluateBatch(scenarios, noDirConfig);
    results.push({
      ablationType: 'ORBIT_NO_DIRECTION',
      description: 'Disables directional stability profile; evaluates single scalar radius only.',
      metrics: noDirRes.metrics,
      deltaVsFullOrbit: computeDelta(noDirRes.metrics)
    });

    // 4. ORBIT_NO_TOPOLOGY (Disables structural graph shock evaluation)
    const noTopoConfig = { ...DEFAULT_ORBIT_CONFIG, topologyShockThreshold: 999.0 };
    const noTopoRes = new BenchmarkEvaluator(noTopoConfig).evaluateBatch(scenarios, noTopoConfig);
    results.push({
      ablationType: 'ORBIT_NO_TOPOLOGY',
      description: 'Disables Topology Shock; ignores graph connectivity and dependency severance.',
      metrics: noTopoRes.metrics,
      deltaVsFullOrbit: computeDelta(noTopoRes.metrics)
    });

    // 5. ORBIT_NO_INTERVENTION (Disables Pareto escape search; zero cost optimization)
    const noIntvConfig = {
      ...DEFAULT_ORBIT_CONFIG,
      objectiveWeights: {
        ...DEFAULT_ORBIT_CONFIG.objectiveWeights,
        weightMargin: 0,
        weightRisk: 0,
        weightCost: 1.0
      }
    };
    const noIntvRes = new BenchmarkEvaluator(noIntvConfig).evaluateBatch(scenarios, noIntvConfig);
    results.push({
      ablationType: 'ORBIT_NO_INTERVENTION',
      description: 'Disables Pareto optimizer; relies on unoptimized heuristic action selection.',
      metrics: noIntvRes.metrics,
      deltaVsFullOrbit: computeDelta(noIntvRes.metrics)
    });

    // 6. ORBIT_NO_UNCERTAINTY (Disables Monte Carlo calibration; 1 sample point estimate)
    const noUncertConfig = { ...DEFAULT_ORBIT_CONFIG, monteCarloSamples: 1 };
    const noUncertRes = new BenchmarkEvaluator(noUncertConfig).evaluateBatch(scenarios, noUncertConfig);
    results.push({
      ablationType: 'ORBIT_NO_UNCERTAINTY',
      description: 'Disables Monte Carlo sampling; assumes deterministic certainty.',
      metrics: noUncertRes.metrics,
      deltaVsFullOrbit: computeDelta(noUncertRes.metrics)
    });

    // 7. ORBIT_NO_COUNTERFACTUAL (Disables forward trajectory projection; 1-step lookahead)
    const noCfConfig = { ...DEFAULT_ORBIT_CONFIG, predictionHorizon: 1 };
    const noCfRes = new BenchmarkEvaluator(noCfConfig).evaluateBatch(scenarios, noCfConfig);
    results.push({
      ablationType: 'ORBIT_NO_COUNTERFACTUAL',
      description: 'Disables parallel trajectory branching; optimizes solely on static state snapshots.',
      metrics: noCfRes.metrics,
      deltaVsFullOrbit: computeDelta(noCfRes.metrics)
    });

    return results;
  }
}
