# Synthetic Data Leakage Audit: ORBIT-Bench vs. ORBIT-A

**Audit Date:** September 2026  
**Auditors:** Research Integrity Review  
**Objective:** Detect, document, and remediate circular dependencies and data leakage between synthetic benchmark generation and algorithmic inference.

---

## 1. The Core Risk of Synthetic Benchmarking
When both the benchmark generator and the evaluated algorithm are developed within the same repository, subtle forms of data leakage can occur:
1. **Shared Mathematical Assumptions:** If the benchmark generates transitions using the exact linear differential equations that the algorithm assumes, the algorithm is evaluated on its own inductive biases.
2. **Privileged Candidate Filtering:** If the algorithm is handed only the ground-truth optimal action in its candidate set, it is spared the combinatorial search problem.
3. **Static Ground Truth Leakage:** If the ground truth was hardcoded to match specific algorithm outputs, tests confirm only internal consistency rather than real-world validity.

---

## 2. Systematic Audit of Shared vs. Independent Components

| Component | Benchmark Generator | ORBIT-A Inference Engine | Independence Status | Remediation Applied |
|---|---|---|---|---|
| **Forward Transition** | `TransitionModel` (Euler step) | `TransitionModel` (Euler step) | **Shared Assumption** | Added nonlinear saturation & disturbance terms to benchmark |
| **Ground Truth BTD** | `GroundTruthSimulator` (256 rays, 20 bisection steps, tolerance $10^{-6}$) | `BoundaryDistanceOptimizer` (64 rays, 14 bisection steps, tolerance $6 \times 10^{-5}$) | **Partially Independent** | Ground truth uses $4\times$ denser ray sampling and higher bisection depth |
| **Candidate Action Space** | Generates 4 diverse actions (optimal, under-provisioned, aggressive, null) | Must evaluate all 4 actions blind to which is optimal | **Fully Independent** | Algorithm must evaluate costs, constraints, and BTD gains independently |
| **Random Seed Schedule** | Standard Training: Seeds `42, 1337, 2026` | Holdout Testing: Seeds `9001 ... 9100` | **Fully Independent** | Holdout suite uses disjoint, non-overlapping seed schedule |
| **State Observations** | Generates $X_t$ with observation noise $\sigma$ & missing data rate $\mu$ | Receives masked $Y_t$, must impute missing values | **Fully Independent** | Algorithm never observes uncorrupted ground truth in noisy scenarios |

---

## 3. Discovered Vulnerabilities & Fixes

### Vulnerability 1: Hardcoded Ground Truth Scalars
- **Prior Code:** `src/orbit/benchmark/scenarios.ts` previously assigned `trueBtd = 0.52; trueBtd = 0.38;` regardless of actual initial load state.
- **Fix:** Integrated `GroundTruthSimulator.computeExactGroundTruth()`, which simulates forward trajectories and performs fine-grained 256-ray bisection on the actual generated state.

### Vulnerability 2: Trivial Candidate Action Set
- **Prior Code:** `src/orbit/benchmark/evaluator.ts` supplied `candidates = [sc.groundTruth.optimalIntervention]`.
- **Fix:** Evaluator now supplies a multi-action portfolio with 4 competing options: optimal, under-provisioned (too weak to reach safety), aggressive (excessive cost penalty), and null status quo.

### Vulnerability 3: Shared Transition Model Fidelity
- **Assessment:** While both generator and algorithm share transition physics, real-world systems exhibit unmodeled dynamics.
- **Remediation in Holdout Suite:** `ORBIT-Bench-HOLDOUT` injects unmodeled nonlinear coupling (thermal runaway acceleration and quadratic friction) that ORBIT-A's linear forward model does not explicitly predict, measuring algorithm degradation under model mismatch.
