# ORBIT Experimental Research Protocol
## Standard Operating Procedures for Benchmarking, Ablations, and Evaluation

**Protocol Version:** 1.0.0  
**Target Architecture:** ORBIT-A on ORBIT-Bench Synthetic Benchmark Suite  

---

## 1. Scope & Objective
This protocol establishes the rigorous, reproducible procedure for evaluating the **ORBIT-A** algorithmic framework against 7 competitive baselines, conducting 7 ablation studies, and performing sensitivity sweeps across data corruption, graph scale, and hyperparameter variants.

---

## 2. Experimental Setup & Environment

### 2.1 Hardware and Runtime Baseline
- **Runtime:** Node.js v20+ / TypeScript 5.8+ (Strict Mode)
- **Execution Engine:** `npx tsx` or compiled production bundle (`npm run build`)
- **Random Number Generation:** Deterministic Pseudo-Random Number Generator (PRNG) parameterized with fixed seeds:
  - Benchmark Suite Default: `seed = 42`
  - Statistical Validation Runs: `seed \in {42, 1337, 2026, 9999, 10101}`

### 2.2 Baseline Models
All models are evaluated on identical observation sequences $Y_{1:t}$:
1. **Baseline A (Static Thresholding):** Fires alert when any normalized continuous feature exceeds standard empirical limits ($x_i > 0.85$).
2. **Baseline B (Moving Average Residual):** Tracks exponential moving average (window $W=10$) and triggers on residual deviations $> 2.5\sigma$.
3. **Baseline C (Isolation Forest Surrogate):** High-dimensional isolation tree density estimator scoring anomalous state vector combinations.
4. **Baseline D (Forecast-Only):** Linear autoregressive trajectory projection without boundary geometry or regime classification.
5. **Baseline E (Graph Centrality Ranker):** Pure topological degree/betweenness weighting without physical state transition dynamics.
6. **Baseline F (Random Perturbation Search):** Monte Carlo uniform random ray sampling without gradient bisection or directional ranking.
7. **Baseline G (Greedy Single-Step Recovery):** Myopic heuristic choosing the single lowest unit-cost action without multi-objective Pareto optimization.

---

## 3. Protocol Steps

### Phase 1: Benchmark Generation (`ORBIT-Bench`)
1. Initialize the synthetic generator with `seed = 42`.
2. Generate $N=100$ total scenarios ($N=10$ per family across all 10 scenario families: `OB-01` to `OB-10`).
3. Verify that each scenario contains:
   - Initial graph topology $G_0 = (V_0, E_0)$.
   - Ground truth analytical boundary distance $BTD^*(X_0)$.
   - Known worst-case vulnerability direction $\theta^*$.
   - Ground truth regime sequence $\mathcal{R}_0, \dots, \mathcal{R}_H$.

### Phase 2: Algorithmic Inference & Scorecard Generation
1. Execute `OrbitEngine.analyze(state, topology)` on each scenario.
2. Record:
   - Estimated boundary distance $\widehat{BTD}$.
   - Estimated vulnerability vector $\hat{\theta}^*$.
   - Regime classification $\hat{\mathcal{R}}$.
   - Structural shock index $\hat{\sigma}_{\text{topo}}$.
   - Monte Carlo 95% Confidence Interval $[\text{CI}_{\text{lower}}, \text{CI}_{\text{upper}}]$.
   - Minimum escape intervention $U^*$ and counterfactual projections.

### Phase 3: Metric Calculation
Compute all 10 standardized research metrics:
- **BTDE:** $\frac{1}{N}\sum |\widehat{BTD}_i - BTD^*_i|$
- **BDR:** $\frac{TP}{TP + FN}$ for impending critical regime transitions within horizon $H=20$.
- **VDA:** $\frac{1}{N}\sum \frac{\hat{\theta}_i^* \cdot \theta_i^*}{\|\hat{\theta}_i^*\|_2 \|\theta_i^*\|_2}$
- **TSA:** $1 - \frac{1}{N}\sum |\hat{\sigma}_i - \sigma_i^*|$
- **CHL:** Mean early warning margin in simulation steps prior to collapse.
- **MIR:** Fraction of degraded scenarios where $BTD(\hat{F}(X, U^*)) \ge BTD_{\text{safe}}$.
- **RSE:** Normalised entropy of softmax regime margin distribution.
- **FAR:** $\frac{FP}{FP + TN}$ on baseline equilibrium scenarios.
- **OAR:** Throughput preserved under intervention / nominal throughput.
- **UCE:** Empirical error relative to nominal 95% interval coverage.

### Phase 4: Ablation Testing
Execute the 7 ablation variants systematically against the benchmark suite:
1. `Variant 1 (-Bisection)`: Omits logarithmic bisection ray refinement.
2. `Variant 2 (-HigherOrder)`: Evaluates first-order univariate perturbations only.
3. `Variant 3 (-Topology)`: Ignores graph structure and edge disconnection.
4. `Variant 4 (-Pareto)`: Uses scalarized weighted-sum instead of Pareto optimization.
5. `Variant 5 (-Uncertainty)`: Replaces Monte Carlo distribution with point estimate.
6. `Variant 6 (-Transition)`: Static state inspection without multi-step forward model.
7. `Variant 7 (-Normalization)`: Unweighted Euclidean L2 norm across raw feature units.

### Phase 5: Robustness & Scaling Stress Testing
1. **Missing Data Perturbation:** Inject observational dropout from 0% to 40% in 10% steps.
2. **Measurement Noise Perturbation:** Add Gaussian noise $\epsilon \sim \mathcal{N}(0, \sigma^2)$ with $\sigma \in [0.0, 0.30]$.
3. **Graph Scaling Sweep:** Evaluate computational latency and memory consumption across network sizes $|V| \in \{10, 25, 50, 100, 250\}$.
4. **Generalization Matrix:** Measure transfer accuracy when models trained/calibrated on one scenario family are tested against all others.

---

## 4. Reporting & Export Standards

All benchmark and ablation results must be exportable in machine-readable JSON format conforming to the `OrbitBenchmarkExport` schema:
```json
{
  "timestamp": "2026-09-24T12:00:00.000Z",
  "framework": "ORBIT-A v1.0.0",
  "configuration": { "seed": 42, "horizon": 20, "mcSamples": 100 },
  "summary": { "btde": 0.048, "bdr": 0.942, "vda": 0.915, "tsa": 0.960, "mir": 0.920 },
  "baselines": [ ... ],
  "ablations": [ ... ],
  "robustness": [ ... ]
}
```
In the UI, any benchmark metric that has not yet been executed in the active session MUST be displayed as `"NOT RUN"` or `"—"` rather than displaying fabricated or hardcoded placeholders.
