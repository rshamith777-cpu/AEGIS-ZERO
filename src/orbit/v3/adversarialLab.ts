/**
 * Adversarial Lab for ORBIT-A 3.0
 * 
 * Evaluates operational degradation curves under 13 live stress vectors:
 * 1. 5% sensor dropout
 * 2. 10% sensor dropout
 * 3. 25% sensor dropout
 * 4. Missing nodes (15% unmonitored)
 * 5. Missing edges (20% unmonitored corridors)
 * 6. Structural topology shock (severed corridors)
 * 7. Observation delay (1, 2, 3 ticks)
 * 8. Gaussian noise (sigma = 0.05, 0.15, 0.30)
 * 9. Heavy-tail noise (Cauchy outliers)
 * 10. Covariate distribution shift (+20% mean shift)
 * 11. Sudden step disruption
 * 12. Slow parameter drift
 * 13. Unseen pairwise non-linear interaction
 * 
 * Every curve point is computed live from actual model execution on corrupted states.
 */

import { SystemState, GenericIntervention, SystemNode, SystemEdge } from '../core/types';
import { OrbitEngineV3 } from './orbitEngineV3';
import { OrbitV3AnalysisResult } from './types';

export interface StressCurvePoint {
  stressVector: string;
  intensity: number | string;
  f1Score: number;
  btdError: number;
  escapeEfficiency: number;
  falseAlarmsPerDay: number;
  stabilityIndex: number; // [0, 1]
}

export interface GroundTruthEventRef {
  isEvent: boolean;
}

export class AdversarialLabRunner {
  public static runStressSuite(
    testStates: SystemState[],
    candidateInterventions: GenericIntervention[] = [],
    eventLabels?: GroundTruthEventRef[]
  ): StressCurvePoint[] {
    const points: StressCurvePoint[] = [];
    const baseEngine = new OrbitEngineV3();

    // Baseline uncorrupted run for BTD reference
    baseEngine.resetMemory();
    const baselineResults = testStates.map((s) => baseEngine.analyzeSystem(s, candidateInterventions));

    // Fallback event labels if not provided
    const labels = eventLabels || testStates.map((_, i) => ({
      isEvent: i >= Math.floor(testStates.length * 0.4) && i <= Math.floor(testStates.length * 0.8)
    }));

    // Helper to evaluate live performance on corrupted states
    const evaluateCorruptedStates = (
      corruptedStates: SystemState[],
      vectorName: string,
      intensityStr: string
    ): StressCurvePoint => {
      baseEngine.resetMemory();
      const results: OrbitV3AnalysisResult[] = [];
      for (const s of corruptedStates) {
        results.push(baseEngine.analyzeSystem(s, candidateInterventions));
      }

      // 1. Compute F1 Score
      let tp = 0;
      let fp = 0;
      let fn = 0;
      let totalEff = 0;
      let btdDiffSum = 0;

      for (let i = 0; i < results.length; i++) {
        const isAlarm = results[i].operationalState !== 'NORMAL';
        const isGroundTruth = labels[i]?.isEvent ?? false;

        if (isAlarm && isGroundTruth) tp++;
        else if (isAlarm && !isGroundTruth) fp++;
        else if (!isAlarm && isGroundTruth) fn++;

        // BTD Error vs baseline uncorrupted BTD
        btdDiffSum += Math.abs(results[i].adaptiveBtd - baselineResults[i].adaptiveBtd);

        const bestEsc = results[i].mei2Result.bestEscape;
        if (bestEsc) totalEff += bestEsc.escapeEfficiency;
      }

      const precision = tp + fp > 0 ? tp / (tp + fp) : 0.0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0.0;
      const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0.0;

      // 2. Mean BTD Error
      const btdError = results.length > 0 ? btdDiffSum / results.length : 0.0;

      // 3. Mean Escape Efficiency
      const escapeEfficiency = results.length > 0 ? totalEff / results.length : 0.0;

      // 4. False Alarms per Day (normalized to 24h operational window)
      const nominalSteps = labels.filter((l) => !l.isEvent).length;
      const falseAlarmRate = nominalSteps > 0 ? fp / nominalSteps : 0.0;
      const falseAlarmsPerDay = Number((falseAlarmRate * 96).toFixed(1)); // 96 15m intervals or scaled

      // 5. Stability Index (rate of operational state oscillations)
      let stateFlips = 0;
      for (let i = 1; i < results.length; i++) {
        if (results[i].operationalState !== results[i - 1].operationalState) {
          stateFlips++;
        }
      }
      const stabilityIndex = results.length > 1
        ? Number(Math.max(0.0, 1.0 - (stateFlips / (results.length - 1))).toFixed(3))
        : 1.0;

      return {
        stressVector: vectorName,
        intensity: intensityStr,
        f1Score: Number(f1Score.toFixed(3)),
        btdError: Number(btdError.toFixed(3)),
        escapeEfficiency: Number(escapeEfficiency.toFixed(3)),
        falseAlarmsPerDay,
        stabilityIndex
      };
    };

    // ------------------------------------------------------------------------
    // 1. Sensor Dropout Sweep (5%, 10%, 25%)
    // ------------------------------------------------------------------------
    for (const rate of [0.05, 0.10, 0.25]) {
      const corrupted = testStates.map((s) => this.injectDropout(s, rate));
      points.push(evaluateCorruptedStates(corrupted, 'Sensor Dropout', `${Math.round(rate * 100)}%`));
    }

    // ------------------------------------------------------------------------
    // 2. Missing Nodes (15% Unmonitored)
    // ------------------------------------------------------------------------
    const missingNodesStates = testStates.map((s) => this.injectMissingNodes(s, 0.15));
    points.push(evaluateCorruptedStates(missingNodesStates, 'Missing Nodes (Unmonitored)', '15% Nodes'));

    // ------------------------------------------------------------------------
    // 3. Missing Edges (20% Unmonitored Corridors)
    // ------------------------------------------------------------------------
    const missingEdgesStates = testStates.map((s) => this.injectMissingEdges(s, 0.20));
    points.push(evaluateCorruptedStates(missingEdgesStates, 'Missing Edges (Unmonitored Corridors)', '20% Edges'));

    // ------------------------------------------------------------------------
    // 4. Structural Topology Shock (Severed Corridors)
    // ------------------------------------------------------------------------
    const topologyShockStates = testStates.map((s) => this.injectTopologyShock(s));
    points.push(evaluateCorruptedStates(topologyShockStates, 'Structural Topology Shock (Rerouted Corridors)', 'Severed Corridor'));

    // ------------------------------------------------------------------------
    // 5. Telemetry Observation Delay (1, 2, 3 ticks)
    // ------------------------------------------------------------------------
    for (const delay of [1, 2, 3]) {
      const delayedStates = this.injectObservationDelay(testStates, delay);
      points.push(evaluateCorruptedStates(delayedStates, 'Observation Delay', `${delay} tick(s)`));
    }

    // ------------------------------------------------------------------------
    // 6. Gaussian Sensor Noise (sigma = 0.05, 0.15, 0.30)
    // ------------------------------------------------------------------------
    for (const sigma of [0.05, 0.15, 0.30]) {
      const noisyStates = testStates.map((s) => this.injectGaussianNoise(s, sigma));
      points.push(evaluateCorruptedStates(noisyStates, 'Gaussian Sensor Noise', `sigma=${sigma}`));
    }

    // ------------------------------------------------------------------------
    // 7. Heavy-Tail Outliers (Cauchy Distribution)
    // ------------------------------------------------------------------------
    const heavyTailStates = testStates.map((s) => this.injectHeavyTailNoise(s));
    points.push(evaluateCorruptedStates(heavyTailStates, 'Heavy-Tail Outliers (Cauchy)', 'nu=3 degrees'));

    // ------------------------------------------------------------------------
    // 8. Covariate Distribution Shift (+20% Mean Shift)
    // ------------------------------------------------------------------------
    const shiftStates = testStates.map((s) => this.injectDistributionShift(s, 0.20));
    points.push(evaluateCorruptedStates(shiftStates, 'Covariate Distribution Shift', '+20% Mean Shift'));

    // ------------------------------------------------------------------------
    // 9. Sudden Step Disruption
    // ------------------------------------------------------------------------
    const suddenStepStates = this.injectSuddenStep(testStates);
    points.push(evaluateCorruptedStates(suddenStepStates, 'Sudden Step Disruption', 'Instantaneous Step'));

    // ------------------------------------------------------------------------
    // 10. Slow Parameter Drift
    // ------------------------------------------------------------------------
    const slowDriftStates = this.injectSlowDrift(testStates);
    points.push(evaluateCorruptedStates(slowDriftStates, 'Slow Creeping Parameter Drift', 'Linear Drift (12h)'));

    // ------------------------------------------------------------------------
    // 11. Unseen Pairwise Non-linear Interaction
    // ------------------------------------------------------------------------
    const interactionStates = testStates.map((s) => this.injectUnseenInteraction(s));
    points.push(evaluateCorruptedStates(interactionStates, 'Unseen Pairwise Nonlinear Interaction', 'Multi-corridor coupling'));

    return points;
  }

  // --------------------------------------------------------------------------
  // Perturbation Ingestion Engines
  // --------------------------------------------------------------------------

  private static injectDropout(state: SystemState, rate: number): SystemState {
    const corruptedNodes = new Map<string, SystemNode>();
    let seed = 1234;
    const rng = () => {
      seed = (seed * 16807 + 7) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    state.nodes.forEach((node, nodeId) => {
      const clonedState = { ...node.state };
      Object.keys(clonedState).forEach((k) => {
        if (rng() < rate) {
          clonedState[k] = { ...clonedState[k], value: clonedState[k].nominal };
        }
      });
      corruptedNodes.set(nodeId, { ...node, state: clonedState });
    });

    return { ...state, nodes: corruptedNodes };
  }

  private static injectMissingNodes(state: SystemState, dropRate: number): SystemState {
    const remainingNodes = new Map<string, SystemNode>();
    let seed = 54321;
    const rng = () => {
      seed = (seed * 16807 + 13) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    state.nodes.forEach((node, nodeId) => {
      if (rng() >= dropRate) {
        remainingNodes.set(nodeId, { ...node });
      }
    });

    return { ...state, nodes: remainingNodes };
  }

  private static injectMissingEdges(state: SystemState, dropRate: number): SystemState {
    const remainingEdges = new Map<string, SystemEdge>();
    let seed = 98765;
    const rng = () => {
      seed = (seed * 16807 + 17) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    state.edges.forEach((edge, edgeId) => {
      if (rng() >= dropRate) {
        remainingEdges.set(edgeId, { ...edge });
      }
    });

    return { ...state, edges: remainingEdges };
  }

  private static injectTopologyShock(state: SystemState): SystemState {
    const severedEdges = new Map<string, SystemEdge>();
    let count = 0;
    state.edges.forEach((edge, edgeId) => {
      if (count < 2) {
        severedEdges.set(edgeId, { ...edge, active: false, flow: 0 });
        count++;
      } else {
        severedEdges.set(edgeId, { ...edge });
      }
    });

    return { ...state, edges: severedEdges };
  }

  private static injectObservationDelay(states: SystemState[], delay: number): SystemState[] {
    return states.map((s, idx) => {
      const laggedIdx = Math.max(0, idx - delay);
      return {
        ...states[laggedIdx],
        timestamp: s.timestamp
      };
    });
  }

  private static injectGaussianNoise(state: SystemState, sigma: number): SystemState {
    const noisyNodes = new Map<string, SystemNode>();
    let seed = 112233;
    const rng = () => {
      seed = (seed * 16807 + 23) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Box-Muller transform for normal distribution
    const randn = () => {
      const u1 = Math.max(1e-6, rng());
      const u2 = rng();
      return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    };

    state.nodes.forEach((node, nodeId) => {
      const clonedState = { ...node.state };
      Object.keys(clonedState).forEach((k) => {
        const span = clonedState[k].max - clonedState[k].min;
        const noise = randn() * sigma * span;
        clonedState[k] = {
          ...clonedState[k],
          value: Math.max(clonedState[k].min, Math.min(clonedState[k].max, clonedState[k].value + noise))
        };
      });
      noisyNodes.set(nodeId, { ...node, state: clonedState });
    });

    return { ...state, nodes: noisyNodes };
  }

  private static injectHeavyTailNoise(state: SystemState): SystemState {
    const outlierNodes = new Map<string, SystemNode>();
    let seed = 445566;
    const rng = () => {
      seed = (seed * 16807 + 29) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    state.nodes.forEach((node, nodeId) => {
      const clonedState = { ...node.state };
      Object.keys(clonedState).forEach((k) => {
        if (rng() < 0.08) {
          // Cauchy impulse outlier: tan(pi * (u - 0.5))
          const u = Math.max(0.01, Math.min(0.99, rng()));
          const impulse = Math.tan(Math.PI * (u - 0.5)) * 0.15;
          const span = clonedState[k].max - clonedState[k].min;
          clonedState[k] = {
            ...clonedState[k],
            value: Math.max(clonedState[k].min, Math.min(clonedState[k].max, clonedState[k].value + impulse * span))
          };
        }
      });
      outlierNodes.set(nodeId, { ...node, state: clonedState });
    });

    return { ...state, nodes: outlierNodes };
  }

  private static injectDistributionShift(state: SystemState, shiftPct: number): SystemState {
    const shiftedNodes = new Map<string, SystemNode>();

    state.nodes.forEach((node, nodeId) => {
      const clonedState = { ...node.state };
      Object.keys(clonedState).forEach((k) => {
        const span = clonedState[k].max - clonedState[k].min;
        clonedState[k] = {
          ...clonedState[k],
          value: Math.max(clonedState[k].min, Math.min(clonedState[k].max, clonedState[k].value + shiftPct * span))
        };
      });
      shiftedNodes.set(nodeId, { ...node, state: clonedState });
    });

    return { ...state, nodes: shiftedNodes };
  }

  private static injectSuddenStep(states: SystemState[]): SystemState[] {
    const mid = Math.floor(states.length / 2);
    return states.map((s, idx) => {
      if (idx < mid) return s;
      const steppedNodes = new Map<string, SystemNode>();
      s.nodes.forEach((node, nodeId) => {
        const clonedState = { ...node.state };
        Object.keys(clonedState).forEach((k) => {
          clonedState[k] = {
            ...clonedState[k],
            value: clonedState[k].value * 1.35
          };
        });
        steppedNodes.set(nodeId, { ...node, state: clonedState });
      });
      return { ...s, nodes: steppedNodes };
    });
  }

  private static injectSlowDrift(states: SystemState[]): SystemState[] {
    return states.map((s, idx) => {
      const factor = 1.0 + (idx / states.length) * 0.25;
      const driftedNodes = new Map<string, SystemNode>();
      s.nodes.forEach((node, nodeId) => {
        const clonedState = { ...node.state };
        Object.keys(clonedState).forEach((k) => {
          clonedState[k] = {
            ...clonedState[k],
            value: clonedState[k].value * factor
          };
        });
        driftedNodes.set(nodeId, { ...node, state: clonedState });
      });
      return { ...s, nodes: driftedNodes };
    });
  }

  private static injectUnseenInteraction(state: SystemState): SystemState {
    const coupledNodes = new Map(state.nodes);
    // Cross-couple adjacent nodes
    state.edges.forEach((edge) => {
      const src = coupledNodes.get(edge.source);
      const tgt = coupledNodes.get(edge.target);
      if (src && tgt && src.state.activePower && tgt.state.voltageMagnitude) {
        // High load drops downstream voltage nonlinearly
        const loadRatio = src.state.activePower.value / src.state.activePower.max;
        if (loadRatio > 0.8) {
          tgt.state.voltageMagnitude = {
            ...tgt.state.voltageMagnitude,
            value: tgt.state.voltageMagnitude.value * 0.92
          };
        }
      }
    });

    return { ...state, nodes: coupledNodes };
  }
}
