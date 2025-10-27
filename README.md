# Next.js Starter with Supabase & shadcn/ui

Production-ready Next.js 16 starter with Supabase backend, shadcn/ui components, Tailwind CSS v4, and GSAP animations.

## Features

- **Next.js 16** - App Router, React Server Components, Turbopack
- **Supabase** - Local-first development with PostgreSQL, auth, and migrations
- **shadcn/ui** - Copy-paste components (New York style, OKLCH colors)
- **Tailwind CSS v4** - Modern styling with CSS variables
- **GSAP 3** - Professional animations
- **TypeScript** - Strict mode, end-to-end type safety

## Quick Start

### Local Development (Recommended)

```bash
# Install dependencies
pnpm install

# Start local Supabase (requires Docker)
supabase start

# Start dev server
pnpm dev
```

Open http://localhost:3000

**Note**: `.env.local` is pre-configured for local Supabase. No additional setup needed.

### Production/Cloud Setup

Update `.env.local` with cloud credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get credentials from: https://app.supabase.com/project/_/settings/api

## Architecture

### Project Structure

```
├── app/                    # Next.js App Router
├── components/
│   └── ui/                 # shadcn/ui components
├── hooks/                  # React hooks (use-user, use-session)
├── lib/
│   ├── auth/               # Route protection (requireAuth, requireGuest)
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   ├── middleware.ts   # Middleware client
│   │   ├── types.ts        # Generated DB types
│   │   ├── queries/        # Data fetching
│   │   └── mutations/      # Data mutations (Server Actions)
│   └── utils.ts            # Utilities (cn helper)
├── supabase/
│   ├── migrations/         # SQL migrations
│   └── seed.sql            # Seed data
└── middleware.ts           # Auth middleware
```

### Path Aliases

- `@/components` - Components
- `@/components/ui` - shadcn UI components
- `@/lib` - Utilities and integrations
- `@/hooks` - React hooks

### Supabase Client Selection

- **Server Components/Actions** → `lib/supabase/server.ts`
- **Client Components** → `lib/supabase/client.ts`
- **Middleware** → `lib/supabase/middleware.ts`

## Development Commands

```bash
pnpm dev                     # Start dev server (http://localhost:3000)
pnpm build                   # Production build
pnpm start                   # Start production server
pnpm lint                    # Run ESLint

supabase start               # Start local database (http://127.0.0.1:54323)
supabase migration new <name> # Create migration
supabase db reset            # Apply migrations + seed
supabase gen types typescript --local > lib/supabase/types.ts  # Generate types

npx shadcn@latest add <component>  # Add shadcn component
```

## Key Patterns

### Authentication

Always use `getUser()` (not `getSession()`) for server-side auth. Use `requireAuth()` helper for protected pages.

### Data Mutations

Always call `revalidatePath()` after mutations in Server Actions to update cache.

### Animations

Use GSAP (`useGSAP` hook) for animations. Prefer GSAP over CSS animations.

### Styling

Use CSS variables (`bg-background`, `text-foreground`) for theming support.

## Documentation

For detailed guides, see:

- `CLAUDE.md` - Project overview and quick reference
- `lib/supabase/CLAUDE.md` - Supabase integration (CLI, migrations, security)
- `lib/supabase/README.md` - Supabase code examples
- `lib/auth/CLAUDE.md` - Authentication patterns
- `docs/animations.md` - GSAP animation guide
- `components/CLAUDE.md` - Component system
- `docs/styling.md` - Tailwind v4 and theming

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [GSAP Docs](https://greensock.com/docs)

## License

MIT
