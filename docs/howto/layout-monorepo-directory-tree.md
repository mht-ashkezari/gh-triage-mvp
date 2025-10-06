# Monorepo & Directory Tree (LAYOUT)

**What & Why.** Standardize the project structure and enforce a helper policy:
- Committed helpers → `/tooling/**`
- Local scratch allowed → `/scripts/**` (untracked, never referenced)

**Prereqs.** pnpm installed; repo compiles.

**Local quickstart**
pnpm repo:layout:check
pnpm repo:tree

**CI**
- `.github/workflows/layout-ci.yml` runs on PR: enforces policy and prints the tree.

**Demo checklist**
- [ ] No tracked `/scripts/**` files.
- [ ] No references to `/scripts/` in tracked files.
- [ ] ADR 0001 present; docs updated.
