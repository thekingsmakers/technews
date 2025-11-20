## TheKingsmaker Tech News

Cloudflare-tunneled, n8n-powered tech news stack delivering curated AI, cloud,
security, devices, and developer-tools coverage.

### Stack
- `backend/` – Express API that stores news in `data/news.json`, exposes health,
  sitemap, upsert endpoint (`POST /api/news`), and Cloudflare-friendly IP logging.
  **New:** Includes intelligent keyword-based auto-categorization.
- `frontend/` – Vite + React single page app styled with a regal dark/light
  theme and branded as “TheKingsmaker Tech News”.
- `cloudflared-config.yml` – Tunnel template mapping `api.thekingsmaker.org`
  to the backend (port 5000) and `thekingsmaker.org` to the frontend (port 6080).
- `automation/` – n8n workflow example plus docs describing how to wire the API
  into an automated content pipeline. Use `n8n-techpulse-ultimate-v5.json` for
  the full multi-source, full-story scraping pipeline.

### Local Development
1. **Backend**
   ```bash
   cd backend
   cp env.sample .env    # edit API_KEY, FRONTEND_BASE_URL, etc.
   npm install
   npm run dev
   ```
   The API trusts proxy headers, exposes `/api/request-info` for IP debugging,
   and applies configurable CORS via `FRONTEND_BASE_URL` / `CORS_ORIGIN`.

   # expose via LAN IP by visiting http://<your-ip>:5000/api/health
   ```
   `AUTO_LAN_ORIGINS` (on by default in dev) automatically whitelists every
   detected IPv4 address on your machine so requests coming from other PCs on
   the same network are accepted by CORS.

2. **Frontend**
   ```bash
   cd frontend
   cp env.sample .env
   npm install
   npm run dev       # serves on http://localhost:6080 (uses a browser-safe port)
   ```
   Access the UI from other devices using `http://<your-ip>:6080`. Because the
   backend now auto-allows your machine’s LAN origins, cross-origin requests
   from that IP will succeed without extra configuration.
   - `/archive` renders the JavaScript-powered news timeline (grouped by month).
   - `/rss.xml` (and `/feed.xml`) exposes the live RSS feed crafted on the
     backend for downstream automations.

### Cloudflare Tunnel
1. Authenticate `cloudflared` and create a tunnel (`cloudflared tunnel create thekingsmaker-tech-news`).
2. Update `cloudflared-config.yml` with the generated tunnel ID/credentials path.
3. Route DNS:
   ```bash
   cloudflared tunnel route dns thekingsmaker-tech-news thekingsmaker.org
   cloudflared tunnel route dns thekingsmaker-tech-news api.thekingsmaker.org
   ```
4. Run the tunnel: `cloudflared tunnel run thekingsmaker-tech-news`.

### Automation via n8n
See `docs/automation.md` for the playbook. Import
`automation/n8n-workflow-example.json` for a minimal ingest or
`automation/n8n-techpulse-rss.json` for the full Cron + RSS pipeline, set your feed
and API keys, and schedule the workflow. The backend performs idempotent upserts,
so replays won’t create duplicates.

### Testing & Hardening
- `GET /api/health` now returns the detected requester IP; combine with
  `/api/request-info` to verify Cloudflare headers.
- Sitemap uses `FRONTEND_BASE_URL`, keeping SEO-friendly URLs in sync.
- `newsStore` validates/sanitizes payloads and auto-creates the backing JSON
  file if it’s missing/corrupted.

