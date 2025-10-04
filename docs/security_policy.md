# Security & Compliance Policy (v1)

## PII Handling
- All snapshots and sample sets must be PII-free.  
- Detected emails, tokens, keys → fail CI.  
- Redaction rules defined in `packages/shared/redaction.ts`.

## Data Residency
- EU region only (`swedencentral`).  
- No cross-region transfers.

## Secrets Storage
- Dev: .env  
- Stage/Prod: Azure Key Vault (workload identity).

## Outbound Network
- Allow-list: api.github.com, login.microsoftonline.com  
- Deny all others (default).

## Audit Logging
- Actions recorded in `security_audit_log`.  
- Rotation: 90 days.
