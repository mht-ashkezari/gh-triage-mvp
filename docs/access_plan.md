# Access Plan (P0.2.B)

**Model:** GitHub App (read-only) with "Only select repositories".
**Permissions (read):** metadata, contents, issues, pull_requests.
**Webhooks:** issues, issue_comment, pull_request, pull_request_review, label, release.
**Install Flow:** Install App → get installation_id → BFF lists repos via installation token → user selects repos → store selection.
**Security:** webhook HMAC (x-hub-signature-256), CORS allow-list, rate limits.
**SSO:** If org enforces SSO, ensure the App is authorized org-wide.
**Env:** GITHUB_APP_ID, GITHUB_PRIVATE_KEY_BASE64, GITHUB_WEBHOOK_SECRET.
