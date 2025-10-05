# HOWTO: Automated Architecture Diagrams (CI Integration)

## Purpose
This HOWTO explains how architecture diagrams (`.mmd` Mermaid files) are automatically rendered, validated, and versioned via GitHub Actions.

## Overview
The workflow `.github/workflows/diagrams.yml` builds SVG diagrams for each release version under `docs/arch/releases/`.

Outputs are stored under:
- `docs/img/vX.Y.Z/` — versioned diagrams
- `docs/img/latest/` — latest diagrams for quick preview

## Tooling
- **Mermaid CLI** (`@mermaid-js/mermaid-cli`)
- **Puppeteer** with no-sandbox config (`tooling/puppeteer-config.json`)
- **Validation script:** `tooling/check_component_ids.ts`
- **Render script:** `tooling/render_diagrams.sh`

## Run Locally
```bash
pnpm diagrams:build
pnpm diagrams:check
