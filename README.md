# YK Stitches

Luxury tailoring storefront and atelier management app with customer tracking, admin tooling, and AI-assisted tailor consultation.

## Run locally

Prerequisites:
- Node.js 18+
- A Gemini API key

1. Install dependencies:
   `npm install`
2. Create `.env.local` with the required values:
   ```env
   GEMINI_API_KEY="your-gemini-key"
   ADMIN_PASSWORD="admin123"
   DEMO_USER_PASSWORD="demo1234"
   TAILOR_PASSWORD="tailor123"
   NODE_ENV="development"
   ```
3. Start the app:
   `npm run dev`
4. Open:
   `http://localhost:3000`

## Deployment and production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete production deployment guide, environment variables, HTTPS setup, health checks, and launch checklist.

## Security status

### Added now
- Server-side session cookies (`HttpOnly`, `SameSite=Lax`, `Secure` in production)
- Session expiration and logout invalidation
- Password hashing with `scrypt`
- Admin and authenticated-user middleware
- Strict security headers (CSP, HSTS in production, X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting for auth and API traffic
- Input validation using `zod` for auth and order search payloads
- Protected route access for admin-only functionality and customer order lookup
- HTTP redirect to HTTPS in production
- CSRF validation for mutating requests using per-request tokens and same-origin checks

### Should be added before public production launch
- Real persistent database (PostgreSQL/MySQL) instead of in-memory arrays
- Secure payment provider with webhook verification and idempotency
- Proper file upload validation and storage (not inline base64 data URLs)
- Role-based access checks for every sensitive endpoint, including audit logs
- Monitoring, alerting, and error tracking
- Automated security tests and dependency audits
- Production TLS certificate management and reverse-proxy hardening
- Environment secret rotation and `.env` management outside the repo

## Production checklist

Before going live:
- set `NODE_ENV=production`
- set TLS certificates with `TLS_KEY_PATH` and `TLS_CERT_PATH`
- configure real secret values for admin, demo, and tailor credentials
- move session and data storage to a durable backend
- test authentication flows, authorization checks, and payment processing in staging
- verify CSP and headers in a deployed production environment

## Notes

This application is not yet a fully production-hardened SaaS system. The current implementation closes several critical gaps for local/demo use, but real customer-facing launch still requires the items in the security plan above.

## Continue here next

Completed:
- Render deployment is live.
- Supabase is connected for customer profiles.
- Customer email/password authentication uses Supabase Auth.
- Customer sessions are persisted in Supabase.
- Mobile quick-view and authentication UI improvements are complete.

Before continuing:
1. Run `supabase/migrations/001_create_sessions.sql` in the Supabase SQL Editor.
2. Redeploy the latest `main` branch on Render.
3. Test customer registration, sign-in, logout, and sign-in after a Render restart.

Next implementation priorities:
- Add forgot-password, password-reset, and change-password flows.
- Move product and order persistence fully to Supabase.
- Move admin image uploads to Supabase Storage instead of base64 data URLs.
- Add email verification/resend controls.
- Add monitoring, error tracking, audit logs, and automated security tests.

Payments are intentionally unchanged for now.
