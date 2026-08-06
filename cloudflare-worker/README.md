# ShyneTyme Cloudflare lead receiver

This Worker handles only `https://shynetyme.works/api/leads` while the existing website remains at its current origin.

## Included

- Same-origin JSON lead submission
- Cloudflare D1 storage with automatic resource provisioning
- Duplicate-token protection
- Server-side validation and honeypot handling
- `STW-...` reference numbers
- Optional owner notification binding
- Structured Workers logs

## Cloudflare Git deployment

1. Cloudflare dashboard → **Workers & Pages** → **Create application**.
2. Choose **Import a repository** and select `Deke206/thethinkingtank`.
3. Worker name: `shynetyme-lead-receiver`.
4. Production branch: `agent/p0-contact-lead-funnel` for the first test.
5. Root directory: `/cloudflare-worker`.
6. Deploy command: `npx wrangler deploy`.
7. Save and deploy.

Wrangler will automatically provision the `DB` D1 binding because the binding is declared without a resource ID.

## Optional owner email notification

The lead is stored even when email is not enabled. To add an owner alert later:

1. Enable Cloudflare Email Routing and verify the desired destination inbox.
2. Add a Worker send-email binding named `NOTIFY_OWNER`.
3. Add text variables `OWNER_EMAIL` and `FROM_EMAIL`.
4. Redeploy.

Customer confirmation is displayed on the page with the lead reference. No paid outbound customer-email service is required.

## Health check

After deployment, open:

`https://shynetyme.works/api/leads`

Expected response includes `"ok":true` and `"storage":true`.
