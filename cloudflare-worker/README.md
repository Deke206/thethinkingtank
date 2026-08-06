# ShyneTyme Cloudflare lead receiver

This Worker handles only `https://shynetyme.works/api/leads` while the existing live website remains at its current GitHub Pages origin.

## Included

- Same-origin JSON lead submission
- Cloudflare D1 storage with automatic resource provisioning
- Automatic D1 table/index initialization on the first request
- Duplicate-token protection
- Server-side validation and honeypot handling
- `STW-...` reference numbers
- Optional owner notification through a Cloudflare Email Service binding
- Structured Workers logs
- No Google Cloud billing project, OAuth consent screen, API key, or service account

## Cloudflare Git deployment

1. Cloudflare dashboard → **Workers & Pages** → **Create application**.
2. Choose **Import a repository** and select `Deke206/thethinkingtank`.
3. Worker name: `shynetyme-lead-receiver`.
4. Production branch for the first test: `agent/p0-contact-lead-funnel`.
5. Root directory: `cloudflare-worker`.
6. Build command: `npm install`.
7. Deploy command: `npx wrangler deploy`.
8. Save and deploy.

Wrangler 4.45+ automatically provisions the `DB` D1 binding because the binding is declared without a resource ID.

The Worker route is limited to:

`shynetyme.works/api/leads*`

The rest of `shynetyme.works` continues to use the existing origin.

## Required DNS check

The existing DNS record serving `shynetyme.works` must be proxied through Cloudflare (orange cloud). Do not replace the GitHub Pages CNAME or change the website origin.

## Health check

After deployment, open:

`https://shynetyme.works/api/leads`

Expected response:

```json
{
  "ok": true,
  "service": "ShyneTyme lead receiver",
  "storage": true
}
```

The first health check creates the D1 `leads` table and indexes if they do not already exist.

## Owner email notification

Lead storage works without email. To enable the free owner alert:

1. Cloudflare dashboard → **Email Service** → onboard `shynetyme.works`.
2. Add and verify `westsidelistingservices@gmail.com` as a destination address.
3. Open the Worker → **Bindings** → add a **Send Email** binding.
4. Binding name: `NOTIFY_OWNER`.
5. Restrict the destination to `westsidelistingservices@gmail.com`.
6. Redeploy or create a new Worker version if Cloudflare requests it.

The Worker already uses:

- `OWNER_EMAIL=westsidelistingservices@gmail.com`
- `FROM_EMAIL=leads@shynetyme.works`

Cloudflare Free can send to a verified destination address. Sending automatic confirmation email to arbitrary customer addresses requires a paid sender or another transactional-email provider. The website still displays the reference number immediately at no charge.

## Lead review

Cloudflare dashboard → **D1 SQL Database** → the automatically created database → **Console**:

```sql
SELECT
  lead_id,
  submitted_at,
  status,
  name,
  email,
  phone,
  project_type,
  message,
  owner_notification_status
FROM leads
ORDER BY submitted_at DESC;
```
