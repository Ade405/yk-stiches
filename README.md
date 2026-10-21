# YK Stitches

Luxury tailoring storefront and atelier management app with customer tracking, admin tooling, and AI-assisted tailor consultation.

## Requirements

- Node.js 20 LTS or newer (Node.js 22 LTS recommended)
- npm (included with Node.js)

## Fresh clone: install, test, and build

1. Clone the repository and enter the project directory:
   ```bash
   git clone https://github.com/Ade405/yk-stiches.git
   cd yk-stiches
   ```
2. Install the exact dependency versions recorded in the lockfile:
   ```bash
   npm ci
   ```
3. Run the TypeScript check, automated tests, and production build:
   ```bash
   npm run check
   ```
   Or run each step separately with `npm run lint`, `npm test`, and `npm run build`.

## Run locally

Most storefront and demo flows can run without external service credentials. To use AI-assisted consultation or configured Supabase features, create a `.env.local` file based on `.env.example` and fill in the credentials for the services you have configured.

For a local demo, you can start with:
```env
ADMIN_PASSWORD="change-this-demo-password"
DEMO_USER_PASSWORD="change-this-demo-password"
TAILOR_PASSWORD="change-this-demo-password"
NODE_ENV="development"
```

Start the development server:
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000).

## Production

Build and start the production server with:
```bash
npm run build
npm start
``

Configure production environment variables and terminate HTTPS at a trusted reverse proxy, or configure `TLS_KEY_PATH` and `TLS_CERT_PATH` if the application itself will serve HTTPS. Do not use the demo passwords in production.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the production deployment guide, environment variables, HTTPS setup, health checks, and launch checklist.

## Security status

### Implemented for local/demo use

- Server-side session cookies (`HttpOnly`, `SameSite=Lax`, `Secure` in production)
- Session expiration and logout invalidation
- Password hashing with `scrypt`
- Admin and authenticated-user middleware
- Security headers, including CSP, HSTS in production, X-Frame-Options, and X-Content-Type-Options
- Rate limiting for auth and API traffic
- Input validation using `zod` for auth and order search payloads
- Protected route access for admin-only functionality and customer order lookup
- HTTP-to-HTTPS redirect behavior for production deployments configured for it
- CSRF validation for mutating requests using per-request tokens and same-origin checks

### Before a public production launch

- Use a persistent database rather than in-memory arrays
- Integrate a real payment provider with webhook verification and idempotency
- Validate and store uploaded files securely rather than using inline base64 data URLs
- Review role-based access checks for every sensitive endpoint, including audit logs
- Configure monitoring, alerting, and error tracking
- Run automated security tests and dependency audits
- Harden production TLS/reverse-proxy configuration
- Rotate secrets and manage them outside the repository

This application is not yet a fully production-hardened SaaS system. Review the security plan and deployment checklist before handling real customer data or payments.

## Database and integrations

Supabase migrations and integration settings are documented in `.env.example` and the `supabase/migrations` directory. Apply migrations to the intended Supabase project before relying on database-backed features. Keep service-role keys and other secrets out of source control.

Payments are currently demonstration/mock flows. Production use requires a real payment gateway, webhook verification, PCI compliance review, and payment reconciliation.


## Docker Compose

Docker Compose builds and starts the production app (Express API plus the built Vite storefront) as one service:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f app
```

Open [http://localhost:3000](http://localhost:3000). To use integrations, copy `.env.example` to `.env.local` and replace every placeholder with real credentials before starting the container. Compose loads `.env.local` if it exists; external Gemini and Supabase services are optional for the basic storefront.

Stop the app with `docker compose down`. The image is multi-stage and runs with production dependencies only. Do not expose demo passwords or default credentials in a public deployment.

## Code quality

- `npm run lint` runs the TypeScript check and ESLint rules for tests/config files.
- `npm run format:check` verifies formatting for the new app modules and deployment/quality configuration.
- `npm run format` applies Prettier to those enforced files.
- `npm run check` runs lint, format checks, tests, and the production build.
