# Security Policy

## Reporting

Please report vulnerabilities **privately via GitHub Security Advisories** (this repository → **Security** tab → **Report a vulnerability**).
Do **not** open public issues for sensitive reports.

## Scope

- This repository and any published container images.

## CI Security

- CodeQL and container/SBOM scans run in CI (see `.github/workflows/security.yml`).

## Secrets

- Never commit secrets. Use environment variables or cloud-managed identity at runtime.
