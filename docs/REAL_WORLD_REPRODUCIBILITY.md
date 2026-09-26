# Real-World Experiment Reproducibility Guide

### One-Command Reproduction
To execute the entire real-world validation protocol, run:

```bash
npm run research:real
```

### Execution Details
- **Artifacts Written:**
  - Machine-readable JSON: `C:\Users\SUMITH R\Desktop\AEGIS ZERO\experiments\results\realworld_research_validation.json`
  - Machine-readable CSV: `C:\Users\SUMITH R\Desktop\AEGIS ZERO\experiments\results\realworld_leaderboard.csv`
  - Markdown Reports: `docs/REAL_WORLD_*.md`
- **Data Provenance:** Documented in `docs/REAL_WORLD_DATA_CARD.md`
- **Deterministic Random Seeds:** Fixed schedules (42001, 91823) guarantee identical temporal graph generation.
