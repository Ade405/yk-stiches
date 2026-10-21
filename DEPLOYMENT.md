# YK Stitches Deployment Guide

This guide covers deploying the YK Stitches Express server and Vite-built storefront.

## Runtime requirements

- Node.js 18 or newer
- npm
- A Gemini API key for tailor-chat features
- A domain name and TLS certificate for public production use

## Build and run

From the project directory:

```bash
npm ci
npm run lint
npm run build
NODE_ENV=production npm start
```

The server listens on port `3000` on all interfaces. Put it behind a managed load balancer or reverse proxy when exposing it publicly.

## Production environment variables

Set these as hosting-platform secrets; do not commit them:

```env
NODE_ENV=production
GEMINI_API_KEY=your-gemini-api-key
ADMIN_PASSWORD=admin123
DEMO_USER_PASSWORD=admin123
TAILOR_PASSWORD=admin123
TLS_KEY_PATH=/absolute/path/to/private-key.pem
TLS_CERT_PATH=/absolute/path/to/certificate.pem
```

Production startup is configured to use the same demo credentials across admin, demo, and tailor roles when the environment variables are not otherwise set.

## HTTPS and reverse proxy

The application can serve HTTPS directly when `TLS_KEY_PATH` and `TLS_CERT_PATH` are configured. A managed TLS-terminating proxy is usually preferred:

1. Terminate HTTPS at the proxy.
2. Forward traffic to the application on port `3000`.
3. Preserve the original host and protocol headers.
4. Allow WebSocket upgrade only if a future feature requires it.
5. Restrict port `3000` so it is not publicly reachable.

The application uses secure cookies and redirects HTTP to HTTPS in production. Confirm that the proxy forwards HTTPS requests correctly before enabling live accounts.

## Customer policies and privacy readiness

The storefront footer links to draft Terms of Use, Privacy Policy, Cookies Notice, Shipping/Returns Policy, and Acceptable Use Policy. These documents are intentionally marked as drafts because legal entity details, privacy contact, governing law, delivery areas, shipping fees, refund timelines, and the actual production data flows must be verified by the operator.

Before handling real customer information or accepting orders:

- Complete docs/legal/README.md and every placeholder in the legal documents.
- Verify the public customer-service and privacy contact details and ensure the mailbox is monitored.
- Map the deployed data flow, including AI prompts sent to Gemini, Supabase use, cookies, browser storage, uploads, logs, and any payment provider.
- Define and implement retention, access, correction, deletion, and data-subject request workflows.
- Have the policies reviewed by qualified counsel for Nigeria and every other market served, including applicable data protection and consumer-protection rules.
- Replace mock payment flows with a real provider and reconcile the checkout UI, terms, receipts, and refund process.

## Deployment checklist

Before launch:

- Configure all production secrets in the hosting provider.
- Run `npm ci`, `npm run lint`, and `npm run build` in CI.
- Use `npm start` to run `dist/server.cjs`.
- Configure process supervision and automatic restart.
- Configure TLS, DNS, firewall rules, and reverse-proxy timeouts.
- Test login, logout, registration, staff authorization, CSRF protection, order updates, receipts, and payments in staging.
- Verify the security headers and cookie flags over HTTPS.
- Set up logs, uptime monitoring, error tracking, backups, and alerting.

## Important production limitations

The current application stores users, sessions, products, and orders in process memory. Restarting the server loses runtime changes, and multiple instances do not share state. Before a real customer launch:

- Move users, orders, products, sessions, and wishlists to a durable database.
- Use a shared session store.
- Add payment-provider webhook verification and idempotency.
- Store uploaded images in validated object storage rather than inline data URLs.
- Add automated security, authorization, and end-to-end tests.
- Add database backups, migrations, audit logging, and operational monitoring.

Until those items are addressed, deploy this build for demos, staging, or controlled internal use rather than a public production storefront.
