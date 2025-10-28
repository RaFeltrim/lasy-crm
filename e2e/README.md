# E2E Tests

This directory contains end-to-end tests for the Lasy AI CRM System using Playwright.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Set up environment variables:
Create a `.env.local` file with valid Supabase credentials and test user credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your-test-password
```

## Running Tests

The E2E tests are currently skipped by default because they require:
- A running Next.js application
- Valid Supabase credentials
- Test user accounts
- Test data in the database

To run the tests:

1. Start the development server:
```bash
npm run dev
```

2. In another terminal, run the tests:
```bash
npm run test:e2e
```

## Test Coverage

The E2E tests cover the following critical user flows:

### Authentication (auth.spec.ts)
- Display login page for unauthenticated users
- Login with valid credentials
- Show error for invalid credentials
- Logout successfully

### Lead Management (leads.spec.ts)
- Create a new lead
- Edit an existing lead
- Delete a lead

### Kanban Board (kanban.spec.ts)
- Display Kanban board with columns
- Drag and drop lead between columns
- Update stage analytics after drag

### Search and Filter (search.spec.ts)
- Search leads by name
- Filter leads by status
- Filter leads by date range
- Combine search and filters
- Clear filters

### Import/Export (import-export.spec.ts)
- Import leads from CSV file
- Show validation errors for invalid CSV
- Export leads to CSV
- Export leads to XLSX

## Enabling Tests

To enable the tests, remove the `.skip` from the test declarations and ensure you have:
1. A running application
2. Valid test credentials
3. Test fixtures (CSV files) in the `e2e/fixtures` directory

## Notes

- Tests are marked as `.skip` to prevent failures in CI/CD without proper setup
- Each test file includes requirements references for traceability
- Tests use Playwright's auto-waiting and retry mechanisms
- The application server is automatically started by Playwright if not running
