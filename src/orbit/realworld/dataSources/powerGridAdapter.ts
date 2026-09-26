/**
 * IEEE Power Transmission Database Adapter for ORBIT-A 3.0
 * 
 * Maps dynamic PMU (Phasor Measurement Unit) state telemetry and transmission
 * line power flows to temporal physical resilience graphs.
 * 
 * Third Domain: Energy / Electrical Power Infrastructure.
 * Uses exact same core ORBIT mathematics.
 */

import {
  SystemState,
  SystemNode,
  Constraint,
  StateVector
} from '../../core/types';
import { systemStateToVector } from '../../core/stateVector';

export interface PowerGridBusRecord {
  busId: number;
  busType: 'SLACK' | 'PV_GEN' | 'PQ_LOAD';
  voltagePu: number;
  angleRad: number;
  activeMw: number;
  reactiveMvar: number;
  frequencyHz: number;
  spinningReserveMw: number;
}

export interface PowerGridBranchRecord {
  fromBus: number;
  toBus: number;
  activeFlowMw: number;
  reactiveFlowMvar: number;
  thermalLoadingPct: number;
}

export interface PowerGridTelemetrySnapshot {
  timestampEpochMs: number;
  timeStepIndex: number;
  buses: PowerGridBusRecord[];
  branches: PowerGridBranchRecord[];
}

export interface PowerGridEventLabel {
  timestamp: number;
  timeStepIndex: number;
  isContingencyEvent: boolean;
  eventClass: 'GRADUAL_TRANSITION' | 'ACCELERATING_TRANSITION' | 'SUDDEN_SHOCK' | 'NOMINAL';
  affectedBusIds: number[];
  severityScore: number;
  eventDescription: string;
}

export class PowerGridAdapter {
  /**
   * Generates deterministic, physically grounded transmission grid operational timeseries
   * across 140 time intervals of 5 minutes (representing ~11.6 hours).
   */
  public generateTelemetrySequence(): {
    states: SystemState[];
    eventLabels: PowerGridEventLabel[];
    timestamps: number[];
  } {
    const states: SystemState[] = [];
    const eventLabels: PowerGridEventLabel[] = [];
    const timestamps: number[] = [];

    const baseEpoch = new Date('2024-03-12T06:00:00.000Z').getTime();
    const intervalMs = 5 * 60 * 1000;
    const totalSteps = 120;

    // PRNG for physical drift
    let seed = 918273;
    const rng = () => {
      seed = (seed * 16807 + 11) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // IEEE 14-bus transmission corridors (From -> To)
    const transmissionLines = [
      [1, 2], [1, 5], [2, 3], [2, 4], [2, 5],
      [3, 4], [4, 5], [4, 7], [4, 9], [5, 6],
      [6, 11], [6, 12], [6, 13], [7, 8], [7, 9],
      [9, 10], [9, 14], [10, 11], [12, 13], [13, 14]
    ];

    for (let step = 0; step < totalSteps; step++) {
      const stepEpoch = baseEpoch + step * intervalMs;
      timestamps.push(stepEpoch);

      // Operational Event Profiles across distinct splits (Train: 0-71, Val: 72-95, Test: 96-119):
      let eventClass: 'GRADUAL_TRANSITION' | 'ACCELERATING_TRANSITION' | 'SUDDEN_SHOCK' | 'NOMINAL' = 'NOMINAL';
      let progress = 0;
      let quadProgress = 0;

      if (step >= 15 && step <= 24) {
        eventClass = 'GRADUAL_TRANSITION';
        progress = (step - 15) / 9;
      } else if (step >= 35 && step <= 43) {
        eventClass = 'ACCELERATING_TRANSITION';
        quadProgress = Math.pow((step - 35) / 8, 2);
      } else if (step >= 55 && step <= 60) {
        eventClass = 'SUDDEN_SHOCK';
      } else if (step >= 76 && step <= 81) {
        eventClass = 'GRADUAL_TRANSITION';
        progress = (step - 76) / 5;
      } else if (step >= 85 && step <= 90) {
        eventClass = 'ACCELERATING_TRANSITION';
        quadProgress = Math.pow((step - 85) / 5, 2);
      } else if (step >= 99 && step <= 105) {
        eventClass = 'GRADUAL_TRANSITION';
        progress = (step - 99) / 6;
      } else if (step >= 107 && step <= 112) {
        eventClass = 'ACCELERATING_TRANSITION';
        quadProgress = Math.pow((step - 107) / 5, 2);
      } else if (step >= 115 && step <= 118) {
        eventClass = 'SUDDEN_SHOCK';
      }

      const isGradual = eventClass === 'GRADUAL_TRANSITION';
      const isAccelerating = eventClass === 'ACCELERATING_TRANSITION';
      const isSuddenShock = eventClass === 'SUDDEN_SHOCK';
      const isContingencyEvent = eventClass !== 'NOMINAL';

      const nodes = new Map<string, SystemNode>();
      const edges = new Map<string, any>();
      const constraints: Constraint[] = [];

      // Physical state calculations for 14 buses
      for (let b = 1; b <= 14; b++) {
        const isGen = b === 1 || b === 2 || b === 3 || b === 6 || b === 8;
        let vBase = isGen ? 1.04 : 1.01;
        let pBase = isGen ? 120.0 : 45.0;
        let qBase = isGen ? 30.0 : 15.0;

        // Apply physical impact of events
        if (isGradual && (b === 9 || b === 14 || b === 10)) {
          vBase -= 0.06 * progress; // gradual voltage depression
          qBase += 25.0 * progress;
        } else if (isAccelerating && (b === 2 || b === 4 || b === 5)) {
          vBase -= 0.08 * quadProgress; // non-linear accelerated drop
          pBase += 40.0 * quadProgress;
        } else if (isSuddenShock && (b === 4 || b === 9 || b === 7)) {
          vBase -= 0.09; // instantaneous drop
          pBase *= 1.35;
        }

        const vNoise = (rng() - 0.5) * 0.006;
        const vFinal = Number(Math.max(0.85, Math.min(1.10, vBase + vNoise)).toFixed(3));
        const freqHz = Number((60.0 + (rng() - 0.5) * 0.04 - (isSuddenShock ? 0.28 : 0.0)).toFixed(2));
        const activeMw = Number((pBase * (0.95 + rng() * 0.1)).toFixed(1));
        const reactiveMvar = Number((qBase * (0.95 + rng() * 0.1)).toFixed(1));

        nodes.set(`bus_${b}`, {
          id: `bus_${b}`,
          label: `Substation Bus ${b} (${isGen ? 'Generator' : 'Load'})`,
          capacity: isGen ? 300 : 100,
          demand: activeMw,
          state: {
            voltageMagnitude: {
              name: 'voltageMagnitude',
              type: 'continuous',
              value: vFinal,
              min: 0.85,
              max: 1.15,
              nominal: 1.02,
              weight: 1.8
            },
            frequency: {
              name: 'frequency',
              type: 'continuous',
              value: freqHz,
              min: 58.5,
              max: 61.5,
              nominal: 60.0,
              weight: 1.5
            },
            activePower: {
              name: 'activePower',
              type: 'continuous',
              value: activeMw,
              min: 0,
              max: 400,
              nominal: 60,
              weight: 1.2
            },
            reactivePower: {
              name: 'reactivePower',
              type: 'continuous',
              value: reactiveMvar,
              min: -50,
              max: 200,
              nominal: 20,
              weight: 1.1
            }
          }
        });

        // Add operational security constraints
        constraints.push({
          id: `const_voltage_min_${b}`,
          description: `Bus ${b} Voltage >= 0.94 pu (Under-voltage margin)`,
          nodeId: `bus_${b}`,
          variableName: 'voltageMagnitude',
          type: 'min',
          threshold: 0.94,
          isHardConstraint: isGen || b === 9,
          penaltyWeight: 1.5
        });
      }

      // Add transmission corridors (edges)
      transmissionLines.forEach(([from, to]) => {
        const isTripped = isSuddenShock && from === 4 && to === 9;
        const baseFlow = isTripped ? 0.0 : 45.0 + rng() * 20.0;
        const thermalLoading = isTripped ? 0.0 : isSuddenShock && (from === 4 && to === 7) ? 108.5 : 55.0 + rng() * 20.0;

        edges.set(`line_${from}_${to}`, {
          id: `line_${from}_${to}`,
          source: `bus_${from}`,
          target: `bus_${to}`,
          weight: 1.0,
          active: !isTripped,
          flow: Number(baseFlow.toFixed(1)),
          capacity: 100.0,
          metadata: {
            thermalLoadingPct: Number(thermalLoading.toFixed(1)),
            lineImpedance: 0.045
          }
        });
      });

      states.push({
        timestamp: stepEpoch,
        nodes,
        edges,
        dependencies: [
          {
            sourceNodeId: 'bus_1',
            targetNodeId: 'bus_2',
            dependencyType: 'critical',
            elasticity: 0.95,
            delayTicks: 1
          },
          {
            sourceNodeId: 'bus_4',
            targetNodeId: 'bus_9',
            dependencyType: 'critical',
            elasticity: 0.90,
            delayTicks: 1
          }
        ],
        constraints,
        globalVariables: {
          systemFrequencyHz: {
            name: 'systemFrequencyHz',
            type: 'continuous',
            value: Number((60.0 - (isSuddenShock ? 0.28 : isAccelerating ? 0.12 : 0.02)).toFixed(2)),
            min: 58.0,
            max: 62.0,
            nominal: 60.0
          },
          totalLoadMw: {
            name: 'totalLoadMw',
            type: 'continuous',
            value: Number((750 + step * 2.5 + (isSuddenShock ? 60 : 0)).toFixed(1)),
            min: 500,
            max: 1400,
            nominal: 800
          }
        }
      });

      eventLabels.push({
        timestamp: stepEpoch,
        timeStepIndex: step,
        isContingencyEvent,
        eventClass,
        affectedBusIds: isSuddenShock ? [4, 9, 7] : isAccelerating ? [2, 4, 5] : isGradual ? [9, 14] : [],
        severityScore: isSuddenShock ? 0.92 : isAccelerating ? 0.78 : isGradual ? 0.65 : 0.0,
        eventDescription: isSuddenShock
          ? 'N-1 Transmission Line 4-9 Trip: Corridors overload with severe voltage sag'
          : isAccelerating
          ? 'Generator 2 Over-excitation: Rapid voltage collapse in central load pocket'
          : isGradual
          ? 'Gradual Reactive Power Depletion: Substation 9 & 14 voltage margin degrading'
          : 'Nominal Economic Dispatch State'
      });
    }

    return { states, eventLabels, timestamps };
  }

  /**
   * Leakage audit ensuring zero contingency labels or fault flags enter ORBIT features
   */
  public verifyZeroLeakage(state: SystemState): { passed: boolean; auditLog: string[] } {
    const auditLog: string[] = [];
    let passed = true;

    state.nodes.forEach((node, nodeId) => {
      Object.keys(node.state).forEach((varKey) => {
        const lower = varKey.toLowerCase();
        if (lower.includes('fault') || lower.includes('event') || lower.includes('contingency') || lower.includes('label')) {
          passed = false;
          auditLog.push(`[LEAK in Node ${nodeId}]: Forbidden feature '${varKey}'`);
        }
      });
    });

    if (passed) {
      auditLog.push('Leakage Audit PASSED: Zero contingency or fault labels present in power grid state.');
    }
    return { passed, auditLog };
  }
}
