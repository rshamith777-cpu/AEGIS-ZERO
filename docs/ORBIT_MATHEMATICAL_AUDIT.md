# ORBIT Mathematical Audit: Formal Theory vs. Implementation Reality

**Audit Date:** September 2026  
**Auditor:** Automated Codebase & Mathematical Core Inspection  
**Scope:** `/docs/ORBIT.md`, `/src/orbit/core/`, `/src/orbit/boundary/`, `/src/orbit/topology/`, `/src/orbit/intervention/`, `/src/orbit/uncertainty/`, `/src/orbit/benchmark/`  

---

## Executive Summary of Findings

This audit systematically checks every mathematical claim and formula in the ORBIT documentation against the actual TypeScript implementation. 

### Critical Discrepancies & Flaws Identified:
1. **Benchmark Ground Truth Discrepancy:** In `src/orbit/benchmark/scenarios.ts`, the "ground truth" boundary distance $BTD^*$ was populated with hardcoded constants (e.g., `0.52`, `0.38`, `0.19`) rather than being analytically derived or computed via exhaustive numerical forward search from the scenario's initial conditions. This introduced an artificial baseline error into BTDE calculations.
2. **Evaluator Leakage:** In `src/orbit/benchmark/evaluator.ts`, the evaluation loop supplied `[sc.groundTruth.optimalIntervention]` as the candidate intervention set to `analyzeSystem()`, eliminating the need for the algorithm to search through competing or suboptimal actions.
3. **Arbitrary Heuristic Pareto Weighting:** In `src/orbit/intervention/escapeOptimizer.ts`, the Pareto score is calculated as `(btdGain * 10 + riskReduction * 50) / Math.sqrt(costNormalized)`. The constants `10`, `50`, and the square-root denominator lack formal theoretical justification and represent an ad-hoc heuristic.
4. **Topology Shock Discrepancy:** In `src/orbit/core/graphModel.ts`, the global efficiency formula $\mathcal{E}(G)$ is simplified to a composite Jaccard index on edges and component fragmentation deltas rather than the exact harmonic mean of all-pairs shortest paths $\frac{1}{n(n-1)}\sum_{i \ne j} \frac{1}{d(i, j)}$.
5. **Non-Convex Boundary Guarantee:** The documentation correctly notes that exact BTD is non-convex, but the code relies on a multi-start ray-bisection heuristic. The result is strictly an **upper bound on the true distance** (since an untested ray might cross the boundary at a smaller magnitude), not an exact infimum.

---

## Detailed Equation-by-Equation Audit

### 1. State Space Canonical Embedding
- **Equation:**
  $$X_t = (V_t, E_t, S_t, D_t) \in \mathcal{X}, \quad x = \text{flatten}(X_t) \in \mathbb{R}^D$$
- **Implementation File:** `src/orbit/core/stateVector.ts`
- **Implementation Function:** `systemStateToVector(state: SystemState): StateVector`
- **Assumptions:** All node features, edge capacities, and global indicators can be represented as bounded real numbers $[x_i^{\min}, x_i^{\max}]$. Discrete statuses (e.g. online/offline) are mapped to $\{0, 1\}$.
- **Approximation:** Discrete graph switches are embedded into continuous dimensions $[0, 1]$.
- **Computational Complexity:** $\mathcal{O}(|V| \cdot d_v + |E| \cdot d_e + d_s + d_d)$ — strictly linear in system entities.
- **Possible Weakness:** Embedding categorical or structural state changes into real vector coordinates assumes continuity where discrete jumps occur.
- **Matches Equation?** **YES.** Correctly extracts and flattens continuous and boolean features into a structured `Float64Array`.

---

### 2. Normalized Scale-Invariant Distance Metric
- **Equation:**
  $$\|x - y\|_W = \sqrt{\frac{\sum_{i=1}^D w_i \left(\frac{x_i - y_i}{x_i^{\max} - x_i^{\min}}\right)^2}{\frac{1}{D}\sum_{i=1}^D w_i}}$$
- **Implementation File:** `src/orbit/core/normalization.ts`
- **Implementation Function:** `computeDistance(a, b, { metric: 'NORMALIZED_WEIGHTED' })`
- **Assumptions:** Feature ranges $x_i^{\max} - x_i^{\min} > 0$ are known and non-zero (guarded by $\max(10^{-6}, \Delta)$).
- **Approximation:** Assumes orthogonal coordinate axes (uncoupled distance).
- **Computational Complexity:** $\mathcal{O}(D)$ where $D$ is the state dimension.
- **Possible Weakness:** Ignores covariance structure between coupled variables (Mahalanobis distance would require full covariance matrix inversion $\mathcal{O}(D^3)$).
- **Matches Equation?** **YES.** Exactly matches the weighted scale-normalized L2 formula.

---

### 3. Boundary Transition Distance (BTD)
- **Equation:**
  $$\text{BTD}(X_0) = \inf_{\delta \in \mathbb{R}^D} \left\{ \|\delta\|_W : \text{Regime}\left(\hat{F}(X_0 + \delta)\right) \ne \text{Regime}(X_0) \right\}$$
- **Implementation File:** `src/orbit/boundary/boundaryDistance.ts`
- **Implementation Function:** `BoundaryDistanceOptimizer.computeBtd()` and `binarySearchRay()`
- **Assumptions:** The transition boundary is star-convex along the sampled rays from $X_0$ (i.e. if $X_0 + \alpha_1 \theta \notin \mathcal{R}_{\text{safe}}$, then $X_0 + \alpha_2 \theta \notin \mathcal{R}_{\text{safe}}$ for all $\alpha_2 > \alpha_1$).
- **Approximation:** Evaluates $K$ candidate rays ($2D$ axis-aligned, $\mathcal{O}(D^2)$ pairwise diagonal, and $M$ random hypersphere vectors). On each ray, bisection executes $I=14$ steps.
- **Computational Complexity:** $\mathcal{O}\left((2D + D^2 + M) \cdot I \cdot T_{\text{forward}}\right)$.
- **Possible Weakness:**
  - **Non-Convex Boundary Blind Spots:** If the safe regime has concave boundaries or disconnected pockets, radial bisection can miss interior boundaries.
  - **Upper Bound Nature:** Because search is conducted over a finite set of rays, $\widehat{BTD} \ge BTD^*$. The algorithm finds an upper bound on vulnerability.
- **Matches Equation?** **PARTIAL (Multi-start Ray Approximation).** The documentation acknowledges this as an NP-hard problem, but the audit emphasizes that $\widehat{BTD}$ is an empirical upper bound, not an analytical infimum.

---

### 4. Directional Vulnerability & Worst-Case Ray ($\theta^*$)
- **Equation:**
  $$\text{BTD}(X_0, \theta) = \inf_{\alpha > 0} \{\alpha : \hat{F}(X_0 + \alpha \theta) \notin \mathcal{R}_{\text{safe}}\}, \quad \theta^* = \arg\min_{\theta \in \mathbb{S}^{D-1}} \text{BTD}(X_0, \theta)$$
- **Implementation File:** `src/orbit/boundary/vulnerabilityDirection.ts`
- **Implementation Function:** `VulnerabilityDirectionAnalyzer.analyzeDirectionalProfiles()`
- **Assumptions:** Disturbances can be aligned with coordinate axes (order 1), pairwise couplings (order 2), or triadic resonant paths (order 3).
- **Approximation:** Caps the number of evaluated variables to `maxVariablesToAnalyze = 12` to prevent $\mathcal{O}(D^3)$ combinatorial explosion.
- **Computational Complexity:** $\mathcal{O}((2D + 4\binom{k}{2} + 8\binom{k}{3}) \cdot I \cdot T_{\text{classify}})$.
- **Possible Weakness:** High-dimensional networks with $> 12$ variables will not have all 2nd- and 3rd-order cross-couplings tested.
- **Matches Equation?** **YES.** Correctly takes the $\arg\min$ over the evaluated directional set.

---

### 5. Topology Shock Index
- **Equation in docs/ORBIT.md:**
  $$\sigma_{\text{topo}}(G_0, G_t) = \omega_{\text{flow}} \frac{|\mathcal{F}_{\text{lost}}|}{|\mathcal{F}_0|} + \omega_{\text{conn}} \left(1 - \frac{|C_0|}{|C_t|}\right) + \omega_{\text{eff}} \frac{\mathcal{E}(G_0) - \mathcal{E}(G_t)}{\mathcal{E}(G_0)}$$
- **Implementation File:** `src/orbit/core/graphModel.ts` & `src/orbit/topology/topologyShock.ts`
- **Implementation Function:** `computeGraphDistance(gCurrent, gFuture)`
- **Actual Code Formula:**
  $$\sigma = 0.20 \cdot \Delta_{\text{nodes}} + 0.30 \cdot \Delta_{\text{edges}} + 0.15 \cdot \Delta_{\text{centrality}} + 0.15 \cdot \Delta_{\text{components}} + 0.20 \cdot \Delta_{\text{deps}}$$
- **Discrepancy:** The code implements a weighted sum of Jaccard node distance, Jaccard edge distance, degree centrality delta, component fragmentation, and dependency severance. It does NOT compute the all-pairs harmonic mean graph efficiency $\mathcal{E}(G)$.
- **Computational Complexity:** The code runs in $\mathcal{O}(|V| + |E|)$ via BFS, whereas harmonic global efficiency would require all-pairs shortest paths $\mathcal{O}(|V|^3)$ or $\mathcal{O}(|V| \cdot |E| \log |V|)$.
- **Assessment:** The code's implementation is computationally tractable ($\mathcal{O}(|V|+|E|)$) and valid for real-time inference, but the documentation claimed an explicit harmonic efficiency term $\mathcal{E}(G)$.
- **Resolution:** Reconcile documentation to state the exact tractable 5-factor graph distance metric.

---

### 6. Minimum Escape Intervention & Pareto Objective
- **Equation in docs/ORBIT.md:**
  $$U^* = \arg\min_{U \in \mathcal{U}} C(U) \quad \text{s.t.} \quad \text{BTD}\left(\hat{F}(X_0, U)\right) \ge BTD_{\text{safe}}$$
- **Implementation File:** `src/orbit/intervention/escapeOptimizer.ts`
- **Implementation Function:** `EscapeOptimizer.optimizeEscape()`
- **Actual Code Formula:**
  `const paretoScore = (btdGain * 10 + riskReduction * 50) / Math.sqrt(costNormalized);`
  Filter: Candidates with $BTD_{\text{projected}} \ge BTD_{\text{safe}}$, sorted by $\min C(U)$.
- **Discrepancy:** When safe candidates exist, the optimizer correctly picks the minimum cost $U^*$. However, the ranking heuristic `(btdGain * 10 + riskReduction * 50) / Math.sqrt(costNormalized)` uses arbitrary hardcoded multipliers (`10`, `50`).
- **Computational Complexity:** $\mathcal{O}(|\mathcal{U}| \cdot (T_{\text{counterfactual}} + T_{\text{BTD}}))$.
- **Assessment:** Mathematically heuristic. The multipliers must be replaced with formally parametrized weights or a pure non-dominated Pareto front filter.

---

### 7. Counterfactual Twin Simulation
- **Equation:**
  $$X_{t+1}^{(0)} = \hat{F}(X_t^{(0)}, \mathbf{0}, \epsilon_t), \quad X_{t+1}^{(1)} = \hat{F}(X_t^{(1)}, U_t^*, \epsilon_t)$$
- **Implementation File:** `src/orbit/intervention/counterfactual.ts`
- **Implementation Function:** `CounterfactualEngine.simulateCounterfactual()`
- **Assumptions:** Intervention $U$ is applied at step 0 and remains active or induces an irreversible state shift. Forward model $\hat{F}$ is deterministic when comparing branches ($\epsilon_t^{(0)} = \epsilon_t^{(1)}$).
- **Approximation:** Constant drift parameters per node type.
- **Computational Complexity:** $\mathcal{O}(H \cdot (|V| + |E|))$.
- **Matches Equation?** **YES.** Accurately simulates twin trajectories and measures divergence deltas.

---

### 8. Monte Carlo Uncertainty Propagation
- **Equation:**
  $$\hat{\mu}_{\text{BTD}} = \frac{1}{S}\sum_{s=1}^S \text{BTD}(X^{(s)}), \quad \text{CI}_{95} = \left[ q_{0.025}, q_{0.975} \right]$$
- **Implementation File:** `src/orbit/uncertainty/uncertaintyEstimator.ts`
- **Implementation Function:** `UncertaintyEstimator.estimateBtdUncertainty()`
- **Assumptions:** Observation noise is i.i.d. Gaussian across features; missing data is Missing Completely at Random (MCAR).
- **Approximation:** Employs empirical sample quantiles over $S=128$ perturbations. Fast btd calculation on samples uses reduced ray count (16 rays, 8 bisection iterations) to maintain real-time performance.
- **Computational Complexity:** $\mathcal{O}(S \cdot K_{\text{reduced}} \cdot I_{\text{reduced}} \cdot T_{\text{forward}})$.
- **Matches Equation?** **YES.** Accurately computes mean, variance, empirical percentiles, and Gaussian differential entropy.

---

### 9. Ground Truth in Synthetic Benchmark (`ORBIT-Bench`)
- **Status:** **CRITICAL AUDIT FINDING**
- **Implementation File:** `src/orbit/benchmark/scenarios.ts`
- **Observed Code:**
  ```typescript
  case 'SINGLE_BOUNDARY':
    trueBtd = 0.52;
    trueTransitionTime = 7;
    ...
  case 'COUPLED_BOUNDARY':
    trueBtd = 0.38;
  ```
- **Flaw:** Ground truth values were assigned as static constants rather than derived from the dynamic simulation. If node capacities or initial loads change, the hardcoded `0.52` becomes disconnected from the actual physical boundary.
- **Remediation Required:** Implement an independent analytical / fine-grained exhaustive numerical forward simulator (`src/orbit/benchmark/groundTruthSimulator.ts`) that computes the true exact ground truth $BTD^*$ dynamically for any initial state and seed.

---

## Audit Sign-off Matrix

| Mathematical Component | Documented Formula | Implemented In Code? | Mathematical Rigor | Status |
|---|---|---|---|---|
| **State Vector $X_t$** | Linear embedding of graph state | Yes (`stateVector.ts`) | Rigorous | Verified |
| **Normalized Distance** | Scale-invariant weighted L2 | Yes (`normalization.ts`) | Rigorous | Verified |
| **BTD Formulation** | Minimal perturbation norm | Yes (`boundaryDistance.ts`) | Upper-bound approx | Documented |
| **BTR Ray Search** | Bisection along rays | Yes (`boundaryDistance.ts`) | Convergent bisection | Verified |
| **Worst-Case $\theta^*$** | Argmin over directional profile | Yes (`vulnerabilityDirection.ts`) | Rigorous over subset | Verified |
| **Topology Shock** | Weighted structural metric | Replaced $\mathcal{E}(G)$ with Jaccard | Heuristic tractable | Flagged / Fixed |
| **Escape Optimizer** | Constrained minimum cost | Yes (`escapeOptimizer.ts`) | Heuristic score | Formalized in Ph.4 |
| **Counterfactuals** | Branching trajectory simulation | Yes (`counterfactual.ts`) | Rigorous | Verified |
| **Uncertainty CI** | Monte Carlo empirical quantiles | Yes (`uncertaintyEstimator.ts`) | Rigorous | Verified |
| **Benchmark Ground Truth**| Exact physical boundaries | Hardcoded constants (`scenarios.ts`)| Unsound | Remediation Required |
