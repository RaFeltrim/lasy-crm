# Database Setup - Quick Start

## 🚀 5-Minute Setup

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select project: `qxbgltpxqhuhzyjfbcdp`
3. Click **SQL Editor** in sidebar
4. Click **New Query**

### Step 2: Run Migration
1. Open file: `supabase/migrations/20250127_initial_schema.sql`
2. Copy all contents (Ctrl/Cmd + A, then Ctrl/Cmd + C)
3. Paste into SQL Editor (Ctrl/Cmd + V)
4. Click **Run** button (or press Ctrl/Cmd + Enter)

### Step 3: Verify Setup
Run this quick verification query:

```sql
-- Quick verification
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('leads', 'interactions')) as tables_created,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE tablename IN ('leads', 'interactions')) as policies_created,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE schemaname = 'public' 
   AND tablename IN ('leads', 'interactions')
   AND indexname LIKE 'idx_%') as indexes_created;
```

**Expected Result:**
- tables_created: 2
- policies_created: 6
- indexes_created: 6

### Step 4: Test It
Create a test lead:

```sql
-- Test lead creation (replace 'your-user-id' with actual user ID from auth.users)
INSERT INTO leads (name, email, company, status, user_id)
VALUES ('Test Lead', 'test@example.com', 'Test Co', 'new', auth.uid())
RETURNING *;
```

## ✅ You're Done!

The database is now ready for the CRM application.

## 📚 Need More Details?

- Full setup guide: `scripts/setup-database.md`
- Schema reference: `supabase/SCHEMA.md`
- Verification queries: `scripts/verify-database.sql`
- General info: `supabase/README.md`

## ⚠️ Troubleshooting

**Error: "auth.uid() is null"**
- You need to be authenticated to create leads
- Use a valid user_id from auth.users table for testing

**Error: "permission denied"**
- Ensure you're running the query in Supabase SQL Editor
- Check that you have proper permissions

**Tables already exist?**
- The migration is safe to run multiple times (uses IF NOT EXISTS)
- To reset: Drop tables first, then run migration again
