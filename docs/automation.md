## n8n Automation Playbook

The backend exposes `POST /api/news` for programmatic updates. It performs
upserts keyed by slug, so idempotent automations (like n8n) can safely replay
events without duplicating articles.

### 1. Required Environment

| Component | Value |
| --- | --- |
| API URL | `https://api.thekingsmaker.org/api/news` |
| Header | `x-api-key: <value from backend/.env>` |
| Body | JSON object containing article fields (`title`, `summary`, `content`, `category`, `tags`, `imageUrl`, `publishedAt`, `featured`) |

### 2. Recommended Workflow

- `automation/n8n-workflow-example.json` – simple fetch → normalize → POST
- `automation/n8n-techpulse-rss.json` – Cron (every 30 min) → API init (`GET /api/health`)
  → RSS ingest (from `https://thekingsmaker.org/rss.xml`) → JavaScript categorization + slugging → POST.

1. **HTTP Request** – Poll a trusted feed provider (Newsdata, GDELT, etc).
2. **Function** – Normalize keys to match the Tech News API shape and derive a slug.
3. **HTTP Request** – POST each normalized item to `POST /api/news` with the API key header.
4. **Schedule** – Tie the workflow to a Cron node (e.g., every 10 minutes) or webhook trigger.

### 3. Hardening Tips

- Cache the last published timestamp via n8n workflow static data to avoid re-fetching older stories.
- Wrap the POST call with `Continue On Fail` and log errors to Slack/email to keep the automation self-healing.
- Use the new `/api/request-info` endpoint to confirm Cloudflare is forwarding the correct IP and that your automation is allow‑listed in CORS.

### 4. Deployment Checklist

1. Import `automation/n8n-workflow-example.json` **or** `automation/n8n-techpulse-rss.json`.
2. Update API keys, feed credentials, and target hostname.
3. Verify the Cron cadence (every 30 minutes by default) and adjust if needed.
4. Run once manually to confirm the backend returns `201 Created` with the stored payload.
5. Enable the workflow and monitor via n8n executions (tie failures to Slack/email).

