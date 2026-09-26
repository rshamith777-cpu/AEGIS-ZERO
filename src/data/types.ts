/**
 * ORBIT-A 3.1 Generic External Data Ingestion Architecture
 * 
 * Pipeline:
 *   DataSource -> RawDataLoader -> SchemaMapper -> TemporalNormalizer -> StateBuilder -> GraphBuilder -> ORBIT State
 * 
 * Enforces strict distinction between:
 *   RAW: Unmodified observational data directly from external instrumentation
 *   DERIVED: Deterministic aggregations, temporal rollups, or topological projections of RAW data
 *   SIMULATED: Generated from physical models (e.g., AC power flow on IEEE 14-bus)
 *   SYNTHETIC: Procedurally generated for testing edge-cases and benchmarks
 */

import { SystemState, Constraint, GenericIntervention } from '../orbit/core/types';

export type DataProvenanceCategory = 'RAW' | 'DERIVED' | 'SIMULATED' | 'SYNTHETIC';

export interface DatasetProvenanceMetadata {
  id: string;
  name: string;
  source: string;
  dataset: string;
  version: string;
  retrievedAt: string;
  records: number;
  timeRange: { start: string; end: string };
  samplingIntervalSeconds: number;
  features: string[];
  derivedFeatures: string[];
  transformations: string[];
  provenanceCategory: DataProvenanceCategory;
  license: string;
  checksumSha256: string;
  isLiveTelemetry: false; // Explicit declaration: historical/static, never live
  telemetryTypeDescription: string;
}

export interface ValidationReport {
  isValid: boolean;
  totalRecordsChecked: number;
  schemaErrors: string[];
  temporalOrderingValid: boolean;
  duplicateTimestamps: number;
  missingValuesCount: number;
  warnings: string[];
}

export interface OrbitGraph {
  timestamp: number;
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    metrics: Record<string, number>;
  }>;
  edges: Array<{
    source: string;
    target: string;
    weight: number;
    metrics?: Record<string, number>;
  }>;
}

/**
 * Generic External Data Adapter Interface
 */
export interface ExternalDataAdapter<TRaw = any> {
  name: string;
  version: string;
  source: string;
  description: string;
  provenanceCategory: DataProvenanceCategory;
  metadata: DatasetProvenanceMetadata;

  load(): Promise<TRaw[]>;

  mapToState(record: TRaw): SystemState;

  buildGraph(records: TRaw[]): OrbitGraph;

  buildTemporalSequence(records: TRaw[]): {
    states: SystemState[];
    timestamps: number[];
    constraints: Constraint[];
    interventions: GenericIntervention[];
  };

  validate(records: TRaw[]): ValidationReport;
}
