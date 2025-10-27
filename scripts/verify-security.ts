/**
 * Security verification script
 * Run this script to verify RLS policies, authentication, and session management
 * 
 * Usage:
 * npx tsx scripts/verify-security.ts
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - TEST_USER_EMAIL (email of a test user)
 * - TEST_USER_PASSWORD (password of the test user)
 * - NEXT_PUBLIC_APP_URL (optional, defaults to http://localhost:3000)
 */

import { createClient } from '@supabase/supabase-js';
import {
  runAllSecurityTests,
  printTestResults,
  type SecurityTestResult,
} from '../lib/security-verification';

async function main() {
  console.log('Starting security verification...\n');

  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase configuration');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  if (!testEmail || !testPassword) {
    console.error('Error: Missing test user credentials');
    console.error('Please set TEST_USER_EMAIL and TEST_USER_PASSWORD');
    console.error('Note: Create a test user in your Supabase project first');
    process.exit(1);
  }

  // Get user token
  console.log('Authenticating test user...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (authError || !authData.session) {
    console.error('Error: Failed to authenticate test user');
    console.error(authError);
    process.exit(1);
  }

  const userToken = authData.session.access_token;
  console.log('Test user authenticated successfully\n');

  // Run all security tests
  const results = await runAllSecurityTests(
    supabaseUrl,
    supabaseAnonKey,
    userToken,
    baseUrl,
    testEmail,
    testPassword
  );

  // Print results
  printTestResults(results);

  // Sign out test user
  await supabase.auth.signOut();

  // Exit with appropriate code
  const hasFailures = results.some((r) => !r.passed);
  process.exit(hasFailures ? 1 : 0);
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
