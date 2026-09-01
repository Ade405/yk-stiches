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
ADMIN_PASSWORD=use-a-long-random-password
DEMO_USER_PASSWORD=use-a-long-random-password
TAILOR_PASSWORD=use-a-long-random-password
TLS_KEY_PATH=/absolute/path/to/private-key.pem
TLS_CERT_PATH=/absolute/path/to/certificate.pem
```

Production startup fails unless all three staff passwords and both TLS paths are set. Generate unique passwords with a password manager and rotate them if they are exposed.

## HTTPS and reverse proxy

The application can serve HTTPS directly when `TLS_KEY_PATH` and `TLS_CERT_PATH` are configured. A managed TLS-terminating proxy is usually preferred:

1. Terminate HTTPS at the proxy.
2. Forward traffic to the application on port `3000`.
3. Preserve the original host and protocol headers.
4. Allow WebSocket upgrade only if a future feature requires it.
5. Restrict port `3000` so it is not publicly reachable.

The application uses secure cookies and redirects HTTP to HTTPS in production. Confirm that the proxy forwards HTTPS requests correctly before enabling live accounts.

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
