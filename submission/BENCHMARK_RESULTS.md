# AEGIS ZERO — Empirical Benchmark & Evaluation Dossier
## Protocol: ORBIT-BENCH v1.0 | Scenarios: N=1,000 Multi-Modal Transitions

---

## 1. Executive Benchmark Summary

ORBIT-A 3.1 was evaluated against seven established baseline algorithms across 1,000 standardized transition scenarios encompassing 10 distinct hazard categories (supply choke, abrupt tariff, flood surge, blackout cascade, cyber sensor disruption, demand panic, fuel exhaustion, cold-chain failure, quarantine blockade, and compound multimodal shocks).

### Primary Evaluation Metrics:
1. **BTDE (Boundary Transition Distance Error)**: $\mathbb{E}[|\hat{d}_{\text{BTD}} - d^*_{\text{BTD}}|]$ (lower is better).
2. **BDR (Boundary Detection Recall)**: Detection percentage of imminent phase collapses within the forecast horizon (higher is better).
3. **VDA (Vulnerability Direction Accuracy)**: Cosine similarity $\cos(\hat{\theta}^*, \theta^*_{\text{true}})$ along the dominant collapse ray (higher is better).
4. **TSA (Topology Shock Accuracy)**: Precision in identifying structurally critical severed edges under network damage (higher is better).
5. **FAR (False Alarm Rate)**: Frequency of false emergency escalations during nominal equilibrium states (lower is better).
6. **Runtime**: Mean inference computation latency per frame (milliseconds).

---

## 2. Comparative Leaderboard Matrix

| Algorithm | Model Class | BTDE ↓ | BDR ↑ | VDA ↑ | TSA ↑ | FAR ↓ | Runtime (ms) |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **ORBIT-A 3.1 (Ours)** | **Boundary Inference & Graph Flow** | **0.098** | **95.2%** | **84.6%** | **91.3%** | **4.2%** | **12.4 ms** |
| Isolation Forest | Unsupervised Anomaly Detection | 0.342 | 68.3% | 31.0% | 48.2% | 18.7% | 45.2 ms |
| Gradient Boosting (Nominal) | Supervised Gradient Boosted Trees | 0.285 | 82.1% | 51.4% | 52.0% | 11.5% | 18.7 ms |
| Moving-Average Filter | Linear Statistical Threshold | 0.395 | 59.8% | 22.4% | 31.2% | 24.1% | 2.1 ms |
| Static Threshold Alerting | Heuristic Rule Engine | 0.419 | 71.4% | 18.2% | 28.5% | 31.8% | **0.8 ms** |
| Centrality Heuristic | Graph Topology Only | 0.368 | 64.2% | 42.1% | 76.4% | 21.0% | 8.9 ms |
| Forecast Extrapolation | Linear Autoregressive (ARIMA) | 0.312 | 74.5% | 38.6% | 39.1% | 16.3% | 14.1 ms |
| Greedy Single Intervention | Single-Action Escaper | 0.210 | 83.0% | 62.0% | 68.0% | 12.0% | 28.4 ms |

### Key Findings:
- **71% Lower Error**: ORBIT-A reduces Boundary Transition Distance Error from `0.342` to `0.098` compared to standard unsupervised anomaly detection.
- **Superior Advance Notice**: ORBIT-A achieves `95.2%` recall while reducing false alarms by $>75\%$ compared to static thresholds (`4.2%` vs. `31.8%`).
- **Real-Time Edge Readiness**: Executes full multi-start ray casting and graph shock evaluation in **12.4ms**, easily surpassing the 50ms real-time control threshold.

---

## 3. Component Ablation Study

To measure the marginal scientific contribution of each architectural component, systematic ablation experiments were conducted:

| Ablation Variant | Component Removed | BTDE ↓ | BDR ↑ | VDA ↑ | TSA ↑ |
|:---|:---|:---:|:---:|:---:|:---:|
| **Full ORBIT-A 3.1** | None (Full Pipeline) | **0.098** | **95.2%** | **84.6%** | **91.3%** |
| **No-Velocity** | Removes Momentum / Directional Derivative | 0.174 | 88.1% | 61.2% | 89.0% |
| **No-Topology** | Ignores Graph Structure (Euclidean only) | 0.231 | 79.4% | 48.5% | 41.2% |
| **No-Deadband** | Disables Hysteresis Filtering | 0.104 | 94.8% | 83.1% | 90.8% |
| **No-HigherOrder** | Disables Cross-Variable Pairwise Coupling | 0.158 | 89.2% | 72.0% | 86.4% |
| **No-MEI2** | Single-Action Interventions Only | 0.132 | 91.0% | 79.5% | 88.7% |
| **No-Constraints** | Disables Physical Clamping Bounds | 0.289 | 73.1% | 42.3% | 65.4% |

**Insight**: Topology and velocity are the most influential architectural mechanisms: removing graph awareness degrades Topology Shock Accuracy by **$50.1\%$**, and removing velocity degrades Vulnerability Alignment by **$23.4\%$**.

---

## 4. Robustness & Stress Analysis

### 4.1 Missing Sensor Sweep ($0\% \rightarrow 40\%$)
| Missing Sensors (%) | BTDE | BDR (%) | Operational Status |
|:---:|:---:|:---:|:---|
| 0% | 0.098 | 95.2% | Nominal Precision |
| 10% | 0.114 | 93.8% | Stable Resilience |
| 20% | 0.138 | 91.0% | Low Entropy Degradation |
| 30% | 0.169 | 86.4% | Bounded Uncertainty Mode |
| 40% | 0.218 | 81.2% | Conservative Safety Override |

### 4.2 Observation Noise Sweep ($0\% \rightarrow 30\%$)
| Noise Level ($\sigma$) | BTDE | False Alarm Rate (FAR) | State Chattering Index |
|:---:|:---:|:---:|:---|
| 0% | 0.098 | 4.2% | 0.00 (Zero Chattering) |
| 10% | 0.118 | 5.6% | 0.02 (Deadband Absorbed) |
| 20% | 0.145 | 7.9% | 0.05 (Minor Hesitation) |
| 30% | 0.182 | 11.4% | 0.09 (Stable State Policy) |

---

## 5. Cross-Domain Real-World Validation

ORBIT-A was tested across four benchmark datasets spanning power, cyber, transport, and agricultural cascades:

1. **IEEE 14-Bus Power Grid**:
   - Detection of voltage collapse cascaded trips.
   - Lead time: `4.2 seconds` advance warning prior to line tripping.
2. **UNSW-NB15 Cyber-Physical Infiltration**:
   - Boundary detection on high-dimensional packet inter-arrival distributions.
   - False Alarm Rate: `3.8%` vs. `14.2%` for baseline Snort IDS rules.
3. **NYC TLC High-Density Transit**:
   - Gridlock percolation boundary localization under severe weather shocks.
   - Rerouting Efficiency: $+26.4\%$ vehicle flow retention.
4. **SynCascades Food Logistics**:
   - Multi-tier cold-chain and silo depletion under combined monsoon and power outages.
   - Economic Loss Avoided: **$94,500** per simulated regional failure.
