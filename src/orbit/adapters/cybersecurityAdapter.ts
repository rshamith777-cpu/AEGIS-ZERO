import { SystemState, SystemNode, SystemEdge, Constraint, GenericIntervention } from '../core/types';
import { DomainAdapter } from './domainAdapterInterface';

export interface EnterpriseHost {
  hostId: string;
  hostname: string;
  zone: 'dmz' | 'workstation' | 'active_directory' | 'database_vault';
  anomalyScore: number; // 0 to 1
  failedAuthAttemptsPerHour: number;
  lateralConnectionRate: number; // connections per minute
  dataEgressRateMbps: number;
  isIsolated: boolean;
  mfaEnforced: boolean;
}

export interface CybersecurityState {
  hosts: EnterpriseHost[];
  globalThreatLevel: 'elevated' | 'high' | 'critical';
  c2BeaconingDetections: number;
}

export class CybersecurityAdapter implements DomainAdapter<CybersecurityState, string> {
  public domainName = 'Enterprise Zero-Trust & Cybersecurity Infrastructure';
  public description = 'Active Directory privilege escalation, lateral attack propagation, ransomware encryption bursts, and dynamic host isolation.';

  public createDefaultDomainState(seed: number = 42): CybersecurityState {
    return {
      globalThreatLevel: 'high',
      c2BeaconingDetections: 3,
      hosts: [
        {
          hostId: 'host_dmz_web',
          hostname: 'External Web Ingress Bastion',
          zone: 'dmz',
          anomalyScore: 0.88,
          failedAuthAttemptsPerHour: 480,
          lateralConnectionRate: 24,
          dataEgressRateMbps: 45.0,
          isIsolated: false,
          mfaEnforced: true
        },
        {
          hostId: 'host_workstation_finance',
          hostname: 'Finance Admin Endpoint #04',
          zone: 'workstation',
          anomalyScore: 0.74,
          failedAuthAttemptsPerHour: 85,
          lateralConnectionRate: 14,
          dataEgressRateMbps: 12.0,
          isIsolated: false,
          mfaEnforced: true
        },
        {
          hostId: 'host_active_directory',
          hostname: 'Primary Domain Controller (DC-01)',
          zone: 'active_directory',
          anomalyScore: 0.62,
          failedAuthAttemptsPerHour: 120,
          lateralConnectionRate: 38,
          dataEgressRateMbps: 2.5,
          isIsolated: false,
          mfaEnforced: true
        },
        {
          hostId: 'host_customer_vault',
          hostname: 'Cardholder Data Environment Vault',
          zone: 'database_vault',
          anomalyScore: 0.28,
          failedAuthAttemptsPerHour: 4,
          lateralConnectionRate: 2,
          dataEgressRateMbps: 0.8,
          isIsolated: false,
          mfaEnforced: true
        }
      ]
    };
  }

  public toOrbitState(domainState: CybersecurityState): SystemState {
    const nodes = new Map<string, SystemNode>();
    const edges = new Map<string, SystemEdge>();
    const constraints: Constraint[] = [];

    domainState.hosts.forEach((h) => {
      nodes.set(h.hostId, {
        id: h.hostId,
        label: h.hostname,
        capacity: 100.0,
        demand: h.anomalyScore * 100,
        state: {
          threatScore: {
            name: 'threatScore',
            type: 'continuous',
            value: h.anomalyScore,
            min: 0,
            max: 1.0,
            nominal: 0.1,
            weight: 2.2
          },
          lateralMovement: {
            name: 'lateralMovement',
            type: 'continuous',
            value: h.lateralConnectionRate,
            min: 0,
            max: 100,
            nominal: 5,
            weight: 1.8
          },
          dataEgress: {
            name: 'dataEgress',
            type: 'continuous',
            value: h.dataEgressRateMbps,
            min: 0,
            max: 200,
            nominal: 2,
            weight: 1.6
          },
          quarantineStatus: {
            name: 'quarantineStatus',
            type: 'discrete',
            value: h.isIsolated ? 1 : 0,
            min: 0,
            max: 1,
            nominal: 0,
            weight: 1.0
          }
        }
      });

      // Containment constraints:
      // Anomaly score on core identity or database must not exceed critical boundary
      constraints.push({
        id: `sec_anomaly_${h.hostId}`,
        description: `Max permissible anomaly score <= 0.70 at ${h.hostname}`,
        nodeId: h.hostId,
        variableName: 'threatScore',
        type: 'max',
        threshold: 0.70,
        isHardConstraint: h.zone === 'active_directory' || h.zone === 'database_vault',
        penaltyWeight: 50
      });

      // Data exfiltration threshold
      constraints.push({
        id: `sec_egress_${h.hostId}`,
        description: `Exfiltration threshold <= 25.0 Mbps at ${h.hostname}`,
        nodeId: h.hostId,
        variableName: 'dataEgress',
        type: 'max',
        threshold: 25.0,
        isHardConstraint: true,
        penaltyWeight: 50
      });
    });

    edges.set('dmz_to_endpoint', {
      id: 'dmz_to_endpoint',
      source: 'host_dmz_web',
      target: 'host_workstation_finance',
      weight: 1.0,
      capacity: 50,
      flow: 24,
      latency: 1,
      active: true
    });

    edges.set('endpoint_to_ad', {
      id: 'endpoint_to_ad',
      source: 'host_workstation_finance',
      target: 'host_active_directory',
      weight: 1.0,
      capacity: 40,
      flow: 38,
      latency: 1,
      active: true
    });

    edges.set('ad_to_vault', {
      id: 'ad_to_vault',
      source: 'host_active_directory',
      target: 'host_customer_vault',
      weight: 1.0,
      capacity: 20,
      flow: 2,
      latency: 1,
      active: true
    });

    return {
      timestamp: Date.now(),
      nodes,
      edges,
      dependencies: [
        {
          sourceNodeId: 'host_active_directory',
          targetNodeId: 'host_customer_vault',
          dependencyType: 'critical',
          elasticity: 0.05,
          delayTicks: 1
        }
      ],
      constraints,
      globalVariables: {
        beacons: {
          name: 'beacons',
          type: 'continuous',
          value: domainState.c2BeaconingDetections,
          min: 0,
          max: 20,
          nominal: 0
        }
      }
    };
  }

  public toDomainIntervention(intervention: GenericIntervention): string {
    const actionType = intervention.actions?.[0]?.actionType ?? 'MULTI_ACTION';
    const target = intervention.actions?.[0]?.targetNodeId ?? 'enclave';
    return `[Cybersecurity Response Command]: ${intervention.name} (Action: ${actionType}, Target: ${target}, Friction Cost: ${intervention.totalCost})`;
  }

  public generateCandidateInterventions(domainState: CybersecurityState): GenericIntervention[] {
    return [
      {
        id: 'action_quarantine_bastion',
        name: 'Isolate DMZ Ingress Bastion via Zero-Trust EDR Firewall Rule',
        actions: [
          {
            id: 'act_quarantine',
            targetNodeId: 'host_dmz_web',
            targetVariable: 'anomalyScore',
            actionType: 'scale',
            value: 0.15,
            cost: 15.0,
            latencyTicks: 1,
            description: 'Isolate DMZ Ingress Bastion via Zero-Trust EDR Firewall Rule'
          }
        ],
        totalCost: 15.0,
        resourceRequirements: { subnetBlocks: 1 },
        maxExecutionTimeTicks: 1
      },
      {
        id: 'action_revoke_kerberos_tickets',
        name: 'Force Golden Ticket Reset & Invalidate Domain Controller Sessions',
        actions: [
          {
            id: 'act_kerberos',
            targetNodeId: 'host_active_directory',
            targetVariable: 'failedAuth',
            actionType: 'scale',
            value: 0.20,
            cost: 25.0,
            latencyTicks: 1,
            description: 'Force Golden Ticket Reset & Invalidate Domain Controller Sessions'
          }
        ],
        totalCost: 25.0,
        resourceRequirements: { authResets: 1 },
        maxExecutionTimeTicks: 1
      },
      {
        id: 'action_segment_vault',
        name: 'Sever Ingress Trust Corridor to Cardholder Database Vault',
        actions: [
          {
            id: 'act_segment',
            targetNodeId: 'host_customer_vault',
            targetVariable: 'dataEgress',
            actionType: 'scale',
            value: 0.10,
            cost: 35.0,
            latencyTicks: 1,
            description: 'Sever Ingress Trust Corridor to Cardholder Database Vault'
          }
        ],
        totalCost: 35.0,
        resourceRequirements: { enclavesLocked: 1 },
        maxExecutionTimeTicks: 1
      },
      {
        id: 'action_deploy_honeytokens',
        name: 'Deploy Synthetic Decoy Credentials & Deceptive Honeytokens',
        actions: [
          {
            id: 'act_honey',
            targetNodeId: 'host_workstation_finance',
            targetVariable: 'lateralConn',
            actionType: 'scale',
            value: 0.40,
            cost: 10.0,
            latencyTicks: 1,
            description: 'Deploy Synthetic Decoy Credentials & Deceptive Honeytokens'
          }
        ],
        totalCost: 10.0,
        resourceRequirements: { canaryAccounts: 5 },
        maxExecutionTimeTicks: 1
      }
    ];
  }
}
