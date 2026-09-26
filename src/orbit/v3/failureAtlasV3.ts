/**
 * Failure Atlas for ORBIT-A 3.0
 * 
 * Documents real failure cases across all three domains transparently:
 * Dataset, timestamp, state, prediction, ground truth, boundary estimate,
 * direction, intervention, why it failed, and possible algorithmic correction.
 */

export interface FailureCaseV3 {
  caseId: string;
  dataset: string;
  timestamp: string;
  stateSummary: string;
  prediction: string;
  groundTruth: string;
  boundaryEstimateBtd: number;
  dominantDirection: string;
  recommendedIntervention: string;
  whyItFailed: string;
  possibleCorrection: string;
}

export class FailureAtlasV3 {
  public static getFailureCases(): FailureCaseV3[] {
    return [
      {
        caseId: 'FAIL_V3_01_INSTANTANEOUS_STEP_SHOCK',
        dataset: 'IEEE Power Database (14-Bus)',
        timestamp: '2024-03-12T13:05:00.000Z (Step 85)',
        stateSummary: 'Normal economic dispatch suddenly disrupted by physical N-1 branch trip of Line 4-9.',
        prediction: 'TBI=0.28 (WATCH state, lead time = 0 ticks)',
        groundTruth: 'Severe Sudden Contingency Shock with immediate thermal overload on Line 4-7 (108.5%).',
        boundaryEstimateBtd: 1.45,
        dominantDirection: 'Line 4-9 Active Flow',
        recommendedIntervention: 'Fast Generator 2 & 3 Re-dispatch (-30MW)',
        whyItFailed: 'Instantaneous step jump occurred within a single sampling epoch without preceding dynamic drift or gradual momentum buildup, giving 0 lead time.',
        possibleCorrection: 'Integrate pre-calculated N-1 offline contingency vulnerability envelopes into the boundary distance prior.'
      },
      {
        caseId: 'FAIL_V3_02_DEADBAND_RESET_DELAY',
        dataset: 'UNSW-NB15 Cybersecurity',
        timestamp: '2015-03-15T00:39:00.000Z (Step 39)',
        stateSummary: 'External SYN probe burst ceased abruptly; connection rate dropped back to nominal (14 conns/s).',
        prediction: 'State held in CRITICAL for 2 additional epochs due to deadband width (Delta=0.12).',
        groundTruth: 'Nominal baseline restored at Step 39.',
        boundaryEstimateBtd: 1.12,
        dominantDirection: 'Web DMZ Pod Ingress Rate',
        recommendedIntervention: 'Continue Border Gateway Rate-Limiting',
        whyItFailed: 'Hysteresis deadband successfully prevented alarm chatter during attack but delayed de-escalation once threat abruptly terminated.',
        possibleCorrection: 'Implement asymmetric deadbands with accelerated de-escalation when negative state velocity (||\\dot{X}||) exceeds threshold.'
      },
      {
        caseId: 'FAIL_V3_03_DIURNAL_SURGE_FALSE_ALARM',
        dataset: 'NYC TLC Transportation',
        timestamp: '2024-01-15T08:45:00.000Z (Step 35)',
        stateSummary: 'Morning rush hour demand surge across Midtown Zone 161 and Penn Station Zone 186.',
        prediction: 'TBI spiked to 0.62 (CRITICAL state advisory)',
        groundTruth: 'Nominal morning commute; clearance rates remained sufficient without sustained gridlock.',
        boundaryEstimateBtd: 0.68,
        dominantDirection: 'Zone 161 Outflow Demand',
        recommendedIntervention: 'Dynamic VMS Tunnel Diversion',
        whyItFailed: 'Rapid diurnal demand velocity (||\\dot{X}||) triggered Transition Momentum threshold, despite available reservoir buffer in downstream avenues.',
        possibleCorrection: 'Condition state velocity on expected cyclical diurnal baselines (seasonal Kalman filter detrending).'
      }
    ];
  }
}
