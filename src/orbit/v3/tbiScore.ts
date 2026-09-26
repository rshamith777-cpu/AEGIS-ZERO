/**
 * Transition Boundary Intelligence (TBI) Score Engine for ORBIT-A 3.0
 * 
 * Computes the 4 Core Quantities:
 * 1. Boundary Proximity (BP)
 * 2. Transition Momentum (TM)
 * 3. Structural Amplification (SA)
 * 4. Intervention Leverage (IL)
 * 
 * Aggregates into dimensionless composite TBI \in [0, 1].
 */

import { FourCoreQuantities, OrbitV3Config } from './types';
import { Mei2OptimizationResult } from './types';

export class TbiScoreEngine {
  public computeTbi(
    adaptiveBtd: number,
    transitionMomentum: number,
    structuralAmplification: number,
    mei2Result: Mei2OptimizationResult,
    config?: OrbitV3Config
  ): {
    coreQuantities: FourCoreQuantities;
    tbiScore: number;
  } {
    // 1. Boundary Proximity: Dimensionless margin index in [0, 1]
    const bp = Number((1.0 / (1.0 + Math.max(0.0, adaptiveBtd))).toFixed(4));

    // 2. Transition Momentum
    const tm = Number(Math.max(0.0, transitionMomentum).toFixed(4));

    // 3. Structural Amplification
    const sa = Number(Math.max(1.0, structuralAmplification).toFixed(4));

    // 4. Intervention Leverage: Controllability margin in [0, 1]
    const bestEscape = mei2Result.bestEscape;
    let il = 0.50; // default medium controllability
    if (bestEscape) {
      const btdGain = Math.max(0.0, bestEscape.postInterventionBtd - adaptiveBtd);
      il = Math.min(1.0, Math.max(0.05, btdGain / (btdGain + bestEscape.totalCost * 0.1)));
    }
    il = Number(il.toFixed(4));

    // Composite TBI formula:
    // TBI = w_bp * BP + w_tm * TM + w_sa * (SA - 1) + w_il * (1 - IL)
    const wBp = config?.wBp ?? 0.40;
    const wTm = config?.wTm ?? 0.30;
    const wSa = config?.wSa ?? 0.20;
    const wIl = config?.wIl ?? 0.10;

    const rawTbi = wBp * bp + wTm * tm + wSa * (sa - 1.0) + wIl * (1.0 - il);
    const tbiScore = Number(Math.max(0.0, Math.min(1.0, rawTbi)).toFixed(4));

    return {
      coreQuantities: {
        boundaryProximity: bp,
        transitionMomentum: tm,
        structuralAmplification: sa,
        interventionLeverage: il
      },
      tbiScore
    };
  }
}
