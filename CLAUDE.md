# CLAUDE.md

Next.js 16 App Router starter with Supabase, shadcn/ui, Tailwind v4, and GSAP.

## Quick Start

```bash
supabase start      # Start local DB (Docker required)
pnpm seed:demo      # Seed database with demo data (optional)
pnpm dev           # Dev server at http://localhost:3000
```

## Development Commands

- `pnpm dev` - Start dev server (Turbopack, HMR enabled)
- `pnpm build` - Production build (Turbopack)
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm seed:demo` - Seed database with demo user and sample data

## Environment Setup

**Local Development** (Recommended):
- `.env.local` is pre-configured for local Supabase
- Just run `supabase start` and `pnpm dev`

**Production/Cloud**:
Update `.env.local` with cloud credentials from https://app.supabase.com/project/_/settings/api

## Architecture Essentials

- **Next.js 16**: App Router, RSC by default, TypeScript strict mode
- **Styling**: Tailwind v4 (inline @theme), shadcn/ui "new-york" style, OKLCH colors
- **Database**: Supabase (local-first development) → See `lib/supabase/CLAUDE.md`
- **Auth**: Server-side patterns, route protection → See `lib/auth/CLAUDE.md`
- **Animations**: GSAP 3 (always prefer over CSS) → See `docs/animations.md`
- **Components**: shadcn/ui system → See `components/CLAUDE.md`

## Path Aliases

- `@/components` - General components
- `@/components/ui` - shadcn UI components
- `@/lib` - Utility libraries
- `@/hooks` - React hooks

## Critical Rules

1. **Supabase Client Selection**:
   - Server Components/Actions → `lib/supabase/server.ts`
   - Client Components → `lib/supabase/client.ts`
   - Middleware → `lib/supabase/middleware.ts`

2. **Security**: Always use `getUser()` not `getSession()` in server code

3. **Data Mutations**: Always call `revalidatePath()` after mutations (Server Actions)

4. **Animations**: Use `useGSAP` hook in Client Components only

5. **Styling**: Always use CSS variables (`bg-background`, `text-foreground`)

## Adding shadcn Components

```bash
npx shadcn@latest add [component-name]
```

Components are added to `components/ui/` with automatic configuration.

## Common Supabase Commands

```bash
supabase migration new <name>           # Create new migration
supabase db reset                       # Apply migrations (fresh database)
supabase gen types typescript --local > lib/supabase/types.ts  # Generate types
```

Access Supabase Studio: http://127.0.0.1:54323

## Database Seeding

**Demo Data Script** (`scripts/seed-demo-data.ts`):
- Creates a demo user with credentials
- Seeds 15 default categories
- Populates sample expenses (last 30 days)
- Sets up a monthly budget

```bash
pnpm seed:demo         # Run the seeding script
```

**Demo Credentials** (after running script):
- Email: `demo@example.com`
- Password: `Demo123!`

**Note**: The script uses the Supabase service role key to bypass RLS. Running it multiple times will clean up existing demo data and re-seed.

## Detailed Documentation

- **Supabase Integration**: `lib/supabase/CLAUDE.md` (CLI, migrations, security, types)
- **Supabase Code Examples**: `lib/supabase/README.md`
- **Authentication**: `lib/auth/CLAUDE.md` (patterns, route protection)
- **GSAP Animations**: `docs/animations.md` (complete guide with examples)
- **Component System**: `components/CLAUDE.md` (shadcn, MCP, conventions)
- **Styling System**: `docs/styling.md` (Tailwind v4, theme, conventions)

## Fonts

- Geist Sans and Geist Mono via `next/font/google`
- Loaded in root layout with CSS variable integration