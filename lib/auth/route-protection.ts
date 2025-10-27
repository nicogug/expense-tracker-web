/**
 * Route Protection Utilities
 *
 * Server-side utilities for protecting routes and redirecting unauthenticated users.
 * Use these in Server Components, Server Actions, and Route Handlers.
 */

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/queries/auth'

/**
 * Require authentication for a page
 *
 * Redirects to login page if user is not authenticated.
 * Returns the user object if authenticated.
 *
 * @param redirectTo - Path to redirect after login (default: current path)
 * @returns The authenticated user object
 *
 * @example
 * ```tsx
 * import { requireAuth } from '@/lib/auth/route-protection'
 *
 * export default async function ProtectedPage() {
 *   const user = await requireAuth()
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser()

  if (!user) {
    const loginUrl = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/login'
    redirect(loginUrl)
  }

  return user
}

/**
 * Require guest (non-authenticated) for a page
 *
 * Redirects to home page if user is already authenticated.
 * Useful for login/signup pages.
 *
 * @param redirectTo - Path to redirect if already authenticated (default: '/')
 *
 * @example
 * ```tsx
 * import { requireGuest } from '@/lib/auth/route-protection'
 *
 * export default async function LoginPage() {
 *   await requireGuest()
 *   return <LoginForm />
 * }
 * ```
 */
export async function requireGuest(redirectTo: string = '/') {
  const user = await getCurrentUser()

  if (user) {
    redirect(redirectTo)
  }
}

/**
 * Optional authentication
 *
 * Returns the user if authenticated, null otherwise.
 * Does not redirect - useful for pages that work for both authenticated and guest users.
 *
 * @returns User object or null
 *
 * @example
 * ```tsx
 * import { optionalAuth } from '@/lib/auth/route-protection'
 *
 * export default async function HomePage() {
 *   const user = await optionalAuth()
 *   return <div>{user ? `Welcome ${user.email}` : 'Welcome Guest'}</div>
 * }
 * ```
 */
export async function optionalAuth() {
  return await getCurrentUser()
}

/**
 * Check if user has specific role/permission
 *
 * This is a placeholder - implement based on your authorization strategy.
 * Common patterns:
 * - Store roles in user metadata
 * - Use a separate roles/permissions table
 * - Use Supabase Auth with custom claims
 *
 * @param user - The user object
 * @param role - The required role
 * @returns boolean
 *
 * @example
 * ```tsx
 * import { requireAuth } from '@/lib/auth/route-protection'
 * import { hasRole } from '@/lib/auth/route-protection'
 *
 * export default async function AdminPage() {
 *   const user = await requireAuth()
 *   if (!hasRole(user, 'admin')) {
 *     redirect('/unauthorized')
 *   }
 *   return <AdminDashboard />
 * }
 * ```
 */
export function hasRole(user: any, role: string): boolean {
  // Implement your role checking logic here
  // Example: return user.user_metadata?.role === role
  return false
}
