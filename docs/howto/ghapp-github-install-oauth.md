# GHAPP — GitHub install / OAuth

**What/Why:** Install the GitHub App and receive webhooks to track installations/repos. Optional OAuth identifies the human user; all repo access uses installation tokens.

**Prereqs:** App ID, private key (base64), webhook secret, DATABASE_URL, PUBLIC_URL.

**Local**

```bash
pnpm i
docker compose -f infra/docker/docker-compose.dev.yml up -d postgres
pnpm -F @ghtriage/bff dev
open http://localhost:3000/settings/integrations/github
```

If testing locally without a public IP, use a tunnel to receive GitHub webhooks.

**Webhook tunnel (optional)**
Use ngrok (or GitHub CLI) to expose `${PUBLIC_URL}/webhooks/github`.

**Demo checklist**

- [ ] Click Connect GitHub → redirected to GitHub App install page.
- [ ] Install on an org or test repo.
- [ ] Deliveries show 200 OK for installation* events.
- [ ] `/github/installations` and `/github/installations/{id}/repos` return rows.

**Verify**

- [x] GitHub App page shows “Last delivery → 200 OK”
- [x] `pnpm test -F @ghtriage/bff` passes all 7 tests
- [x] Database tables `installations` and `repos` contain rows
