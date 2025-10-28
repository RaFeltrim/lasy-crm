/**
 * Security verification utilities for testing RLS policies and authentication
 * This file contains helper functions to verify security implementations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface SecurityTestResult {
  passed: boolean;
  testName: string;
  message: string;
  error?: any;
}

/**
 * Test RLS policies for leads table
 */
export async function testLeadsRLS(
  supabaseUrl: string,
  supabaseAnonKey: string,
  userToken: string
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];
  
  const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  });

  // Test 1: User can only see their own leads
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*');
    
    if (error) {
      results.push({
        passed: false,
        testName: 'Leads SELECT RLS',
        message: 'Failed to query leads',
        error,
      });
    } else {
      // Verify all returned leads belong to the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      const allBelongToUser = data.every(lead => lead.user_id === user?.id);
      
      results.push({
        passed: allBelongToUser,
        testName: 'Leads SELECT RLS',
        message: allBelongToUser
          ? 'User can only see their own leads'
          : 'User can see leads from other users (RLS VIOLATION)',
      });
    }
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Leads SELECT RLS',
      message: 'Exception during test',
      error,
    });
  }

  // Test 2: User can insert leads with their user_id
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: 'RLS Test Lead',
        status: 'new',
        user_id: user!.id,
      })
      .select()
      .single();
    
    if (error) {
      results.push({
        passed: false,
        testName: 'Leads INSERT RLS',
        message: 'Failed to insert lead',
        error,
      });
    } else {
      results.push({
        passed: true,
        testName: 'Leads INSERT RLS',
        message: 'User can insert their own leads',
      });
      
      // Clean up test lead
      await supabase.from('leads').delete().eq('id', data.id);
    }
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Leads INSERT RLS',
      message: 'Exception during test',
      error,
    });
  }

  // Test 3: User can update their own leads
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create a test lead
    const { data: testLead } = await supabase
      .from('leads')
      .insert({
        name: 'RLS Update Test',
        status: 'new',
        user_id: user!.id,
      })
      .select()
      .single();
    
    if (testLead) {
      const { error } = await supabase
        .from('leads')
        .update({ name: 'Updated Name' })
        .eq('id', testLead.id);
      
      results.push({
        passed: !error,
        testName: 'Leads UPDATE RLS',
        message: error
          ? 'Failed to update own lead'
          : 'User can update their own leads',
        error,
      });
      
      // Clean up
      await supabase.from('leads').delete().eq('id', testLead.id);
    }
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Leads UPDATE RLS',
      message: 'Exception during test',
      error,
    });
  }

  // Test 4: User can delete their own leads
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create a test lead
    const { data: testLead } = await supabase
      .from('leads')
      .insert({
        name: 'RLS Delete Test',
        status: 'new',
        user_id: user!.id,
      })
      .select()
      .single();
    
    if (testLead) {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', testLead.id);
      
      results.push({
        passed: !error,
        testName: 'Leads DELETE RLS',
        message: error
          ? 'Failed to delete own lead'
          : 'User can delete their own leads',
        error,
      });
    }
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Leads DELETE RLS',
      message: 'Exception during test',
      error,
    });
  }

  return results;
}

/**
 * Test RLS policies for interactions table
 */
export async function testInteractionsRLS(
  supabaseUrl: string,
  supabaseAnonKey: string,
  userToken: string
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];
  
  const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  });

  // Test 1: User can only see interactions for their own leads
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create a test lead
    const { data: testLead } = await supabase
      .from('leads')
      .insert({
        name: 'Interaction RLS Test',
        status: 'new',
        user_id: user!.id,
      })
      .select()
      .single();
    
    if (testLead) {
      // Create a test interaction
      const { data: testInteraction } = await supabase
        .from('interactions')
        .insert({
          lead_id: testLead.id,
          type: 'note',
          description: 'Test interaction',
          user_id: user!.id,
        } as any)
        .select()
        .single();
      
      // Query interactions
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('lead_id', testLead.id);
      
      results.push({
        passed: !error && data.length > 0,
        testName: 'Interactions SELECT RLS',
        message: error
          ? 'Failed to query interactions'
          : 'User can see interactions for their own leads',
        error,
      });
      
      // Clean up
      if (testInteraction) {
        await supabase.from('interactions').delete().eq('id', testInteraction.id);
      }
      await supabase.from('leads').delete().eq('id', testLead.id);
    }
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Interactions SELECT RLS',
      message: 'Exception during test',
      error,
    });
  }

  // Test 2: User can insert interactions for their own leads
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create a test lead
    const { data: testLead } = await supabase
      .from('leads')
      .insert({
        name: 'Interaction Insert Test',
        status: 'new',
        user_id: user!.id,
      })
      .select()
      .single();
    
    if (testLead) {
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          lead_id: testLead.id,
          type: 'note',
          description: 'Test interaction',
          user_id: user!.id,
        } as any)
        .select()
        .single();
      
      results.push({
        passed: !error,
        testName: 'Interactions INSERT RLS',
        message: error
          ? 'Failed to insert interaction'
          : 'User can insert interactions for their own leads',
        error,
      });
      
      // Clean up
      if (data) {
        await supabase.from('interactions').delete().eq('id', data.id);
      }
      await supabase.from('leads').delete().eq('id', testLead.id);
    }
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Interactions INSERT RLS',
      message: 'Exception during test',
      error,
    });
  }

  return results;
}

/**
 * Test authentication middleware
 */
export async function testAuthenticationMiddleware(
  baseUrl: string
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];

  // Test 1: Unauthenticated requests to protected routes should redirect
  try {
    const response = await fetch(`${baseUrl}/dashboard`, {
      redirect: 'manual',
    });
    
    const isRedirect = response.status === 302 || response.status === 307;
    const redirectsToLogin = response.headers.get('location')?.includes('/login');
    
    results.push({
      passed: isRedirect && !!redirectsToLogin,
      testName: 'Auth Middleware - Protected Route',
      message: isRedirect && redirectsToLogin
        ? 'Unauthenticated requests are redirected to login'
        : 'Protected routes are accessible without authentication (SECURITY ISSUE)',
    });
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Auth Middleware - Protected Route',
      message: 'Exception during test',
      error,
    });
  }

  // Test 2: Login page should be accessible without authentication
  try {
    const response = await fetch(`${baseUrl}/login`);
    
    results.push({
      passed: response.status === 200,
      testName: 'Auth Middleware - Public Route',
      message: response.status === 200
        ? 'Public routes are accessible without authentication'
        : 'Login page is not accessible',
    });
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Auth Middleware - Public Route',
      message: 'Exception during test',
      error,
    });
  }

  // Test 3: API endpoints should require authentication
  try {
    const response = await fetch(`${baseUrl}/api/leads`);
    
    results.push({
      passed: response.status === 401,
      testName: 'Auth Middleware - API Endpoint',
      message: response.status === 401
        ? 'API endpoints require authentication'
        : 'API endpoints are accessible without authentication (SECURITY ISSUE)',
    });
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Auth Middleware - API Endpoint',
      message: 'Exception during test',
      error,
    });
  }

  return results;
}

/**
 * Test session management
 */
export async function testSessionManagement(
  supabaseUrl: string,
  supabaseAnonKey: string,
  email: string,
  password: string
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];
  
  const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey);

  // Test 1: Valid credentials should create a session
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    results.push({
      passed: !error && !!data.session,
      testName: 'Session Creation',
      message: !error && data.session
        ? 'Valid credentials create a session'
        : 'Failed to create session with valid credentials',
      error,
    });
    
    // Test 2: Session should contain valid user data
    if (data.session) {
      results.push({
        passed: !!data.user && !!data.user.id && !!data.user.email,
        testName: 'Session User Data',
        message: data.user
          ? 'Session contains valid user data'
          : 'Session missing user data',
      });
      
      // Test 3: Token should be valid
      const { data: userData, error: userError } = await supabase.auth.getUser(
        data.session.access_token
      );
      
      results.push({
        passed: !userError && !!userData.user,
        testName: 'Token Validation',
        message: !userError && userData.user
          ? 'Session token is valid'
          : 'Session token is invalid',
        error: userError,
      });
      
      // Clean up - sign out
      await supabase.auth.signOut();
    }
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Session Management',
      message: 'Exception during test',
      error,
    });
  }

  // Test 4: Invalid credentials should not create a session
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'wrong-password',
    });
    
    results.push({
      passed: !!error && !data.session,
      testName: 'Invalid Credentials',
      message: error && !data.session
        ? 'Invalid credentials are rejected'
        : 'Invalid credentials created a session (SECURITY ISSUE)',
    });
  } catch (error) {
    results.push({
      passed: false,
      testName: 'Invalid Credentials',
      message: 'Exception during test',
      error,
    });
  }

  return results;
}

/**
 * Run all security verification tests
 */
export async function runAllSecurityTests(
  supabaseUrl: string,
  supabaseAnonKey: string,
  userToken: string,
  baseUrl: string,
  testEmail: string,
  testPassword: string
): Promise<SecurityTestResult[]> {
  const allResults: SecurityTestResult[] = [];

  console.log('Running Leads RLS tests...');
  const leadsRLSResults = await testLeadsRLS(supabaseUrl, supabaseAnonKey, userToken);
  allResults.push(...leadsRLSResults);

  console.log('Running Interactions RLS tests...');
  const interactionsRLSResults = await testInteractionsRLS(supabaseUrl, supabaseAnonKey, userToken);
  allResults.push(...interactionsRLSResults);

  console.log('Running Authentication Middleware tests...');
  const authMiddlewareResults = await testAuthenticationMiddleware(baseUrl);
  allResults.push(...authMiddlewareResults);

  console.log('Running Session Management tests...');
  const sessionResults = await testSessionManagement(
    supabaseUrl,
    supabaseAnonKey,
    testEmail,
    testPassword
  );
  allResults.push(...sessionResults);

  return allResults;
}

/**
 * Print test results to console
 */
export function printTestResults(results: SecurityTestResult[]): void {
  console.log('\n=== Security Verification Results ===\n');
  
  let passedCount = 0;
  let failedCount = 0;
  
  results.forEach((result) => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    const color = result.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`${color}${status}${reset} ${result.testName}`);
    console.log(`  ${result.message}`);
    
    if (result.error) {
      console.log(`  Error: ${JSON.stringify(result.error, null, 2)}`);
    }
    
    console.log('');
    
    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  });
  
  console.log('=== Summary ===');
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log('');
  
  if (failedCount > 0) {
    console.log('\x1b[31m⚠ SECURITY ISSUES DETECTED\x1b[0m');
  } else {
    console.log('\x1b[32m✓ All security tests passed\x1b[0m');
  }
}
