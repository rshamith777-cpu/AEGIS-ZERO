/**
 * Adaptive Alarm Policy, Hysteresis, and Temporal Persistence Engine for ORBIT-A 2.0
 * 
 * 1. Boundary Risk Score: BR = P_cross * (1 / (BTD_contextual + \epsilon))
 * 2. Adaptive Alarm Policy: Warning triggered when BR >= \tau_alarm (calibrated on validation data)
 * 3. Hysteresis: Alarm stays active until risk drops below \tau_low = \tau_alarm - \Delta_hyst
 * 4. Temporal Persistence: Requires k consecutive operational frames of elevated risk to escalate
 */

import { OrbitV2Config, AlarmPolicyResult } from './types';

export class AlarmPolicyEngine {
  private consecutiveAlertCount: number = 0;
  private currentAlarmState: boolean = false;
  private calibratedThreshold: number;

  constructor(calibratedThreshold?: number) {
    this.calibratedThreshold = calibratedThreshold ?? 0.45;
  }

  public setCalibratedThreshold(threshold: number): void {
    this.calibratedThreshold = threshold;
  }

  public getCalibratedThreshold(): number {
    return this.calibratedThreshold;
  }

  public resetState(): void {
    this.consecutiveAlertCount = 0;
    this.currentAlarmState = false;
  }

  /**
   * Computes Boundary Risk Score (BR):
   * BR = P_cross \cdot \frac{1}{BTD_{contextual} + 0.10}
   * Scaled into [0, 1].
   */
  public computeBoundaryRiskScore(pCross: number, contextualBtd: number): number {
    const rawRatio = pCross / (Math.max(0.01, contextualBtd) + 0.10);
    // Sigmoidal saturation to bound nicely within [0, 1]
    const normalizedScore = 1.0 - Math.exp(-0.75 * rawRatio);
    return Number(normalizedScore.toFixed(4));
  }

  /**
   * Evaluates the adaptive alarm policy with hysteresis and temporal persistence.
   */
  public evaluateAlarmPolicy(
    riskScore: number,
    config: OrbitV2Config
  ): AlarmPolicyResult {
    const tauHigh = this.calibratedThreshold;
    const tauLow = Math.max(0.05, tauHigh - config.hysteresisDeadband);
    const requiredPersistence = Math.max(1, config.persistenceWindow);

    let inDeadband = false;

    // Check raw risk against threshold
    if (riskScore >= tauHigh) {
      this.consecutiveAlertCount++;
    } else if (riskScore <= tauLow) {
      // Risk has safely de-escalated below lower hysteresis boundary
      this.consecutiveAlertCount = 0;
      this.currentAlarmState = false;
    } else {
      // Risk is in deadband: maintain current alarm state (hysteresis active)
      inDeadband = true;
      if (!this.currentAlarmState) {
        this.consecutiveAlertCount = 0;
      }
    }

    // Temporal persistence check
    const persistenceSatisfied = this.consecutiveAlertCount >= requiredPersistence;

    if (persistenceSatisfied) {
      this.currentAlarmState = true;
    }

    // Determine alarm escalation severity level
    let alarmLevel: 'NORMAL' | 'ADVISORY' | 'ELEVATED' | 'CRITICAL_ESCAPE' = 'NORMAL';
    if (this.currentAlarmState) {
      if (riskScore >= 0.80) {
        alarmLevel = 'CRITICAL_ESCAPE';
      } else if (riskScore >= 0.60) {
        alarmLevel = 'ELEVATED';
      } else {
        alarmLevel = 'ADVISORY';
      }
    }

    return {
      alarmTriggered: this.currentAlarmState,
      rawRiskScore: riskScore,
      alarmLevel,
      consecutiveAlertsCount: this.consecutiveAlertCount,
      persistenceSatisfied,
      inHysteresisDeadband: inDeadband,
      calibratedThreshold: tauHigh
    };
  }
}
