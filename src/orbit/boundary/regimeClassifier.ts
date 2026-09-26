import { SystemState, StateVector, Regime, RegimeType, Constraint } from '../core/types';

/**
 * Regime Classifier:
 * Maps an instantaneous or projected state X to a behavioral regime:
 * - RECOVERABLE_EQUILIBRIUM: All constraints respected, positive safety margins.
 * - DEGRADED_OPERATIONAL: Minor soft constraints breached, but fully recoverable.
 * - CRITICAL_CASCADE: Hard constraint breached or rapid instability growth.
 * - COLLAPSED / IRREVERSIBLE_FAILURE: Unrecoverable regime loss.
 * 
 * Includes constraint checking, safety margins, and stability scoring.
 */

export class RegimeClassifier {
  /**
   * Evaluates the regime of a state vector given constraint definitions.
   */
  public classify(
    stateVector: StateVector,
    constraints: Constraint[] = []
  ): Regime {
    let hardViolations = 0;
    let softViolations = 0;
    let worstMargin = 1.0; // 1 = maximum safety margin, <= 0 = breached
    let totalPenalty = 0;

    for (const c of constraints) {
      // Find variable index
      const idx = stateVector.nodeMapping.findIndex(
        (m) => (!c.nodeId || m.nodeId === c.nodeId) && m.variableName === c.variableName
      );

      if (idx !== -1) {
        const val = stateVector.values[idx];
        const bound = stateVector.bounds[idx];
        const span = Math.max(1e-6, bound.max - bound.min);

        let isViolated = false;
        let margin = 1.0;

        switch (c.type) {
          case 'max':
            margin = (c.threshold - val) / span;
            if (val > c.threshold) isViolated = true;
            break;
          case 'min':
            margin = (val - c.threshold) / span;
            if (val < c.threshold) isViolated = true;
            break;
          case 'range':
            if (c.thresholdUpper !== undefined) {
              const marginLower = (val - c.threshold) / span;
              const marginUpper = (c.thresholdUpper - val) / span;
              margin = Math.min(marginLower, marginUpper);
              if (val < c.threshold || val > c.thresholdUpper) isViolated = true;
            }
            break;
        }

        if (margin < worstMargin) worstMargin = margin;

        if (isViolated) {
          totalPenalty += c.penaltyWeight;
          if (c.isHardConstraint) {
            hardViolations++;
          } else {
            softViolations++;
          }
        }
      }
    }

    // Regime Determination Logic
    if (hardViolations >= 2 || totalPenalty >= 80) {
      return {
        id: 'regime-collapsed',
        type: 'COLLAPSED',
        label: 'System Collapse',
        description: 'Multiple critical hard constraints violated. Irreversible systemic failure.',
        stabilityIndex: 0.05,
        severityRank: 4,
        isRecoverable: false
      };
    }

    if (hardViolations === 1 || totalPenalty >= 40) {
      return {
        id: 'regime-critical',
        type: 'CRITICAL_CASCADE',
        label: 'Critical Cascade Regime',
        description: 'Hard constraint breached. Exponential degradation risk requiring immediate intervention.',
        stabilityIndex: Math.max(0.1, 0.35 + worstMargin * 0.2),
        severityRank: 3,
        isRecoverable: true
      };
    }

    if (softViolations > 0 || worstMargin < 0.1) {
      return {
        id: 'regime-degraded',
        type: 'DEGRADED_OPERATIONAL',
        label: 'Degraded Operational Regime',
        description: 'Operational buffer depleted. Sub-optimal throughput with heightened sensitivity.',
        stabilityIndex: Math.max(0.4, 0.7 + worstMargin * 0.3),
        severityRank: 1,
        isRecoverable: true
      };
    }

    return {
      id: 'regime-equilibrium',
      type: 'RECOVERABLE_EQUILIBRIUM',
      label: 'Recoverable Equilibrium',
      description: 'Nominal operational envelope with healthy safety margins.',
      stabilityIndex: Math.min(1.0, 0.85 + Math.max(0, worstMargin) * 0.15),
      severityRank: 0,
      isRecoverable: true
    };
  }

  /**
   * Helper to quickly check if a transition occurred between two states.
   */
  public hasRegimeTransition(
    before: StateVector,
    after: StateVector,
    constraints: Constraint[] = []
  ): boolean {
    const regBefore = this.classify(before, constraints);
    const regAfter = this.classify(after, constraints);
    return regBefore.type !== regAfter.type;
  }
}
