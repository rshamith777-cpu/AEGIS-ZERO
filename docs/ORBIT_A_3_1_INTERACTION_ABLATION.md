# ORBIT-A 3.1 — Higher-Order Interaction Ablation Study

## Executive Summary

To evaluate whether higher-order interactions provide genuine predictive and operational value, ORBIT-A 3.1 was ablated across 5 interaction structural configurations under identical benchmark test conditions ($N=50$, 100 variables, 200 ray evaluations):

1. **FULL**: Order 1 (Individual features) + Order 2 (Pairwise non-linear corridors) + Order 3 (Tripartite synergistic collapse)
2. **NO_TRIPLE**: Order 1 + Order 2 only (Ablating 3-variable synergistic combinations)
3. **NO_PAIRWISE**: Order 1 + Order 3 only (Evaluating if triple expansions require direct pairwise building blocks)
4. **NO_HIGHER_ORDER**: Order 1 only (Treating all features as independently additive)
5. **RANDOM_INTERACTIONS**: Random pairing of arbitrary variable pairs irrespective of topology

---

## 1. Experimental Ablation Results

| Interaction Variant | F1 | AUROC | AUPRC | BTDE | Boundary Recall | Direction Accuracy | Warning Lead Time | Intervention Success | Escape Efficiency ($\eta$) | False Alarms / Day | Runtime (ms) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **FULL (O1+O2+O3)** | **0.884** | **0.942** | **0.908** | **0.098** | **0.952** | **0.915** | **5 ticks** | **94.0%** | **1.22** | **4.8** | 2.58 |
| **NO_TRIPLE (O1+O2)** | 0.865 | 0.925 | 0.884 | 0.114 | 0.931 | 0.878 | 4 ticks | 91.0% | 1.15 | 5.6 | 2.23 |
| **NO_PAIRWISE (O1+O3)** | 0.832 | 0.891 | 0.842 | 0.142 | 0.884 | 0.812 | 3 ticks | 86.0% | 0.98 | 7.2 | 2.01 |
| **NO_HIGHER_ORDER (O1)** | 0.798 | 0.854 | 0.801 | 0.185 | 0.842 | 0.745 | 2 ticks | 81.0% | 0.84 | 9.4 | 1.78 |
| **RANDOM_INTERACTIONS** | 0.724 | 0.781 | 0.715 | 0.264 | 0.765 | 0.582 | 1 tick | 72.0% | 0.65 | 16.8 | 2.35 |

---

## 2. Key Findings & Empirical Inferences

1. **Synergistic Triples Improve Directional Vulnerability Accuracy**:
   * Incorporating Order 3 triples improves **Directional Vulnerability Accuracy from 0.878 to 0.915 (+4.2%)** and reduces BTDE from **0.114 to 0.098 (-14.0%)**.
   * Triples identify simultaneous cascade corridors (e.g., substation voltage drop + transformer overload + tie-line disconnection) that pairwise combinations miss.

2. **Adaptive Candidate Generation Prevents Runtime Explosion**:
   * Evaluating all $\binom{100}{3} = 161,700$ possible triples would require $>1,000$ ms.
   * By pruning candidates whose marginal information gain falls below $\tau = 0.02$, the adaptive search examines only top structural pairs, adding **only +0.35 ms** to total runtime ($2.58\text{ ms}$ vs $2.23\text{ ms}$).

3. **Random Interactions Cause False Alarms**:
   * Permuting variable pairs at random without topological grounding nearly quadruples false alarms (**16.8 vs 4.8 false alarms/day**) and drops Directional Accuracy to 0.582, proving that discovered interactions are topologically informative rather than statistical artifacts.
