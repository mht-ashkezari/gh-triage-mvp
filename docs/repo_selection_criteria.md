# Repo Selection Criteria 
We score candidate repos on normalized features weighted by configs/repo_scoring.yaml.

**Features**
- Volume (issues/PRs + stars/forks proxy, capped)
- Labels (distinct label count)
- RecentActivity90d (issues/PRs updated in last 90 days)
- LicensePermissive (MIT/Apache/BSD/ISC/Unlicense => 1)
- Templates (has .github/ISSUE_TEMPLATE)
- LanguageAlignment (primary ∈ {TypeScript, JavaScript, C#, Python})
- Diversity (count of languages from /languages)
- PrivateReady (repo.private ? 1 : 0)

**Outputs**
- docs/repo_matrix.csv
- docs/repo_matrix_ranked.json
