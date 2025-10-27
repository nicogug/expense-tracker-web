/**
 * Authentication Queries
 *
 * Server-side queries for fetching authentication-related data.
 * These functions use the server client and should only be called from:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 */

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

/**
 * Get the current authenticated user
 *
 * This function is cached per request to avoid multiple calls to Supabase.
 * Use this instead of getSession() for security - it validates the token on every call.
 *
 * @returns User object if authenticated, null if not
 * @throws Error if there's a problem fetching the user
 *
 * @example
 * ```tsx
 * import { getCurrentUser } from '@/lib/supabase/queries/auth'
 *
 * export default async function ProfilePage() {
 *   const user = await getCurrentUser()
 *   if (!user) redirect('/login')
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user:', error.message)
    return null
  }

  return user
})

/**
 * Get the current session
 *
 * Note: Only use this when you need the full session object (with tokens).
 * For user data, prefer getCurrentUser() instead.
 *
 * @returns Session object if authenticated, null if not
 *
 * @example
 * ```tsx
 * import { getSession } from '@/lib/supabase/queries/auth'
 *
 * export async function GET() {
 *   const session = await getSession()
 *   if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
 *   // Use session.access_token for API calls, etc.
 * }
 * ```
 */
export const getSession = cache(async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
})

/**
 * Check if a user is authenticated
 *
 * Helper function to quickly check auth status without fetching full user object.
 *
 * @returns boolean indicating if user is authenticated
 *
 * @example
 * ```tsx
 * import { isAuthenticated } from '@/lib/supabase/queries/auth'
 *
 * export default async function Page() {
 *   const authenticated = await isAuthenticated()
 *   return <div>{authenticated ? 'Logged in' : 'Logged out'}</div>
 * }
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}
