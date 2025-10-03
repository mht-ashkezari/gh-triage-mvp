# KPIs

| key | target | cadence | description |
|---|---|---|---|
| json_validity_rate | >= 0.98 | per_run | Percentage of LLM JSON outputs that pass schema validation (after ≤2 repair attempts). |
| a2e_p50_seconds | <= 60 | daily | 50th percentile runtime for a full pipeline run. |
| a2e_p95_seconds | <= 120 | daily | 95th percentile runtime for a full pipeline run. |
| label_f1 | >= 0.70 | weekly | Micro-averaged F1 on a held-out set from the reference repo(s). |
| dup_at_5 | >= 0.60 | weekly | Mean hit-rate of the true duplicate in the top-5 ranked results. |
| release_edit_rate | <= 0.30 | weekly | Fraction of release-draft entries edited/removed by a maintainer. |
| mean_cost_usd_per_run | <= 0.25 | daily | Average provider cost for A→E runs over a recent window. |
