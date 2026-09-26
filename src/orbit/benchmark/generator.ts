import { BenchmarkScenario, BenchmarkScenarioFamily } from '../core/types';
import { generateScenario } from './scenarios';

/**
 * ORBIT-Bench Generator:
 * Streams or generates reproducible benchmark scenarios in chunks/batches.
 * Supports:
 * - Quick: 100 scenarios
 * - Development: 1,000 scenarios
 * - Research: 10,000 scenarios
 * - Stress: 50,000+ scenarios (via async generator / Web Worker friendly)
 */

export interface GeneratorOptions {
  count: number;
  seed: number;
  families?: BenchmarkScenarioFamily[];
  noiseLevel?: number;
  missingDataRate?: number;
  nodeCount?: number;
  batchSize?: number;
}

export const ALL_SCENARIO_FAMILIES: BenchmarkScenarioFamily[] = [
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
];

export class BenchmarkGenerator {
  /**
   * Synchronously generates small batches (e.g. 100 scenarios).
   */
  public static generateBatch(options: Partial<GeneratorOptions> = {}): BenchmarkScenario[] {
    const count = options.count ?? 100;
    const baseSeed = options.seed ?? 42;
    const families = options.families ?? ALL_SCENARIO_FAMILIES;
    const noise = options.noiseLevel ?? 0.0;
    const missing = options.missingDataRate ?? 0.0;
    const nodes = options.nodeCount ?? 8;

    const scenarios: BenchmarkScenario[] = [];

    for (let i = 0; i < count; i++) {
      const family = families[i % families.length];
      const scenarioSeed = baseSeed + i * 37;
      scenarios.push(generateScenario(family, scenarioSeed, nodes, noise, missing));
    }

    return scenarios;
  }

  /**
   * Asynchronous generator yielding batches to keep browser responsive
   * when generating 1,000 to 10,000+ scenarios.
   */
  public static async *generateStreaming(
    options: Partial<GeneratorOptions> = {},
    onProgress?: (generated: number, total: number) => void
  ): AsyncGenerator<BenchmarkScenario[], void, unknown> {
    const count = options.count ?? 1000;
    const batchSize = options.batchSize ?? 50;
    const baseSeed = options.seed ?? 42;
    const families = options.families ?? ALL_SCENARIO_FAMILIES;
    const noise = options.noiseLevel ?? 0.0;
    const missing = options.missingDataRate ?? 0.0;
    const nodes = options.nodeCount ?? 8;

    let generated = 0;

    while (generated < count) {
      const currentBatchSize = Math.min(batchSize, count - generated);
      const batch: BenchmarkScenario[] = [];

      for (let b = 0; b < currentBatchSize; b++) {
        const idx = generated + b;
        const family = families[idx % families.length];
        const scenarioSeed = baseSeed + idx * 37;
        batch.push(generateScenario(family, scenarioSeed, nodes, noise, missing));
      }

      generated += currentBatchSize;
      if (onProgress) onProgress(generated, count);

      yield batch;

      // Yield thread momentarily to prevent UI locking
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}
