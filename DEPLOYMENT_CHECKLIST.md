# YK Stitches - Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Changes
- [x] Password recovery endpoints implemented
- [x] Audit logging system added
- [x] Security tests created
- [x] Documentation updated
- [x] Environment variables documented

### Database Migrations
- [ ] Run migration 002_add_password_recovery.sql
- [ ] Run migration 003_add_products_table.sql
- [ ] Run migration 004_add_orders_table.sql
- [ ] Run migration 005_add_audit_logs.sql

**Steps to run migrations:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste each migration file
3. Run each migration
4. Verify tables exist in Database → Tables section

### Environment Configuration
- [ ] Verify SUPABASE_URL is set
- [ ] Verify SUPABASE_ANON_KEY is set
- [ ] Verify SUPABASE_SERVICE_ROLE_KEY is set
- [ ] Update ADMIN_PASSWORD with secure value
- [ ] Update DEMO_USER_PASSWORD with secure value
- [ ] Update TAILOR_PASSWORD with secure value
- [ ] Set NODE_ENV=production for production deployment

### Feature Testing (Local)

#### Password Recovery
- [ ] Request password reset from login page
- [ ] Verify token appears in console
- [ ] Click reset link in console output
- [ ] Enter new password
- [ ] Login with new password succeeds
- [ ] Test invalid token rejection
- [ ] Test expired token handling (wait 24 hours OR use admin)

#### Audit Logging
- [ ] Login and verify audit_logs event created
- [ ] Logout and verify logout event created
- [ ] Navigate to /api/audit-logs (should be admin only)
- [ ] Verify pagination works (limit, offset)
- [ ] Export audit logs as CSV
- [ ] Verify CSV file contains all fields

#### Authentication
- [ ] Test login with correct password → success
- [ ] Test login with wrong password → failure
- [ ] Verify failed attempt appears in audit logs
- [ ] Test rate limiting (10+ failed attempts)
- [ ] Test CSRF token validation (missing token → 403)

### Security Verification
- [ ] Check HTTPS is enforced in production
- [ ] Verify security headers are present
- [ ] Test CSRF protection
- [ ] Verify password reset tokens are hashed (not plaintext)
- [ ] Confirm rate limiting is active

### Performance
- [ ] Verify audit logs are indexed properly
- [ ] Check query performance (EXPLAIN ANALYZE)
- [ ] Monitor token generation performance
- [ ] Ensure no N+1 queries

---

## Deployment Steps

### 1. Prepare for Deployment

```bash
# Ensure all changes are committed
git add .
git commit -m "Implement password recovery, audit logging, and security tests

- Added forgot-password, reset-password, change-password endpoints
- Implemented comprehensive audit logging system
- Added security test suite
- Created database migrations for password recovery and audit logs
- Enhanced authentication event tracking
- Added audit log export for compliance

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Push to repository
git push origin main
```

### 2. Run Database Migrations

**In Supabase Dashboard:**
1. Go to SQL Editor
2. Run each migration file from `supabase/migrations/`:
   - 002_add_password_recovery.sql
   - 003_add_products_table.sql
   - 004_add_orders_table.sql
   - 005_add_audit_logs.sql
3. Verify tables exist and are accessible

### 3. Deploy Application

**For Render.com:**
1. Push changes to main branch
2. Render will auto-deploy
3. Monitor build logs for errors
4. Verify application starts successfully

**For Other Platforms:**
```bash
npm run build
npm run start
# Monitor logs for startup errors
```

### 4. Verify Production Deployment

- [ ] Application is running
- [ ] Can access login page
- [ ] Database connection is working
- [ ] Migrations are applied
- [ ] Can login with existing credentials
- [ ] Password recovery works
- [ ] Audit logs appear for actions
- [ ] HTTPS is active

---

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Monitor application logs for errors
- [ ] Test password recovery with real user
- [ ] Verify audit logs are being recorded
- [ ] Check database connection status
- [ ] Monitor error tracking (if configured)

### Short-term (Week 1)
- [ ] Configure email service for password resets
- [ ] Set up error tracking (Sentry or similar)
- [ ] Archive/delete test audit logs
- [ ] Configure automated backups
- [ ] Review first week's audit logs

### Medium-term (Month 1)
- [ ] Complete product persistence migration
- [ ] Complete order persistence migration
- [ ] Move image uploads to Supabase Storage
- [ ] Add email verification flows
- [ ] Monitor performance metrics

---

## Rollback Plan

If issues occur after deployment:

### Quick Rollback (< 1 hour after deploy)
```bash
git revert HEAD
git push origin main
# Render will auto-deploy previous version
```

### Manual Rollback
1. Go to Render dashboard
2. Select YK Stitches service
3. Find previous successful deployment
4. Click "Redeploy" on that version
5. Monitor logs to verify success

### Database Rollback (if needed)
```sql
-- Drop new tables (if necessary)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.password_recovery_tokens CASCADE;
-- NOTE: Don't drop products/orders tables - these are new schemas
-- Only drop if migrations failed
```

---

## Monitoring After Deployment

### Key Metrics to Monitor
- Application uptime
- Database query performance
- Authentication endpoint response times
- Audit log growth rate
- Error rate

### Log Monitoring
```bash
# View recent application logs
tail -f application.log

# Check Supabase logs
# Dashboard → Settings → Database Logs

# Search for errors
grep -i error application.log
```

### Performance Queries
```sql
-- Check audit log size
SELECT COUNT(*) as total_logs FROM public.audit_logs;

-- Check password recovery tokens (should be small)
SELECT COUNT(*) as active_tokens FROM public.password_recovery_tokens 
WHERE is_valid = true AND expires_at > now();

-- Check slow queries
SELECT query, mean_exec_time FROM pg_stat_statements 
WHERE mean_exec_time > 100 
ORDER BY mean_exec_time DESC;
```

---

## Production Configuration

### Email Configuration (Recommended)

For password reset emails, add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yk-stitches.com
```

**Common providers:**
- **Gmail**: smtp.gmail.com:587
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587
- **AWS SES**: email-smtp.region.amazonaws.com:587

### Error Tracking (Recommended)

Add Sentry for error tracking:

```env
SENTRY_DSN=https://your-key@sentry.io/project-id
```

**Setup:**
1. Create account at sentry.io
2. Create project (select Node)
3. Copy DSN
4. Add to environment variables
5. Application will auto-report errors

### Rate Limiting Configuration

Adjust rate limits in production based on expected traffic:

```typescript
// In server.ts
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 minutes
  max: 25,                        // 25 requests per window (production)
  standardHeaders: true,
  legacyHeaders: false,
});

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,            // 1 minute
  max: 200,                       // 200 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## Compliance & Audit

### Audit Log Export
```bash
# Export audit logs for compliance
curl -H "Cookie: yk_session=ADMIN_SESSION" \
  https://production.yk-stitches.com/api/audit-logs/export \
  > audit-logs-$(date +%Y-%m-%d).csv
```

### Data Retention Policy
- Audit logs: Keep indefinitely for compliance
- Password recovery tokens: Auto-expire after 24 hours
- Sessions: Auto-expire after 8 hours
- Failed auth attempts: Keep for forensics

### Compliance Checklist
- [ ] Audit logs are immutable (append-only)
- [ ] User attribution is complete
- [ ] Failed attempts are logged
- [ ] CSV export works for reports
- [ ] Data retention policy documented
- [ ] Backup strategy in place

---

## Support Contacts

### For Issues
1. Check application logs first
2. Review audit logs for context
3. Check Supabase status page
4. Contact DevOps team

### Escalation
- **Critical issues**: On-call engineer
- **Database issues**: Supabase support
- **Deployment issues**: DevOps team

---

## Sign-Off

- [ ] All migrations verified
- [ ] Code reviewed and approved
- [ ] Tests passed locally
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] Rollback plan understood
- [ ] Monitoring configured
- [ ] Deployment approved

**Deployed by:** _________________ **Date:** ___________

**Verified by:** _________________ **Date:** ___________

---

## Version Information

- **Deployment Date:** [To be filled]
- **Version:** Based on commit hash
- **Database Migrations:** 002, 003, 004, 005
- **New Endpoints:** 5 (password recovery + audit logs)
- **Breaking Changes:** None (backward compatible)
- **Migration Time:** ~2 minutes (depending on data size)

---

**Last Updated:** 2026-09-02
**Status:** Ready for Production Deployment
**Risk Level:** Low (new features, backward compatible)
**Rollback Time:** < 5 minutes
