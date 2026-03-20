# GigScale Cloudflare Worker (Scan Jobs)

This worker runs the full profile scan pipeline asynchronously:

1. Cloudflare Browser Rendering crawl (`render: true`) with polling
2. Firecrawl fallback (only if Cloudflare errors)
3. Parse profile markdown into structured fields
4. Gemini analysis
5. POST results to the Vercel webhook (`/api/scan-jobs/:jobId/complete`)

## Required env vars

### Worker env vars (set in `wrangler.toml` or via `wrangler secret`)
- `FIRECRAWL_API_KEY`
- `GEMINI_API_KEY`
- `CLOUDFLARE_BROWSER_RENDERING_ACCOUNT_ID`
- `CLOUDFLARE_BROWSER_RENDERING_API_TOKEN`
- `SCAN_JOBS_WEBHOOK_SECRET` (must match Vercel)

### Vercel env vars
The app enqueues jobs and hosts the webhook.

- `SCAN_JOBS_WEBHOOK_SECRET` (must match Worker)
- `CLOUDFLARE_WORKER_SCAN_ENQUEUE_URL` must point to:
  - `POST {worker}/enqueue`

## Local development

From `cloudflare/worker/`:

```bash
pnpm dlx wrangler dev
```

Then trigger a scan via the webapp:

```bash
POST http://localhost:3000/api/profiles/scan
```

Or enqueue directly (use a real `jobId` created in Vercel first):

```bash
curl -X POST http://localhost:8787/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "YOUR_JOB_ID",
    "profileUrl": "https://www.upwork.com/freelancers/~your-profile",
    "platform": "upwork",
    "cloudflareAllowed": true,
    "webhookUrl": "http://localhost:3000/api/scan-jobs/YOUR_JOB_ID/complete"
  }'
```

## Queues

The worker uses Cloudflare Queues with queue name `gigscale-scan-jobs`.

