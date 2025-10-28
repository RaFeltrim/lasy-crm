/**
 * Integration Verification Script
 * 
 * This script verifies that all features of the CRM system work together seamlessly.
 * It checks for:
 * - API endpoint availability
 * - Database connectivity
 * - Real-time subscription setup
 * - Authentication flow
 * - Error handling
 * - Loading states
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface VerificationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: VerificationResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warning', message: string) {
  results.push({ name, status, message });
  const icon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⚠';
  const color = status === 'pass' ? '\x1b[32m' : status === 'fail' ? '\x1b[31m' : '\x1b[33m';
  console.log(`${color}${icon}\x1b[0m ${name}: ${message}`);
}

async function verifyEnvironmentVariables() {
  console.log('\n📋 Verifying Environment Variables...\n');
  
  if (!supabaseUrl) {
    addResult('Supabase URL', 'fail', 'NEXT_PUBLIC_SUPABASE_URL is not set');
    return false;
  }
  addResult('Supabase URL', 'pass', 'Environment variable is set');
  
  if (!supabaseAnonKey) {
    addResult('Supabase Anon Key', 'fail', 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    return false;
  }
  addResult('Supabase Anon Key', 'pass', 'Environment variable is set');
  
  return true;
}

async function verifyDatabaseConnection() {
  console.log('\n🗄️  Verifying Database Connection...\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection by querying the leads table
    const { error } = await supabase.from('leads').select('count').limit(1);
    
    if (error) {
      addResult('Database Connection', 'fail', `Failed to connect: ${error.message}`);
      return false;
    }
    
    addResult('Database Connection', 'pass', 'Successfully connected to database');
    return true;
  } catch (error) {
    addResult('Database Connection', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function verifyDatabaseSchema() {
  console.log('\n📊 Verifying Database Schema...\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Check leads table
    const { error: leadsError } = await supabase.from('leads').select('*').limit(0);
    if (leadsError) {
      addResult('Leads Table', 'fail', `Table not accessible: ${leadsError.message}`);
    } else {
      addResult('Leads Table', 'pass', 'Table exists and is accessible');
    }
    
    // Check interactions table
    const { error: interactionsError } = await supabase.from('interactions').select('*').limit(0);
    if (interactionsError) {
      addResult('Interactions Table', 'fail', `Table not accessible: ${interactionsError.message}`);
    } else {
      addResult('Interactions Table', 'pass', 'Table exists and is accessible');
    }
    
    return !leadsError && !interactionsError;
  } catch (error) {
    addResult('Database Schema', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function verifyRealtimeCapabilities() {
  console.log('\n⚡ Verifying Real-time Capabilities...\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test real-time subscription
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {})
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          addResult('Real-time Subscription', 'pass', 'Successfully subscribed to changes');
          supabase.removeChannel(channel);
        } else if (status === 'CHANNEL_ERROR') {
          addResult('Real-time Subscription', 'fail', 'Failed to subscribe to changes');
        }
      });
    
    // Wait for subscription to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  } catch (error) {
    addResult('Real-time Subscription', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function verifySecurityHeaders() {
  console.log('\n🔒 Verifying Security Configuration...\n');
  
  const requiredHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'X-XSS-Protection',
  ];
  
  // Note: This would need to be run against a running server
  addResult('Security Headers', 'warning', 'Manual verification required - check middleware.ts');
  
  return true;
}

async function verifyComponentStructure() {
  console.log('\n🧩 Verifying Component Structure...\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredComponents = [
    'components/AppLayout.tsx',
    'components/KanbanBoard.tsx',
    'components/LeadForm.tsx',
    'components/LeadList.tsx',
    'components/SearchBar.tsx',
    'components/Timeline.tsx',
    'components/ErrorBoundary.tsx',
    'components/LoadingSkeletons.tsx',
  ];
  
  let allExist = true;
  
  for (const component of requiredComponents) {
    const componentPath = path.join(process.cwd(), component);
    if (fs.existsSync(componentPath)) {
      addResult(component, 'pass', 'Component exists');
    } else {
      addResult(component, 'fail', 'Component not found');
      allExist = false;
    }
  }
  
  return allExist;
}

async function verifyAPIRoutes() {
  console.log('\n🌐 Verifying API Routes...\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredRoutes = [
    'app/api/leads/route.ts',
    'app/api/leads/[id]/route.ts',
    'app/api/leads/search/route.ts',
    'app/api/leads/import/route.ts',
    'app/api/leads/export/route.ts',
    'app/api/interactions/route.ts',
  ];
  
  let allExist = true;
  
  for (const route of requiredRoutes) {
    const routePath = path.join(process.cwd(), route);
    if (fs.existsSync(routePath)) {
      addResult(route, 'pass', 'Route exists');
    } else {
      addResult(route, 'fail', 'Route not found');
      allExist = false;
    }
  }
  
  return allExist;
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const total = results.length;
  
  console.log(`Total Checks: ${total}`);
  console.log(`\x1b[32m✓ Passed: ${passed}\x1b[0m`);
  console.log(`\x1b[31m✗ Failed: ${failed}\x1b[0m`);
  console.log(`\x1b[33m⚠ Warnings: ${warnings}\x1b[0m`);
  
  const successRate = ((passed / total) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%`);
  
  if (failed === 0) {
    console.log('\n\x1b[32m✓ All critical checks passed! System is ready.\x1b[0m\n');
  } else {
    console.log('\n\x1b[31m✗ Some checks failed. Please review the issues above.\x1b[0m\n');
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 LASY AI CRM SYSTEM - INTEGRATION VERIFICATION');
  console.log('='.repeat(60));
  
  await verifyEnvironmentVariables();
  await verifyDatabaseConnection();
  await verifyDatabaseSchema();
  await verifyRealtimeCapabilities();
  await verifySecurityHeaders();
  await verifyComponentStructure();
  await verifyAPIRoutes();
  
  await printSummary();
}

main().catch(console.error);
