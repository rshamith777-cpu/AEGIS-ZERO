import {
  BenchmarkScenario,
  BenchmarkScenarioFamily,
  ResearchMetrics,
  DEFAULT_ORBIT_CONFIG
} from '../core/types';
import { generateScenario } from '../benchmark/scenarios';
import { BenchmarkEvaluator } from '../benchmark/evaluator';

/**
 * Robustness & Generalization Test Suite:
 * Measures algorithmic degradation under adverse data conditions:
 * 1. Missing observations (0% to 40%)
 * 2. Additive Gaussian noise (0% to 30%)
 * 3. Globe scale (10 to 250 nodes)
 * 4. Cross-Family Generalization: Calibrate on {SINGLE, COUPLED}, evaluate on {MOVING, TOPOLOGY}
 */

export interface RobustnessCurvePoint {
  parameterValue: number;
  label: string;
  metrics: ResearchMetrics;
  runtimeMs: number;
}

export interface GeneralizationResult {
  trainingFamilies: BenchmarkScenarioFamily[];
  evaluationFamilies: BenchmarkScenarioFamily[];
  trainMetrics: ResearchMetrics;
  evalMetrics: ResearchMetrics;
  generalizationGap: {
    btdeGap: number;
    bdrGap: number;
    vdaGap: number;
  };
}

export class RobustnessExperimentRunner {
  /**
   * Evaluates performance degradation across increasing missing data rates: [0%, 10%, 20%, 30%, 40%]
   */
  public static runMissingDataSweep(baseSeed: number = 42, countPerStep: number = 20): RobustnessCurvePoint[] {
    const missingRates = [0.0, 0.10, 0.20, 0.30, 0.40];
    const curve: RobustnessCurvePoint[] = [];
    const evaluator = new BenchmarkEvaluator();

    for (const rate of missingRates) {
      const scenarios: BenchmarkScenario[] = [];
      for (let i = 0; i < countPerStep; i++) {
        scenarios.push(generateScenario('SINGLE_BOUNDARY', baseSeed + i, 8, 0.0, rate));
      }

      const res = evaluator.evaluateBatch(scenarios, DEFAULT_ORBIT_CONFIG);
      curve.push({
        parameterValue: rate,
        label: `${(rate * 100).toFixed(0)}% Missing`,
        metrics: res.metrics,
        runtimeMs: res.runtimeMs
      });
    }

    return curve;
  }

  /**
   * Evaluates performance degradation across observation noise levels: [0%, 5%, 10%, 20%, 30%]
   */
  public static runNoiseSweep(baseSeed: number = 42, countPerStep: number = 20): RobustnessCurvePoint[] {
    const noiseLevels = [0.0, 0.05, 0.10, 0.20, 0.30];
    const curve: RobustnessCurvePoint[] = [];
    const evaluator = new BenchmarkEvaluator();

    for (const noise of noiseLevels) {
      const scenarios: BenchmarkScenario[] = [];
      for (let i = 0; i < countPerStep; i++) {
        scenarios.push(generateScenario('COUPLED_BOUNDARY', baseSeed + i, 8, noise, 0.0));
      }

      const res = evaluator.evaluateBatch(scenarios, DEFAULT_ORBIT_CONFIG);
      curve.push({
        parameterValue: noise,
        label: `${(noise * 100).toFixed(0)}% Noise`,
        metrics: res.metrics,
        runtimeMs: res.runtimeMs
      });
    }

    return curve;
  }

  /**
   * Evaluates scaling across graph sizes: [10, 25, 50, 100, 250 nodes]
   */
  public static runGraphScaleSweep(baseSeed: number = 42, countPerStep: number = 10): RobustnessCurvePoint[] {
    const nodeCounts = [10, 25, 50, 100, 250];
    const curve: RobustnessCurvePoint[] = [];
    const evaluator = new BenchmarkEvaluator();

    for (const nodes of nodeCounts) {
      const scenarios: BenchmarkScenario[] = [];
      for (let i = 0; i < countPerStep; i++) {
        scenarios.push(generateScenario('TOPOLOGY_BOUNDARY', baseSeed + i, nodes));
      }

      const res = evaluator.evaluateBatch(scenarios, DEFAULT_ORBIT_CONFIG);
      curve.push({
        parameterValue: nodes,
        label: `${nodes} Nodes`,
        metrics: res.metrics,
        runtimeMs: res.runtimeMs
      });
    }

    return curve;
  }

  /**
   * Cross-Family Generalization Test:
   * Calibrate on SINGLE_BOUNDARY & COUPLED_BOUNDARY
   * Evaluate out-of-distribution on MOVING_BOUNDARY & TOPOLOGY_BOUNDARY
   */
  public static runGeneralizationTest(baseSeed: number = 42, countPerFamily: number = 25): GeneralizationResult {
    const evaluator = new BenchmarkEvaluator();

    // 1. In-distribution set
    const trainScenarios: BenchmarkScenario[] = [];
    for (let i = 0; i < countPerFamily; i++) {
      trainScenarios.push(generateScenario('SINGLE_BOUNDARY', baseSeed + i));
      trainScenarios.push(generateScenario('COUPLED_BOUNDARY', baseSeed + 100 + i));
    }
    const trainEval = evaluator.evaluateBatch(trainScenarios, DEFAULT_ORBIT_CONFIG);

    // 2. Out-of-distribution evaluation set
    const evalScenarios: BenchmarkScenario[] = [];
    for (let i = 0; i < countPerFamily; i++) {
      evalScenarios.push(generateScenario('MOVING_BOUNDARY', baseSeed + 200 + i));
      evalScenarios.push(generateScenario('TOPOLOGY_BOUNDARY', baseSeed + 300 + i));
    }
    const evalResult = evaluator.evaluateBatch(evalScenarios, DEFAULT_ORBIT_CONFIG);

    return {
      trainingFamilies: ['SINGLE_BOUNDARY', 'COUPLED_BOUNDARY'],
      evaluationFamilies: ['MOVING_BOUNDARY', 'TOPOLOGY_BOUNDARY'],
      trainMetrics: trainEval.metrics,
      evalMetrics: evalResult.metrics,
      generalizationGap: {
        btdeGap: Number(Math.abs(evalResult.metrics.btde - trainEval.metrics.btde).toFixed(4)),
        bdrGap: Number(Math.abs(evalResult.metrics.bdr - trainEval.metrics.bdr).toFixed(4)),
        vdaGap: Number(Math.abs(evalResult.metrics.vda - trainEval.metrics.vda).toFixed(4))
      }
    };
  }
}
