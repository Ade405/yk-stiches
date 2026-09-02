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
   DEMO_USER_PASSWORD="admin123"
   TAILOR_PASSWORD="admin123"
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

## Recent Implementations

### Completed Features (Latest)
- ✅ **Password Recovery Flows**: Forgot-password, reset-password, and change-password endpoints with secure token management
- ✅ **Audit Logging**: Comprehensive audit trail for all sensitive operations (auth, payments, admin actions)
- ✅ **Security Enhancements**: Enhanced authentication logging, payment audit trails, audit log export (CSV)
- ✅ **Security Tests**: Full test suite covering CSRF, input validation, rate limiting, SQL injection, and authorization

### In Progress
- 🔄 **Product Persistence**: Moving product catalog from in-memory to Supabase database
- 🔄 **Order Persistence**: Moving order tracking from in-memory to Supabase database  
- 🔄 **Image Upload**: Moving admin image uploads from base64 to Supabase Storage

## Continue here next

### Before First Production Deployment

1. **Run Database Migrations**
   ```
   supabase/migrations/002_add_password_recovery.sql
   supabase/migrations/003_add_products_table.sql
   supabase/migrations/004_add_orders_table.sql
   supabase/migrations/005_add_audit_logs.sql
   ```
   Execute these in the Supabase SQL Editor or via Supabase CLI: `supabase db push`

2. **Test Password Recovery**
   - Request password reset from login screen
   - Check console logs (development) for reset token
   - Verify reset link works and password changes successfully

3. **Test Audit Logging**
   - Login/logout and verify events appear in `/api/audit-logs`
   - Test audit log export: `GET /api/audit-logs/export`

4. **Email Configuration** (Optional but Recommended)
   - Configure SMTP settings for password reset emails (see `.env.example`)
   - Currently, reset tokens are logged to console in development mode

### Next Implementation Priorities

- Complete product persistence migration to Supabase
- Complete order persistence migration to Supabase
- Move admin image uploads to Supabase Storage
- Add email verification/resend controls
- Add monitoring/error tracking (Sentry or similar)
- Setup automated security test CI/CD pipeline

### New Endpoints Available

- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password for authenticated users
- `GET /api/audit-logs` - View audit logs (admin only, paginated)
- `GET /api/audit-logs/export` - Export audit logs as CSV (admin only)

### Security Improvements in This Release

✅ Secure password recovery with token expiration (24 hours)  
✅ User enumeration prevention in forgot-password flow  
✅ One-time use tokens (invalidated after use)  
✅ Comprehensive audit logging for compliance  
✅ IP address and user agent tracking for forensics  
✅ Enhanced authentication event logging  
✅ Payment processing audit trail  
✅ Security test suite for continuous validation

### Payments
Payments remain as mock/demonstration for now. Production implementation requires:
- Real payment gateway integration (Stripe, Paystack, etc.)
- Webhook verification
- PCI compliance review
- Payment reconciliation
