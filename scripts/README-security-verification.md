# Security Verification Script

This script runs comprehensive security tests to verify RLS policies, authentication, and session management.

## Prerequisites

1. **Test User Account**: Create a test user in your Supabase project
2. **Environment Variables**: Set up the required environment variables
3. **Running Application**: The application should be running (for middleware tests)

## Setup

### 1. Create Test User

In your Supabase dashboard:
1. Go to Authentication > Users
2. Click "Add user"
3. Create a user with email and password
4. Note the credentials for testing

### 2. Set Environment Variables

Create a `.env.local` file or export variables:

```bash
# Required - Supabase configuration
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Required - Test user credentials
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="your-test-password"

# Optional - App URL (defaults to http://localhost:3000)
export NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Install Dependencies

If not already installed:

```bash
npm install tsx
```

## Running the Tests

### Basic Usage

```bash
npx tsx scripts/verify-security.ts
```

### With Environment Variables

```bash
TEST_USER_EMAIL="test@example.com" \
TEST_USER_PASSWORD="password" \
npx tsx scripts/verify-security.ts
```

### From npm Script

Add to `package.json`:

```json
{
  "scripts": {
    "verify-security": "tsx scripts/verify-security.ts"
  }
}
```

Then run:

```bash
npm run verify-security
```

## Test Categories

### 1. Leads RLS Tests

Tests that Row Level Security policies work correctly for the leads table:

- ✅ Users can only see their own leads
- ✅ Users can insert their own leads
- ✅ Users can update their own leads
- ✅ Users can delete their own leads

### 2. Interactions RLS Tests

Tests that RLS policies work correctly for the interactions table:

- ✅ Users can only see interactions for their own leads
- ✅ Users can insert interactions for their own leads

### 3. Authentication Middleware Tests

Tests that the Next.js middleware properly protects routes:

- ✅ Unauthenticated requests to protected routes are redirected
- ✅ Public routes are accessible without authentication
- ✅ API endpoints require authentication

### 4. Session Management Tests

Tests that Supabase Auth session management works correctly:

- ✅ Valid credentials create a session
- ✅ Session contains valid user data
- ✅ Session tokens are valid
- ✅ Invalid credentials are rejected

## Understanding Results

### Success Output

```
=== Security Verification Results ===

✓ PASS Leads SELECT RLS
  User can only see their own leads

✓ PASS Leads INSERT RLS
  User can insert their own leads

...

=== Summary ===
Total: 12
Passed: 12
Failed: 0

✓ All security tests passed
```

### Failure Output

```
✗ FAIL Leads SELECT RLS
  User can see leads from other users (RLS VIOLATION)
  Error: {...}

=== Summary ===
Total: 12
Passed: 10
Failed: 2

⚠ SECURITY ISSUES DETECTED
```

## Troubleshooting

### "Missing Supabase configuration"

**Problem**: Environment variables not set

**Solution**: 
```bash
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
```

### "Failed to authenticate test user"

**Problem**: Invalid test user credentials or user doesn't exist

**Solution**:
1. Verify the test user exists in Supabase
2. Check the email and password are correct
3. Ensure the user is confirmed (check email confirmation)

### "Connection refused" or "ECONNREFUSED"

**Problem**: Application is not running

**Solution**:
```bash
# Start the development server in another terminal
npm run dev
```

### RLS Tests Failing

**Problem**: RLS policies not properly configured

**Solution**:
1. Check database migrations have been applied
2. Verify RLS is enabled on tables:
   ```sql
   ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
   ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
   ```
3. Verify policies exist and are correct

### Middleware Tests Failing

**Problem**: Middleware not properly configured

**Solution**:
1. Check `middleware.ts` exists and is configured
2. Verify the middleware matcher includes the routes being tested
3. Check authentication logic in middleware

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run security verification
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
        run: npm run verify-security
```

## Best Practices

1. **Run Before Deployment**: Always run security tests before deploying to production
2. **Regular Testing**: Run tests regularly, not just before deployment
3. **Monitor Results**: Track test results over time to catch regressions
4. **Update Tests**: Update tests when adding new features or security measures
5. **Separate Test User**: Use a dedicated test user, not a production user
6. **Clean Test Data**: Tests clean up after themselves, but verify periodically

## Additional Security Testing

This script tests RLS and authentication. Also consider:

1. **Manual Penetration Testing**: Test for vulnerabilities not covered by automated tests
2. **Dependency Scanning**: Use `npm audit` to check for vulnerable dependencies
3. **Static Analysis**: Use ESLint security plugins
4. **Dynamic Analysis**: Use tools like OWASP ZAP
5. **Load Testing**: Test rate limiting under load

## Support

For issues or questions:
1. Check the main security documentation: `docs/SECURITY.md`
2. Review the quick reference: `docs/security-quick-reference.md`
3. Check the implementation summary: `docs/task-13-security-implementation-summary.md`

## Exit Codes

- `0`: All tests passed
- `1`: One or more tests failed or error occurred

Use in scripts:

```bash
if npx tsx scripts/verify-security.ts; then
  echo "Security tests passed"
  # Continue with deployment
else
  echo "Security tests failed"
  exit 1
fi
```
