# GHAPP — ngrok for GitHub webhooks

```bash
ngrok http 4100
```
**Then**:

- Set PUBLIC_URL in .env to the HTTPS URL provided by ngrok.

- In your GitHub App settings, set the Webhook URL to
${PUBLIC_URL}/webhooks/github

- Use the same secret value as GITHUB_WEBHOOK_SECRET from your .env.

**Verify**
```bash
curl -i $PUBLIC_URL/webhooks/github -X POST -d '{"ping":"pong"}'
# Expect: HTTP/1.1 200 OK
```
