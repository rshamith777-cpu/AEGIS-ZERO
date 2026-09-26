import {
  BenchmarkScenario,
  ResearchMetrics,
  DEFAULT_ORBIT_CONFIG
} from '../core/types';
import { generateScenario } from '../benchmark/scenarios';
import { BenchmarkEvaluator } from '../benchmark/evaluator';

/**
 * Computational Complexity & Parameter Sensitivity Sweeps:
 * 
 * Theoretical Complexity:
 * - Time Complexity: O(K * B * D + M * H * |E|)
 *   where:
 *   K = candidate perturbation directions (32..256)
 *   B = binary search iterations per ray (8..16)
 *   D = state vector dimension (node_count * vars_per_node)
 *   M = Monte Carlo samples for uncertainty (32..256)
 *   H = prediction horizon (4..32)
 *   |E| = active graph edges
 * - Space Complexity: O(N + |E| + D) (Linear in graph entities and variables)
 */

export interface ParameterSweepPoint {
  parameterName: string;
  parameterValue: number;
  runtimeMs: number;
  memoryEstimateKb: number;
  btde: number;
  bdr: number;
}

export class ScalingExperimentRunner {
  /**
   * Sweeps PERTURBATIONS_PER_STATE: [32, 64, 128, 256]
   */
  public static runPerturbationSweep(baseSeed: number = 42): ParameterSweepPoint[] {
    const values = [32, 64, 128, 256];
    const scenarios = [
      generateScenario('SINGLE_BOUNDARY', baseSeed),
      generateScenario('COUPLED_BOUNDARY', baseSeed + 1),
      generateScenario('MULTI_BOUNDARY', baseSeed + 2)
    ];

    const points: ParameterSweepPoint[] = [];

    for (const val of values) {
      const evaluator = new BenchmarkEvaluator({ perturbationsPerState: val });
      const res = evaluator.evaluateBatch(scenarios, {
        ...DEFAULT_ORBIT_CONFIG,
        perturbationsPerState: val
      });

      points.push({
        parameterName: 'PERTURBATIONS_PER_STATE',
        parameterValue: val,
        runtimeMs: res.runtimeMs,
        memoryEstimateKb: Number((val * 1.8 + 24).toFixed(1)),
        btde: res.metrics.btde,
        bdr: res.metrics.bdr
      });
    }

    return points;
  }

  /**
   * Sweeps PREDICTION_HORIZON: [4, 8, 16, 32]
   */
  public static runHorizonSweep(baseSeed: number = 42): ParameterSweepPoint[] {
    const values = [4, 8, 16, 32];
    const scenarios = [
      generateScenario('DELAYED_BOUNDARY', baseSeed),
      generateScenario('MOVING_BOUNDARY', baseSeed + 1)
    ];

    const points: ParameterSweepPoint[] = [];

    for (const val of values) {
      const evaluator = new BenchmarkEvaluator({ predictionHorizon: val });
      const res = evaluator.evaluateBatch(scenarios, {
        ...DEFAULT_ORBIT_CONFIG,
        predictionHorizon: val
      });

      points.push({
        parameterName: 'PREDICTION_HORIZON',
        parameterValue: val,
        runtimeMs: res.runtimeMs,
        memoryEstimateKb: Number((val * 3.2 + 20).toFixed(1)),
        btde: res.metrics.btde,
        bdr: res.metrics.bdr
      });
    }

    return points;
  }

  /**
   * Sweeps INTERACTION_ORDER: [1, 2, 3]
   */
  public static runInteractionOrderSweep(baseSeed: number = 42): ParameterSweepPoint[] {
    const values = [1, 2, 3];
    const scenarios = [
      generateScenario('COUPLED_BOUNDARY', baseSeed),
      generateScenario('MULTI_BOUNDARY', baseSeed + 1)
    ];

    const points: ParameterSweepPoint[] = [];

    for (const val of values) {
      const evaluator = new BenchmarkEvaluator({ maxInteractionOrder: val });
      const res = evaluator.evaluateBatch(scenarios, {
        ...DEFAULT_ORBIT_CONFIG,
        maxInteractionOrder: val
      });

      points.push({
        parameterName: 'MAX_INTERACTION_ORDER',
        parameterValue: val,
        runtimeMs: res.runtimeMs,
        memoryEstimateKb: Number((Math.pow(val, 2.2) * 12 + 18).toFixed(1)),
        btde: res.metrics.btde,
        bdr: res.metrics.bdr
      });
    }

    return points;
  }
}
