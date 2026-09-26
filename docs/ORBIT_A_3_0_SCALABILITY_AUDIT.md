# ORBIT-A 3.0: Empirical Scalability, Runtime Complexity & Ray Instrumentation Audit

**Audit Date:** September 24, 2026  
**Auditor Role:** Senior ML Systems Engineer, Research Engineer, Software Auditor & QA Engineer  
**System:** ORBIT-A 3.0 (Operational Resilience Boundary & Inference Transform)  
**Workspace:** `c:\Users\SUMITH R\Desktop\AEGIS ZERO`  

---

## 1. Executive Summary

A critical measurement and reporting defect in the previous complexity benchmark was identified and corrected:
1. **Reporting Column Shift Defect:** The table header contained 7 columns (`N | Variables | Latency (ms) | Memory Delta (KB) | Ray Evals | Active Features | Discovered Interactions`), but the benchmark printed only 6 fields. The instrumented `rayEvaluationCount` was omitted, causing `res.screenedActiveVariables.length` to be printed in the `Ray Evals` column and shifting all downstream columns.
2. **Ray Instrumentation Added:** True instrumentation was integrated into [`src/orbit/v3/adaptiveBoundarySearch.ts`](file:///c:/Users/SUMITH%20R/Desktop/AEGIS%20ZERO/src/orbit/v3/adaptiveBoundarySearch.ts) and exposed via `OrbitV3AnalysisResult.rayEvaluationCount` in [`src/orbit/v3/types.ts`](file:///c:/Users/SUMITH%20R/Desktop/AEGIS%20ZERO/src/orbit/v3/types.ts). The counter increments strictly when the state is evaluated against constraint boundaries along proposal rays.
3. **Statistical Rigor:** The benchmark was upgraded from single-shot execution to **1 warm-up run + 5 measured runs per dimension** across $N \in [10, 50, 100, 250, 500, 1000]$.
4. **1000-Node Target Assessment:** At $N=1000$ ($D=2000$ state variables, 200 constraints), total inference latency is **801.14 ms** (mean) / **730.53 ms** (median). **ORBIT-A 3.0 does NOT meet the $\le 50\text{ ms}$ real-time budget at $N=1000$ on CPU**. The dominant bottleneck is the $O(|C| \cdot D)$ un-indexed constraint boundary check inside Adaptive Boundary Search (accounting for 85.4% of total runtime).

---

## 2. Environment

* **Node Version:** `v24.11.0`
* **OS / Platform:** `win32 x64` (Windows)
* **CPU:** `AMD Ryzen 5 3500U with Radeon Vega Mobile Gfx` (4 Cores / 8 Threads)
* **RAM:** `6 GB System RAM`
* **Execution Engine:** `npx tsx` (TypeScript ESM JIT Execution)
* **Project Repository:** Standalone directory (`c:\Users\SUMITH R\Desktop\AEGIS ZERO`)

---

## 3. Benchmark Methodology

* **Synthetic Topology:** Deterministic 1D corridor chain with $N$ substations, 2 state variables per node (`val1`, `val2`) resulting in $D = 2N$ continuous state variables. Directed corridor edges with active flows.
* **Constraints:** Hard minimum constraints on `val1` (`threshold: 0.85`, `penaltyWeight: 10.0`) defined on every 5th node ($|C| = N / 5$).
* **Candidate Interventions:** Dimension-safe candidate portfolio:
  - Action 1: Target `node_0`, variable `val1`, increment $+0.1$, cost 10.0.
  - Action 2: Target `node_1` (or `node_0` if $N=1$), variable `val2`, increment $-10.0$, cost 5.0.
* **Repetition Protocol:** 1 un-timed warm-up execution per dimension to prime JIT compiler and initialize allocation pools, followed by 5 timed measured runs.
* **Memory Methodology:** `global.gc?.()` invoked before measurement when available. Explicitly reported as **Approx Heap Delta (KB)** (`heapUsed` difference between start and end of inference). RSS and Heap Total also collected.

---

## 4. Main Results

### Exact Single-Run Verified Output (Task 3 Format)

```text
N | Variables | Latency (ms) | Memory Delta (KB) | Ray Evals | Active Features | Discovered Interactions
---|---|---|---|---|---|---
10 | 20 | 1.63 | 523 | 200 | 16 | 10
50 | 100 | 6.57 | 639 | 200 | 16 | 10
100 | 200 | 10.15 | 0 | 200 | 16 | 10
250 | 500 | 31.01 | 0 | 200 | 16 | 10
500 | 1000 | 114.33 | 0 | 200 | 16 | 10
1000 | 2000 | 523.28 | 0 | 200 | 16 | 10
```

### Statistical Suite Results (1 Warm-up + 5 Measured Runs per N)

| $N$ | Variables ($D$) | Mean ms | Median ms | Std ms | Min ms | Max ms | Approx Heap Delta (KB) | Ray Evals | Active Features | Discovered Interactions |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **10** | 20 | 0.35 | 0.34 | 0.04 | 0.29 | 0.41 | 149.8 | 200 | 16 | 10 |
| **50** | 100 | 1.51 | 1.44 | 0.12 | 1.42 | 1.75 | 325.3 | 200 | 16 | 10 |
| **100** | 200 | 6.37 | 5.62 | 1.12 | 5.17 | 7.87 | 549.4 | 200 | 16 | 10 |
| **250** | 500 | 25.38 | 25.25 | 0.30 | 25.02 | 25.86 | 1197.4 | 200 | 16 | 10 |
| **500** | 1000 | 174.98 | 174.39 | 16.49 | 154.19 | 202.83 | 1782.0 | 200 | 16 | 10 |
| **1000** | 2000 | 801.14 | 730.53 | 192.90 | 611.53 | 1155.65 | 2737.2 | 200 | 16 | 10 |

---

## 5. Stage-Level Timing Breakdown

Microsecond instrumentation across all 9 pipeline stages (mean ms per stage):

| Pipeline Stage | $N=10$ | $N=50$ | $N=100$ | $N=250$ | $N=500$ | $N=1000$ | % of Total ($N=1000$) |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **State Vector Construction** | 0.016 | 0.056 | 0.159 | 0.160 | 0.518 | 3.401 | 0.42% |
| **Feature Screening** | 0.005 | 0.022 | 0.057 | 0.136 | 0.696 | 2.711 | 0.34% |
| **Interaction Discovery** | 0.025 | 0.050 | 0.106 | 0.156 | 0.601 | 2.843 | 0.35% |
| **Directional Proposals** | 0.067 | 0.138 | 0.564 | 1.836 | 13.225 | 54.301 | 6.78% |
| **Adaptive Boundary Search** | **0.095** | **0.904** | **4.356** | **20.207** | **142.085** | **683.780** | **85.35%** |
| **Transition Momentum** | 0.038 | 0.008 | 0.028 | 0.032 | 0.172 | 0.240 | 0.03% |
| **Structural Amplification** | 0.060 | 0.256 | 0.860 | 1.938 | 11.334 | 32.931 | 4.11% |
| **MEI-2 Optimization** | 0.022 | 0.057 | 0.203 | 0.852 | 6.290 | 20.846 | 2.60% |
| **TBI & State Policy** | 0.006 | 0.005 | 0.008 | 0.029 | 0.017 | 0.031 | 0.00% |
| **Total Inference Time** | **0.35** | **1.51** | **6.37** | **25.38** | **174.98** | **801.14** | **100.0%** |

---

## 6. Scaling Metrics & Densities

| $N$ | Variables ($D$) | Feature Reduction ($D / K$) | Interaction Density ($I / K$) | Ray Eval Density ($\text{Rays} / D$) | Latency / Var ($\mu\text{s}$) | Latency Growth (vs $N=10$) |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **10** | 20 | 1.3x | 0.625 | 10.0000 | 17.38 | 1.00x |
| **50** | 100 | 6.3x | 0.625 | 2.0000 | 15.12 | 4.35x |
| **100** | 200 | 12.5x | 0.625 | 1.0000 | 31.84 | 18.32x |
| **250** | 500 | 31.3x | 0.625 | 0.4000 | 50.76 | 73.03x |
| **500** | 1000 | 62.5x | 0.625 | 0.2000 | 174.98 | 503.48x |
| **1000** | 2000 | 125.0x | 0.625 | 0.1000 | 400.57 | 2305.16x |

---

## 7. Empirical Complexity Analysis

* **Empirical Log-Log Regression Slope:** $\alpha = 1.707$
* **Complexity Class Classification:** $\mathcal{O}(N^2)$ (Quadratic).
* **Mathematical Derivation:**
  1. High-dimensional importance screening bounds the active proposal subspace to $K = 16$.
  2. Proposal distribution generates $M = 32$ candidate rays.
  3. However, checking each candidate ray in `isStateBreached` iterates over all constraints $|C|$ and all dimension indices $D$:
     $$\text{Work per ray check} = \mathcal{O}(|C| \cdot D)$$
     Since both $|C| \propto N$ (constraints on substations) and $D \propto N$ (variables per substation), evaluating a candidate state vector takes $\mathcal{O}(N^2)$ scalar comparisons.
  4. Across 200 ray evaluations per step, the total boundary check work scales as:
     $$\mathcal{O}(R \cdot |C| \cdot D) = \mathcal{O}(R \cdot N^2)$$
     At $N=1000$, $|C|=200$ and $D=2000$, yielding $400,000$ checks per ray $\times 200$ rays $= 80,000,000$ operations in single-threaded JavaScript.

---

## 8. Dominant Bottleneck Identification

* **Dominant Stage:** **Adaptive Boundary Search** ([`src/orbit/v3/adaptiveBoundarySearch.ts`](file:///c:/Users/SUMITH%20R/Desktop/AEGIS%20ZERO/src/orbit/v3/adaptiveBoundarySearch.ts))
* **Share of Total Runtime:** **85.4%** at $N=1000$ (683.78 ms out of 801.14 ms).
* **Root Cause:**
  `isStateBreached(candidateValues, referenceState, constraints)` performs an un-indexed double loop:
  ```ts
  for (const c of constraints) {
    for (let i = 0; i < candidateValues.length; i++) {
      // String comparison and property lookup on every scalar:
      if (varName === c.variableName && (nodeId === c.nodeId || !c.nodeId)) { ... }
    }
  }
  ```
  Instead of indexing constraint targets by variable index, it scans the entire $D$-dimensional array for each constraint.

---

## 9. 1000-Node Case Assessment

* **Stated Real-Time Target:** $\le 50.0\text{ ms}$ per telemetry step.
* **Measured Latency at $N=1000$:** **801.14 ms** (mean) / **730.53 ms** (median).
* **Verdict:** **FAILS REAL-TIME TARGET AT $N=1000$**.
* **Practical Operational Scope:**
  - $N \le 100$ ($D \le 200$): **Highly Practical & Real-time** ($\le 6.37\text{ ms}$, > 150 Hz throughput).
  - $N = 250$ ($D = 500$): **Practical for Sub-second Systems** ($25.38\text{ ms} < 50\text{ ms}$, ~39 Hz throughput).
  - $N \ge 500$ ($D \ge 1000$): **Batch / Offline Only** ($175\text{ ms}$ to $801\text{ ms}$). Not suitable for sub-second protection relays without constraint index pre-compilation.

---

## 10. Reproducibility

To independently reproduce all benchmark measurements from a clean shell:

```bash
# Execute standalone CLI benchmark
npm run benchmark:scalability

# Alternative direct invocation
npx tsx src/orbit/experiments/benchmarkScalability.ts
```

All 49 unit and regression tests remain 100% passing:
```bash
npm run test:orbit
```
Production build verification:
```bash
npm run build
```
Research suite reproduction:
```bash
npm run research:v3
```
