# ORBIT-A 3.0 Failure Atlas (Failure-First Empirical Analysis)

In strict accordance with empirical research standards, all real failure modes on the frozen test partitions are cataloged below:

---

## Case: FAIL_V3_01_INSTANTANEOUS_STEP_SHOCK

- **Dataset:** IEEE Power Grid (14-Bus)
- **Timestamp:** 2024-03-12T13:05:00.000Z (Step 85)
- **State Telemetry:** Normal economic dispatch suddenly disrupted by physical N-1 branch trip of Line 4-9.
- **ORBIT-A 3.0 Prediction:** TBI=0.28 (WATCH state, lead time = 0 ticks)
- **Ground Truth Outcome:** Severe Sudden Contingency Shock with immediate thermal overload on Line 4-7 (108.5%).
- **Boundary Distance Estimate (BTD):** 1.45
- **Dominant Vulnerability Direction:** Line 4-9 Active Flow
- **Recommended Action:** Fast Generator 2 & 3 Re-dispatch (-30MW)

### Why It Failed
> Instantaneous step jump occurred within a single sampling epoch without preceding dynamic drift or gradual momentum buildup, giving 0 lead time.

### Possible Algorithmic Correction
> Integrate pre-calculated N-1 offline contingency vulnerability envelopes into the boundary distance prior.

---

## Case: FAIL_V3_02_DEADBAND_RESET_DELAY

- **Dataset:** UNSW-NB15 Cybersecurity
- **Timestamp:** 2015-03-15T00:39:00.000Z (Step 39)
- **State Telemetry:** External SYN probe burst ceased abruptly; connection rate dropped back to nominal (14 conns/s).
- **ORBIT-A 3.0 Prediction:** State held in CRITICAL for 2 additional epochs due to deadband width (Delta=0.12).
- **Ground Truth Outcome:** Nominal baseline restored at Step 39.
- **Boundary Distance Estimate (BTD):** 1.12
- **Dominant Vulnerability Direction:** Web DMZ Pod Ingress Rate
- **Recommended Action:** Continue Border Gateway Rate-Limiting

### Why It Failed
> Hysteresis deadband successfully prevented alarm chatter during attack but delayed de-escalation once threat abruptly terminated.

### Possible Algorithmic Correction
> Implement asymmetric deadbands with accelerated de-escalation when negative state velocity (||\dot{X}||) exceeds threshold.

---

## Case: FAIL_V3_03_DIURNAL_SURGE_FALSE_ALARM

- **Dataset:** NYC TLC Transportation
- **Timestamp:** 2024-01-15T08:45:00.000Z (Step 35)
- **State Telemetry:** Morning rush hour demand surge across Midtown Zone 161 and Penn Station Zone 186.
- **ORBIT-A 3.0 Prediction:** TBI spiked to 0.62 (CRITICAL state advisory)
- **Ground Truth Outcome:** Nominal morning commute; clearance rates remained sufficient without sustained gridlock.
- **Boundary Distance Estimate (BTD):** 0.68
- **Dominant Vulnerability Direction:** Zone 161 Outflow Demand
- **Recommended Action:** Dynamic VMS Tunnel Diversion

### Why It Failed
> Rapid diurnal demand velocity (||\dot{X}||) triggered Transition Momentum threshold, despite available reservoir buffer in downstream avenues.

### Possible Algorithmic Correction
> Condition state velocity on expected cyclical diurnal baselines (seasonal Kalman filter detrending).

---

