# ORBIT-A 3.0 Statistical Rigor & Hypothesis Testing

**Methodology:**
- Non-parametric bootstrap resamples: $B = 1,000$ iterations
- Confidence level: 95% two-sided intervals $[CI_{\text{low}}, CI_{\text{high}}]$
- Effect size metric: Cohen's $d = \frac{\bar{X}_A - \bar{X}_B}{s_{\text{pooled}}}$
- Multiple comparisons correction: Holm-Bonferroni step-down adjustment

---

## Pairwise Statistical Comparisons

### Comparison: ORBIT-A 3.0 vs ORBIT-A v2.0 (Escape Efficiency (eta))
- **Difference in Means:** +0.0013
- **95% Bootstrap CI [ORBIT-A 3.0]:** [0.003, 0.0046]
- **95% Bootstrap CI [ORBIT-A v2.0]:** [0.0021, 0.0031]
- **Cohen's d Effect Size:** **0.891** (LARGE)
- **Raw Student's t p-value:** 0.0005
- **Holm-Bonferroni Adjusted p-value:** **0.0015**
- **Statistically Significant ($alpha = 0.05$):** **YES**

### Comparison: ORBIT-A 3.0 vs Greedy Baseline (Escape Efficiency (eta))
- **Difference in Means:** +0.0023
- **95% Bootstrap CI [ORBIT-A 3.0]:** [0.003, 0.0046]
- **95% Bootstrap CI [Greedy Baseline]:** [0.0013, 0.0019]
- **Cohen's d Effect Size:** **1.813** (LARGE)
- **Raw Student's t p-value:** 0.0001
- **Holm-Bonferroni Adjusted p-value:** **0.0003**
- **Statistically Significant ($alpha = 0.05$):** **YES**

