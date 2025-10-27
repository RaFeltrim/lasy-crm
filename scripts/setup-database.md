# Database Setup Instructions

This guide will help you set up the database schema for the Lasy AI CRM System.

## Prerequisites

- Supabase project created and running
- Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step-by-Step Setup

### 1. Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `qxbgltpxqhuhzyjfbcdp`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### 2. Run the Migration

1. Open the file: `supabase/migrations/20250127_initial_schema.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

### 3. Verify the Setup

After running the migration, verify everything is set up correctly:

#### Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'interactions')
ORDER BY table_name;
```

Expected result: 2 rows (interactions, leads)

#### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'interactions');
```

Expected result: Both tables should have `rowsecurity = true`

#### Check RLS Policies
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('leads', 'interactions')
ORDER BY tablename, cmd;
```

Expected result: 
- 4 policies for leads (SELECT, INSERT, UPDATE, DELETE)
- 2 policies for interactions (SELECT, INSERT)

#### Check Indexes
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'interactions')
ORDER BY tablename, indexname;
```

Expected result: Multiple indexes including:
- idx_leads_user_id
- idx_leads_status
- idx_leads_created_at
- idx_leads_search (GIN index for full-text search)
- idx_interactions_lead_id
- idx_interactions_created_at

#### Check Trigger
```sql
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'leads'
AND trigger_name = 'update_leads_updated_at';
```

Expected result: 1 row showing the trigger for automatic updated_at updates

### 4. Test the Setup

#### Test Lead Creation (via SQL)
```sql
-- This should work (creates a lead for the authenticated user)
INSERT INTO leads (name, email, company, status, user_id)
VALUES ('Test Lead', 'test@example.com', 'Test Company', 'new', auth.uid());
```

#### Test RLS Policies
```sql
-- This should only return leads for the authenticated user
SELECT * FROM leads;
```

#### Test Full-Text Search
```sql
-- This should find leads matching the search term
SELECT * FROM leads
WHERE to_tsvector('english', 
  coalesce(name, '') || ' ' || 
  coalesce(email, '') || ' ' || 
  coalesce(company, '') || ' ' || 
  coalesce(notes, '')
) @@ to_tsquery('english', 'test');
```

## What Was Created

### Tables
1. **leads** - Stores lead information with contact details and status
2. **interactions** - Stores interaction history for each lead

### Indexes
- Performance indexes on frequently queried columns (user_id, status, created_at, lead_id)
- Full-text search GIN index on leads table for fast text search

### Triggers
- `update_leads_updated_at` - Automatically updates the updated_at timestamp when a lead is modified

### RLS Policies
- **Leads table**: 4 policies (SELECT, INSERT, UPDATE, DELETE) ensuring users only access their own leads
- **Interactions table**: 2 policies (SELECT, INSERT) with lead ownership validation

## Troubleshooting

### Error: "permission denied for schema public"
- Ensure you're logged in to Supabase with proper permissions
- Try running the migration as the postgres user in the SQL Editor

### Error: "relation already exists"
- The migration uses `IF NOT EXISTS` clauses, so it's safe to run multiple times
- If you need to reset, drop the tables first:
  ```sql
  DROP TABLE IF EXISTS interactions CASCADE;
  DROP TABLE IF EXISTS leads CASCADE;
  ```

### RLS Policies Not Working
- Verify RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'leads';`
- Check that you're authenticated when testing
- Ensure `auth.uid()` returns a valid user ID

### Full-Text Search Not Working
- Verify the GIN index exists: `\d leads` or check pg_indexes
- Ensure the search query uses proper syntax: `to_tsquery('english', 'search:*')`

## Next Steps

After successful setup:

1. ✅ Database schema is ready
2. ✅ RLS policies are enforced
3. ✅ Indexes are optimized for performance
4. 🔄 Continue with Task 3: Authentication system implementation
5. 🔄 Build API endpoints to interact with the database
6. 🔄 Implement the frontend components

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
