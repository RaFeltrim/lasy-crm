# Security Implementation Guide

This document outlines the security measures implemented in the Lasy AI CRM System and provides guidance for maintaining and verifying security.

## Table of Contents

1. [Security Headers](#security-headers)
2. [HTTPS Enforcement](#https-enforcement)
3. [CORS Configuration](#cors-configuration)
4. [Input Sanitization](#input-sanitization)
5. [Rate Limiting](#rate-limiting)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Authentication](#authentication)
8. [Security Verification](#security-verification)

## Security Headers

The application implements comprehensive security headers in the middleware:

### Implemented Headers

- **X-Frame-Options: DENY** - Prevents clickjacking attacks
- **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing
- **Referrer-Policy: origin-when-cross-origin** - Controls referrer information
- **X-XSS-Protection: 1; mode=block** - Enables XSS filtering
- **Content-Security-Policy** - Restricts resource loading
- **Permissions-Policy** - Controls browser features
- **Strict-Transport-Security** (Production only) - Enforces HTTPS

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'none';
```

## HTTPS Enforcement

### Production Environment

In production, the middleware automatically redirects all HTTP requests to HTTPS:

```typescript
if (
  process.env.NODE_ENV === 'production' &&
  request.headers.get('x-forwarded-proto') !== 'https'
) {
  // Redirect to HTTPS
}
```

### HSTS Header

The Strict-Transport-Security header is set in production with:
- `max-age=31536000` (1 year)
- `includeSubDomains` flag
- `preload` flag for HSTS preload list

## CORS Configuration

### API Routes

CORS is configured for API routes with:

- **Allowed Origins**: Configurable via `ALLOWED_ORIGINS` environment variable
- **Allowed Methods**: GET, POST, PATCH, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization
- **Credentials**: Enabled for authenticated requests
- **Preflight Caching**: 24 hours (86400 seconds)

### Configuration

Set the `ALLOWED_ORIGINS` environment variable:

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## Input Sanitization

All user inputs are sanitized to prevent XSS attacks.

### Sanitization Functions

Located in `lib/sanitize.ts`:

- `sanitizeString()` - General string sanitization
- `sanitizeEmail()` - Email-specific sanitization
- `sanitizePhone()` - Phone number sanitization
- `sanitizeText()` - Text field sanitization (removes script tags, event handlers)
- `sanitizeLeadInput()` - Lead data sanitization
- `sanitizeInteractionInput()` - Interaction data sanitization

### Implementation

All API endpoints sanitize inputs before database operations:

```typescript
const data = await validateRequestBody(request, schema);
const sanitizedData = sanitizeLeadInput(data);
// Use sanitizedData for database operations
```

### Defense in Depth

- Zod validation for type safety and format validation
- Input sanitization for XSS prevention
- Parameterized queries (via Supabase) for SQL injection prevention
- React's automatic HTML escaping for output

## Rate Limiting

Rate limiting is implemented to prevent abuse and DoS attacks.

### Rate Limit Presets

Located in `lib/rate-limit.ts`:

| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| Standard | 100 requests | 60 seconds | General API endpoints |
| Strict | 10 requests | 60 seconds | Auth, sensitive operations |
| Bulk | 5 requests | 300 seconds | Import/Export operations |
| Search | 30 requests | 60 seconds | Search operations |

### Implementation

Rate limiting is applied per user (authenticated) or per IP (unauthenticated):

```typescript
const rateLimitResult = applyRateLimit(request, RateLimitPresets.standard, user.id);
if (!rateLimitResult.success) {
  return createRateLimitResponse(rateLimitResult);
}
```

### Response Headers

Rate limit responses include:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Remaining requests in window
- `X-RateLimit-Reset` - Unix timestamp when limit resets
- `Retry-After` - Seconds until retry is allowed

### Production Considerations

The current implementation uses in-memory storage. For production with multiple servers, consider:
- Redis for distributed rate limiting
- Cloudflare or similar CDN with built-in rate limiting
- API Gateway with rate limiting capabilities

## Row Level Security (RLS)

RLS policies ensure users can only access their own data at the database level.

### Leads Table Policies

1. **SELECT**: Users can view only their own leads
   ```sql
   auth.uid() = user_id
   ```

2. **INSERT**: Users can insert leads with their user_id
   ```sql
   auth.uid() = user_id
   ```

3. **UPDATE**: Users can update only their own leads
   ```sql
   auth.uid() = user_id
   ```

4. **DELETE**: Users can delete only their own leads
   ```sql
   auth.uid() = user_id
   ```

### Interactions Table Policies

1. **SELECT**: Users can view interactions for their own leads
   ```sql
   EXISTS (
     SELECT 1 FROM leads
     WHERE leads.id = interactions.lead_id
     AND leads.user_id = auth.uid()
   )
   ```

2. **INSERT**: Users can insert interactions for their own leads
   ```sql
   auth.uid() = user_id AND
   EXISTS (
     SELECT 1 FROM leads
     WHERE leads.id = interactions.lead_id
     AND leads.user_id = auth.uid()
   )
   ```

### Verification

RLS policies are verified in the database migrations and can be tested using the security verification script.

## Authentication

### Session Management

- Sessions are managed by Supabase Auth
- Access tokens are stored in httpOnly cookies (handled by Supabase)
- Tokens are automatically refreshed
- Session expiration is enforced

### Middleware Protection

The Next.js middleware protects all routes except:
- `/login` - Public login page
- Static assets (images, fonts, etc.)
- Next.js internal routes

### API Authentication

All API endpoints require authentication:

```typescript
const user = await getAuthenticatedUser(request);
// Throws AuthenticationError if not authenticated
```

### Token Validation

Tokens are validated on every request:
1. Extract token from Authorization header
2. Validate with Supabase Auth
3. Verify user exists and is active
4. Proceed with request or return 401

## Security Verification

### Automated Testing

Run the security verification script to test all security measures:

```bash
# Set up environment variables
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="your-test-password"

# Run verification
npx tsx scripts/verify-security.ts
```

### Tests Performed

1. **Leads RLS Tests**
   - Users can only see their own leads
   - Users can insert their own leads
   - Users can update their own leads
   - Users can delete their own leads

2. **Interactions RLS Tests**
   - Users can only see interactions for their own leads
   - Users can insert interactions for their own leads

3. **Authentication Middleware Tests**
   - Unauthenticated requests to protected routes are redirected
   - Public routes are accessible without authentication
   - API endpoints require authentication

4. **Session Management Tests**
   - Valid credentials create a session
   - Session contains valid user data
   - Session tokens are valid
   - Invalid credentials are rejected

### Manual Testing

1. **Test RLS Policies**
   - Create two test users
   - Create leads for each user
   - Verify users cannot see each other's leads
   - Attempt to update/delete other user's leads (should fail)

2. **Test Authentication**
   - Access protected routes without authentication (should redirect)
   - Access API endpoints without token (should return 401)
   - Sign in and verify access is granted

3. **Test Rate Limiting**
   - Make rapid requests to an endpoint
   - Verify rate limit response (429) after threshold
   - Check rate limit headers in response

4. **Test Input Sanitization**
   - Submit forms with XSS payloads (e.g., `<script>alert('xss')</script>`)
   - Verify payloads are sanitized
   - Check database to ensure clean data

## Security Best Practices

### For Developers

1. **Always validate and sanitize inputs**
   - Use Zod schemas for validation
   - Apply sanitization functions before database operations

2. **Use parameterized queries**
   - Supabase client handles this automatically
   - Never concatenate user input into queries

3. **Implement proper error handling**
   - Don't expose sensitive information in error messages
   - Log detailed errors server-side only

4. **Keep dependencies updated**
   - Regularly update npm packages
   - Monitor security advisories

5. **Use environment variables for secrets**
   - Never commit secrets to version control
   - Use `.env.local` for local development

### For Deployment

1. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Configure HSTS header

2. **Set secure environment variables**
   - Use platform-specific secret management
   - Rotate secrets regularly

3. **Monitor and log**
   - Set up error tracking (e.g., Sentry)
   - Monitor rate limit violations
   - Track authentication failures

4. **Regular security audits**
   - Run security verification script
   - Perform penetration testing
   - Review access logs

## Incident Response

If a security issue is discovered:

1. **Assess the impact**
   - Determine what data may be affected
   - Identify affected users

2. **Contain the issue**
   - Deploy a fix immediately
   - Revoke compromised tokens if necessary

3. **Notify affected parties**
   - Inform users if their data was accessed
   - Follow data breach notification requirements

4. **Document and learn**
   - Document the incident
   - Update security measures
   - Conduct post-mortem review

## Security Checklist

- [ ] All security headers are configured
- [ ] HTTPS is enforced in production
- [ ] CORS is properly configured
- [ ] All inputs are validated and sanitized
- [ ] Rate limiting is applied to all API endpoints
- [ ] RLS policies are enabled and tested
- [ ] Authentication is required for protected routes
- [ ] Session management is secure
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date
- [ ] Security verification tests pass
- [ ] Monitoring and logging are configured

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Content Security Policy Reference](https://content-security-policy.com/)
