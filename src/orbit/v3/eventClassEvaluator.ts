/**
 * Event Class Evaluator for ORBIT-A 3.0
 * 
 * Evaluates operational transition performance SEPARATELY across:
 * A. Gradual transition (slow drift, margin degradation)
 * B. Accelerating transition (non-linear acceleration, cascading loss)
 * C. Sudden shock (instantaneous disruption, step function)
 * 
 * Never combines these classes into a single score.
 */

import { TransitionEventClass } from './types';

export interface EventClassEvaluationResult {
  eventClass: TransitionEventClass;
  totalEventSteps: number;
  detectedCount: number;
  recall: number;
  precision: number;
  f1Score: number;
  medianLeadTimeTicks: number;
  escapeEfficiency: number;
  lossAvoidedPct: number;
}

export class EventClassEvaluator {
  public static evaluateByClass(
    predictions: Array<{ alarm: boolean; leadTimeTicks: number; escapeEff: number; lossAvoided: number }>,
    groundTruths: Array<{ isEvent: boolean; eventClass: TransitionEventClass }>
  ): Record<TransitionEventClass, EventClassEvaluationResult> {
    const classes: TransitionEventClass[] = [
      'GRADUAL_TRANSITION',
      'ACCELERATING_TRANSITION',
      'SUDDEN_SHOCK'
    ];

    const results: Record<TransitionEventClass, EventClassEvaluationResult> = {
      GRADUAL_TRANSITION: {
        eventClass: 'GRADUAL_TRANSITION',
        totalEventSteps: 0,
        detectedCount: 0,
        recall: 0,
        precision: 0,
        f1Score: 0,
        medianLeadTimeTicks: 0,
        escapeEfficiency: 0,
        lossAvoidedPct: 0
      },
      ACCELERATING_TRANSITION: {
        eventClass: 'ACCELERATING_TRANSITION',
        totalEventSteps: 0,
        detectedCount: 0,
        recall: 0,
        precision: 0,
        f1Score: 0,
        medianLeadTimeTicks: 0,
        escapeEfficiency: 0,
        lossAvoidedPct: 0
      },
      SUDDEN_SHOCK: {
        eventClass: 'SUDDEN_SHOCK',
        totalEventSteps: 0,
        detectedCount: 0,
        recall: 0,
        precision: 0,
        f1Score: 0,
        medianLeadTimeTicks: 0,
        escapeEfficiency: 0,
        lossAvoidedPct: 0
      }
    };

    for (const c of classes) {
      let totalSteps = 0;
      let tp = 0;
      let fp = 0;
      let fn = 0;
      const leadTimes: number[] = [];
      let totalEff = 0;
      let totalLossAvoided = 0;

      for (let i = 0; i < groundTruths.length; i++) {
        const gt = groundTruths[i];
        const pred = predictions[i] || { alarm: false, leadTimeTicks: 0, escapeEff: 0, lossAvoided: 0 };

        if (gt.isEvent && gt.eventClass === c) {
          totalSteps++;
          if (pred.alarm) {
            tp++;
            leadTimes.push(pred.leadTimeTicks);
            totalEff += pred.escapeEff;
            totalLossAvoided += pred.lossAvoided;
          } else {
            fn++;
          }
        } else if (!gt.isEvent && pred.alarm) {
          // Attribute fractional false alarm to background
          fp += 0.33;
        }
      }

      const rec = totalSteps > 0 ? tp / totalSteps : 0.0;
      const prec = tp + fp > 0 ? tp / (tp + fp) : 0.0;
      const f1 = prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0.0;

      leadTimes.sort((a, b) => a - b);
      const mwt = leadTimes.length > 0 ? leadTimes[Math.floor(leadTimes.length / 2)] : 0;
      const meanEff = tp > 0 ? totalEff / tp : 0.0;
      const meanLossAvoided = tp > 0 ? Math.min(100.0, totalLossAvoided / tp) : 0.0;

      results[c] = {
        eventClass: c,
        totalEventSteps: totalSteps,
        detectedCount: tp,
        recall: Number(rec.toFixed(3)),
        precision: Number(prec.toFixed(3)),
        f1Score: Number(f1.toFixed(3)),
        medianLeadTimeTicks: mwt,
        escapeEfficiency: Number(meanEff.toFixed(3)),
        lossAvoidedPct: Number(meanLossAvoided.toFixed(1))
      };
    }

    return results;
  }
}
