# Database Migration Best Practices

Best practices and patterns for managing database migrations in this Supabase project.

## Migration Principles

### 1. Always Use Migrations

**✅ DO**: Create migrations for schema changes
```bash
supabase migration new add_column_to_posts
```

**❌ DON'T**: Manually edit schema in Supabase Studio for persistent changes

**Why**: Migrations are version-controlled, reproducible, and can be applied to any environment.

### 2. Test Locally First

**Workflow**:
```bash
# 1. Create migration
supabase migration new my_change

# 2. Write SQL
# Edit supabase/migrations/TIMESTAMP_my_change.sql

# 3. Test locally
supabase db reset

# 4. Verify it works
pnpm dev

# 5. Commit
git add supabase/migrations/
git commit -m "Add migration: my_change"

# 6. Push to production (when ready)
supabase db push
```

**Never skip local testing!** Always verify migrations work before pushing to production.

### 3. Always Enable RLS

**Every table should have Row Level Security enabled**:

```sql
-- Create table
create table public.my_table (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  data text not null
);

-- Enable RLS (REQUIRED)
alter table public.my_table enable row level security;

-- Create policies
create policy "Users can view their own data"
  on public.my_table for select
  using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on public.my_table for insert
  with check (auth.uid() = user_id);
```

**Without RLS**: Your data is accessible by anyone if they know the table name!

### 4. Descriptive Migration Names

**✅ GOOD**:
```bash
supabase migration new add_user_profiles_table
supabase migration new add_email_index_to_users
supabase migration new create_posts_rls_policies
```

**❌ BAD**:
```bash
supabase migration new migration1
supabase migration new fix
supabase migration new update
```

**Why**: Clear names make it easy to understand what changed and when.

### 5. One Logical Change Per Migration

**✅ GOOD**: Separate migrations for separate concerns
```bash
supabase migration new add_posts_table
supabase migration new add_comments_table
supabase migration new add_posts_full_text_search
```

**❌ BAD**: Multiple unrelated changes in one migration
```bash
supabase migration new add_all_new_tables  # Too broad
```

**Why**: Easier to debug, revert, and understand changes.

### 6. Always Regenerate Types

After every schema change:
```bash
supabase gen types typescript --local > lib/supabase/types.ts
```

**Automate it** in your workflow:
```bash
# After applying migration
supabase db reset
supabase gen types typescript --local > lib/supabase/types.ts
pnpm dev
```

### 7. Maintain seed.sql

Keep `supabase/seed.sql` updated with realistic test data.

**Good seed data**:
- Covers common use cases
- Includes edge cases
- Uses realistic values
- Creates relationships between tables

```sql
-- seed.sql
insert into public.categories (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Technology'),
  ('22222222-2222-2222-2222-222222222222', 'Design');

insert into public.posts (user_id, title, content, category_id) values
  ('user-id'::uuid, 'Getting Started', 'Content here', '11111111-1111-1111-1111-111111111111');
```

## Common Migration Patterns

### Creating a Table with RLS

```sql
-- Create table
create table public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  task text not null,
  is_complete boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.todos enable row level security;

-- Policies
create policy "Users can view own todos"
  on public.todos for select
  using (auth.uid() = user_id);

create policy "Users can insert own todos"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos for update
  using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos for delete
  using (auth.uid() = user_id);

-- Indexes
create index todos_user_id_idx on public.todos(user_id);
create index todos_is_complete_idx on public.todos(is_complete);
```

### Adding Columns

```sql
-- Add nullable column (safe)
alter table public.posts
  add column excerpt text;

-- Add column with default (safe)
alter table public.posts
  add column view_count integer default 0;

-- Add NOT NULL column (requires default or backfill)
alter table public.posts
  add column status text not null default 'draft';
```

### Creating Indexes

```sql
-- Single column index
create index posts_user_id_idx on public.posts(user_id);

-- Composite index
create index posts_user_published_idx on public.posts(user_id, published);

-- Unique index
create unique index posts_slug_idx on public.posts(slug);

-- Partial index (conditional)
create index posts_published_idx on public.posts(created_at)
  where published = true;
```

### Foreign Keys with Cascade

```sql
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null
);
```

**Cascade options**:
- `on delete cascade` - Delete child when parent deleted
- `on delete set null` - Set to null when parent deleted
- `on delete restrict` - Prevent deletion if children exist (default)

### Timestamps and Updated At

```sql
-- Add timestamps to table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Function to update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to automatically update updated_at
create trigger set_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();
```

### Public vs Authenticated Policies

```sql
-- Public read, authenticated write
create policy "Anyone can view published posts"
  on public.posts for select
  using (published = true);

create policy "Authenticated users can create posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);
```

### Enum Types

```sql
-- Create enum
create type public.post_status as enum ('draft', 'published', 'archived');

-- Use in table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  status post_status default 'draft'
);
```

## Migration Workflow Checklist

Before committing a migration:

- [ ] Migration has descriptive name
- [ ] SQL syntax is valid
- [ ] RLS is enabled on new tables
- [ ] RLS policies are created
- [ ] Indexes are added for foreign keys
- [ ] Migration tested locally with `supabase db reset`
- [ ] TypeScript types regenerated
- [ ] seed.sql updated if needed
- [ ] App tested with new schema
- [ ] Changes committed to git

## Handling Migration Conflicts

**Problem**: Two developers create migrations at the same time

**Solution**: 
1. Pull latest migrations from git
2. If conflict, rename your migration file to have a later timestamp
3. Test with `supabase db reset`
4. Commit

**Example**:
```bash
# Original migration
20240125120000_my_feature.sql

# Rename to later timestamp after pulling
20240125123000_my_feature.sql
```

## Rollback Strategy

Supabase doesn't have built-in rollback, but you can:

**Option 1**: Create a "down" migration
```bash
supabase migration new rollback_add_posts_table
```

```sql
-- In rollback migration
drop table if exists public.posts cascade;
```

**Option 2**: Use version control
```bash
# Revert the migration commit
git revert <commit-hash>

# Reset database
supabase db reset
```

## Production Migration Strategy

**Before deploying**:
1. Test migration locally
2. Backup production database
3. Schedule maintenance window if needed
4. Monitor for errors after deployment

**Deployment**:
```bash
supabase db push  # Applies to cloud
```

**After deployment**:
1. Verify migration applied successfully
2. Test critical user flows
3. Monitor error logs
4. Be ready to rollback if needed

## Related Documentation

- `lib/supabase/CLAUDE.md` - Quick reference
- `lib/supabase/cli-guide.md` - CLI commands and workflow
- `lib/supabase/README.md` - Code examples