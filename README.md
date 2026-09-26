# 🛡️ AEGIS ZERO
### Autonomous Food Resilience & Cascade Engine (ORBIT-A 3.1)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/NTHG_OS_Theme-Monochrome-000000.svg?style=for-the-badge)](https://nothing.tech)
[![Quality Gates](https://img.shields.io/badge/Quality_Gates-80%2F80_PASS-10B981.svg?style=for-the-badge)](./src/orbit/__tests__/)
[![Scalability](https://img.shields.io/badge/Latency-29.8ms_(N%3D1000)-00E676.svg?style=for-the-badge)](./experiments/results/)
[![License](https://img.shields.io/badge/License-MIT-white.svg?style=for-the-badge)](./LICENSE)

---

## 🌟 Overview

**AEGIS ZERO** is a state-of-the-art autonomous food supply resilience, cascading collapse prevention, and boundary intelligence engine powered by **ORBIT-A 3.1**. 

Designed with a sleek, minimalist **NTHG OS (Nothing OS)** aesthetic, AEGIS ZERO provides real-time boundary transition distance tracking, non-linear structural coupling detection, multi-agent swarm orchestration, and Pareto-optimal counterfactual escape intervention computing for critical physical-digital logistics and agricultural supply chain networks.

Unlike traditional black-box forecasting tools, AEGIS ZERO models the **exact operational geometry** of food distribution systems, identifying failure cascades before they happen and offering actionable, minimum-cost mitigation strategies.

---

## ✨ Key Modules & Features

### 🌐 1. Physical-Digital Twin & Supply World
- **Global & Regional Node Mapping**: Real-time visualization of grain elevators, cold storage hubs, regional processing centers, and transit corridors.
- **Dynamic Stress Telemetry**: Live metric overlays tracking throughput, energy reserve, flow speed, and structural vulnerability.
- **Operational Intelligence Console**: Instant access to detailed node telemetry, fault propagation paths, and real-time stress analytics.

### 🌊 2. Cascade Autonomous Vision Tracker
- **Cascade Flow Graph (DAG)**: Interactive directed acyclic graph mapping cascade propagation between interconnected supply hubs.
- **Autonomous Vision Stream**: Integrated camera feedback stream analyzing visual telemetry and physical queue congestion.
- **Cascade Vulnerability Heatmaps**: Instant identification of bottleneck nodes causing systemic domino failures.

### 🤖 3. Autonomous Multi-Agent Swarm
- **Specialized Swarm Agents**: 
  - 🌾 *Agritech Agent*: Monitors crop yield predictions and harvest vectors.
  - 🚚 *Logistics Dispatcher*: Optimizes route allocation under corridor disruption.
  - ❄️ *Cold-Chain Auditor*: Prevents thermal degradation of perishable goods.
  - ⚖️ *Allocation Governor*: Balances equitable distribution during regional deficits.
- **Live Execution Stream**: Sub-second agent communication logs, consensus voting, and autonomous intervention dispatches.

### 🔮 4. Futures & Scenario Simulation Engine
- **Stress Testing Scenarios**: Simulate extreme climate events, fuel grid failures, corridor blockades, and geopolitical shocks.
- **Monte Carlo Resilience Projections**: Predict system recovery curves, state trajectory shifts, and recovery time estimates under varying parameters.

### 🔬 5. ORBIT-A 3.1 Lab & Command Center
- **Boundary Transition Distance (BTD) Radar**: 360° directional radar analyzing proximity to critical collapse thresholds across multi-dimensional state space.
- **Transition Boundary Intelligence (TBI) Decomposition**: Instant breakdown of risk into 4 core quantities:
  1. *Boundary Proximity (BP)*
  2. *Transition Momentum (TM)*
  3. *Structural Amplification (SA)*
  4. *Intervention Leverage (IL)*
- **Higher-Order Non-Linear Interaction Engine**: Dynamic screening of linear (Order 1), pairwise (Order 2), and triplet (Order 3) structural couplings.
- **Minimum Escape Intervention 2 (MEI-2)**: Multi-action escape portfolio optimizer mapping Pareto-optimal intervention pathways.

---

## 📐 Mathematical Framework

System state at discrete time step $t$:
$$X_t = (V_t, E_t, S_t, D_t)$$

The composite **Transition Boundary Intelligence (TBI)** score is calculated as:
$$\text{TBI} = \phi(\text{BP}, \text{TM}, \text{SA}, \text{IL}) \in [0, 1]$$

### Core Quantities Definition

| Quantity | Formula | Description |
|---|---|---|
| **Boundary Proximity (BP)** | $\text{BP} = \exp\left(-\frac{\text{BTD}_{\text{adaptive}}}{\sigma_{\text{scale}}}\right)$ | Normalized distance to non-equilibrium constraint boundaries. |
| **Transition Momentum (TM)** | $\text{TM} = \frac{\alpha \|v_t\|_2 + \beta \|a_t\|_2}{1 + \alpha \|v_t\|_2 + \beta \|a_t\|_2} \cdot \max(0, \cos(\theta_{\text{align}}))$ | Speed, acceleration, and alignment with dominant failure vector. |
| **Structural Amplification (SA)** | $\text{SA} = 1.0 + \gamma_{\text{shock}} \cdot \text{Shock} + \gamma_{\text{cent}} \cdot \Delta C_B$ | Topological amplification caused by network partition and bottlenecking. |
| **Intervention Leverage (IL)** | $\text{IL} = \min\left(1.0, \frac{\Delta \text{BTD}_{\text{best}}}{\text{Cost}(U^*) \cdot (1 + \rho_{\text{impact}})}\right)$ | Feasibility and efficiency of counterfactual escape maneuvers. |

---

## ⚡ Performance & Benchmarks

ORBIT-A 3.1 features **Compiled Adaptive Boundary Search (ABS)**, achieving $6.5\times$ performance acceleration:

| $N$ (Nodes) | Variables | Mean Latency | Median Latency | Ray Evaluations | Status |
|---|---|---|---|---|---|
| 10 | 20 | 1.17 ms | 0.96 ms | 200 | ✅ PASS |
| 50 | 100 | 1.74 ms | 1.67 ms | 200 | ✅ PASS |
| 100 | 200 | 2.90 ms | 3.03 ms | 200 | ✅ PASS |
| 250 | 500 | 7.07 ms | 7.12 ms | 200 | ✅ PASS |
| 500 | 1000 | 11.42 ms | 10.57 ms | 200 | ✅ PASS |
| **1000** | **2000** | **29.80 ms** | **31.55 ms** | **200** | ⚡ **PASSED (<50ms target)** |

- **Empirical Complexity**: $O(N)$ linear scaling slope ($\alpha = 0.707$).
- **Test Suite Pass Rate**: 100% (80/80 Quality Gates).

---

## 🔌 HTTP REST API Endpoints

The native HTTP REST API server runs on port `3001` (`npm run start:server`):

| Method | Endpoint | Functionality |
|---|---|---|
| `GET` | `/api/health` | System health check, version, and uptime telemetry |
| `GET` | `/api/version` | Version 3.1.0 engine manifest and capability flags |
| `GET` | `/api/datasets` | Catalog of registered provenance datasets |
| `GET` | `/api/datasets/:id` | Detailed dataset provenance metadata and SHA-256 hashes |
| `GET` | `/api/provenance` | Audit breakdown (`RAW`, `DERIVED`, `SIMULATED`, `SYNTHETIC`) |
| `GET` | `/api/metrics` | 4-leaderboard performance metrics |
| `POST` | `/api/analyze` | Run full ORBIT-A 3.1 analysis pipeline |
| `POST` | `/api/boundary` | Evaluate Adaptive Boundary Search and vulnerability rays |
| `POST` | `/api/intervention` | Generate MEI-2 escape portfolios along Pareto frontier |
| `POST` | `/api/shock/analyze` | Detect and classify instantaneous non-equilibrium shocks |
| `POST` | `/api/batch/analyze` | Execute batch inference across node arrays |
| `POST` | `/api/simulate` | Run custom scenario simulations |

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rshamith777-cpu/AEGIS-ZERO.git
   cd AEGIS-ZERO
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run quality gate unit tests:**
   ```bash
   npm run test:orbit
   ```

4. **Execute scalability benchmarks:**
   ```bash
   npm run benchmark:scalability
   ```

5. **Start the backend REST API server:**
   ```bash
   npm run start:server
   ```

6. **Start the development frontend web app:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5174` in your browser.

---

## 📁 Repository Structure

```
AEGIS ZERO/
├── docs/                                    # Research documentation & baseline audits
│   ├── ORBIT_A_3_1_BASELINE.md
│   ├── ORBIT_A_3_1_INTERACTION_ABLATION.md
│   └── ORBIT_A_3_1_FINAL_AUDIT.md
├── src/
│   ├── components/                          # NTHG OS UI Modules
│   │   ├── Navigation/                      # LeftRail & Navigation components
│   │   ├── World/                           # Physical-Digital Twin World View
│   │   ├── Cascade/                         # Cascade Vision & DAG Tracker
│   │   ├── Agents/                          # Multi-Agent Swarm Cockpit
│   │   ├── Futures/                         # Scenario & Simulation Engine
│   │   └── OrbitLab/                        # BTD Radar & TBI Command Center
│   ├── orbit/                               # ORBIT-A 3.1 Algorithmic Engine
│   │   ├── v3/                              # Core Inference, Shock & ABS Engines
│   │   └── __tests__/                       # Quality Gate Test Suite
│   ├── data/                                # Data ingestion & provenance adapters
│   └── server/                              # HTTP REST API server
├── public/                                  # Static assets & icons
└── vite.config.ts                           # Vite configuration
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---
*AEGIS ZERO — Autonomous & Resilient Engineering for Global Food Security Systems.*
