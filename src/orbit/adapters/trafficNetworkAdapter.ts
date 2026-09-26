import { SystemState, SystemNode, SystemEdge, Constraint, GenericIntervention } from '../core/types';
import { DomainAdapter } from './domainAdapterInterface';

export interface TrafficIntersection {
  junctionId: string;
  name: string;
  type: 'freeway_interchange' | 'arterial_crossing' | 'bridge_bottleneck' | 'downtown_grid';
  vehicleDensityPerKm: number;
  averageSpeedKmh: number;
  queueLengthMeters: number;
  signalPhaseDurationSec: number;
  incidentBlockingLane: boolean;
}

export interface TrafficNetworkState {
  junctions: TrafficIntersection[];
  cityWideVehicleCount: number;
  rainPrecipitationMmH: number;
}

export class TrafficNetworkAdapter implements DomainAdapter<TrafficNetworkState, string> {
  public domainName = 'Urban Traffic & Multi-Modal Transit Database';
  public description = 'Congestion propagation, bridge chokepoints, freeway arterial queues, and signal phase rerouting under gridlock cascades.';

  public createDefaultDomainState(seed: number = 42): TrafficNetworkState {
    return {
      cityWideVehicleCount: 142000,
      rainPrecipitationMmH: 14.5,
      junctions: [
        {
          junctionId: 'junc_bay_bridge',
          name: 'Bay Crossing Causeway',
          type: 'bridge_bottleneck',
          vehicleDensityPerKm: 145,
          averageSpeedKmh: 18,
          queueLengthMeters: 1850,
          signalPhaseDurationSec: 90,
          incidentBlockingLane: true
        },
        {
          junctionId: 'junc_downtown_loop',
          name: 'Central Expressway Ring',
          type: 'freeway_interchange',
          vehicleDensityPerKm: 110,
          averageSpeedKmh: 24,
          queueLengthMeters: 920,
          signalPhaseDurationSec: 60,
          incidentBlockingLane: false
        },
        {
          junctionId: 'junc_arterial_north',
          name: 'North-South Boulevard',
          type: 'arterial_crossing',
          vehicleDensityPerKm: 75,
          averageSpeedKmh: 38,
          queueLengthMeters: 340,
          signalPhaseDurationSec: 45,
          incidentBlockingLane: false
        },
        {
          junctionId: 'junc_metro_core',
          name: 'Financial District Plaza',
          type: 'downtown_grid',
          vehicleDensityPerKm: 95,
          averageSpeedKmh: 12,
          queueLengthMeters: 620,
          signalPhaseDurationSec: 50,
          incidentBlockingLane: false
        }
      ]
    };
  }

  public toOrbitState(domainState: TrafficNetworkState): SystemState {
    const nodes = new Map<string, SystemNode>();
    const edges = new Map<string, SystemEdge>();
    const constraints: Constraint[] = [];

    domainState.junctions.forEach((j) => {
      nodes.set(j.junctionId, {
        id: j.junctionId,
        label: j.name,
        capacity: 180.0,
        demand: j.vehicleDensityPerKm,
        state: {
          density: {
            name: 'density',
            type: 'continuous',
            value: j.vehicleDensityPerKm,
            min: 0,
            max: 200,
            nominal: 60,
            weight: 1.4
          },
          speed: {
            name: 'speed',
            type: 'continuous',
            value: j.averageSpeedKmh,
            min: 0,
            max: 120,
            nominal: 60,
            weight: 1.3
          },
          queue: {
            name: 'queue',
            type: 'continuous',
            value: j.queueLengthMeters,
            min: 0,
            max: 3000,
            nominal: 200,
            weight: 1.1
          },
          incident: {
            name: 'incident',
            type: 'discrete',
            value: j.incidentBlockingLane ? 1 : 0,
            min: 0,
            max: 1,
            nominal: 0,
            weight: 1.5
          }
        }
      });

      // Gridlock threshold constraints
      constraints.push({
        id: `const_speed_${j.junctionId}`,
        description: `Maintain min speed >= 15 km/h at ${j.name}`,
        nodeId: j.junctionId,
        variableName: 'speed',
        type: 'min',
        threshold: 15.0,
        isHardConstraint: j.type === 'bridge_bottleneck',
        penaltyWeight: 50
      });

      constraints.push({
        id: `const_queue_${j.junctionId}`,
        description: `Max queue spillback <= 2000m at ${j.name}`,
        nodeId: j.junctionId,
        variableName: 'queue',
        type: 'max',
        threshold: 2000.0,
        isHardConstraint: true,
        penaltyWeight: 50
      });
    });

    edges.set('bridge_to_loop', {
      id: 'bridge_to_loop',
      source: 'junc_bay_bridge',
      target: 'junc_downtown_loop',
      weight: 1.0,
      capacity: 3500,
      flow: 3200,
      latency: 3,
      active: true
    });

    edges.set('loop_to_core', {
      id: 'loop_to_core',
      source: 'junc_downtown_loop',
      target: 'junc_metro_core',
      weight: 1.0,
      capacity: 2500,
      flow: 2300,
      latency: 2,
      active: true
    });

    edges.set('loop_to_arterial', {
      id: 'loop_to_arterial',
      source: 'junc_downtown_loop',
      target: 'junc_arterial_north',
      weight: 1.0,
      capacity: 2800,
      flow: 1400,
      latency: 2,
      active: true
    });

    return {
      timestamp: Date.now(),
      nodes,
      edges,
      dependencies: [
        {
          sourceNodeId: 'junc_bay_bridge',
          targetNodeId: 'junc_downtown_loop',
          dependencyType: 'critical',
          elasticity: 0.3,
          delayTicks: 2
        }
      ],
      constraints,
      globalVariables: {
        rain: {
          name: 'rain',
          type: 'continuous',
          value: domainState.rainPrecipitationMmH,
          min: 0,
          max: 50,
          nominal: 0
        }
      }
    };
  }

  public toDomainIntervention(intervention: GenericIntervention): string {
    const actionType = intervention.actions?.[0]?.actionType ?? 'MULTI_ACTION';
    return `[Traffic Routing Plan]: ${intervention.name} (Action: ${actionType}, Est Cost: $${intervention.totalCost}k)`;
  }

  public generateCandidateInterventions(domainState: TrafficNetworkState): GenericIntervention[] {
    return [
      {
        id: 'action_divert_arterial',
        name: 'Dynamic VMS Highway Diversion onto North-South Arterial',
        actions: [
          {
            id: 'act_divert',
            targetNodeId: 'junc_downtown_loop',
            targetVariable: 'density',
            actionType: 'scale',
            value: 0.65,
            cost: 15.0,
            latencyTicks: 1,
            description: 'Dynamic VMS Highway Diversion onto North-South Arterial'
          }
        ],
        totalCost: 15.0,
        resourceRequirements: {},
        maxExecutionTimeTicks: 2
      },
      {
        id: 'action_metering_bridge',
        name: 'Ramp Metering Influx Regulation at Bay Causeway Ingress',
        actions: [
          {
            id: 'act_meter',
            targetNodeId: 'junc_bay_bridge',
            targetVariable: 'density',
            actionType: 'scale',
            value: 0.70,
            cost: 20.0,
            latencyTicks: 1,
            description: 'Ramp Metering Influx Regulation at Bay Causeway Ingress'
          }
        ],
        totalCost: 20.0,
        resourceRequirements: {},
        maxExecutionTimeTicks: 2
      },
      {
        id: 'action_green_wave_core',
        name: 'Synchronized Downtown Green Wave Signal Timers (+25s)',
        actions: [
          {
            id: 'act_speed',
            targetNodeId: 'junc_metro_core',
            targetVariable: 'speed',
            actionType: 'increment',
            value: 15.0,
            cost: 10.0,
            latencyTicks: 1,
            description: 'Synchronized Downtown Green Wave Signal Timers (+25s)'
          }
        ],
        totalCost: 10.0,
        resourceRequirements: {},
        maxExecutionTimeTicks: 1
      },
      {
        id: 'action_emergency_shoulder_lane',
        name: 'Open Expressway Emergency Hard-Shoulder to Commuter Flow',
        actions: [
          {
            id: 'act_cap',
            targetNodeId: 'junc_downtown_loop',
            targetVariable: 'speed',
            actionType: 'increment',
            value: 20.0,
            cost: 35.0,
            latencyTicks: 1,
            description: 'Open Expressway Emergency Hard-Shoulder to Commuter Flow'
          }
        ],
        totalCost: 35.0,
        resourceRequirements: {},
        maxExecutionTimeTicks: 1
      }
    ];
  }
}
