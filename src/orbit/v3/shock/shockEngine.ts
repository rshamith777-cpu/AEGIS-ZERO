/**
 * Shock Detection, Classification, and Emergency Response Engine for ORBIT-A 3.1
 * 
 * Formal Operational Distinction:
 *   - PREDICTABLE TRANSITION: Precursor evidence accumulates over >= 2 ticks. ORBIT generates advance warning.
 *   - INSTANTANEOUS SHOCK: Step magnitude exceeds shock threshold with zero precursor warning.
 *     Reports:
 *       PRE-SHOCK WARNING: NONE
 *       SHOCK DETECTED: YES
 *       DETECTION LATENCY: X
 *       POST-SHOCK ESCAPE ANALYSIS: YES
 * 
 * Classifications:
 *   - GRADUAL: Velocity <= 0.40, acceleration <= 0.20, lead time >= 3 ticks
 *   - ACCELERATING: Monotonically increasing velocity (a > 0.20), lead time >= 2 ticks
 *   - SUDDEN: Step delta >= threshold over 1 tick, but with prior structural drift (lead time 1 tick)
 *   - INSTANTANEOUS: Step delta >= threshold with zero warning (previous state NORMAL)
 *   - UNKNOWN: Multi-modal / insufficient data
 */

import { StateVector, SystemState, Constraint, GenericIntervention } from '../../core/types';
import { Mei2Optimizer } from '../mei2Optimizer';
import { Mei2OptimizationResult, OrbitV3Config } from '../types';

export type ShockClassification = 'GRADUAL' | 'ACCELERATING' | 'SUDDEN' | 'INSTANTANEOUS' | 'UNKNOWN';

export interface ShockAnalysisReport {
  isShockActive: boolean;
  classification: ShockClassification;
  shockMagnitude: number;
  preShockWarningStatus: 'NONE' | 'ADVANCE_WARNING' | 'MARGINAL';
  detectionLatencyTicks: number;
  affectedNodes: string[];
  topologyImpact: {
    severedCorridorsCount: number;
    severedEdges: string[];
    capacityLossPct: number;
  };
  postShockBtd: number;
  fastestRecoveryDirection: {
    name: string;
    vector: Float64Array;
  };
  postShockEscapeResult: Mei2OptimizationResult | null;
  postShockEscapeProbability: number;
  expectedLossAvoided: number;
  recoveryEstimateTicks: number;
  explanation: string;
}

export class ShockEngine {
  private mei2Optimizer = new Mei2Optimizer();

  public analyzeShock(
    currentState: SystemState,
    stateVector: StateVector,
    previousStateVector: StateVector | null,
    priorPreviousStateVector: StateVector | null,
    previousOperationalState: string,
    currentBtd: number,
    candidateInterventions: GenericIntervention[],
    constraints: Constraint[],
    config: OrbitV3Config
  ): ShockAnalysisReport {
    const dim = stateVector.values.length;
    let shockMagnitude = 0;
    const affectedNodeSet = new Set<string>();

    if (previousStateVector && previousStateVector.values.length === dim) {
      let sumSq = 0;
      for (let i = 0; i < dim; i++) {
        const diff = Math.abs(stateVector.values[i] - previousStateVector.values[i]);
        if (diff > 0.25) {
          const nid = stateVector.nodeMapping[i]?.nodeId;
          if (nid) affectedNodeSet.add(nid);
        }
        sumSq += diff * diff;
      }
      shockMagnitude = Math.sqrt(sumSq) / Math.sqrt(Math.max(1, dim));
    }

    const shockThreshold = 0.45;
    const isShockActive = shockMagnitude >= shockThreshold || previousOperationalState === 'SHOCK';

    // ------------------------------------------------------------------------
    // CLASSIFICATION LOGIC BASED ON MEASURABLE METRICS
    // ------------------------------------------------------------------------
    let classification: ShockClassification = 'UNKNOWN';
    let preShockWarningStatus: 'NONE' | 'ADVANCE_WARNING' | 'MARGINAL' = 'NONE';
    let detectionLatencyTicks = 1;

    if (!previousStateVector || previousStateVector.values.length !== dim) {
      classification = 'UNKNOWN';
      preShockWarningStatus = 'NONE';
    } else {
      let vel1 = shockMagnitude;
      let vel0 = 0;
      if (priorPreviousStateVector && priorPreviousStateVector.values.length === dim) {
        let sum0 = 0;
        for (let i = 0; i < dim; i++) {
          const d = previousStateVector.values[i] - priorPreviousStateVector.values[i];
          sum0 += d * d;
        }
        vel0 = Math.sqrt(sum0) / Math.sqrt(Math.max(1, dim));
      }
      const accel = vel1 - vel0;

      if (shockMagnitude >= shockThreshold) {
        if (previousOperationalState === 'NORMAL' && vel0 < 0.15) {
          classification = 'INSTANTANEOUS';
          preShockWarningStatus = 'NONE';
          detectionLatencyTicks = 1;
        } else if (previousOperationalState === 'WATCH') {
          classification = 'SUDDEN';
          preShockWarningStatus = 'MARGINAL';
          detectionLatencyTicks = 1;
        } else if (accel > 0.20) {
          classification = 'ACCELERATING';
          preShockWarningStatus = 'ADVANCE_WARNING';
          detectionLatencyTicks = 2;
        } else {
          classification = 'GRADUAL';
          preShockWarningStatus = 'ADVANCE_WARNING';
          detectionLatencyTicks = 3;
        }
      } else {
        if (accel > 0.20) {
          classification = 'ACCELERATING';
          preShockWarningStatus = 'ADVANCE_WARNING';
        } else {
          classification = 'GRADUAL';
          preShockWarningStatus = 'ADVANCE_WARNING';
        }
      }
    }

    // ------------------------------------------------------------------------
    // TOPOLOGY IMPACT ASSESSMENT
    // ------------------------------------------------------------------------
    const severedEdges: string[] = [];
    let inactiveCount = 0;
    const rawEdges: any = currentState.edges;
    const edgesList: any[] = rawEdges instanceof Map
      ? Array.from(rawEdges.values())
      : Array.isArray(rawEdges)
      ? rawEdges
      : Object.values(rawEdges || {});

    edgesList.forEach((e: any) => {
      if (e.active === false || affectedNodeSet.has(e.source) || affectedNodeSet.has(e.target)) {
        severedEdges.push(`${e.source}->${e.target}`);
        inactiveCount++;
      }
    });

    const capacityLossPct = Number(
      (edgesList.length > 0 ? (inactiveCount / edgesList.length) * 100 : 0).toFixed(1)
    );

    // ------------------------------------------------------------------------
    // FASTEST RECOVERY DIRECTION & POST-SHOCK MEI-2 ESCAPE
    // ------------------------------------------------------------------------
    const recoveryVec = new Float64Array(dim);
    if (previousStateVector && previousStateVector.values.length === dim) {
      let rNorm = 0;
      for (let i = 0; i < dim; i++) {
        // Direct opposite to shock displacement
        const val = previousStateVector.values[i] - stateVector.values[i];
        recoveryVec[i] = val;
        rNorm += val * val;
      }
      rNorm = Math.sqrt(rNorm);
      if (rNorm > 1e-6) {
        for (let i = 0; i < dim; i++) recoveryVec[i] /= rNorm;
      }
    }

    let postPTrans = 0.85;
    let lossAvoided = 0.0;
    let recoveryTicks = 3;
    let escapeEfficiency = 0.0;
    let postShockEscapeResult: any = null;

    if (isShockActive && candidateInterventions.length > 0) {
      postShockEscapeResult = this.mei2Optimizer.optimizeEscape(
        currentState,
        stateVector,
        currentBtd,
        candidateInterventions,
        constraints,
        config
      );
      postPTrans = postShockEscapeResult.bestEscape ? postShockEscapeResult.bestEscape.postInterventionPTrans : 0.85;
      lossAvoided = postShockEscapeResult.bestEscape ? postShockEscapeResult.bestEscape.lossAvoided : 0.0;
      recoveryTicks = postShockEscapeResult.bestEscape ? postShockEscapeResult.bestEscape.timeToEffectTicks : 3;
      escapeEfficiency = postShockEscapeResult.overallEscapeEfficiency;
    }

    const explanation = isShockActive
      ? `Shock detected [${classification}] with magnitude ${shockMagnitude.toFixed(3)}. ` +
        `Pre-shock warning: ${preShockWarningStatus}. Detection latency: ${detectionLatencyTicks} tick(s). ` +
        `Affected nodes: ${Array.from(affectedNodeSet).slice(0, 4).join(', ') || 'distributed'}. ` +
        `Immediate MEI-2 escape portfolio deployed with efficiency ${escapeEfficiency}.`
      : 'No active instantaneous shock detected. System operating under nominal transition boundary dynamics.';

    return {
      isShockActive,
      classification,
      shockMagnitude: Number(shockMagnitude.toFixed(4)),
      preShockWarningStatus,
      detectionLatencyTicks,
      affectedNodes: Array.from(affectedNodeSet),
      topologyImpact: {
        severedCorridorsCount: severedEdges.length,
        severedEdges: severedEdges.slice(0, 10),
        capacityLossPct
      },
      postShockBtd: Number(currentBtd.toFixed(4)),
      fastestRecoveryDirection: {
        name: 'Inverse Shock Recovery Gradient',
        vector: recoveryVec
      },
      postShockEscapeResult,
      postShockEscapeProbability: Number((1.0 - postPTrans).toFixed(4)),
      expectedLossAvoided: lossAvoided,
      recoveryEstimateTicks: recoveryTicks,
      explanation
    };
  }
}
