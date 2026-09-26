# ORBIT Failure Atlas: Adversarial Scenarios & Failure Modes

**Date:** September 2026  
**Document Status:** Open Scientific Empirical Failure Log  
**Purpose:** Rigorously document known failure conditions where ORBIT-A produces false alarms, underestimates boundary proximity, or proposes suboptimal interventions.

---

## 1. Scientific Integrity Policy
An algorithm that claims 100% perfection on every conceivable scenario is either fraudulent or evaluating on a trivial benchmark. The purpose of this Failure Atlas is to catalog the exact dynamical, observational, and structural regimes where ORBIT-A breaks down, diagnose why it fails, and identify theoretical remedies.

---

## 2. Catalog of Adversarial Failure Cases

### Case 1: Unmonitored Latent Variable Drift (Hidden State Degradation)
- **Scenario ID:** `OB-04-ADV-HIDDEN`
- **Random Seed:** `seed = 8402`
- **System Configuration:** $N=8$ nodes. An internal thermal insulation breakdown degrades buffer capacity $x_{\text{buffer}}$ exponentially, but the sensor is unmonitored ($x_{\text{buffer}} \in \mathcal{X}_{\text{hidden}}$).
- **ORBIT Prediction:** $\widehat{BTD} = 1.450$ (Safe/Equilibrium, confidence = 0.88).
- **Ground Truth:** $BTD^* = 0.120$ (Critical impending collapse at $T^* = 3$ ticks).
- **Failure Mode:** False Negative (Missed Detection).
- **Failure Reason:** ORBIT's BTD search optimizes over observed dimensions $\mathbb{R}^{D_{\text{obs}}}$. When the driving instability lies in the null space of the observation operator ($C \cdot \delta_{\text{latent}} = 0$), the optimizer cannot detect boundary proximity until secondary variables exhibit delayed collateral symptoms.
- **Remediation / Fix:** Integrate an Extended Kalman Filter (EKF) or Particle Observer with an explicit latent state estimator $\hat{X}_{t|t}$ that infers unmeasured states from physical mass/energy conservation residuals.

---

### Case 2: Concave Boundary Pockets & Star-Convexity Violations
- **Scenario ID:** `OB-07-ADV-CONCAVE`
- **Random Seed:** `seed = 4419`
- **System Configuration:** Multi-attractor non-linear system with high coupling where safe operating regions form a non-convex, curved manifold.
- **ORBIT Prediction:** $\widehat{BTD} = 0.890, \quad \theta^* = [+x_1, -x_2]$.
- **Ground Truth:** $BTD^* = 0.310, \quad \theta_{\text{true}}^* = [0.42, 0.88, -0.21]$.
- **Failure Mode:** Overestimation of Distance ($+187\%$ error).
- **Failure Reason:** ORBIT-A relies on multi-start directional ray bisection. In regions where the boundary features narrow, concave fissures, sampled rays shoot past the narrow indentations. Because finite rays are sampled ($K=64$), the true minimum distance is missed.
- **Remediation / Fix:** Augment radial ray bisection with projected gradient descent (PGD) along the boundary contour or incorporate active subspace Bayesian optimization.

---

### Case 3: High-Frequency Oscillatory Demand (Bullwhip Resonance)
- **Scenario ID:** `OB-05-ADV-OSCILLATE`
- **Random Seed:** `seed = 1205`
- **System Configuration:** Demand oscillates with period $T_{\text{period}} = 2$ ticks, inducing alternating surge and depletion across downstream nodes.
- **ORBIT Prediction:** Alarms `CRITICAL_CASCADE` at every peak, predicting unmitigated collapse ($BTD = 0.15$). Proposes aggressive emergency load-shedding ($C(U) = \$45\text{k}$).
- **Ground Truth:** Natural self-stabilizing oscillation; system recovers autonomously at $t+1$ without intervention ($BTD_{\text{effective}} = 0.95$).
- **Failure Mode:** False Alarm (High FAR) & Unnecessary Intervention Cost.
- **Failure Reason:** The static snapshot $X_t$ catches the system at the wave crest. ORBIT-A's forward model projects forward using mean velocity without estimating phase frequency, interpreting momentary kinematic velocity as permanent secular drift.
- **Remediation / Fix:** Introduce dynamic phase-space embedding (Takens' delay coordinates or Fourier modal decomposition) into the state vector to differentiate cyclic oscillations from monotonic degradation.

---

### Case 4: Instantaneous Graph Rewiring with Zero Physical Metric Delta
- **Scenario ID:** `OB-08-ADV-REWIRING`
- **Random Seed:** `seed = 9912`
- **System Configuration:** An adversarial agent cuts 3 vital arterial corridors and simultaneously connects 3 high-latency detour routes. Flow capacity remains unchanged, but path lengths triple.
- **ORBIT Prediction:** $\sigma_{\text{topo}} = 0.12$ (Minor rearrangement), $BTD = 1.10$.
- **Ground Truth:** Network experiences massive transit delay backlog, collapsing within 5 ticks ($BTD^* = 0.22$).
- **Failure Mode:** Delayed Critical Alert.
- **Failure Reason:** Node and edge Jaccard distance scores look only at net set cardinality. Because 3 edges were lost and 3 added, the component count was preserved, hiding the $300\%$ increase in communication diameter.
- **Remediation / Fix:** Replace set-based Jaccard similarity with all-pairs effective graph resistance or spectral radius delta $\Delta \lambda_1(L)$.

---

### Case 5: Deceptive Multi-Point Correlation (The "Mirage" Axis)
- **Scenario ID:** `OB-04-ADV-MIRAGE`
- **Random Seed:** `seed = 7731`
- **System Configuration:** Two highly correlated variables ($x_1, x_2$) diverge in opposite directions due to sensor recalibration, mimicking an imminent coupled cascade.
- **ORBIT Prediction:** $\theta^* = [+x_1, -x_2], \quad \widehat{BTD} = 0.18$ (DEFCON 1 Alert).
- **Ground Truth:** Safe equilibrium; physical invariant $x_1 + x_2 = \text{const}$ is preserved.
- **Failure Mode:** False Critical Transition Alert.
- **Failure Reason:** Distance metric weights each axis independently without subtracting empirical covariance.
- **Remediation / Fix:** Use regularized Mahalanobis distance $\|x\|_M = \sqrt{x^T \Sigma^{-1} x}$ parameterized by online running covariance matrix $\Sigma_t$.

---

## 3. Summary of Known Limitations

| Failure Category | Vulnerability | Algorithmic Bottleneck | Proposed Research Fix |
|---|---|---|---|
| **Observational** | Hidden / unmeasured state drift | Linear observation embedding | EKF / Physics-Informed Residual Observer |
| **Geometric** | Concave boundary crevices | Finite radial ray sampling | Projected Gradient Descent (PGD) contouring |
| **Dynamical** | Bullwhip frequency resonance | Static velocity forward model | Phase-space delay coordinate embedding |
| **Topological** | Iso-cardinal graph rewiring | Jaccard edge set metrics | Spectral Laplacian $\Delta \lambda_1(L)$ & Effective Resistance |
| **Statistical** | Correlated sensor drift | Diagonal weight matrix $W$ | Adaptive Mahalanobis covariance metric $\Sigma^{-1}$ |
