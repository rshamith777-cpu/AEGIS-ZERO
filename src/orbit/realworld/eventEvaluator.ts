/**
 * Real-World Operational Event Evaluator
 * 
 * Computes warning lead times, false alarm penalties, missed events, and intervention efficacy
 * using strictly information legitimately available at prediction time.
 */

import { PredictionEvaluationPoint, ResearchMetricsV2, MetricsCalculatorV2 } from './metricsV2';
import { BaselinePrediction } from './baselinesV2';

export interface OperationalGroundTruthEvent {
  timestamp: number;
  timeStepIndex: number;
  isEvent: boolean;
  eventDescription: string;
}

export class RealWorldEventEvaluator {
  /**
   * Compares model predictions against ground truth operational events.
   * Calculates warning lead time prior to event onset.
   */
  public static evaluatePredictions(
    predictions: BaselinePrediction[],
    events: OperationalGroundTruthEvent[],
    timestamps: number[],
    stepMinutes: number = 15,
    optimalCostReference: number = 20.0,
    emergencyCost: number = 80.0,
    runtimeMs: number = 0,
    memoryMb: number = 0
  ): {
    points: PredictionEvaluationPoint[];
    metrics: ResearchMetricsV2;
  } {
    const points: PredictionEvaluationPoint[] = [];
    const N = Math.min(predictions.length, events.length);

    // Identify contiguous event intervals to calculate true warning lead time
    const eventOnsetIndices: number[] = [];
    for (let i = 0; i < N; i++) {
      if (events[i].isEvent && (i === 0 || !events[i - 1].isEvent)) {
        eventOnsetIndices.push(i);
      }
    }

    for (let i = 0; i < N; i++) {
      const pred = predictions[i];
      const actual = events[i];

      // Calculate lead time: if alarm is triggered before an upcoming event
      let warningLeadTimeMinutes = 0;
      if (pred.binaryAlarm) {
        // Find nearest upcoming or concurrent event onset
        const nextEvent = eventOnsetIndices.find((onset) => onset >= i && onset <= i + 6);
        if (nextEvent !== undefined) {
          warningLeadTimeMinutes = (nextEvent - i) * stepMinutes;
        } else if (actual.isEvent) {
          warningLeadTimeMinutes = stepMinutes; // detected during event
        }
      }

      points.push({
        timestamp: timestamps[i] || actual.timestamp,
        timeStepIndex: i,
        predictedProbability: pred.probability,
        binaryAlarm: pred.binaryAlarm,
        groundTruthEvent: actual.isEvent,
        warningLeadTimeMinutes,
        interventionCost: pred.binaryAlarm ? pred.interventionCost : 0,
        interventionSucceeded: pred.interventionSucceeded,
        optimalCost: actual.isEvent ? optimalCostReference : 0
      });
    }

    const metrics = MetricsCalculatorV2.computeMetrics(
      points,
      stepMinutes,
      optimalCostReference * 2.0,
      emergencyCost,
      runtimeMs,
      memoryMb
    );

    return { points, metrics };
  }
}
