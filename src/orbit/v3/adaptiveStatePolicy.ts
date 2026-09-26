/**
 * Adaptive 4-State Regime Policy for ORBIT-A 3.0
 * 
 * Regimes:
 * 1. NORMAL: Stable basin, minimal transition hazard
 * 2. WATCH: Directional drift or velocity acceleration detected
 * 3. CRITICAL: High boundary proximity combined with structural amplification
 * 4. TRANSITION: Boundary breach underway; immediate escape intervention required
 */

import { OperationalRegimeState, FourCoreQuantities, OrbitV3Config } from './types';

export interface StatePolicyEvaluation {
  operationalState: OperationalRegimeState;
  stateTransitionEvidence: number;
  isEscalation: boolean;
  isDeescalation: boolean;
  suppressedByDeadband: boolean;
}

export class AdaptiveStatePolicyEngine {
  private currentState: OperationalRegimeState = 'NORMAL';
  private consecutiveEvidenceTicks: number = 0;
  private previousTbiScore: number = 0;

  public reset(): void {
    this.currentState = 'NORMAL';
    this.consecutiveEvidenceTicks = 0;
    this.previousTbiScore = 0;
  }

  public getCurrentState(): OperationalRegimeState {
    return this.currentState;
  }

  public evaluateState(
    coreQuantities: FourCoreQuantities,
    tbiScore: number,
    config: OrbitV3Config,
    isShockActive: boolean = false
  ): StatePolicyEvaluation {
    const { boundaryProximity, transitionMomentum, structuralAmplification } = coreQuantities;
    const prev = this.currentState;
    let targetState: OperationalRegimeState = 'NORMAL';

    // 1. Determine instantaneous target state
    if (isShockActive) {
      targetState = 'SHOCK';
    } else if (boundaryProximity >= 0.95 || tbiScore >= 0.85) {
      targetState = 'TRANSITION';
    } else if (boundaryProximity >= 0.65 || (tbiScore >= 0.55 && structuralAmplification > 1.2)) {
      targetState = 'CRITICAL';
    } else if (boundaryProximity >= 0.35 || transitionMomentum > 0.30 || tbiScore >= 0.32) {
      targetState = 'WATCH';
    } else {
      targetState = 'NORMAL';
    }

    // 2. Temporal evidence accumulation and deadband hysteresis
    let suppressedByDeadband = false;
    let nextState = prev;

    if (targetState !== prev) {
      const isUpgrading = this.stateRank(targetState) > this.stateRank(prev);

      if (isUpgrading) {
        // Fast escalation for sudden shock (TRANSITION or SHOCK skips delay)
        if (targetState === 'SHOCK' || targetState === 'TRANSITION' || transitionMomentum > 1.0) {
          this.consecutiveEvidenceTicks = config.temporalEvidenceWindow;
        } else {
          this.consecutiveEvidenceTicks++;
        }

        if (this.consecutiveEvidenceTicks >= config.temporalEvidenceWindow) {
          nextState = targetState;
          this.consecutiveEvidenceTicks = 0;
        }
      } else {
        // De-escalation with deadband & asymmetric fast recovery
        const tbiDrop = this.previousTbiScore - tbiScore;
        // Asymmetric fast de-escalation: If hazard has collapsed (BP < 0.30 and TM < 0.15), immediately reset
        const isClearRecovery = boundaryProximity < 0.30 && transitionMomentum < 0.15 && !isShockActive;

        if (isClearRecovery) {
          nextState = targetState;
          this.consecutiveEvidenceTicks = 0;
        } else if (tbiDrop < config.deadbandWidth) {
          suppressedByDeadband = true;
          nextState = prev; // hold state to prevent chatter
        } else {
          this.consecutiveEvidenceTicks++;
          if (this.consecutiveEvidenceTicks >= config.temporalEvidenceWindow) {
            nextState = targetState;
            this.consecutiveEvidenceTicks = 0;
          }
        }
      }
    } else {
      this.consecutiveEvidenceTicks = 0;
    }

    this.currentState = nextState;
    this.previousTbiScore = tbiScore;

    return {
      operationalState: nextState,
      stateTransitionEvidence: this.consecutiveEvidenceTicks,
      isEscalation: this.stateRank(nextState) > this.stateRank(prev),
      isDeescalation: this.stateRank(nextState) < this.stateRank(prev),
      suppressedByDeadband
    };
  }

  private stateRank(s: OperationalRegimeState): number {
    switch (s) {
      case 'NORMAL': return 0;
      case 'WATCH': return 1;
      case 'CRITICAL': return 2;
      case 'TRANSITION': return 3;
      case 'SHOCK': return 4;
    }
  }
}
