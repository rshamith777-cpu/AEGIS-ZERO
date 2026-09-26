import {
  BenchmarkScenario,
  ResearchMetrics,
  OrbitConfig,
  DEFAULT_ORBIT_CONFIG
} from '../core/types';
import { generateScenario } from './scenarios';
import { BenchmarkEvaluator } from './evaluator';

/**
 * ORBIT-Bench-HOLDOUT:
 * Completely independent, unseen holdout test suite.
 * 
 * Rules:
 * 1. Strictly disjoint seed schedule (seeds 9001 to 9100)
 * 2. Unseen scenario variations with unmodeled nonlinear cross-couplings
 * 3. Algorithm runs blind to true boundary and optimal intervention
 * 4. Used for final frozen reporting
 */
export class OrbitBenchHoldout {
  private evaluator: BenchmarkEvaluator;

  constructor(config?: Partial<OrbitConfig>) {
    this.evaluator = new BenchmarkEvaluator(config);
  }

  public generateHoldoutSet(countPerFamily: number = 10): BenchmarkScenario[] {
    const families = [
      'STABLE',
      'SINGLE_BOUNDARY',
      'COUPLED_BOUNDARY',
      'HIDDEN_BOUNDARY',
      'MOVING_BOUNDARY',
      'ADVERSARIAL_BOUNDARY',
      'DELAYED_BOUNDARY',
      'TOPOLOGY_BOUNDARY',
      'MULTI_BOUNDARY',
      'RECOVERY_BOUNDARY'
    ] as const;

    const holdoutScenarios: BenchmarkScenario[] = [];
    let seedBase = 9001;

    for (const fam of families) {
      for (let i = 0; i < countPerFamily; i++) {
        const sc = generateScenario(fam, seedBase++, 8, 0.05, 0.05); // Include 5% realistic noise and missing data

        // Inject unmodeled nonlinear dynamics to test model robustness
        sc.initialState.nodes.forEach((n) => {
          // Quadratic load inflation under high stress
          if (n.state.load) {
            const rawVal = n.state.load.value;
            const cap = n.capacity ?? 100;
            if (rawVal > cap * 0.7) {
              n.state.load.value = rawVal * (1.0 + 0.05 * Math.sin(seedBase));
            }
          }
        });

        holdoutScenarios.push(sc);
      }
    }

    return holdoutScenarios;
  }

  public evaluateHoldout(
    countPerFamily: number = 10,
    config: OrbitConfig = DEFAULT_ORBIT_CONFIG
  ): {
    metrics: ResearchMetrics;
    scenarioCount: number;
    runtimeMs: number;
    timestamp: string;
  } {
    const scenarios = this.generateHoldoutSet(countPerFamily);
    const result = this.evaluator.evaluateBatch(scenarios, config);

    return {
      metrics: result.metrics,
      scenarioCount: result.scenarioCount,
      runtimeMs: result.runtimeMs,
      timestamp: new Date().toISOString()
    };
  }
}
