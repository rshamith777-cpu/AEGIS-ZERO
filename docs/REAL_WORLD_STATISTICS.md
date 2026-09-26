# Real-World Statistical Significance & Effect Size Report

This document records rigorous non-parametric bootstrap confidence intervals, paired hypothesis tests, and Cohen's d effect sizes.

| Comparison | Metric | Mean A | Mean B | Difference | 95% Bootstrap CI [A] | 95% Bootstrap CI [B] | Cohen's d | Effect Magnitude | p-value | Significant (p<0.05) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ORBIT-A v2.0** vs **ORBIT-A v1.0** | F1 Score | 0.858 | 0.709 | +0.149 | [0.8438, 0.8712] | [0.6962, 0.7225] | 6.937 | **LARGE** | 0.0001 | **YES** |
| **ORBIT-A v2.0** vs **Forecast-Only** | F1 Score | 0.858 | 0.755 | +0.102 | [0.8425, 0.8713] | [0.745, 0.765] | 5.243 | **LARGE** | 0.0001 | **YES** |
| **ORBIT-A v2.0** vs **Isolation Forest** | F1 Score | 0.858 | 0.657 | +0.200 | [0.8425, 0.87] | [0.6425, 0.6725] | 8.881 | **LARGE** | 0.0001 | **YES** |
