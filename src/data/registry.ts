/**
 * Dataset Registry for ORBIT-A 3.1
 * 
 * Provides unified access to all external adapters with explicit data provenance badges:
 *   RAW | DERIVED | SIMULATED | SYNTHETIC
 */

import { ExternalDataAdapter, DatasetProvenanceMetadata, DataProvenanceCategory } from './types';
import { NycTlcExternalAdapter } from './adapters/nycTlcAdapter';
import { UnswNb15ExternalAdapter } from './adapters/unswNb15Adapter';
import { Ieee14SimulationAdapter } from './adapters/ieee14SimulationAdapter';
import { ExternalGridAdapter } from './adapters/externalGridAdapter';

export class DatasetRegistry {
  private static adapters: Map<string, ExternalDataAdapter> = new Map<string, ExternalDataAdapter>([
    ['nyc_tlc', new NycTlcExternalAdapter()],
    ['unsw_nb15', new UnswNb15ExternalAdapter()],
    ['ieee_14_simulated', new Ieee14SimulationAdapter()],
    ['external_grid_pmu', new ExternalGridAdapter()]
  ]);

  public static getAllAdapters(): ExternalDataAdapter[] {
    return Array.from(this.adapters.values());
  }

  public static getAdapter(id: string): ExternalDataAdapter | undefined {
    return this.adapters.get(id);
  }

  public static getAllMetadata(): DatasetProvenanceMetadata[] {
    return Array.from(this.adapters.values()).map(a => a.metadata);
  }

  public static getProvenanceCategories(): Record<DataProvenanceCategory, string[]> {
    const cats: Record<DataProvenanceCategory, string[]> = {
      RAW: [],
      DERIVED: [],
      SIMULATED: [],
      SYNTHETIC: []
    };
    for (const [id, a] of this.adapters.entries()) {
      cats[a.provenanceCategory].push(id);
    }
    return cats;
  }
}
