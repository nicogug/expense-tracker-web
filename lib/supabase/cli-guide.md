# Supabase CLI Workflow Guide

Comprehensive guide for using the Supabase CLI with this Next.js 16 application.

## Prerequisites

- **Supabase CLI**: Install via Homebrew
  ```bash
  brew install supabase/tap/supabase
  ```
  
- **Docker Desktop**: Required for local Supabase
  - Download: https://www.docker.com/products/docker-desktop
  - Must be running before starting Supabase

## Local Development Setup

### First Time Setup

**1. Start Local Supabase**:
```bash
supabase start
```

This command starts all Supabase services locally in Docker:
- PostgreSQL database (port 54322)
- Auth server (port 54321)
- Storage server (port 54321)
- Realtime server (port 54321)
- Supabase Studio UI (port 54323)

**Output**:
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbG...
service_role key: eyJhbG...
```

**2. Environment Configuration**:

The `.env.local` file is already configured for local development:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

**3. Access Supabase Studio**:
Open http://127.0.0.1:54323 in your browser.

This is a local version of the Supabase Dashboard where you can:
- Browse and edit tables
- Run SQL queries
- View and create users
- Manage storage buckets
- Configure auth settings
- View realtime logs

**4. Start Your App**:
```bash
pnpm dev
```

Your app is now connected to local Supabase!

### Daily Development

```bash
# Morning: Start Supabase (if Docker was stopped)
supabase start

# Work on your app
pnpm dev

# Evening: Stop Supabase (optional, preserves data)
supabase stop
```

**Note**: `supabase stop` preserves your local data. It will still be there when you run `supabase start` again.

## Database Migration Workflow

### Creating Migrations

**1. Create a New Migration File**:
```bash
supabase migration new add_posts_table
```

This creates a timestamped file:
```
supabase/migrations/20240125120000_add_posts_table.sql
```

**2. Write Your Schema Changes**:

Edit the generated file with SQL:

```sql
-- supabase/migrations/20240125120000_add_posts_table.sql

-- Create the posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.posts enable row level security;

-- Create policies
create policy "Public posts are viewable by everyone"
  on public.posts for select
  using (published = true);

create policy "Users can create their own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index posts_user_id_idx on public.posts(user_id);
create index posts_published_idx on public.posts(published);
create index posts_created_at_idx on public.posts(created_at desc);
```

**3. Apply the Migration**:

```bash
# Destructive: Resets DB and applies all migrations + seed
supabase db reset

# Non-destructive: Only applies new migrations
supabase db push
```

**Difference**:
- `supabase db reset` - **Deletes all data**, applies all migrations, runs seed.sql
- `supabase db push` - **Keeps data**, only applies new/pending migrations

Use `reset` during active development, `push` when you have data you want to keep.

**4. Regenerate TypeScript Types**:

After any schema change, regenerate types:
```bash
supabase gen types typescript --local > lib/supabase/types.ts
```

This keeps your TypeScript types in sync with your database schema.

### Migration Tips

**Creating Related Tables**:
```sql
-- First table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique
);

-- Second table with foreign key
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete set null,
  title text not null
);
```

**Adding Columns to Existing Tables**:
```sql
-- Add new column
alter table public.posts
  add column view_count integer default 0;

-- Add column with constraint
alter table public.posts
  add column slug text unique;
```

**Creating Functions**:
```sql
-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to call function
create trigger set_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();
```

## Seed Data

**Edit `supabase/seed.sql`** to add development data:

```sql
-- supabase/seed.sql

-- Insert test categories
insert into public.categories (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Technology'),
  ('22222222-2222-2222-2222-222222222222', 'Design');

-- Insert test posts (requires a user_id from auth.users)
-- Create a test user in Supabase Studio first, then use their ID here
insert into public.posts (user_id, title, content, published, category_id) values
  ('your-user-id-here'::uuid, 'First Post', 'This is my first post!', true, '11111111-1111-1111-1111-111111111111'),
  ('your-user-id-here'::uuid, 'Draft Post', 'Work in progress', false, '22222222-2222-2222-2222-222222222222');
```

**Apply Seed Data**:
```bash
supabase db reset  # Includes seeding
```

**Tip**: Create a test user in Supabase Studio (http://127.0.0.1:54323 → Authentication → Users → Add user) and use their ID in seed.sql.

## Linking to Supabase Cloud

When you're ready to deploy to production, link your local project to a Supabase Cloud project.

### Setup

**1. Login to Supabase**:
```bash
supabase login
```

This opens a browser to authenticate with your Supabase account.

**2. Create a Cloud Project**:
- Go to https://app.supabase.com
- Click "New project"
- Choose organization, name, password, and region
- Wait for project to be created (~2 minutes)

**3. Link Local Project to Cloud**:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Get your project ref from:
https://app.supabase.com/project/_/settings/general

Example project ref: `abcdefghijklmnop`

### Deploying Migrations

**Push Local Migrations to Cloud**:
```bash
supabase db push
```

This applies all your local migrations to the cloud database.

**Warning**: This will modify your production database. Always test locally first!

### Pulling Cloud Schema

If you have an existing cloud database and want to create migrations from it:

```bash
supabase db pull
```

This generates a migration file from your current cloud schema.

### Environment Variables for Production

Update your production environment (Vercel, etc.) with cloud credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-cloud-anon-key
```

Get these from:
https://app.supabase.com/project/_/settings/api

## Complete CLI Command Reference

### Project Management
```bash
supabase init          # Initialize Supabase in current directory
supabase start         # Start local Supabase
supabase stop          # Stop local Supabase (keeps data)
supabase stop --no-backup  # Stop and delete all data
supabase status        # Show status and connection details
```

### Database
```bash
supabase db reset      # Reset DB, apply all migrations, run seed
supabase db push       # Apply new migrations only (non-destructive)
supabase db pull       # Generate migration from cloud schema
supabase db diff       # Show diff between local and cloud
```

### Migrations
```bash
supabase migration new <name>    # Create new migration file
supabase migration list          # List all migrations
supabase migration repair        # Fix migration history
```

### Types
```bash
supabase gen types typescript --local > lib/supabase/types.ts
supabase gen types typescript --project-id REF > lib/supabase/types.ts
```

### Auth & Users
```bash
supabase gen keys      # Generate new JWT keys
```

### Cloud
```bash
supabase login         # Login to Supabase
supabase link          # Link local to cloud project
supabase unlink        # Unlink from cloud
```

### Logs & Debugging
```bash
supabase logs          # View all logs
supabase logs -f       # Follow logs (live)
```

## Troubleshooting

**Supabase won't start**:
- Ensure Docker Desktop is running
- Check if ports 54321-54324 are available
- Try: `supabase stop --no-backup` then `supabase start`

**Types out of sync**:
- Regenerate: `supabase gen types typescript --local > lib/supabase/types.ts`

**Migration errors**:
- Check `supabase/migrations/` for syntax errors
- Ensure migrations are in correct order (by timestamp)
- Try: `supabase db reset` to start fresh

**Port conflicts**:
```bash
# Find process using port
lsof -ti:54321
# Kill process
kill -9 <PID>
```

**Can't access Studio**:
- Ensure Supabase is running: `supabase status`
- Try: http://127.0.0.1:54323 or http://localhost:54323

## Related Documentation

- `lib/supabase/CLAUDE.md` - Quick reference and essentials
- `lib/supabase/migration-guide.md` - Migration best practices
- `lib/supabase/README.md` - Code examples and API reference