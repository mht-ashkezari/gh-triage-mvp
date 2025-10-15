# Repo Selection Criteria

We score candidate repos using normalized features weighted by `configs/repo_scoring.yaml`.

## Features (all normalized to 0–1)

- **Volume** — activity proxy (issues + PRs + stars/forks), capped by `caps.volume_max`.
- **Labels** — count of distinct labels (encourages triage-ability).
- **RecentActivity90d** — items updated in the last 90 days, capped by `caps.recent_activity_max`.
- **LicensePermissive** — 1 if license ∈ {MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, Unlicense}, else 0.
- **Templates** — 1 if `.github/ISSUE_TEMPLATE` or issue forms exist, else 0.
- **LanguageAlignment** — 1 if primary language ∈ {TypeScript, JavaScript, C#, Python} (see `language_alignment.primary_whitelist`).
- **Diversity** — language diversity (count from `/languages`, normalized).
- **PrivateReady** — 1 if repo is private, else 0 (proves private-repo path).

## Weights (from `configs/repo_scoring.yaml`)

| Feature             | Weight |
| ------------------- | ------ |
| volume              | 0.20   |
| labels              | 0.15   |
| recent_activity_90d | 0.20   |
| license_permissive  | 0.10   |
| templates           | 0.05   |
| language_alignment  | 0.10   |
| diversity           | 0.10   |
| private_ready       | 0.10   |

**Caps**

- `volume_max`: 5000  
- `recent_activity_max`: 1000

## Scoring

For repo *r* with normalized features *fᵢ* and weights *wᵢ*:
score(r) = Σ (wᵢ * fᵢ(r)) , Σ wᵢ = 1.0

## Inputs

- `docs/repo_candidates.txt` — one `owner/repo` per line.
- `configs/repo_scoring.yaml` — weights, caps, language allowlist.

## Outputs

- **CSV:** `docs/repo_matrix.csv` — feature values + composite score per repo.
- **JSON:** `docs/repo_matrix_ranked.json` — same data, sorted by `score` desc.

## How to run (local)

1. Ensure the CLI is built and your token is set:

   ```bash
   pnpm --filter @ghtriage/cli run build
   export GITHUB_TOKEN=<PAT with public_repo or repo read access>
