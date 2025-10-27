# Security Quick Reference

Quick reference for security features implemented in the CRM system.

## Security Headers (middleware.ts)

```typescript
// All requests include these headers:
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
X-XSS-Protection: 1; mode=block
Content-Security-Policy: [configured]
Permissions-Policy: camera=(), microphone=(), geolocation=()

// Production only:
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## HTTPS Enforcement

Production requests are automatically redirected from HTTP to HTTPS.

## CORS Configuration

API routes support CORS with configurable origins:
- Set `ALLOWED_ORIGINS` environment variable
- Defaults to `NEXT_PUBLIC_APP_URL`

## Input Sanitization (lib/sanitize.ts)

```typescript
import { sanitizeLeadInput, sanitizeInteractionInput } from '@/lib/sanitize';

// Sanitize lead data
const sanitized = sanitizeLeadInput(data);

// Sanitize interaction data
const sanitized = sanitizeInteractionInput(data);
```

## Rate Limiting (lib/rate-limit.ts)

```typescript
import { applyRateLimit, RateLimitPresets } from '@/lib/rate-limit';

// Apply rate limiting
const result = applyRateLimit(request, RateLimitPresets.standard, userId);
if (!result.success) {
  return createRateLimitResponse(result);
}
```

### Rate Limit Presets

| Preset | Limit | Window |
|--------|-------|--------|
| standard | 100/min | General endpoints |
| strict | 10/min | Auth endpoints |
| bulk | 5/5min | Import/Export |
| search | 30/min | Search endpoints |

## Authentication (lib/api-utils.ts)

```typescript
import { getAuthenticatedUser } from '@/lib/api-utils';

// Get authenticated user (throws if not authenticated)
const user = await getAuthenticatedUser(request);
```

## Row Level Security

### Leads Table
- Users can only access their own leads
- Enforced at database level via RLS policies

### Interactions Table
- Users can only access interactions for their own leads
- Enforced via RLS with lead ownership check

## Security Verification

```bash
# Set environment variables
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="password"

# Run verification
npx tsx scripts/verify-security.ts
```

## API Endpoint Security Checklist

When creating a new API endpoint:

1. ✅ Authenticate user
   ```typescript
   const user = await getAuthenticatedUser(request);
   ```

2. ✅ Apply rate limiting
   ```typescript
   const result = applyRateLimit(request, RateLimitPresets.standard, user.id);
   if (!result.success) return createRateLimitResponse(result);
   ```

3. ✅ Validate input
   ```typescript
   const data = await validateRequestBody(request, schema);
   ```

4. ✅ Sanitize input
   ```typescript
   const sanitized = sanitizeLeadInput(data);
   ```

5. ✅ Use parameterized queries (Supabase handles this)
   ```typescript
   await supabase.from('leads').insert(sanitized);
   ```

6. ✅ Handle errors properly
   ```typescript
   try {
     // ... operation
   } catch (error) {
     return handleApiError(error);
   }
   ```

## Common Security Patterns

### Creating a Lead
```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const result = applyRateLimit(request, RateLimitPresets.standard, user.id);
    if (!result.success) return createRateLimitResponse(result);
    
    const data = await validateRequestBody(request, createLeadSchema);
    const sanitized = sanitizeLeadInput(data);
    
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({ ...sanitized, user_id: user.id })
      .select()
      .single();
    
    if (error) throw new DatabaseError('Failed to create lead');
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Querying Leads
```typescript
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const result = applyRateLimit(request, RateLimitPresets.standard, user.id);
    if (!result.success) return createRateLimitResponse(result);
    
    // RLS automatically filters to user's leads
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw new DatabaseError('Failed to fetch leads');
    return NextResponse.json({ leads: data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Environment Variables

Required for security:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# CORS (optional, defaults to NEXT_PUBLIC_APP_URL)
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Testing (for security verification script)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password
```

## Security Monitoring

Monitor these metrics:
- Rate limit violations (429 responses)
- Authentication failures (401 responses)
- Validation errors (400 responses)
- Database errors (500 responses)

## Emergency Response

If a security issue is detected:

1. **Immediate**: Deploy fix or disable affected endpoint
2. **Short-term**: Revoke compromised tokens, reset passwords
3. **Long-term**: Audit logs, notify users, update security measures

## Additional Resources

- Full documentation: `docs/SECURITY.md`
- Security verification: `lib/security-verification.ts`
- Rate limiting: `lib/rate-limit.ts`
- Input sanitization: `lib/sanitize.ts`
