import { SystemState, SystemNode, SystemEdge, Constraint, GenericIntervention } from '../core/types';
import { DomainAdapter } from './domainAdapterInterface';

export interface CloudMicroservice {
  serviceId: string;
  name: string;
  tier: 'frontend' | 'gateway' | 'app' | 'database' | 'cache';
  cpuUtilizationPct: number;
  memoryUtilizationPct: number;
  p99LatencyMs: number;
  errorRatePct: number;
  replicasRunning: number;
  circuitBreakerOpen: boolean;
}

export interface CloudDependencyState {
  services: CloudMicroservice[];
  callsPerSecTotal: number;
  globalEgressMbps: number;
}

export class CloudDependencyAdapter implements DomainAdapter<CloudDependencyState, string> {
  public domainName = 'Cloud Microservices & Distributed Architecture';
  public description = 'Service meshes, container orchestration, database connection pools, and circuit breakers under cascading traffic load.';

  public createDefaultDomainState(seed: number = 42): CloudDependencyState {
    return {
      callsPerSecTotal: 45000,
      globalEgressMbps: 1200,
      services: [
        {
          serviceId: 'svc_api_gw',
          name: 'API Edge Gateway',
          tier: 'gateway',
          cpuUtilizationPct: 78,
          memoryUtilizationPct: 65,
          p99LatencyMs: 45,
          errorRatePct: 0.2,
          replicasRunning: 12,
          circuitBreakerOpen: false
        },
        {
          serviceId: 'svc_auth',
          name: 'IAM & Authentication Service',
          tier: 'app',
          cpuUtilizationPct: 62,
          memoryUtilizationPct: 54,
          p99LatencyMs: 28,
          errorRatePct: 0.1,
          replicasRunning: 8,
          circuitBreakerOpen: false
        },
        {
          serviceId: 'svc_checkout',
          name: 'Core Checkout & Order Engine',
          tier: 'app',
          cpuUtilizationPct: 88,
          memoryUtilizationPct: 82,
          p99LatencyMs: 145,
          errorRatePct: 1.8,
          replicasRunning: 16,
          circuitBreakerOpen: false
        },
        {
          serviceId: 'svc_db_primary',
          name: 'Primary PostgreSQL Shard #1',
          tier: 'database',
          cpuUtilizationPct: 92,
          memoryUtilizationPct: 89,
          p99LatencyMs: 310,
          errorRatePct: 4.2,
          replicasRunning: 2,
          circuitBreakerOpen: false
        },
        {
          serviceId: 'svc_cache_redis',
          name: 'Distributed Redis Cache Tier',
          tier: 'cache',
          cpuUtilizationPct: 45,
          memoryUtilizationPct: 72,
          p99LatencyMs: 8,
          errorRatePct: 0.05,
          replicasRunning: 6,
          circuitBreakerOpen: false
        }
      ]
    };
  }

  public toOrbitState(domainState: CloudDependencyState): SystemState {
    const nodes = new Map<string, SystemNode>();
    const edges = new Map<string, SystemEdge>();
    const constraints: Constraint[] = [];

    domainState.services.forEach((s) => {
      nodes.set(s.serviceId, {
        id: s.serviceId,
        label: s.name,
        capacity: 100.0,
        demand: s.cpuUtilizationPct,
        state: {
          cpu: {
            name: 'cpu',
            type: 'continuous',
            value: s.cpuUtilizationPct,
            min: 0,
            max: 100,
            nominal: 50,
            weight: 1.2
          },
          latency: {
            name: 'latency',
            type: 'continuous',
            value: s.p99LatencyMs,
            min: 0,
            max: 1000,
            nominal: 50,
            weight: 1.5
          },
          errorRate: {
            name: 'errorRate',
            type: 'continuous',
            value: s.errorRatePct,
            min: 0,
            max: 50,
            nominal: 0.1,
            weight: 2.0
          },
          circuitBreaker: {
            name: 'circuitBreaker',
            type: 'discrete',
            value: s.circuitBreakerOpen ? 1 : 0,
            min: 0,
            max: 1,
            nominal: 0,
            weight: 1.0
          }
        }
      });

      // Strict SLO constraints
      constraints.push({
        id: `slo_latency_${s.serviceId}`,
        description: `P99 latency SLO for ${s.name} <= 350ms`,
        nodeId: s.serviceId,
        variableName: 'latency',
        type: 'max',
        threshold: 350.0,
        isHardConstraint: s.tier === 'database' || s.tier === 'gateway',
        penaltyWeight: 50
      });

      constraints.push({
        id: `slo_err_${s.serviceId}`,
        description: `Error rate SLO for ${s.name} <= 5.0%`,
        nodeId: s.serviceId,
        variableName: 'errorRate',
        type: 'max',
        threshold: 5.0,
        isHardConstraint: true,
        penaltyWeight: 60
      });
    });

    // Dependencies between microservice tiers
    edges.set('gw_to_auth', {
      id: 'gw_to_auth',
      source: 'svc_api_gw',
      target: 'svc_auth',
      weight: 1.0,
      capacity: 50000,
      flow: 25000,
      latency: 1,
      active: true
    });

    edges.set('gw_to_checkout', {
      id: 'gw_to_checkout',
      source: 'svc_api_gw',
      target: 'svc_checkout',
      weight: 1.0,
      capacity: 40000,
      flow: 35000,
      latency: 1,
      active: true
    });

    edges.set('checkout_to_db', {
      id: 'checkout_to_db',
      source: 'svc_checkout',
      target: 'svc_db_primary',
      weight: 1.0,
      capacity: 10000,
      flow: 9200,
      latency: 1,
      active: true
    });

    edges.set('checkout_to_cache', {
      id: 'checkout_to_cache',
      source: 'svc_checkout',
      target: 'svc_cache_redis',
      weight: 1.0,
      capacity: 30000,
      flow: 15000,
      latency: 1,
      active: true
    });

    return {
      timestamp: Date.now(),
      nodes,
      edges,
      dependencies: [
        {
          sourceNodeId: 'svc_checkout',
          targetNodeId: 'svc_db_primary',
          dependencyType: 'critical',
          elasticity: 0.2,
          delayTicks: 1
        }
      ],
      constraints,
      globalVariables: {
        rps: {
          name: 'rps',
          type: 'continuous',
          value: domainState.callsPerSecTotal,
          min: 0,
          max: 100000,
          nominal: 30000
        }
      }
    };
  }

  public toDomainIntervention(intervention: GenericIntervention): string {
    const actionType = intervention.actions?.[0]?.actionType ?? 'MULTI_ACTION';
    return `[Cloud Control Action]: ${intervention.name} (Action: ${actionType}, Est Cost: $${intervention.totalCost}k)`;
  }

  public generateCandidateInterventions(domainState: CloudDependencyState): GenericIntervention[] {
    return [
      {
        id: 'action_autoscale_checkout',
        name: 'Horizontal Auto-Scale Checkout Pods (+8 Replicas)',
        actions: [
          {
            id: 'act_scale',
            targetNodeId: 'svc_checkout',
            targetVariable: 'cpu',
            actionType: 'scale',
            value: 0.6,
            cost: 24.0,
            latencyTicks: 1,
            description: 'Horizontal Auto-Scale Checkout Pods (+8 Replicas)'
          }
        ],
        totalCost: 24.0,
        resourceRequirements: { pods: 8 },
        maxExecutionTimeTicks: 2
      },
      {
        id: 'action_enable_read_replica',
        name: 'Divert Read Queries to PostgreSQL Read-Replica Pool',
        actions: [
          {
            id: 'act_offload',
            targetNodeId: 'svc_db_primary',
            targetVariable: 'latency',
            actionType: 'scale',
            value: 0.45,
            cost: 18.0,
            latencyTicks: 1,
            description: 'Divert Read Queries to PostgreSQL Read-Replica Pool'
          }
        ],
        totalCost: 18.0,
        resourceRequirements: { replicas: 2 },
        maxExecutionTimeTicks: 1
      },
      {
        id: 'action_circuit_breaker_cache',
        name: 'Trigger Circuit Breaker & Serve Stale Cache on Checkout Tier',
        actions: [
          {
            id: 'act_cb',
            targetNodeId: 'svc_db_primary',
            targetVariable: 'errorRate',
            actionType: 'scale',
            value: 0.1,
            cost: 12.0,
            latencyTicks: 1,
            description: 'Trigger Circuit Breaker & Serve Stale Cache on Checkout Tier'
          }
        ],
        totalCost: 12.0,
        resourceRequirements: { cacheTTL: 120 },
        maxExecutionTimeTicks: 1
      },
      {
        id: 'action_global_rate_limit',
        name: 'Tier-1 Gateway Aggressive Rate-Limiting (-25% RPS)',
        actions: [
          {
            id: 'act_drop',
            targetNodeId: 'svc_api_gw',
            targetVariable: 'cpu',
            actionType: 'scale',
            value: 0.75,
            cost: 45.0,
            latencyTicks: 1,
            description: 'Tier-1 Gateway Aggressive Rate-Limiting (-25% RPS)'
          }
        ],
        totalCost: 45.0,
        resourceRequirements: {},
        maxExecutionTimeTicks: 1
      }
    ];
  }
}
