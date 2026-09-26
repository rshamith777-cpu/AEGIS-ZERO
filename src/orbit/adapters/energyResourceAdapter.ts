import { SystemState, SystemNode, SystemEdge, Constraint, GenericIntervention } from '../core/types';
import { DomainAdapter } from './domainAdapterInterface';

export interface GridSubstation {
  substationId: string;
  name: string;
  type: 'thermal_plant' | 'substation_transmission' | 'bess_storage' | 'distribution_feeder';
  activePowerMW: number;
  reactivePowerMVar: number;
  busVoltageKV: number;
  nominalVoltageKV: number;
  frequencyHz: number;
  thermalCapacityUtilizationPct: number;
  storageSoCPct?: number; // State of Charge for BESS
}

export interface EnergyGridState {
  substations: GridSubstation[];
  totalGenerationMW: number;
  totalDemandMW: number;
  systemFrequencyHz: number;
}

export class EnergyResourceAdapter implements DomainAdapter<EnergyGridState, string> {
  public domainName = 'Electrical Power Database & Distributed Microgrid';
  public description = 'Frequency stabilization, voltage stability bounds, line thermal overloads, and BESS fast-response storage dispatch.';

  public createDefaultDomainState(seed: number = 42): EnergyGridState {
    return {
      totalGenerationMW: 2450,
      totalDemandMW: 2495, // 45 MW deficit driving frequency downward
      systemFrequencyHz: 49.78, // Below 50.0 Hz nominal
      substations: [
        {
          substationId: 'sub_thermal_central',
          name: 'Central Combined-Cycle Plant',
          type: 'thermal_plant',
          activePowerMW: 1200,
          reactivePowerMVar: 280,
          busVoltageKV: 400.0,
          nominalVoltageKV: 400.0,
          frequencyHz: 49.78,
          thermalCapacityUtilizationPct: 94
        },
        {
          substationId: 'sub_main_transmission',
          name: 'Regional 400/132kV Interconnect',
          type: 'substation_transmission',
          activePowerMW: 850,
          reactivePowerMVar: 190,
          busVoltageKV: 127.5, // 96.6% of nominal 132kV
          nominalVoltageKV: 132.0,
          frequencyHz: 49.78,
          thermalCapacityUtilizationPct: 98
        },
        {
          substationId: 'sub_bess_megapack',
          name: 'Utility-Scale 100MW BESS Facility',
          type: 'bess_storage',
          activePowerMW: 0, // Standby
          reactivePowerMVar: 0,
          busVoltageKV: 33.0,
          nominalVoltageKV: 33.0,
          frequencyHz: 49.78,
          thermalCapacityUtilizationPct: 15,
          storageSoCPct: 82
        },
        {
          substationId: 'sub_metro_industrial',
          name: 'Heavy Industrial Distribution Zone',
          type: 'distribution_feeder',
          activePowerMW: 445,
          reactivePowerMVar: 110,
          busVoltageKV: 31.8, // Sagging
          nominalVoltageKV: 33.0,
          frequencyHz: 49.78,
          thermalCapacityUtilizationPct: 91
        }
      ]
    };
  }

  public toOrbitState(domainState: EnergyGridState): SystemState {
    const nodes = new Map<string, SystemNode>();
    const edges = new Map<string, SystemEdge>();
    const constraints: Constraint[] = [];

    domainState.substations.forEach((sub) => {
      const voltDev = Math.abs(sub.busVoltageKV - sub.nominalVoltageKV) / sub.nominalVoltageKV;

      nodes.set(sub.substationId, {
        id: sub.substationId,
        label: sub.name,
        capacity: 100.0,
        demand: sub.thermalCapacityUtilizationPct,
        state: {
          frequency: {
            name: 'frequency',
            type: 'continuous',
            value: sub.frequencyHz,
            min: 48.0,
            max: 52.0,
            nominal: 50.0,
            weight: 2.5 // Frequency is high critical
          },
          thermalLoad: {
            name: 'thermalLoad',
            type: 'continuous',
            value: sub.thermalCapacityUtilizationPct,
            min: 0,
            max: 120,
            nominal: 70,
            weight: 1.5
          },
          voltageDeviation: {
            name: 'voltageDeviation',
            type: 'continuous',
            value: voltDev * 100, // percentage
            min: 0,
            max: 20,
            nominal: 0,
            weight: 1.8
          },
          batterySoC: {
            name: 'batterySoC',
            type: 'continuous',
            value: sub.storageSoCPct ?? 50,
            min: 0,
            max: 100,
            nominal: 80,
            weight: 1.0
          }
        }
      });

      // Database stability constraints:
      // 1. Frequency must stay within 49.50 Hz - 50.50 Hz
      constraints.push({
        id: `const_freq_low_${sub.substationId}`,
        description: `Under-frequency tripping threshold >= 49.50 Hz at ${sub.name}`,
        nodeId: sub.substationId,
        variableName: 'frequency',
        type: 'min',
        threshold: 49.50,
        isHardConstraint: true,
        penaltyWeight: 60
      });

      // 2. Line thermal overload <= 100%
      constraints.push({
        id: `const_thermal_${sub.substationId}`,
        description: `Thermal rating <= 100% at ${sub.name}`,
        nodeId: sub.substationId,
        variableName: 'thermalLoad',
        type: 'max',
        threshold: 100.0,
        isHardConstraint: sub.type === 'substation_transmission',
        penaltyWeight: 50
      });
    });

    edges.set('gen_to_trans', {
      id: 'gen_to_trans',
      source: 'sub_thermal_central',
      target: 'sub_main_transmission',
      weight: 1.0,
      capacity: 1000,
      flow: 980,
      latency: 1,
      active: true
    });

    edges.set('trans_to_bess', {
      id: 'trans_to_bess',
      source: 'sub_main_transmission',
      target: 'sub_bess_megapack',
      weight: 1.0,
      capacity: 200,
      flow: 0,
      latency: 1,
      active: true
    });

    edges.set('trans_to_ind', {
      id: 'trans_to_ind',
      source: 'sub_main_transmission',
      target: 'sub_metro_industrial',
      weight: 1.0,
      capacity: 500,
      flow: 445,
      latency: 1,
      active: true
    });

    return {
      timestamp: Date.now(),
      nodes,
      edges,
      dependencies: [
        {
          sourceNodeId: 'sub_thermal_central',
          targetNodeId: 'sub_main_transmission',
          dependencyType: 'critical',
          elasticity: 0.1,
          delayTicks: 1
        }
      ],
      constraints,
      globalVariables: {
        gridFreq: {
          name: 'gridFreq',
          type: 'continuous',
          value: domainState.systemFrequencyHz,
          min: 47.0,
          max: 53.0,
          nominal: 50.0
        }
      }
    };
  }

  public toDomainIntervention(intervention: GenericIntervention): string {
    const actionType = intervention.actions?.[0]?.actionType ?? 'MULTI_ACTION';
    const target = intervention.actions?.[0]?.targetNodeId ?? 'grid';
    return `[Database Stabilization Command]: ${intervention.name} (Action: ${actionType}, Target: ${target}, Cost: $${intervention.totalCost}k)`;
  }

  public generateCandidateInterventions(domainState: EnergyGridState): GenericIntervention[] {
    return [
      {
        id: 'action_bess_discharge_50mw',
        name: 'Fast-Frequency Response: Dispatch 50MW BESS Discharge within 200ms',
        actions: [
          {
            id: 'act_bess',
            targetNodeId: 'sub_bess_megapack',
            targetVariable: 'frequency',
            actionType: 'increment',
            value: 0.35,
            cost: 15.0,
            latencyTicks: 1,
            description: 'Fast-Frequency Response: Dispatch 50MW BESS Discharge within 200ms'
          }
        ],
        totalCost: 15.0,
        resourceRequirements: { dischargeMW: 50, durationMinutes: 60 },
        maxExecutionTimeTicks: 1
      },
      {
        id: 'action_demand_response_shed',
        name: 'Trigger Contracted Demand-Response Industrial Curtailment (-40 MW)',
        actions: [
          {
            id: 'act_dr',
            targetNodeId: 'sub_metro_industrial',
            targetVariable: 'thermalLoad',
            actionType: 'scale',
            value: 0.60,
            cost: 28.0,
            latencyTicks: 1,
            description: 'Trigger Contracted Demand-Response Industrial Curtailment (-40 MW)'
          }
        ],
        totalCost: 28.0,
        resourceRequirements: { shedMW: 40 },
        maxExecutionTimeTicks: 1
      },
      {
        id: 'action_thermal_ramp_reserve',
        name: 'Ramp Spinning Reserves on Central Plant (+30 MW @ 5MW/min)',
        actions: [
          {
            id: 'act_thermal',
            targetNodeId: 'sub_thermal_central',
            targetVariable: 'frequency',
            actionType: 'increment',
            value: 0.20,
            cost: 22.0,
            latencyTicks: 2,
            description: 'Ramp Spinning Reserves on Central Plant (+30 MW @ 5MW/min)'
          }
        ],
        totalCost: 22.0,
        resourceRequirements: { rampRateMWPerMin: 5 },
        maxExecutionTimeTicks: 2
      },
      {
        id: 'action_capacitor_bank_switch',
        name: 'Switch Substation Shunt Capacitor Banks (+15 MVar Voltage Support)',
        actions: [
          {
            id: 'act_cap_bank',
            targetNodeId: 'sub_main_transmission',
            targetVariable: 'voltageDeviation',
            actionType: 'scale',
            value: 0.25,
            cost: 8.0,
            latencyTicks: 1,
            description: 'Switch Substation Shunt Capacitor Banks (+15 MVar Voltage Support)'
          }
        ],
        totalCost: 8.0,
        resourceRequirements: { mvarBoost: 15 },
        maxExecutionTimeTicks: 1
      }
    ];
  }
}
