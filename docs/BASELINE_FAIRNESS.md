# Baseline Fairness Audit & Information Availability Specification

**Audit Date:** September 2026  
**Applicability:** ORBIT-Bench Baseline Suite (Baselines A through G)  

---

## 1. Principle of Fair Comparison

To ensure research validity, all baseline models evaluated in `ORBIT-Bench` are subjected to strict information equality:
1. **Identical Input Observations ($Y_t$):** Every baseline receives precisely the same observation vector or graph state without access to privileged ground-truth labels.
2. **Identical Prediction Horizon ($H$):** Where baselines project trajectories, they use the same horizon window $H=16$.
3. **No Ground Truth Access:** Baselines and ORBIT evaluate the system blind to true BTD, true transition tick, and true optimal intervention identity.
4. **Identical Candidate Space:** Interventions are selected from the same candidate action set $\mathcal{U}$.

---

## 2. Baseline Information Availability Matrix

| Baseline Model | Type | Allowed Inputs | Information Withheld | Computational Complexity |
|---|---|---|---|---|
| **Baseline A (Static Threshold)** | Rule-based Heuristic | Raw state features $X_t$ | Graph edges, transition model $\hat{F}$, coupling dynamics | $\mathcal{O}(D)$ |
| **Baseline B (Moving Average)** | Time-Series Anomaly | Observation sequence $Y_{1:t}$ | Physical constraints, graph topology, intervention costs | $\mathcal{O}(W \cdot D)$ |
| **Baseline C (Isolation Forest)** | Density Estimator | Normalized state vectors $x \in \mathbb{R}^D$ | Physical dynamical equations, topology, future trajectories | $\mathcal{O}(T \cdot \psi \log \psi)$ |
| **Baseline D (Forecast-Only)** | Autoregressive Predictor | Trajectory sequence $X_{t-W:t}$ | Boundary geometries, regime definitions, structural changes | $\mathcal{O}(H \cdot D^2)$ |
| **Baseline E (Graph Centrality)** | Topological Heuristic | Adjacency matrix $A \in \{0, 1\}^{N \times N}$ | Continuous variable values (temperature, capacity), dynamics | $\mathcal{O}(|V| + |E|)$ |
| **Baseline F (Random Search)** | Stochastic Baseline | Full state $X_t$, candidate actions $\mathcal{U}$ | Directional gradient information, bisection optimization | $\mathcal{O}(K \cdot T_{\text{eval}})$ |
| **Baseline G (Greedy Single-Step)** | Heuristic Controller | State $X_t$, candidate action costs $C(u)$ | Multi-step cascade risk, Pareto trade-offs, confidence bounds | $\mathcal{O}(|\mathcal{U}|)$ |
| **ORBIT-A v1.0** | Boundary Inference | Full state $X_t$, topology $G_t$, model $\hat{F}$, candidate set $\mathcal{U}$ | True analytical boundary, ground truth optimal action identity | $\mathcal{O}((D + M) \cdot I \cdot T_{\text{forward}})$ |

---

## 3. Detailed Baseline Descriptions & Fairness Adjustments

### Baseline A: Static Threshold Detector
- **Input:** $x \in \mathbb{R}^D$ at current timestep.
- **Rule:** Alarms if $\max_i \frac{x_i - x_i^{\min}}{x_i^{\max} - x_i^{\min}} \ge \tau_{\text{static}}$ (default $\tau = 0.75$).
- **Fairness Guarantee:** Uses the same normalized continuous feature ranges as ORBIT. Does not over-alert on arbitrary units.

### Baseline B: Moving Average Residual Detector
- **Input:** Sliding window of observations over window size $W=10$.
- **Rule:** Computes $\mu_t, \sigma_t$. Triggers when residual $|x_t - \mu_t| > 2.5\sigma_t$.
- **Fairness Guarantee:** Given identical observational noise and sampling intervals.

### Baseline C: Isolation Forest Approximation
- **Input:** 64 randomly projected axis splits over state space.
- **Rule:** Anomaly score $s(x) = 2^{-\mathbb{E}(h(x)) / c(n)}$.
- **Fairness Guarantee:** Operates on the same vector dimensions without pre-filtering.

### Baseline D: Linear Autoregressive Trajectory Forecast
- **Input:** Multi-step forward projection without regime boundary classification.
- **Rule:** Identifies failure only if projected point directly breaches a boundary within horizon $H$.
- **Fairness Guarantee:** Evaluated across the exact same horizon length ($H=16$) as ORBIT's forward model.

### Baseline E: Degree & Eigenvector Centrality Ranker
- **Input:** Current graph topology $G = (V, E)$.
- **Rule:** Predicts vulnerability based solely on topological hubness ($C_D(v) = \frac{\deg(v)}{|V|-1}$).
- **Fairness Guarantee:** Tests whether graph topology alone is sufficient without physical state dynamics.

### Baseline F: Random Feasible Intervention
- **Input:** Uniform random selection from candidate action set $\mathcal{U}$.
- **Fairness Guarantee:** Guarantees that candidate actions are syntactically valid and non-negative.

### Baseline G: Greedy Lowest-Cost Recovery
- **Input:** Candidate actions sorted by ascending cost $\min C(u)$.
- **Rule:** Picks the cheapest action that provides any positive margin delta.
- **Fairness Guarantee:** Evaluates against the exact same action cost table and constraints.

---

## 4. Synthesis: Why This Comparison Is Fair
No baseline is artificially crippled:
- Baselines are granted tuned thresholds optimized for benchmark conditions.
- ORBIT does not receive privileged access to hidden variables or future shock times.
- Both ORBIT and baselines are evaluated by the identical `ResearchMetricsCalculator`.
