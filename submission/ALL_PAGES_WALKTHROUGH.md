# AEGIS ZERO — All Pages & Systems Walkthrough

This document provides a comprehensive operational and technical walkthrough of all 9 core interfaces and laboratories in **AEGIS ZERO**.

---

## 1. Overview & Command Cockpit
- **Route / Tab**: `/` (Overview)
- **Screenshot**:
  ![Overview Cockpit](screenshots/overview.png)
- **Primary Function**: The central situational command dashboard providing an at-a-glance status of global food supply networks.
- **Key Modules**:
  - **Global Food Security Index (GFSI)**: Real-time composite readiness score (Nominal / At Risk / Critical).
  - **Critical Alert Ribbon**: Active alerts with live severity ratings, epicenter localization, and tick timestamps.
  - **Active Node Health Matrix**: Health, throughput, buffer status, and inventory velocity for key agricultural hubs (Punjab, Maharashtra, Rhine-Ruhr, Midwest Grain Belt, Mekong Delta).
  - **Quick Action Hub**: Immediate escalation, autonomous swarm deployment, and chaos injection triggers.

---

## 2. Mission Timeline & Live Operations
- **Route / Tab**: Mission Timeline
- **Screenshot**:
  ![Mission Timeline](screenshots/mission.png)
- **Primary Function**: High-temporal resolution simulation scrubbing across historical, current, and forecasted horizons ($T-60\text{m}$ to $T+120\text{m}$).
- **Key Modules**:
  - **Temporal Scrubber**: Step-by-step or continuous play/pause simulation scrubber.
  - **Incident Evolution Tree**: Cascading event branches with conditional trigger indicators.
  - **Operational TBI Plot**: Real-time Transition Boundary Index tracking across simulated hours.

---

## 3. Digital Twin & Geographic Telemetry Graph
- **Route / Tab**: Digital Twin
- **Screenshot**:
  ![Digital Twin](screenshots/world.png)
- **Primary Function**: Interactive 3D/2D geospatial supply topology visualization, rendering multimodal nodes (grain silos, processing facilities, maritime ports, cold storage) and transportation corridors.
- **Key Modules**:
  - **Interactive Node Inspector**: Real-time metric breakdown for any selected node (temperature, stock, utilization, power, and upstream/downstream connections).
  - **Dynamic Flow Particle System**: Visualizes freight throughput velocity and congestion bottlenecks.
  - **Disruption Overlay**: Real-time climate disasters, grid blackouts, and blockade zones rendered directly onto geographic corridors.

---

## 4. Cascade Dynamics & Failure Propagation Radar
- **Route / Tab**: Cascade Dynamics
- **Screenshot**:
  ![Cascade Dynamics](screenshots/cascade.png)
- **Primary Function**: Physics-inspired graph shock modeling that computes how localized failures propagate through non-linear supply interdependencies.
- **Key Modules**:
  - **Causal Radar Matrix**: Visualizes risk vectors expanding across secondary and tertiary tiers.
  - **Topology Shock Detector**: Detects severed graph edges and computes structural shock amplification:
    $$\text{Amplification} = \sum_{e \in E_{\text{severed}}} \frac{\text{Betweenness}(e)}{\text{Network Redundancy}}$$
  - **Vulnerability Direction Vector**: Identifies the exact dimension in state-space driving the network closest to collapse.

---

## 5. Autonomous Agent War Room & Swarm Intelligence
- **Route / Tab**: Swarm Agents
- **Screenshot**:
  ![Autonomous Agents](screenshots/agents.png)
- **Primary Function**: Multi-agent cybernetic command room where specialized AI agents collaborate, debate, and execute mitigation protocols.
- **Agent Roles**:
  - **Sentry-1 (Logistics Rerouter)**: Optimizes freight rerouting and multi-modal transport dispatch.
  - **Arbiter-2 (Inventory Balancer)**: Reallocates buffer reserves and manages rationing protocols.
  - **Aegis-Lead (Synthesizer)**: Weighs humanitarian impact, cost, and time-to-recovery to greenlight plans.
- **Interactive Features**:
  - Live agent dialogue stream with confidence scores and reasoning traces.
  - Manual override toggle with full telemetry logs.

---

## 6. Futures Lab & Counterfactual Multi-Scenario Planner
- **Route / Tab**: Futures Lab
- **Screenshot**:
  ![Futures Lab](screenshots/futures.png)
- **Primary Function**: Monte Carlo scenario engine evaluating alternative future intervention pathways.
- **Key Modules**:
  - **Plan Comparison Matrix (Plan A vs. Plan B vs. Plan C)**: Evaluates loss avoided, transit delays, vehicle dispatch, and carbon impact.
  - **Counterfactual BTD Projection**: Shows how each intervention shifts the system away from the boundary ($\Delta \text{BTD}$).
  - **Execution Protocol**: One-click deployment of synthesized interventions to live operational networks.

---

## 7. Orbit Lab (ORBIT-A 3.1 Research & Benchmark Suite)
- **Route / Tab**: Orbit Lab
- **Screenshot**:
  ![Orbit Lab Cockpit](screenshots/orbit.png)
- **Primary Function**: The scientific core of AEGIS ZERO. Houses the boundary inference engine, BTD radar, TBI decomposition, and benchmark laboratories.
- **Sub-Tabs**:
  1. **Boundary Radar**: Multi-axis radar rendering distance to regime boundary across 6 physical planes.
  2. **TBI Decomposition**: Four-variable breakdown of the Transition Boundary Index.
  3. **High-Order Interactions**: Explores cross-variable coupling ($X_i \times X_j$).
  4. **Intervention War Room**: Pareto escape curve optimizer ($U^*$).
  5. **Benchmark Lab (ORBIT-BENCH)**: Live non-blocking benchmarking across $N \in [10, 25, 50, 100]$ scenarios.
  6. **Ablation Lab**: Component isolation study isolating velocity, topology, and deadband layers.
  7. **Robustness Lab**: Sensitivity sweeps against missing sensors ($0-40\%$) and noise ($0-30\%$).
  8. **Research Report**: Peer-review ready in-app formal mathematical specification.

---

## 8. Chaos Engine & Adversarial Shock Generator
- **Route / Tab**: Chaos Engine
- **Screenshot**:
  ![Chaos Engine](screenshots/chaos.png)
- **Primary Function**: Interactive stress-testing suite inspired by Chaos Engineering principles.
- **Injected Perturbations**:
  - **Extreme Monsoon Flooding**: Disables riverine and rail freight corridors.
  - **Cold-Chain Cyber Blackout**: Spoofs sensor readings and knocks out refrigerated hubs.
  - **Export Embargo / Tariff Spike**: Injects sudden geopolitical price shocks.
  - **Fuel Logistics Depletion**: Halts diesel transit fleets in agricultural hubs.

---

## 9. Episodic Memory Bank & Decision Provenance
- **Route / Tab**: Episodic Memory
- **Screenshot**:
  ![Episodic Memory](screenshots/memory.png)
- **Primary Function**: Immutable audit trail and vector memory bank capturing historical disruptions, agent consensus logs, and recovery outcomes.
- **Key Modules**:
  - **Vector Similarity Search**: Matches current disruption patterns against past historical incidents (e.g., 2020 Suez Canal blockage, 2022 Black Sea grain corridor).
  - **Lessons Learned Graph**: Updates agent heuristic weights based on past intervention successes.
  - **Cryptographic Provenance**: SHA-256 verifiable signatures for every automated agent command.
