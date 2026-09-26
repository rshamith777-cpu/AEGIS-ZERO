# AEGIS ZERO — Autonomous Food Resilience & Cascade Engine (ORBIT-A 3.1)
## Official Project Submission & Research Dossier

![AEGIS ZERO Hero Banner](screenshots/hero_banner.jpg)

---

## 🏛️ Executive Summary

**AEGIS ZERO** is a next-generation cybernetic resilience engine engineered to safeguard critical humanitarian and agricultural supply chains from catastrophic, cascading systemic failures. 

Traditional anomaly detection systems monitor single-node scalar thresholds, firing only *after* disruptions occur, leading to cascading supply collapses. **AEGIS ZERO** introduces **ORBIT-A 3.1** (*Operational Resilience Boundary & Inference Transform*), which continuously estimates the latent mathematical boundary separating recoverable operational regimes from irreversible systemic phase transitions.

By operating in the state-space of coupled logistical, climatic, infrastructural, and economic variables, AEGIS ZERO computes the **Boundary Transition Distance (BTD)**, localizes the most hazardous directional vulnerabilities ($\theta^*$), and automatically synthesizes minimum-energy multi-agent counter-interventions ($U^*$) on the Pareto escape frontier.

---

## 📑 Submission Folder Contents

This submission directory contains complete technical documentation, empirical benchmark evaluations, test verification logs, interactive web presentations, and reproducible datasets:

| File / Folder | Description |
|:---|:---|
| [`ALL_PAGES_WALKTHROUGH.md`](ALL_PAGES_WALKTHROUGH.md) | Exhaustive breakdown and architectural guide for all 9 cockpit pages & labs |
| [`TEST_AND_EVALUATION_REPORT.md`](TEST_AND_EVALUATION_REPORT.md) | 80/80 Quality Gates test report: unit, integration, invariant audits & API tests |
| [`BENCHMARK_RESULTS.md`](BENCHMARK_RESULTS.md) | ORBIT-BENCH vs. 7 competitive baselines, ablation studies & real-world benchmarks |
| [`index.html`](index.html) | Interactive offline submission dashboard with embedded metrics, logs, and screenshots |
| [`screenshots/`](screenshots/) | High-resolution captures of every interface, radar, and analytical cockpit |
| [`data/`](data/) | Benchmark CSVs and JSONs (IEEE 14-bus, UNSW-NB15, NYC TLC, SynCascades) |

---

## 🧭 System Architecture & Mathematical Foundations

```
   ┌─────────────────────────────────────────────────────────────┐
   │                   AEGIS ZERO COMMAND MATRIX                 │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│ DIGITAL TWIN │          │ ORBIT-A 3.1  │          │ SWARM AGENTS │
│ Global Flow  │◄────────►│ LATENT BOUND │◄────────►│ Autonomous   │
│ & Telemetry  │          │ INFERENCE    │          │ War Room     │
└──────────────┘          └──────┬───────┘          └──────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│ CASCADE RADAR│          │ FUTURES LAB  │          │ CHAOS ENGINE │
│ Graph Shocks │          │ Multi-Branch │          │ Adversarial  │
│ Propagation  │          │ Pareto Plans │          │ Stress Tests │
└──────────────┘          └──────────────┘          └──────────────┘
```

### Core Equations:
1. **Boundary Transition Distance (BTD)**:
   $$\text{BTD}(X) = \min_{\delta} \|\delta\| \quad \text{s.t.} \quad \text{Regime}(\hat{F}(X + \delta)) \neq \text{Regime}(X)$$
2. **Directional Vulnerability ($\theta^*$)**:
   $$\theta^* = \arg\min_{\theta} \text{BTD}(X, \theta)$$
3. **Graph Topology Shock Amplification**:
   $$\text{Shock}(G_t, G_{t+1}) = \mathcal{D}_{\text{graph}}(G_t, G_{t+1}) \cdot \sum_{e \in E_{\text{severed}}} \text{Centrality}(e)$$
4. **Minimum-Energy Pareto Intervention ($U^*$)**:
   $$U^* = \arg\min_U \mathcal{C}(U) \quad \text{s.t.} \quad \text{BTD}(\hat{F}(X, U)) \ge \text{BTD}_{\text{safe}}$$

---

## 🚀 Quick Start & Verification

### Prerequisites
- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
# Server initializes at http://localhost:5174/
```

### 3. Run Quality Gates & Research Tests (80/80 Tests)
```bash
npm run test:orbit
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 📊 Summary Benchmark Performance

Across 1,000 synthetic multi-modal disaster scenarios, **ORBIT-A 3.1** demonstrates statistically superior performance over traditional supervised and heuristic approaches:

- **Boundary Transition Distance Error (BTDE)**: `0.098` vs. `0.342` (Isolation Forest) vs. `0.419` (Static Thresholds)
- **Boundary Detection Recall (BDR)**: `95.2%` vs. `71.4%` (Static Alerting)
- **Intervention Cost Efficiency**: `1.48` escape efficiency ($94.5k loss avoided)
- **Inference Latency ($N=250$)**: `12.3ms` (Real-time edge compliance)

*(See [`BENCHMARK_RESULTS.md`](BENCHMARK_RESULTS.md) for full matrix)*.
