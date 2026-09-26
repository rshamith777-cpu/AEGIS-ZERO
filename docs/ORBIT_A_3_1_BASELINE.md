# ORBIT-A 3.1 — Architectural & Research Baseline Audit

**Audit Date:** 2026-09-24  
**Project:** AEGIS ZERO / ORBIT-A 3.0 $\rightarrow$ ORBIT-A 3.1  
**Status:** Frozen Baseline Established  

---

## 1. Current Architecture

ORBIT-A is organized into layered algorithmic subsystems:
* **ORBIT-A Core (`src/orbit/core/`)**:
  * State vector compilation (`systemStateToVector`, `vectorToSystemState`).
  * Typed constraints (min, max, range, conservation, topological), generic interventions, and graph topologies.
* **ORBIT-A v1 (`src/orbit/boundary/`, `src/orbit/benchmark/`, `src/orbit/orbitEngine.ts`)**:
  * Directional boundary analysis along perturbation rays.
  * Analytical Boundary Transition Distance (BTD).
  * 10 benchmark scenario families with 7 comparative baselines.
* **ORBIT-A v2 (`src/orbit/v2/`, `src/orbit/realworld/`)**:
  * Real-world domain adapters: NYC TLC yellow taxi, UNSW-NB15 cybersecurity, IEEE 14-bus electrical grid.
  * Temporal split verification (60% Train, 20% Val, 20% Frozen Test).
  * Metrics suite: BTDE, BDR, FAR, MIR, Lead Time.
* **ORBIT-A 3.0 (`src/orbit/v3/`)**:
  * **Four Core Quantities**: Boundary Proximity (BP), Transition Momentum (TM), Structural Amplification (SA), Intervention Leverage (IL).
  * **Composite Metric**: Transition Boundary Intelligence (TBI) composite score.
  * **Adaptive Boundary Search**: Dynamic proposal ray generation with binary search boundary convergence.
  * **Importance Screening & Interaction Discovery**: Variance and velocity screening to bound candidate search dimension, pairwise feature interaction evaluation.
  * **Adaptive State Policy**: 4-state operational machine (`NORMAL`, `WATCH`, `CRITICAL`, `TRANSITION`) with deadband hysteresis and asymmetric de-escalation.
  * **MEI-2 Optimizer**: Multi-action portfolio escape optimization solving $\min \text{Cost}(U)$ subject to $P_{\text{trans}} < \tau$, $\text{BTD} \ge \text{margin}$, $\text{Impact} \le \text{limit}$.
  * **Adversarial Laboratory**: 17 stress test conditions (sensor dropout, latency delays, Gaussian/heavy-tailed noise, unmonitored nodes/edges).

---

## 2. Current Algorithms

* **Boundary Proximity (BP)**: Normalizes minimum distance across active constraints: $\text{BP} = 1.0 - \min(1.0, \text{BTD} / \text{safeBtdMargin})$.
* **Transition Momentum (TM)**: Velocity projection along gradient/boundary normals with temporal windowing.
* **Structural Amplification (SA)**: Spectral graph amplification measuring cascade vulnerability across severed or high-centrality corridors.
* **Intervention Leverage (IL)**: Controllability quotient evaluating the actionable perturbation budget.
* **TBI Composite**: Linear convex combination $w_{\text{bp}} \text{BP} + w_{\text{tm}} \text{TM} + w_{\text{sa}} \text{SA} + w_{\text{il}} (1 - \text{IL})$.
* **Adaptive Boundary Search**: Directional proposals derived from VELOCITY, CENTRALITY, SENSITIVITY, with compiled constraint evaluation eliminating un-indexed scanning.

---

## 3. Current Datasets & Provenance Status

* **NYC TLC Yellow Taxi Data (`nycTlcAdapter.ts`)**:
  * Aggregated trip pickup/dropoff counts across Manhattan zones.
  * Event definition: Congestion gridlock / throughput collapse events.
  * Provenance: Public NYC Taxi & Limousine Commission records.
* **UNSW-NB15 Cyber Intrusion Data (`unswNb15Adapter.ts`)**:
  * Flow records transformed into IP communication graphs.
  * Event definition: Exploits, DoS, and reconnaissance transitions.
  * Provenance: Synthetic/captured testbed network benchmark (UNSW Canberra).
  * *Audit Note*: Previously labeled loosely as "network telemetry"; requires formal designation as benchmark flow dataset.
* **IEEE 14-Bus Power Grid (`powerGridAdapter.ts`)**:
  * 14-bus transmission system telemetry with voltage/frequency/load metrics.
  * *Audit Note*: Generated via physical AC power flow simulation from the IEEE 14-bus topology. Must be explicitly labeled as *simulated telemetry* rather than live physical grid telemetry.

---

## 4. Current Metrics

1. **Nominal Prediction**: F1-Score, AUROC, AUPRC, Expected Calibration Error (ECE).
2. **Boundary Intelligence**: Boundary Transition Distance Error (BTDE), Boundary Recall (BDR), Directional Vulnerability Accuracy (DirAcc), Warning Lead Time.
3. **Intervention Decision Value**: Escape Efficiency ($\eta = \Delta \text{BTD} / \text{Cost}$), Expected Loss Avoided, Operational Regret (MIR).
4. **Operational Robustness**: False Alarms per Day (FAR), Latency per Evaluation, Stability Index under Noise.

---

## 5. Current Benchmark Results (Frozen v3 Suite)

### Four Independent Leaderboards on Frozen Test:
1. **Nominal Prediction**:
   * Gradient Boosting: AUROC 0.99, F1 0.84, ECE 0.05 (Leads nominal forecasting)
   * ORBIT-A 3.0: AUROC 0.92, F1 0.81, ECE 0.07
2. **Boundary Intelligence**:
   * ORBIT-A 3.0: BTDE 0.11, Boundary Recall 0.94, DirAcc 0.89, Lead Time 45m (Leads transition intelligence)
   * Gradient Boosting: BTDE 0.65, Boundary Recall 0.74, DirAcc 0.45, Lead Time 14m
3. **Intervention Decision Value**:
   * ORBIT-A 3.0 (MEI-2): Escape Efficiency 1.18, Loss Avoided \$94.5k, Regret 0.06 (Leads intervention value)
   * Forecast + Threshold: Escape Efficiency 0.45, Loss Avoided \$60.0k, Regret 0.38
4. **Operational Robustness**:
   * ORBIT-A 3.0: False Alarms/Day 5.6, Latency 16.2ms, Stability 0.94
   * ORBIT-A v1: False Alarms/Day 91.0, Latency 35.1ms, Stability 0.70

---

## 6. Current Frontend

* **AEGIS ZERO Web Client**: React 19 + TypeScript + Vite.
* **Components**: Three.js Digital Twin (`ThreeWorld`), `OrbitLab`, `RealWorldDashboard`, `ContextIntelligencePanel`, `AgentWarRoom`, `CausalRadar`, `FutureLab`, `ChaosDock`.
* **State**: In-memory React state with simulated mock data transitions; lacks a dedicated HTTP API client interface for decoupled backend services.

---

## 7. Current API Status

* Currently, all ORBIT execution is bound within the frontend bundle or executed via CLI scripts (`npx tsx`).
* No independent HTTP REST API service currently exists. All API endpoints (`/api/analyze`, `/api/boundary`, `/api/intervention`, `/api/shock/analyze`, `/api/datasets`) need to be formally implemented and served via a decoupled backend service.

---

## 8. Current Tests

* **Total Tests**: **59 / 59 passed (100.0%)** via `npm run test:orbit`.
  * 36 Core ORBIT-A v1 / benchmark tests.
  * 13 V3 regression tests (TBI, state policy, deadband, MEI-2, structural amplification).
  * 10 Constraint compilation, edge-case, and reference equivalence tests.

---

## 9. Current Build Status

* Production bundle builds cleanly in **3.46s** via `tsc -b && vite build`.
* Zero TypeScript errors, zero bundling errors.

---

## 10. Current Scalability Profile

* **Empirical Scalability ($N=1000$, 2000 state variables, 200 proposal rays)**:
  * Mean End-to-End Latency: **32.57 ms** (Meets $\le 50$ms target).
  * Adaptive Boundary Search Latency: **4.12 ms** (down from 683.78 ms).
  * Empirical Complexity Slope: **0.709** ($O(N)$ linear scaling).
  * Dominant Stage: Structural Amplification (13.08 ms, 40.1%).

---

## 11. Known Limitations to Address in ORBIT-A 3.1

1. **Absence of a Formal HTTP REST API**: Decoupled backend service missing.
2. **Interaction Order Depth**: Current interaction discovery is limited to order-2 pairwise heuristics; order-3 triple interactions with adaptive information gain stopping are not yet implemented.
3. **Instantaneous Shock Blindspot**: ORBIT-A 3.0 models transitions as gradual or accelerating paths; mathematically abrupt step shocks lacking pre-shock evidence are not isolated into an explicit `SHOCK` operational state with post-shock recovery analysis.
4. **Data Provenance Ambiguity**: IEEE 14-bus data is generated by simulation but not visually or semantically badged as `SIMULATED`; external data provenance panel missing in frontend.
5. **Pre-Shock Vulnerability Priors**: Lack of structural prior over vulnerable topology corridors before events manifest.
