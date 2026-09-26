import { SystemState, GenericIntervention } from '../core/types';
import { DomainAdapter } from './domainAdapterInterface';
import { AegisFoodAdapter } from './aegisFoodAdapter';
import { INITIAL_ECOSYSTEM_NODES, INITIAL_COURIERS } from '../../engine/mockData';

export class FoodLogisticsAdapter implements DomainAdapter {
  public domainName = 'Regional Cold-Chain Food Supply Globe';
  public description = 'Cold storage depots, flash-chilled preparation kitchens, distribution shelters, and thermal perishability cascades.';

  public createDefaultDomainState(seed: number = 42) {
    return {
      nodes: INITIAL_ECOSYSTEM_NODES,
      couriers: INITIAL_COURIERS,
      disruptionActive: false
    };
  }

  public toOrbitState(domainState: any): SystemState {
    return AegisFoodAdapter.aegisToOrbitState(
      domainState.nodes,
      domainState.couriers,
      domainState.disruptionActive
    );
  }

  public toDomainIntervention(intervention: GenericIntervention): string {
    const actionType = intervention.actions?.[0]?.actionType ?? 'MULTI_ACTION';
    return `[Food Dispatch Plan]: ${intervention.name} (Action: ${actionType}, Cost: $${intervention.totalCost})`;
  }

  public generateCandidateInterventions(domainState: any): GenericIntervention[] {
    return AegisFoodAdapter.generateAegisInterventions(true);
  }
}
