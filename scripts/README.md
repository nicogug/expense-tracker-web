# Scripts

This directory contains utility scripts for development and data management.

## Available Scripts

### `seed-demo-data.ts`

Creates a demo user and populates the database with sample expenses and budget data for testing and development.

**Usage:**

```bash
pnpm seed:demo
```

**What it does:**

1. Creates a demo user account (or uses existing one)
2. Clears any existing demo data (for fresh seeding)
3. Fetches default category IDs from the database
4. Creates 23 sample expense transactions across different categories and dates
5. Sets up a monthly budget of $2,000

**Demo User Credentials:**

- **Email:** `demo@example.com`
- **Password:** `Demo123!`

**Sample Data Includes:**

- **Expenses:** 23 transactions spanning ~24 days
- **Categories:** Food & Dining, Shopping, Transportation, Entertainment, Bills & Utilities, Groceries, Healthcare
- **Total Expenses:** ~$1,533.27
- **Budget:** $2,000.00
- **Budget Used:** ~76.7%

**Requirements:**

- Supabase must be running (`supabase start`)
- Environment variables must be set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Re-running the Script:**

You can run the script multiple times. If the demo user already exists, it will:
1. Use the existing user
2. Delete all previous demo expenses and budgets
3. Create fresh sample data

This ensures you always have clean, consistent test data.

## Adding New Scripts

To add a new script:

1. Create a new `.ts` file in this directory
2. Add the shebang: `#!/usr/bin/env tsx`
3. Import and configure dotenv if you need environment variables:
   ```typescript
   import { config } from 'dotenv'
   import path from 'path'

   config({ path: path.resolve(process.cwd(), '.env.local') })
   ```
4. Add a script entry in `package.json`:
   ```json
   "scripts": {
     "your-script": "tsx scripts/your-script.ts"
   }
   ```
