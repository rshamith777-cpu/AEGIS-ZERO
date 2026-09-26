/**
 * Generic Ingestion Pipeline Implementation
 * 
 * Pipeline Stage Order:
 *   DataSource -> RawDataLoader -> SchemaMapper -> TemporalNormalizer -> StateBuilder -> GraphBuilder -> ORBIT State
 */

import { SystemState } from '../orbit/core/types';
import { OrbitGraph, ValidationReport } from './types';

export interface RawDataLoader<TRaw> {
  load(): Promise<TRaw[]>;
}

export interface SchemaMapper<TRaw, TNormalized> {
  map(raw: TRaw): TNormalized;
}

export interface TemporalNormalizer<TNormalized> {
  normalizeAndSort(items: TNormalized[]): TNormalized[];
}

export interface StateBuilder<TNormalized> {
  buildState(windowItems: TNormalized[], epochMs: number): SystemState;
}

export interface GraphBuilder<TNormalized> {
  buildGraph(windowItems: TNormalized[], epochMs: number): OrbitGraph;
}

export class GenericIngestionPipeline<TRaw, TNormalized extends { timestampMs: number }> {
  constructor(
    private loader: RawDataLoader<TRaw>,
    private mapper: SchemaMapper<TRaw, TNormalized>,
    private normalizer: TemporalNormalizer<TNormalized>,
    private stateBuilder: StateBuilder<TNormalized>,
    private graphBuilder: GraphBuilder<TNormalized>
  ) {}

  public async execute(windowDurationMs: number): Promise<{
    states: SystemState[];
    graphs: OrbitGraph[];
    validation: ValidationReport;
  }> {
    const rawData = await this.loader.load();
    const mapped = rawData.map((r) => this.mapper.map(r));
    const sorted = this.normalizer.normalizeAndSort(mapped);

    const schemaErrors: string[] = [];
    let missingValuesCount = 0;
    let duplicateTimestamps = 0;

    for (let i = 0; i < sorted.length; i++) {
      if (isNaN(sorted[i].timestampMs) || sorted[i].timestampMs <= 0) {
        schemaErrors.push(`Record ${i} has invalid timestamp`);
      }
      if (i > 0 && sorted[i].timestampMs === sorted[i - 1].timestampMs) {
        duplicateTimestamps++;
      }
    }

    const temporalOrderingValid = schemaErrors.length === 0;

    const validation: ValidationReport = {
      isValid: temporalOrderingValid && schemaErrors.length === 0,
      totalRecordsChecked: rawData.length,
      schemaErrors,
      temporalOrderingValid,
      duplicateTimestamps,
      missingValuesCount,
      warnings: []
    };

    if (sorted.length === 0) {
      return { states: [], graphs: [], validation };
    }

    const minTime = sorted[0].timestampMs;
    const maxTime = sorted[sorted.length - 1].timestampMs;
    const states: SystemState[] = [];
    const graphs: OrbitGraph[] = [];

    for (let t = minTime; t <= maxTime; t += windowDurationMs) {
      const windowItems = sorted.filter((item) => item.timestampMs >= t && item.timestampMs < t + windowDurationMs);
      if (windowItems.length > 0) {
        states.push(this.stateBuilder.buildState(windowItems, t));
        graphs.push(this.graphBuilder.buildGraph(windowItems, t));
      }
    }

    return { states, graphs, validation };
  }
}
