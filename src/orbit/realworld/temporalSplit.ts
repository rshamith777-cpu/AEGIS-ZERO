/**
 * Strict Chronological Temporal Split Engine
 * 
 * Prevents future observation leakage.
 * Partitions temporal operational graphs into:
 * 1. TRAIN (60%): Distribution learning, baseline training
 * 2. VALIDATION (20%): Alarm threshold \tau_alarm tuning, persistence optimization
 * 3. FROZEN TEST (20%): Blind evaluation only (strictly untouched during tuning)
 */

import { SystemState } from '../core/types';

export interface TemporalDataSplit<TEvent> {
  train: {
    states: SystemState[];
    events: TEvent[];
    timestamps: number[];
  };
  validation: {
    states: SystemState[];
    events: TEvent[];
    timestamps: number[];
  };
  frozenTest: {
    states: SystemState[];
    events: TEvent[];
    timestamps: number[];
  };
}

export class TemporalSplitter {
  /**
   * Partitions states and labels chronologically into 60% Train, 20% Validation, 20% Frozen Test.
   */
  public static split<TEvent>(
    states: SystemState[],
    events: TEvent[],
    timestamps: number[],
    trainRatio: number = 0.60,
    valRatio: number = 0.20
  ): TemporalDataSplit<TEvent> {
    const total = states.length;
    if (total === 0) {
      throw new Error('Cannot split empty temporal dataset');
    }

    const trainEnd = Math.floor(total * trainRatio);
    const valEnd = Math.floor(total * (trainRatio + valRatio));

    return {
      train: {
        states: states.slice(0, trainEnd),
        events: events.slice(0, trainEnd),
        timestamps: timestamps.slice(0, trainEnd)
      },
      validation: {
        states: states.slice(trainEnd, valEnd),
        events: events.slice(trainEnd, valEnd),
        timestamps: timestamps.slice(trainEnd, valEnd)
      },
      frozenTest: {
        states: states.slice(valEnd),
        events: events.slice(valEnd),
        timestamps: timestamps.slice(valEnd)
      }
    };
  }
}
