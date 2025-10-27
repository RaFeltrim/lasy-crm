# Supabase Database Setup

This directory contains the database schema and migration files for the Lasy AI CRM System.

## Migration Files

- `migrations/20250127_initial_schema.sql` - Initial database schema with tables, indexes, triggers, and RLS policies

## Database Schema Overview

### Tables

#### Leads Table
- Stores lead information with contact details and status
- Includes full-text search capabilities
- Automatic timestamp updates via trigger
- Row Level Security ensures users only access their own leads

#### Interactions Table
- Stores interaction history for each lead
- Linked to leads via foreign key with cascade delete
- RLS policies validate lead ownership before allowing access

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Policies enforce ownership validation at database level
- Foreign key constraints ensure data integrity

## How to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/20250127_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref qxbgltpxqhuhzyjfbcdp

# Apply migration
supabase db push
```

### Option 3: Manual Execution

If you prefer to run the SQL directly:

```bash
# Using psql (if you have direct database access)
psql -h db.qxbgltpxqhuhzyjfbcdp.supabase.co -U postgres -d postgres -f supabase/migrations/20250127_initial_schema.sql
```

## Verification

After applying the migration, verify the setup:

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'interactions');
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('leads', 'interactions');
```

### Check Indexes
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('leads', 'interactions');
```

### Check Triggers
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'leads';
```

## Database Schema Details

### Leads Table Columns
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL)
- `email` (TEXT)
- `phone` (TEXT)
- `company` (TEXT)
- `status` (TEXT, CHECK constraint for valid statuses)
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ, auto-updated)
- `user_id` (UUID, Foreign Key to auth.users)

### Interactions Table Columns
- `id` (UUID, Primary Key)
- `lead_id` (UUID, Foreign Key to leads)
- `type` (TEXT, CHECK constraint for valid types)
- `description` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ)
- `user_id` (UUID, Foreign Key to auth.users)

## Performance Optimizations

The migration includes several performance optimizations:

1. **Indexes on frequently queried columns**:
   - `user_id` for filtering by user
   - `status` for Kanban board queries
   - `created_at` for sorting and date filtering
   - `lead_id` for interaction lookups

2. **Full-text search index**:
   - GIN index on combined text fields (name, email, company, notes)
   - Enables fast search across all lead text data

3. **Automatic timestamp updates**:
   - Trigger function updates `updated_at` on every lead modification
   - No application code needed for timestamp management

## Troubleshooting

### Migration Fails
- Ensure you have proper permissions in Supabase
- Check if tables already exist (migration uses `IF NOT EXISTS`)
- Verify the UUID extension is available

### RLS Policies Not Working
- Ensure RLS is enabled: `ALTER TABLE leads ENABLE ROW LEVEL SECURITY;`
- Check that `auth.uid()` returns the correct user ID
- Verify policies are created: `SELECT * FROM pg_policies;`

### Performance Issues
- Ensure indexes are created successfully
- Check query plans: `EXPLAIN ANALYZE SELECT * FROM leads WHERE user_id = '...';`
- Monitor index usage in Supabase dashboard

## Next Steps

After applying the migration:

1. Test authentication and verify RLS policies work
2. Create test data to validate the schema
3. Implement API endpoints that interact with these tables
4. Set up real-time subscriptions for live updates
