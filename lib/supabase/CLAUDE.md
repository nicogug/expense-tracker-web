# Supabase Integration Guide

Supabase integration for Next.js 16 App Router, following official best practices.

## Architecture

```
lib/supabase/
├── client.ts              # Browser client (Client Components)
├── server.ts              # Server client (Server Components, Actions, Route Handlers)
├── middleware.ts          # Middleware/Proxy client (auth token refresh)
├── config.ts              # Configuration and environment validation
├── types.ts               # TypeScript types (auto-generated from DB schema)
├── queries/               # Server-side read operations (with React cache)
├── mutations/             # Server-side write operations (Server Actions)
├── README.md              # Code examples and API reference
├── cli-guide.md           # Comprehensive CLI workflow guide
└── migration-guide.md     # Database migration best practices
```

## Client Selection Guide (CRITICAL)

**Always use the correct client for your context:**

```tsx
// Server Components, Route Handlers, Server Actions
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Components
'use client'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Proxy/Middleware - Already configured in proxy.ts
// Uses lib/supabase/middleware.ts
```

## Data Access Patterns

### Queries (`lib/supabase/queries/`)
- **Read operations only**
- Server-side functions
- Use React `cache()` for request deduplication
- Examples: `getCurrentUser()`, `getPosts()`, `getUserById(id)`

### Mutations (`lib/supabase/mutations/`)
- **Write operations** (create, update, delete)
- Implemented as Server Actions with `'use server'`
- Return format: `{ data?, error? }` or `{ success: boolean, error? }`
- **Always call `revalidatePath()`** after mutations
- Examples: `signIn(formData)`, `signUp(formData)`, `signOut()`

## Security Best Practices (CRITICAL)

1. **Use `getUser()` NOT `getSession()` in server code**
   - `getUser()` validates the auth token (secure ✅)
   - `getSession()` only checks cookies (insecure ❌)

2. **Token refresh is automatic**
   - Configured in `proxy.ts`
   - Runs on every request
   - Refreshes expired tokens and updates cookies

3. **Implement Row Level Security (RLS)**
   - Never trust client-side code alone
   - Define security policies in your Supabase database

4. **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (safe for browser)
   - `SUPABASE_SERVICE_ROLE_KEY` - (Optional) Service role key (server-only, bypasses RLS)

## TypeScript Types

Generate types from your database schema:

```bash
# Local development (recommended)
supabase gen types typescript --local > lib/supabase/types.ts

# Production (from cloud)
supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

Usage:
```tsx
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/types'

type Post = Tables<'posts'>
type NewPost = TablesInsert<'posts'>
type UpdatePost = TablesUpdate<'posts'>
```

## Quick CLI Commands

```bash
# Local Development
supabase start              # Start local Supabase (Docker required)
supabase stop               # Stop local Supabase
supabase status             # View status and URLs

# Studio UI
open http://127.0.0.1:54323 # Local Supabase Studio

# Database
supabase db reset           # Reset DB + apply migrations + seed
supabase db push            # Apply migrations (non-destructive)

# Migrations
supabase migration new <name>  # Create new migration
supabase gen types typescript --local > lib/supabase/types.ts  # Regenerate types

# Cloud (when linked)
supabase link --project-ref YOUR_REF  # Link to cloud project
supabase db push            # Push migrations to cloud
supabase db pull            # Pull schema from cloud
```

## Quick Start Workflow

```bash
# 1. Start local Supabase (first time or after reboot)
supabase start

# 2. Your app is ready to run
pnpm dev

# 3. Access Supabase Studio
open http://127.0.0.1:54323
```

The `.env.local` file is already configured for local development.

## File Structure Guidelines

When adding new Supabase functionality:

1. **Query functions** → `lib/supabase/queries/[domain].ts` (read operations)
2. **Mutation functions** → `lib/supabase/mutations/[domain].ts` (write operations)
3. **Route protection** → `lib/auth/route-protection.ts` (secure pages)
4. **Client hooks** → `hooks/use-user.ts`, `hooks/use-session.ts` (client auth state)

## Detailed Documentation

- **Code Examples**: `lib/supabase/README.md` (fetching data, mutations, real-time)
- **CLI Workflow**: `lib/supabase/cli-guide.md` (setup, migrations, linking to cloud)
- **Migration Best Practices**: `lib/supabase/migration-guide.md` (schema management)
- **Authentication**: `lib/auth/CLAUDE.md` (route protection, auth patterns)

## Common Issues

**Problem**: Types out of sync after schema changes
**Solution**: Regenerate types: `supabase gen types typescript --local > lib/supabase/types.ts`

**Problem**: Supabase won't start
**Solution**: Ensure Docker Desktop is running, then `supabase start`

**Problem**: Migration conflicts
**Solution**: Check `supabase/migrations/` for duplicate/conflicting files

**Problem**: RLS blocking queries
**Solution**: Check your RLS policies in Supabase Studio → Authentication → Policies