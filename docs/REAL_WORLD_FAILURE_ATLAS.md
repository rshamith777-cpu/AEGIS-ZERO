# Real-World Failure Atlas: ORBIT-A 2.0 Adversarial & Error Case Audit

In adherence to scientific integrity, this document cataloges real failure cases where ORBIT-A 2.0 triggered false alarms, experienced detection lag, or hovered inside hysteresis deadbands.

## Failure Case: `FN_NYC_TLC_Transport_0` (FALSE_NEGATIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 0)
- **Predicted Crossing Probability:** 58.1% | **Actual Event Occurred:** YES
- **Root Cause Component:** `Temporal Persistence Filter Lag`
- **Mathematical Explanation:** The regime transition manifested within a single abrupt time window. The temporal persistence requirement (k=2) delayed alarm escalation until after the boundary crossing had already occurred.
- **Remedial Architectural Improvement:** Implement dynamic acceleration trigger: if d(Risk)/dt exceeds critical surge velocity, bypass temporal persistence window.

## Failure Case: `FP_NYC_TLC_Transport_1` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 1)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_2` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 2)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_3` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 3)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_4` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 4)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_5` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 5)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_6` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 6)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_7` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 7)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_8` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 8)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_9` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 9)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_10` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 10)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_11` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 11)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_12` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 12)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_13` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 13)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_14` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 14)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_15` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 15)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_16` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 16)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_17` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 17)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

## Failure Case: `FP_NYC_TLC_Transport_18` (FALSE_POSITIVE)
- **Dataset:** NYC_TLC_Transport (TimeStep: 18)
- **Predicted Crossing Probability:** 100.0% | **Actual Event Occurred:** NO
- **Root Cause Component:** `Directional Risk / Worst-Case Ray Projection`
- **Mathematical Explanation:** A localized temporary flow burst aligned with a sensitive boundary ray caused P_cross to spike above threshold, even though surrounding graph corridors possessed surplus reserve capacity that absorbed the shock.
- **Remedial Architectural Improvement:** Introduce graph-wide residual absorption capacity term into contextual distance denominator.

