-- ============================================================================
-- Database Verification Script
-- Run this script to verify the database setup is correct
-- ============================================================================

-- Check if tables exist
SELECT 
  'Tables Check' as check_type,
  CASE 
    WHEN COUNT(*) = 2 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status,
  COUNT(*) as found,
  2 as expected
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'interactions');

-- Check if RLS is enabled
SELECT 
  'RLS Enabled' as check_type,
  CASE 
    WHEN COUNT(*) = 2 AND MIN(rowsecurity::int) = 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status,
  COUNT(*) as tables_with_rls,
  2 as expected
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'interactions');

-- Check RLS policies count
SELECT 
  'RLS Policies' as check_type,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status,
  COUNT(*) as found,
  6 as expected
FROM pg_policies 
WHERE tablename IN ('leads', 'interactions');

-- Check indexes
SELECT 
  'Indexes' as check_type,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status,
  COUNT(*) as found,
  6 as minimum_expected
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'interactions')
AND indexname LIKE 'idx_%';

-- Check full-text search index
SELECT 
  'Full-Text Search Index' as check_type,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status,
  COUNT(*) as found,
  1 as expected
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'leads'
AND indexname = 'idx_leads_search';

-- Check trigger
SELECT 
  'Updated_at Trigger' as check_type,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status,
  COUNT(*) as found,
  1 as expected
FROM information_schema.triggers
WHERE event_object_table = 'leads'
AND trigger_name = 'update_leads_updated_at';

-- Check foreign key constraints
SELECT 
  'Foreign Key Constraints' as check_type,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status,
  COUNT(*) as found,
  3 as minimum_expected
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_name IN ('leads', 'interactions');

-- Detailed table structure for leads
SELECT 
  'Leads Table Structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;

-- Detailed table structure for interactions
SELECT 
  'Interactions Table Structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'interactions'
ORDER BY ordinal_position;

-- List all RLS policies
SELECT 
  'RLS Policy Details' as info,
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE tablename IN ('leads', 'interactions')
ORDER BY tablename, cmd;

-- List all indexes
SELECT 
  'Index Details' as info,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'interactions')
ORDER BY tablename, indexname;
