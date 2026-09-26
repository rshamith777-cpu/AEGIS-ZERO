import { SystemState, GenericIntervention } from '../core/types';

/**
 * Universal Domain Adapter Interface for ORBIT:
 * Enforces strict algorithmic domain-agnosticism.
 * The core ORBIT-A algorithm operates solely on SystemState and GenericIntervention.
 * Any cyber-physical, logistic, computational, or infrastructure network
 * implements this interface to bind to ORBIT.
 */
export interface DomainAdapter<TDomainState = any, TDomainAction = any> {
  domainName: string;
  description: string;
  toOrbitState(domainState: TDomainState): SystemState;
  toDomainIntervention(intervention: GenericIntervention): TDomainAction;
  generateCandidateInterventions(domainState: TDomainState): GenericIntervention[];
  createDefaultDomainState(seed?: number): TDomainState;
}
