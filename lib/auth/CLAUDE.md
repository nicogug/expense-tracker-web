# Authentication Guide

Authentication utilities and route protection for Next.js 16 + Supabase Auth.

## Architecture

```
lib/auth/
├── route-protection.ts    # Server-side route protection helpers
└── examples.md           # Detailed implementation examples
```

Related files:
- `hooks/use-user.ts` - Client hook for current user
- `hooks/use-session.ts` - Client hook for session
- `lib/supabase/mutations/auth.ts` - Auth Server Actions

## Quick Reference

### Server Components (Recommended)

```tsx
import { requireAuth, requireGuest, getCurrentUser } from '@/lib/auth/route-protection'

// Protected route - redirects to /login if not authenticated
const user = await requireAuth()

// Guest-only route - redirects to / if authenticated
await requireGuest()

// Optional auth - returns null if not authenticated
const user = await getCurrentUser()
```

**Available helpers**:
- `requireAuth(redirectTo?)` - Require authenticated user
- `requireGuest(redirectTo?)` - Require guest (not authenticated)
- `getCurrentUser()` - Get current user or null (no redirect)

### Client Components

```tsx
'use client'
import { useUser } from '@/hooks/use-user'
import { useSession } from '@/hooks/use-session'

const { user, loading } = useUser()
const { session, loading } = useSession()
```

### Server Actions (Forms)

```tsx
'use client'
import { signIn, signUp, signOut } from '@/lib/supabase/mutations/auth'

<form action={signIn}>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Sign In</button>
</form>
```

**Available Server Actions**:
- `signIn(formData)` - Sign in with email/password
- `signUp(formData)` - Sign up new user
- `signOut()` - Sign out current user

## Security Best Practices (CRITICAL)

1. **Server-side validation is required**
   - Always validate auth state on the server
   - Client-side checks are for UX only
   - Use `requireAuth()` for protected pages

2. **Use `getUser()` NOT `getSession()`**
   - `getUser()` validates the token (secure ✅)
   - `getSession()` only checks cookies (insecure ❌)
   - Route protection helpers use `getUser()` internally

3. **Token refresh is automatic**
   - Configured in `proxy.ts`
   - Auto-refreshes expired tokens
   - Updates cookies on every request

4. **Row Level Security (RLS)**
   - Never rely on client-side auth alone
   - Implement RLS policies in Supabase database
   - RLS is enforced even if client bypasses checks

## Common Patterns

### Protected Page
```tsx
const user = await requireAuth()
return <Dashboard user={user} />
```

### Guest-Only Page (Login/Signup)
```tsx
await requireGuest()
return <LoginForm />
```

### Public Page with Personalization
```tsx
const user = await getCurrentUser()
return user ? <WelcomeBack user={user} /> : <GuestWelcome />
```

### Custom Redirect
```tsx
const user = await requireAuth('/admin/login')
if (user.role !== 'admin') redirect('/dashboard')
return <AdminPanel />
```

## Detailed Examples

For complete implementation examples including:
- Client-side protected components with loading states
- useEffect patterns for route protection
- Complex authentication flows
- Error handling patterns

See `lib/auth/examples.md`

## Related Documentation

- `lib/supabase/CLAUDE.md` - Supabase integration guide
- `lib/supabase/README.md` - API reference and code examples