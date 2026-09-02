# YK Stitches - Quick Reference: New Features

## Password Recovery System

### User Flow
1. User clicks "Forgot Password" on login screen
2. Enters email address
3. Secure token sent (currently logged to console in dev, email in production)
4. User clicks reset link with token
5. User enters new password
6. Password updated in local and Supabase Auth systems

### API Endpoints

#### Request Password Reset
```
POST /api/auth/forgot-password
Content-Type: application/json
X-CSRF-Token: {token}

{
  "email": "user@example.com"
}

Response (200):
{
  "message": "If an account exists, a password reset link has been sent to the email address"
}
```

#### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json
X-CSRF-Token: {token}

{
  "email": "user@example.com",
  "token": "64-character-hex-string",
  "password": "NewSecurePassword123!"
}

Response (200):
{
  "message": "Password reset successfully. Please log in with your new password."
}
```

#### Change Password (Authenticated Users)
```
POST /api/auth/change-password
Content-Type: application/json
X-CSRF-Token: {token}
Cookie: yk_session={sessionId}

{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewPassword456!"
}

Response (200):
{
  "message": "Password changed successfully"
}
```

## Audit Logging System

### What Gets Logged

**Authentication Events:**
- auth_login - Successful and failed login attempts
- auth_logout - User logout
- auth_register - New user registration
- password_reset - Password recovery requests
- password_change - Password changes
- email_verify - Email verification

**Business Events:**
- order_created - New orders placed
- order_updated - Order modifications
- order_deleted - Order cancellations
- payment_processed - Payment transactions

**Admin Events:**
- admin_user_edit - Admin user profile edits
- admin_product_edit - Product catalog changes
- admin_order_update - Admin order adjustments
- file_upload - Image uploads

**Security Events:**
- access_denied - Unauthorized access attempts
- suspicious_activity - Rate limit breaches, invalid tokens, etc.

### Audit Log Fields

Every log entry contains:
- **timestamp** - When the event occurred
- **event_type** - Category of event
- **actor_id** - User ID (if authenticated)
- **actor_email** - Email of user performing action
- **actor_name** - Name of user
- **action** - Specific action description
- **resource_type** - Type of resource affected (order, product, user, etc.)
- **resource_id** - ID of affected resource
- **status** - success, failure, or blocked
- **ip_address** - IP address of request
- **user_agent** - Browser/client info
- **error_message** - If failed, the error that occurred
- **details** - Additional JSON metadata

### Audit Log API Endpoints

#### View Audit Logs
```
GET /api/audit-logs?limit=50&offset=0&eventType=auth_login&actorId=usr_123
Content-Type: application/json
Cookie: yk_session={sessionId}

Response (200):
{
  "logs": [
    {
      "id": "uuid",
      "event_type": "auth_login",
      "actor_id": "usr_123",
      "actor_email": "user@example.com",
      "action": "Login successful",
      "status": "success",
      "created_at": "2026-09-02T10:30:00Z",
      "ip_address": "192.168.1.100",
      ...
    }
  ],
  "total": 2543,
  "limit": 50,
  "offset": 0
}
```

#### Export Audit Logs (CSV)
```
GET /api/audit-logs/export
Content-Type: text/csv
Cookie: yk_session={sessionId}

Response (200): CSV file with all audit logs
```

### Compliance & Auditing

The audit system provides:
- **Immutable records** - Logs cannot be modified (insert-only)
- **Complete trail** - Every sensitive action is logged
- **User attribution** - Know who did what and when
- **Failure tracking** - See all failed/suspicious attempts
- **Export capability** - Generate compliance reports
- **Forensic data** - IP address and user agent for investigation

## Database Migrations

Run these migrations in Supabase SQL Editor:

### Migration 002 - Password Recovery Tokens
```
Adds: password_recovery_tokens table
- Stores secure password reset/email verification tokens
- Enforces 24-hour expiration
- One-time use enforcement
- Forensic data capture (IP, user agent)
```

### Migration 003 - Products Table
```
Adds: products table
- Persistent product catalog storage
- Replaces in-memory array
- Supports all product attributes
- Indexes for performance
```

### Migration 004 - Orders Table
```
Adds: orders table
- Persistent order tracking
- Payment status tracking
- Milestone tracking
- Customer information
- Indexes for fast queries
```

### Migration 005 - Audit Logs
```
Adds: audit_logs table
- Immutable audit trail
- 15+ event types
- Complete forensic data
- Indexed for performance
```

## Testing the Features

### Test Password Recovery

1. Start the app:
   ```bash
   npm run dev
   ```

2. Go to login page and click "Forgot Password"

3. Enter test email (e.g., adeyinka@example.com)

4. Check server console for the reset token (looks like 64-character hex string)

5. In development, construct reset URL:
   ```
   http://localhost:3000/reset-password?token=YOUR_TOKEN
   ```

6. Enter new password and verify it works on next login

### Test Audit Logs

1. Login as admin (admin@yk.com)

2. Perform various actions:
   - Login/logout
   - Create an order
   - Edit a product
   - Upload an image

3. View audit logs:
   ```bash
   curl -H "Cookie: yk_session=YOUR_SESSION" \
     http://localhost:3000/api/audit-logs
   ```

4. Export as CSV:
   ```bash
   curl -H "Cookie: yk_session=YOUR_SESSION" \
     http://localhost:3000/api/audit-logs/export > audit-logs.csv
   ```

### Run Security Tests

Prerequisites:
```bash
npm install --save-dev jest @jest/globals node-fetch
```

Run tests:
```bash
npm test -- security.test.ts
```

## Security Features

### Password Recovery
- ✅ Secure token generation (crypto.randomBytes)
- ✅ Token hashing before storage (SHA-256)
- ✅ 24-hour expiration
- ✅ One-time use enforcement
- ✅ User enumeration prevention
- ✅ Rate limiting
- ✅ IP address tracking

### Audit Logging
- ✅ Immutable records
- ✅ User attribution
- ✅ Status tracking (success/failure)
- ✅ Forensic data (IP, user agent)
- ✅ Compliance export (CSV)
- ✅ Event categorization

### Authentication
- ✅ Secure password hashing (scrypt)
- ✅ HttpOnly, Secure, SameSite cookies
- ✅ CSRF protection (token validation)
- ✅ Rate limiting (25 auth attempts/15min)
- ✅ Input validation (email, password format)

## Configuration

### Environment Variables

```env
# Required for password recovery functionality
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: For email password reset links
APP_URL=https://your-domain.com

# Optional: For sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Common Issues & Solutions

### Reset Token Not Working
- Verify token hasn't expired (24-hour limit)
- Verify token is correct case (hex string)
- Check token was used only once
- Verify user email matches reset request

### Audit Logs Not Appearing
- Verify Supabase connection is working
- Check user has admin role
- Ensure tables exist (migrations ran)
- Check network requests in browser dev tools

### Password Change Fails
- Verify current password is correct
- Verify new password meets requirements (8+ chars)
- Check user is authenticated
- Verify CSRF token is present

## Performance Considerations

### Audit Logs
- Logs are indexed by event_type, actor_id, created_at
- Use pagination (limit=50, offset=0) for large datasets
- Export may take longer for massive datasets
- Consider archiving old logs (>1 year) in production

### Password Recovery
- Tokens are hashed and indexed
- Lookup is O(1) regardless of token count
- Expired tokens can be cleaned up periodically
- No impact on login performance

## Next Steps

1. **Immediate**: Run migrations and test password recovery
2. **Short-term**: Monitor audit logs, export for compliance
3. **Medium-term**: Configure email service for production
4. **Long-term**: Move products/orders to Supabase, upload images to Storage

See IMPLEMENTATION_PROGRESS.md for detailed roadmap.
