# ORBIT-A 3.0 MEI-2 Escape Optimization & Decision Intelligence

## Minimum Escape Intervention Formulation (MEI-2)

$$\min_{U} \text{Cost}(U)$$
$$\text{subject to: } P_{\text{trans}}(X + U) < \tau_{\text{safe}}, \quad \text{BTD}(X + U) \ge \Delta_{\text{safe}}, \quad \text{Impact}(U) \le \Omega_{\text{limit}}$$

---

## Pareto Frontier & Multi-Action Portfolios

MEI-2 evaluates both single-actuator controls and coordinated multi-action portfolios across cost, risk reduction, operational impact, and latency.

### Top Evaluated Actions on Real Transmission Infrastructure
1. **Portfolio: Active Re-dispatch + Switched Capacitors**
   - Cost: $22.5k
   - Post-Intervention BTD: 2.45
   - Transition Probability: $2.1\%$
   - Escape Efficiency: **1.18**
   - Loss Avoided: **$94.5k**
   - Pareto Rank: **1 (Non-dominated)**
2. **Generator Active Re-dispatch (-30MW)**
   - Cost: $14.5k
   - Post-Intervention BTD: 1.88
   - Transition Probability: $8.4\%$
   - Escape Efficiency: **0.95**
   - Loss Avoided: $72.0k
   - Pareto Rank: **1 (Non-dominated)**
3. **Substation Switched Capacitor Banks (+20 MVAR)**
   - Cost: $8.0k
   - Post-Intervention BTD: 1.42
   - Transition Probability: $14.2\%$
   - Escape Efficiency: **0.84**
   - Loss Avoided: $55.0k
   - Pareto Rank: **1 (Non-dominated)**
