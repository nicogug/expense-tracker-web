# Authentication Examples

Detailed implementation examples for authentication patterns in this Next.js 16 + Supabase application.

## Server Components

### Protected Route (Full Example)

```tsx
import { requireAuth } from '@/lib/auth/route-protection'

export default async function DashboardPage() {
  const user = await requireAuth() // Redirects to /login if not authenticated
  
  // User is guaranteed to be authenticated here
  // You can safely access user properties
  
  return (
    <div>
      <h1>Welcome {user.email}</h1>
      <Dashboard user={user} />
    </div>
  )
}
```

### Guest-Only Route (Login/Signup Pages)

```tsx
import { requireGuest } from '@/lib/auth/route-protection'

export default async function LoginPage() {
  await requireGuest() // Redirects to / if already authenticated
  
  // User is guaranteed to NOT be authenticated here
  // Perfect for login/signup pages
  
  return (
    <div>
      <h1>Sign In</h1>
      <LoginForm />
    </div>
  )
}
```

### Optional Authentication (Public Page with Personalization)

```tsx
import { getCurrentUser } from '@/lib/auth/route-protection'

export default async function HomePage() {
  const user = await getCurrentUser() // null if not authenticated, no redirect
  
  // This page works for both authenticated and guest users
  
  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome back, {user.email}!</h1>
          <PersonalizedContent user={user} />
        </div>
      ) : (
        <div>
          <h1>Welcome!</h1>
          <GuestContent />
          <CallToAction />
        </div>
      )}
    </div>
  )
}
```

### Role-Based Protection

```tsx
import { requireAuth } from '@/lib/auth/route-protection'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await requireAuth()
  
  // Additional role check after authentication
  if (user.role !== 'admin') {
    redirect('/dashboard') // Redirect non-admins
  }
  
  return <AdminPanel user={user} />
}
```

### Custom Redirect URLs

```tsx
import { requireAuth, requireGuest } from '@/lib/auth/route-protection'

// Redirect to custom login page
export default async function SettingsPage() {
  const user = await requireAuth('/auth/login')
  return <Settings user={user} />
}

// Redirect to custom page when already authenticated
export default async function SignUpPage() {
  await requireGuest('/dashboard')
  return <SignUpForm />
}
```

## Client Components

### Basic User Display

```tsx
'use client'

import { useUser } from '@/hooks/use-user'

export function UserProfile() {
  const { user, loading } = useUser()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Not logged in</div>
  }

  return (
    <div>
      <h2>Profile</h2>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  )
}
```

### Client-Side Route Protection

```tsx
'use client'

import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedClientComponent() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  // Render protected content
  return (
    <div>
      <h2>Protected Content</h2>
      <p>Hello, {user.email}</p>
    </div>
  )
}
```

### Conditional Rendering Based on Auth

```tsx
'use client'

import { useUser } from '@/hooks/use-user'

export function ConditionalContent() {
  const { user, loading } = useUser()

  if (loading) {
    return <Skeleton />
  }

  return (
    <div>
      {user ? (
        <div>
          <h2>Member Benefits</h2>
          <PremiumFeatures />
        </div>
      ) : (
        <div>
          <h2>Sign up to access premium features</h2>
          <SignUpCTA />
        </div>
      )}
    </div>
  )
}
```

### Session Information

```tsx
'use client'

import { useSession } from '@/hooks/use-session'

export function SessionInfo() {
  const { session, loading } = useSession()

  if (loading) return <div>Loading session...</div>
  if (!session) return <div>No active session</div>

  return (
    <div>
      <p>Access Token: {session.access_token.substring(0, 20)}...</p>
      <p>Expires: {new Date(session.expires_at! * 1000).toLocaleString()}</p>
    </div>
  )
}
```

## Forms with Server Actions

### Sign In Form

```tsx
'use client'

import { signIn } from '@/lib/supabase/mutations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignInForm() {
  return (
    <form action={signIn} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
        />
      </div>
      
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  )
}
```

### Sign Up Form

```tsx
'use client'

import { signUp } from '@/lib/supabase/mutations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignUpForm() {
  return (
    <form action={signUp} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={6}
          required
        />
      </div>
      
      <Button type="submit" className="w-full">
        Sign Up
      </Button>
    </form>
  )
}
```

### Sign Out Button

```tsx
'use client'

import { signOut } from '@/lib/supabase/mutations/auth'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        Sign Out
      </Button>
    </form>
  )
}
```

## Advanced Patterns

### Loading States with Suspense

```tsx
import { Suspense } from 'react'
import { requireAuth } from '@/lib/auth/route-protection'

export default async function DashboardPage() {
  const user = await requireAuth()
  
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardData userId={user.id} />
      </Suspense>
    </div>
  )
}
```

### Combining Auth with Data Fetching

```tsx
import { requireAuth } from '@/lib/auth/route-protection'
import { getUserProfile } from '@/lib/supabase/queries/profiles'

export default async function ProfilePage() {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)
  
  return (
    <div>
      <h1>Profile</h1>
      <ProfileDisplay profile={profile} />
    </div>
  )
}
```

### Error Handling

```tsx
'use client'

import { signIn } from '@/lib/supabase/mutations/auth'
import { useFormState } from 'react-dom'

export function SignInFormWithErrors() {
  const [state, formAction] = useFormState(signIn, null)
  
  return (
    <form action={formAction}>
      {state?.error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
          {state.error}
        </div>
      )}
      
      <Input name="email" type="email" required />
      <Input name="password" type="password" required />
      <Button type="submit">Sign In</Button>
    </form>
  )
}
```

## Related Documentation

- `lib/auth/CLAUDE.md` - Quick reference and best practices
- `lib/supabase/CLAUDE.md` - Supabase integration
- `lib/supabase/README.md` - API reference