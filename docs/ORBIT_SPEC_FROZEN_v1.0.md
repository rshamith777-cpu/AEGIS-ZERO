# ORBIT Framework Frozen Specification (v1.0.0-FROZEN)

**Specification Release Date:** September 2026  
**Status:** Frozen for Peer-Review & Scientific Reproduction  
**Hash Identifier:** `ORBIT-v1.0.0-PROD-VERIFIED`  

---

## 1. Frozen System Identifiers

- **Core Algorithmic Framework:** `ORBIT` (*Operational Resilience Boundary & Inference Transform*)
- **Core Inference Algorithm:** `ORBIT-A v1.0` (*Operational Boundary Inference & Transition Algorithm*)
- **Evaluation Benchmark:** `ORBIT-Bench v1.0` (*Open Regime-Boundary & Intervention Transition Benchmark*)
- **Metrics Standard:** `ORBIT Metrics v1.0` (10 Formal Metrics: BTDE, BDR, VDA, TSA, CHL, MIR, RSE, FAR, OAR, UCE)
- **Experimental Protocol:** `ORBIT Research Protocol v1.0` (Fixed Seeds: `42, 1337, 2026, 9999, 10101`, Holdout: `9001-9100`)

---

## 2. Frozen Mathematical Core Equations

### 2.1 State-Space Representation
$$X_t = (V_t, E_t, S_t, D_t), \quad x = \text{flatten}(X_t) \in \mathbb{R}^D$$

### 2.2 Scale-Invariant Distance Metric
$$\|x - y\|_W = \sqrt{\frac{\sum_{i=1}^D w_i \left(\frac{x_i - y_i}{x_i^{\max} - x_i^{\min}}\right)^2}{\frac{1}{D}\sum_{i=1}^D w_i}}$$

### 2.3 Boundary Transition Distance (BTD)
$$\text{BTD}(X_0) = \inf_{\delta \in \mathbb{R}^D} \left\{ \|\delta\|_W : \text{Regime}\left(\hat{F}(X_0 + \delta)\right) \ne \text{Regime}(X_0) \right\}$$

### 2.4 Worst-Case Vulnerability Direction ($\theta^*$)
$$\text{BTD}(X_0, \theta) = \inf_{\alpha > 0} \{\alpha : \hat{F}(X_0 + \alpha \theta) \notin \mathcal{R}_{\text{safe}}\}, \quad \theta^* = \arg\min_{\theta \in \mathbb{S}^{D-1}} \text{BTD}(X_0, \theta)$$

### 2.5 Topology Shock Metric ($\sigma_{\text{topo}}$)
$$\sigma_{\text{topo}}(G_0, G_t) = w_v \cdot \Delta_{\text{nodes}} + w_e \cdot \Delta_{\text{edges}} + w_c \cdot \Delta_{\text{centrality}} + w_p \cdot \Delta_{\text{components}} + w_d \cdot \Delta_{\text{deps}}$$
where $(w_v, w_e, w_c, w_p, w_d) = (0.20, 0.30, 0.15, 0.15, 0.20)$.

### 2.6 Unified Optimization Objective
$$J(\delta, U; X_t, G_t) = w_{\text{margin}} \cdot \frac{\text{BTD}\left(\hat{F}(X_t + \delta, U)\right)}{BTD_{\text{safe}}} + w_{\text{risk}} \cdot \Delta \mathcal{P}_{\text{trans}} - w_{\text{cost}} \cdot \frac{C(U)}{C_{\text{ref}}} - w_{\text{shock}} \cdot \sigma_{\text{topo}}(G_0, G(U)) - w_{\text{uncert}} \cdot (1 - \text{conf})$$
$$\text{subject to} \quad \text{BTD}\left(\hat{F}(X_t + \delta, U)\right) \ge BTD_{\text{safe}}, \quad C(U) \le R_{\text{budget}}$$

---

## 3. Frozen Hyperparameters

| Parameter | Symbol | Frozen Value | Physical Meaning |
|---|---|---|---|
| Safe BTD Threshold | $BTD_{\text{safe}}$ | $1.25$ | Margin required to classify system in Recoverable Equilibrium |
| Topology Shock Threshold | $\tau_{\text{topo}}$ | $0.30$ | Structural disruption index triggering structural alert |
| Prediction Horizon | $H$ | $16$ | Number of forward Euler transition steps |
| Perturbation Rays | $K$ | $64$ | Axis-aligned, diagonal, and spherical search rays |
| Ray Bisection Depth | $I$ | $14$ | Logarithmic search iterations ($\varepsilon \le 6 \times 10^{-5}$) |
| Monte Carlo Samples | $S$ | $128$ | State perturbation count for 95% CI estimation |
| Margin Weight | $w_{\text{margin}}$ | $0.35$ | Unified objective weight on boundary distance expansion |
| Risk Weight | $w_{\text{risk}}$ | $0.35$ | Unified objective weight on transition risk reduction |
| Cost Weight | $w_{\text{cost}}$ | $0.15$ | Unified objective weight on intervention resource penalty |
| Shock Weight | $w_{\text{shock}}$ | $0.10$ | Unified objective weight on graph structural disruption |
| Uncertainty Weight | $w_{\text{uncert}}$ | $0.05$ | Unified objective weight on variance penalty |
| Reference Cost Scale | $C_{\text{ref}}$ | $100.0$ | Dollar / energy cost normalizer |

---

## 4. Frozen Software Environment & Seeds
- Language: TypeScript 5.8+ (Strict Mode)
- Runtime: Node.js v20+ / Vite 6+
- Training / Validation Seeds: `[42, 1337, 2026, 9999, 10101]`
- Independent Holdout Seeds: `[9001 ... 9100]`
- All 10 scenario families, 7 baselines, 7 ablations, and 5 domain adapters frozen as specified.
