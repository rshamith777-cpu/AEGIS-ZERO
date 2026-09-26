# ORBIT: Operational Resilience Boundary & Inference Transform
## Theoretical Specification & System Architecture

**Framework Version:** 1.0.0-RC1  
**Authors:** AEGIS Research Team & Operational Dynamics Group  
**Target Architecture:** Multi-agent, networked cyber-physical infrastructure under cascading risk  

---

## 1. Executive Summary & Problem Formulation

Modern cyber-physical networks (such as regional cold-chain food supply networks, microgrids, and multi-modal logistics) operate under high physical coupling and tight operating margins. While conventional anomaly detection alerts operators *after* thresholds have failed, and traditional predictive controllers project states along expected nominal trajectories, they fail to answer the central resilience question:

> **"Given partial, noisy observations $Y_t$ of a coupled network state $X_t$, how close is the system to an unrecoverable regime transition, along which coordinate direction does the least perturbation trigger catastrophic collapse, and what is the minimum-cost intervention that restores an operational safety margin?"**

The **ORBIT** (*Operational Resilience Boundary & Inference Transform*) framework provides a mathematically rigorous, domain-agnostic approach to answering this question. It introduces:
1. **Regime Boundary Characterization:** Defining the operational boundary $\partial \mathcal{R}_{\text{safe}}$ across hybrid continuous-discrete constraints.
2. **Boundary Transition Distance (BTD):** The minimal perturbation norm $\min \|\delta\|$ required to push the state from its current configuration into a degraded or collapsed regime.
3. **Boundary Transition Ray (BTR) & Vulnerability Direction ($\theta^*$):** Identifying the worst-case unit direction along which the boundary is closest.
4. **Topology Shock Metric:** Quantifying structural shock when network corridors or physical dependencies are severed.
5. **Escape Optimizer & Counterfactual Engine:** Identifying Pareto-optimal interventions that maximize margin recovery while minimizing intervention cost.

---

## 2. Mathematical Formulation

### 2.1 State Space Representation
A system at time $t$ is represented by a domain-agnostic state vector:
$$X_t = \left( V_t, E_t, S_t, D_t \right)$$
where:
- $V_t \in \mathbb{R}^{|V| \times d_v}$: Node-level continuous features (e.g., storage capacity, buffer levels, temperature, local degradation).
- $E_t \in \mathbb{R}^{|E| \times d_e}$: Edge/courier flow and transit states (e.g., transit load, transport latency, corridor health).
- $S_t \in \mathbb{R}^{d_s}$: Global scalar state indicators (e.g., ambient stress, systemic buffer margin).
- $D_t \in \{0, 1\}^{d_d}$: Discrete topological statuses (e.g., offline compressor, severed highway corridor).

For geometric analysis, $X_t$ is flattened into a canonical state vector $x \in \mathbb{R}^D$ with normalization weights $W = \text{diag}(w_1, \dots, w_D)$ reflecting physical scale disparities:
$$\|x - x'\|_W = \sqrt{\sum_{i=1}^D w_i (x_i - x'_i)^2}$$

### 2.2 Operational Regimes
The state space $\mathcal{X}$ is partitioned into four distinct qualitative operational regimes:
$$\mathcal{X} = \mathcal{R}_{\text{safe}} \cup \mathcal{R}_{\text{deg}} \cup \mathcal{R}_{\text{crit}} \cup \mathcal{R}_{\text{coll}}$$
- **Recoverable Equilibrium ($\mathcal{R}_{\text{safe}}$):** All continuous features satisfy safe operating bounds with positive margins:
  $$g_k(X_t) \ge m_{\text{safe}, k} > 0, \quad \forall k \in \{1, \dots, K\}$$
- **Degraded Operational ($\mathcal{R}_{\text{deg}}$):** At least one non-critical constraint margin is violated, but the network retains structural paths and sufficient buffer capacity to self-correct without collapse.
- **Critical Cascade ($\mathcal{R}_{\text{crit}}$):** System trajectories enter an attractor basin that leads to irreversible failure unless external control action $U_t$ is applied within deadline $T_{\text{deadline}}$.
- **Collapsed ($\mathcal{R}_{\text{coll}}$):** Catastrophic structural disconnection or unrecoverable inventory spoilage/exhaustion has occurred.

### 2.3 Boundary Transition Distance (BTD)
The distance from the current state $X_0$ to the operational boundary $\partial \mathcal{R}_{\text{safe}}$ is formally defined as:
$$\text{BTD}(X_0) = \inf_{\delta \in \mathbb{R}^D} \left\{ \|\delta\|_W : X_0 + \delta \notin \mathcal{R}_{\text{safe}} \right\}$$

Because $\partial \mathcal{R}_{\text{safe}}$ is governed by nonlinear dynamics and coupled network flow constraints, the exact infimum is non-convex. The **ORBIT-A** algorithm solves for BTD using a three-phase optimization:
1. **Constraint Margin Projection:** Computes analytical distance to individual hyperplane bounds.
2. **Multi-Start Directional Search:** Probes random and gradient-informed ray vectors $\theta \in \mathbb{S}^{D-1}$.
3. **Bisection Ray Refinement:** Performs logarithmic bisection along candidate directions to pinpoint the boundary intersection within tolerance $\varepsilon \le 10^{-4}$.

### 2.4 Vulnerability Direction ($\theta^*$)
The directional distance along unit vector $\theta$ ($\|\theta\| = 1$) is:
$$\text{BTD}(X_0, \theta) = \inf_{\alpha > 0} \left\{ \alpha : X_0 + \alpha \theta \notin \mathcal{R}_{\text{safe}} \right\}$$
The **worst-case vulnerability direction** $\theta^*$ is the direction requiring minimal external shock to provoke transition:
$$\theta^* = \arg\min_{\theta \in \mathbb{S}^{D-1}} \text{BTD}(X_0, \theta)$$
High-order vulnerability profiles are computed across:
- **First-Order (Univariate):** Perturbations isolated to single node features or edges.
- **Second-Order (Pairwise Interaction):** Correlated shocks between coupled nodes (e.g., simultaneous refrigeration failure at Depot and traffic gridlock on the connecting arterial).
- **Third-Order (Triadic Resonance):** Multi-hop cascade paths spanning supply, transit, and demand sinks.

### 2.5 Topology Shock Metric
Physical infrastructure failure is not merely a perturbation of continuous variables; it alters the underlying graph topology $G = (V, E)$. When edges or nodes fail, ORBIT computes the **Topology Shock Index** $\sigma_{\text{topo}} \in [0, 1]$:
$$\sigma_{\text{topo}}(G_0, G_t) = \omega_{\text{flow}} \frac{|\mathcal{F}_{\text{lost}}|}{|\mathcal{F}_0|} + \omega_{\text{conn}} \left(1 - \frac{|C_0|}{|C_t|}\right) + \omega_{\text{eff}} \frac{\mathcal{E}(G_0) - \mathcal{E}(G_t)}{\mathcal{E}(G_0)}$$
where:
- $\mathcal{F}_{\text{lost}}$: Lost edge transmission capacity.
- $|C_t|$: Number of disconnected graph components.
- $\mathcal{E}(G)$: Global graph communication efficiency $\frac{1}{n(n-1)}\sum_{i \ne j} \frac{1}{d(i, j)}$.

### 2.6 Minimum Escape Intervention
When a system enters $\mathcal{R}_{\text{deg}}$ or $\mathcal{R}_{\text{crit}}$, operators require the lowest-cost control input $U^* \in \mathcal{U}$ that restores the boundary distance to a target safety threshold $BTD_{\text{safe}}$:
$$U^* = \arg\min_{U \in \mathcal{U}} \left\{ C(U) \right\} \quad \text{s.t.} \quad \text{BTD}\left(\hat{F}(X_0, U)\right) \ge BTD_{\text{safe}}$$
where $C(U) = \sum_{a \in U} c_a + \lambda_{\text{complexity}} |U|$ represents composite execution, financial, and organizational cost.

ORBIT-A implements a multi-objective Pareto genetic-local search optimizer that evaluates candidate combinations of rerouting, buffer reallocation, shedding, and emergency dispatch.

### 2.7 Counterfactual Simulation Engine
To validate interventions before execution, ORBIT-A forks the operational state into twin branches:
- **Branch 0 (Status Quo / Unmitigated Drift):**
  $$X_{t+1}^{(0)} = \hat{F}\left(X_t^{(0)}, \mathbf{0}, \epsilon_t\right)$$
- **Branch 1 (Counterfactual Intervention):**
  $$X_{t+1}^{(1)} = \hat{F}\left(X_t^{(1)}, U_t^*, \epsilon_t\right)$$

The engine projects trajectories across horizon $H$, calculating divergence metrics, risk reduction ratios, and collateral impact indices.

---

## 3. Algorithm: ORBIT-A

```
Algorithm 1: ORBIT-A (Operational Boundary Inference & Transition Algorithm)
Input: Observed state Y_t, Topology G_t, Transition model F_hat, Horizon H, Confidence level (1-alpha)
Output: OrbitScorecard containing BTD, theta*, Regime, Uncertainty CI, Minimum Escape Intervention U*

1:  X_hat_t <- StateEstimator(Y_t, G_t)
2:  Regime_current <- ClassifyRegime(X_hat_t)
3:  BTD_global, theta_star <- BoundaryDistanceSearch(X_hat_t, F_hat)
4:  Profile_interactions <- ComputeDirectionalProfiles(X_hat_t, orders=[1, 2, 3])
5:  Shock_index <- ComputeTopologyShock(G_0, G_t)
6:  
7:  // Monte Carlo Uncertainty Propagation
8:  Samples <- DrawStatePerturbations(X_hat_t, N=100)
9:  Distances <- [BoundaryDistanceSearch(s, F_hat).BTD for s in Samples]
10: CI_lower, CI_upper <- Quantile(Distances, [alpha/2, 1 - alpha/2])
11: 
12: // Escape Intervention Optimization (if degraded or critical)
13: if Regime_current in {DEGRADED, CRITICAL} then
14:     U_star <- ParetoEscapeSearch(X_hat_t, F_hat, target_BTD=BTD_safe)
15:     Counterfactual_Deltas <- ForkAndSimulate(X_hat_t, U_star, horizon=H)
16: else
17:     U_star <- EmptyIntervention
18:     Counterfactual_Deltas <- Null
19: end if
20: 
21: return OrbitScorecard(BTD_global, theta_star, Profile_interactions, Shock_index, CI, U_star, Counterfactual_Deltas)
```

---

## 4. Benchmark: ORBIT-Bench

To prevent data leakage and guarantee rigorous algorithmic evaluation, **ORBIT-Bench** provides 10 deterministic, synthetic scenario families representing canonical operational failure modes:

| ID | Scenario Family | Key Dynamics | Failure Mode |
|---|---|---|---|
| `OB-01` | **Linear Margin Decay** | Monotonic depletion of storage margin | Slow thermal drift / capacity runoff |
| `OB-02` | **Abrupt Corridor Sever** | Instantaneous edge capacity drops to 0 | Bridge collapse / arterial roadblock |
| `OB-03` | **Cascading Downstream Overload** | Node failure spills load into neighbors | Secondary hub capacity saturation |
| `OB-04` | **Correlated Multi-Point Shock** | Simultaneous correlated failures | Extreme weather / localized power outage |
| `OB-05` | **Oscillatory Demand Surge** | High-frequency fluctuating demand | Bullwhip resonance & buffer exhaustion |
| `OB-06` | **Latent Degradation Drift** | Hidden exponential decay parameter | Unmonitored insulation breakdown |
| `OB-07` | **Bifurcation Under Stress** | Nonlinear tipping point dynamic | Sudden transition to unrecoverable regime |
| `OB-08` | **High-Degree Hub Isolation** | Failure of highest eigenvector node | Core regional distribution loss |
| `OB-09` | **Sparse Peripheral Starvation** | Edge-of-network delivery cutoff | Remote community critical starvation |
| `OB-10` | **Recovery Hysteresis Trap** | State cannot recover via symmetric input | Structural delay / cold-chain perishability |

### Evaluation Metrics
1. **BTDE (Boundary Transition Distance Error):** Mean absolute error relative to analytical ground truth boundary.
2. **BDR (Boundary Detection Recall):** Sensitivity in detecting imminent regime crossings within horizon $H$.
3. **VDA (Vulnerability Direction Accuracy):** Cosine similarity between estimated $\hat{\theta}^*$ and ground truth $\theta^*$.
4. **TSA (Topology Shock Accuracy):** Precision of structural graph impact estimation.
5. **CHL (Cascade Horizon Lead-Time):** Earliest warning timestamp in steps before unrecoverable tipping point.
6. **MIR (Minimum Intervention Recovery Rate):** Fraction of critical scenarios safely stabilized by $U^*$.
7. **RSE (Regime Separation Entropy):** Discreteness and confidence of regime assignment.
8. **FAR (False Alarm Rate):** Erroneous critical alerts during nominal operations.
9. **OAR (Operational Availability Ratio):** Preserved delivery throughput during resilience interventions.
10. **UCE (Uncertainty Calibration Error):** Empirical coverage error of 95% confidence intervals.

---

## 5. Domain Adaptation: AEGIS Food Resilience

While ORBIT core (`src/orbit/`) is completely domain-agnostic, the AEGIS Zero application layer binds it to regional food supply chain operations via `src/orbit/adapters/aegisFoodAdapter.ts`:
- **Nodes** $\to$ Cold Depots, Central Prep Kitchens, Food Banks, Distribution Shelters.
- **Edges** $\to$ Refrigirated Courier Vans, Electric Cargo Fleets, Arterial Transit Corridors.
- **Continuous Features** $\to$ Temperature (°C), Shelf-Life Remaining (Minutes), Inventory Meals, Crowd Surge.
- **Discrete Features** $\to$ Chiller Compressor Status, Transit Roadway Blockade.
- **Interventions** $\to$ Emergency High-Elevation Courier Bypass, Re-Prioritization to Vulnerable Shelters, Flash-Chilled Meal Redistribution.

---

## 6. Implementation & Reproducibility Verification

All components are strictly typed in TypeScript and validated through automated unit tests (`src/orbit/__tests__/orbitCore.test.ts`):
- Boundary Distance properties (positivity, monotonicity, directionality).
- Topology Shock index boundedness $\sigma \in [0, 1]$.
- Escape optimizer cost and safety guarantees.
- Counterfactual divergence metrics.
- Benchmark metric reproducibility across all 10 scenario families.
