# Database Schema Reference

## Tables Overview

### Leads Table

Stores customer lead information with contact details and pipeline status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| name | TEXT | NOT NULL | Lead's full name |
| email | TEXT | - | Lead's email address |
| phone | TEXT | - | Lead's phone number |
| company | TEXT | - | Lead's company name |
| status | TEXT | DEFAULT 'new', CHECK | Pipeline stage (new, contacted, qualified, pending, lost, won) |
| notes | TEXT | - | Additional notes about the lead |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp (auto-updated) |
| user_id | UUID | NOT NULL, FK to auth.users | Owner of the lead |

**Valid Status Values**: `new`, `contacted`, `qualified`, `pending`, `lost`, `won`

### Interactions Table

Stores interaction history and activities for each lead.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| lead_id | UUID | NOT NULL, FK to leads | Associated lead |
| type | TEXT | NOT NULL, CHECK | Type of interaction |
| description | TEXT | NOT NULL | Details of the interaction |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Interaction timestamp |
| user_id | UUID | NOT NULL, FK to auth.users | User who created the interaction |

**Valid Interaction Types**: `call`, `email`, `meeting`, `note`, `other`

## Indexes

### Leads Table Indexes

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| idx_leads_user_id | B-tree | user_id | Filter leads by user |
| idx_leads_status | B-tree | status | Filter leads by status (Kanban) |
| idx_leads_created_at | B-tree | created_at | Sort and filter by date |
| idx_leads_search | GIN | to_tsvector(name, email, company, notes) | Full-text search |

### Interactions Table Indexes

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| idx_interactions_lead_id | B-tree | lead_id | Get all interactions for a lead |
| idx_interactions_created_at | B-tree | created_at | Sort interactions chronologically |

## Triggers

### update_leads_updated_at

- **Table**: leads
- **Event**: BEFORE UPDATE
- **Function**: update_updated_at_column()
- **Purpose**: Automatically updates the `updated_at` timestamp whenever a lead is modified

## Row Level Security (RLS)

### Leads Table Policies

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view their own leads | SELECT | auth.uid() = user_id |
| Users can insert their own leads | INSERT | auth.uid() = user_id |
| Users can update their own leads | UPDATE | auth.uid() = user_id (USING and WITH CHECK) |
| Users can delete their own leads | DELETE | auth.uid() = user_id |

### Interactions Table Policies

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view interactions for their leads | SELECT | Lead exists AND lead.user_id = auth.uid() |
| Users can insert interactions for their leads | INSERT | auth.uid() = user_id AND lead exists AND lead.user_id = auth.uid() |

## Relationships

```
auth.users (Supabase Auth)
    ↓ (one-to-many)
leads
    ↓ (one-to-many)
interactions
```

- Each lead belongs to one user
- Each interaction belongs to one lead and one user
- Cascade delete: Deleting a user deletes their leads and interactions
- Cascade delete: Deleting a lead deletes its interactions

## Example Queries

### Create a Lead

```sql
INSERT INTO leads (name, email, phone, company, status, notes, user_id)
VALUES (
  'John Doe',
  'john@example.com',
  '+1234567890',
  'Acme Corp',
  'new',
  'Met at conference',
  auth.uid()
);
```

### Get All Leads for Current User

```sql
SELECT * FROM leads
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Get Leads by Status (Kanban Column)

```sql
SELECT * FROM leads
WHERE user_id = auth.uid()
AND status = 'contacted'
ORDER BY created_at DESC;
```

### Update Lead Status

```sql
UPDATE leads
SET status = 'qualified'
WHERE id = 'lead-uuid'
AND user_id = auth.uid();
```

### Full-Text Search

```sql
SELECT * FROM leads
WHERE user_id = auth.uid()
AND to_tsvector('english', 
  coalesce(name, '') || ' ' || 
  coalesce(email, '') || ' ' || 
  coalesce(company, '') || ' ' || 
  coalesce(notes, '')
) @@ to_tsquery('english', 'search_term:*')
ORDER BY created_at DESC;
```

### Create an Interaction

```sql
INSERT INTO interactions (lead_id, type, description, user_id)
VALUES (
  'lead-uuid',
  'call',
  'Discussed pricing and timeline',
  auth.uid()
);
```

### Get Interaction Timeline for a Lead

```sql
SELECT * FROM interactions
WHERE lead_id = 'lead-uuid'
ORDER BY created_at DESC;
```

### Get Lead with Interaction Count

```sql
SELECT 
  l.*,
  COUNT(i.id) as interaction_count
FROM leads l
LEFT JOIN interactions i ON i.lead_id = l.id
WHERE l.user_id = auth.uid()
GROUP BY l.id
ORDER BY l.created_at DESC;
```

## Data Integrity Rules

1. **User Ownership**: All leads and interactions must be associated with a valid user
2. **Lead Association**: All interactions must be associated with a valid lead
3. **Status Validation**: Lead status must be one of the predefined values
4. **Type Validation**: Interaction type must be one of the predefined values
5. **Cascade Deletion**: Deleting a lead automatically deletes all its interactions
6. **Automatic Timestamps**: `created_at` is set on insert, `updated_at` is updated on every modification

## Performance Considerations

1. **Indexes**: All frequently queried columns are indexed
2. **Full-Text Search**: GIN index enables fast text search across multiple columns
3. **RLS**: Policies are optimized to use indexed columns (user_id)
4. **Pagination**: Use LIMIT and OFFSET for large result sets
5. **Connection Pooling**: Supabase handles connection pooling automatically

## Security Features

1. **Row Level Security**: Enforced at database level, cannot be bypassed
2. **User Isolation**: Users can only access their own data
3. **Foreign Key Constraints**: Ensure data integrity
4. **Check Constraints**: Validate enum values at database level
5. **Cascade Deletion**: Prevents orphaned records
