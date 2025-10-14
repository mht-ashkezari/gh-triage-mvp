# Security Policy

## Reporting

Please report vulnerabilities privately via email: <security@example.com>  
Do not open public issues for sensitive reports.

## Scope

- This repository and any published container images.

## CI Security

- CodeQL and container/SBOM scans run in CI (see `.github/workflows/security.yml`).

## Secrets

- Never commit secrets. Use environment variables or cloud-managed identity at runtime.
