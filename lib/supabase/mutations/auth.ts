/**
 * Authentication Mutations
 *
 * Server Actions for authentication operations.
 * These functions handle sign up, sign in, sign out, and password management.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type ActionResult = {
  error?: string
  success?: boolean
}

/**
 * Sign up a new user with email and password
 *
 * @param formData - Form data containing email and password
 * @returns Object with error message if failed
 *
 * @example
 * ```tsx
 * 'use client'
 * import { signUp } from '@/lib/supabase/mutations/auth'
 *
 * export function SignUpForm() {
 *   return (
 *     <form action={signUp}>
 *       <input name="email" type="email" required />
 *       <input name="password" type="password" required />
 *       <button type="submit">Sign Up</button>
 *     </form>
 *   )
 * }
 * ```
 */
export async function signUp(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Sign in an existing user with email and password
 *
 * @param formData - Form data containing email and password
 * @returns Object with error message if failed
 *
 * @example
 * ```tsx
 * 'use client'
 * import { signIn } from '@/lib/supabase/mutations/auth'
 *
 * export function SignInForm() {
 *   return (
 *     <form action={signIn}>
 *       <input name="email" type="email" required />
 *       <input name="password" type="password" required />
 *       <button type="submit">Sign In</button>
 *     </form>
 *   )
 * }
 * ```
 */
export async function signIn(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Sign out the current user
 *
 * @example
 * ```tsx
 * 'use client'
 * import { signOut } from '@/lib/supabase/mutations/auth'
 *
 * export function SignOutButton() {
 *   return (
 *     <form action={signOut}>
 *       <button type="submit">Sign Out</button>
 *     </form>
 *   )
 * }
 * ```
 */
export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Send a password reset email
 *
 * @param formData - Form data containing email
 * @returns Object with error or success message
 *
 * @example
 * ```tsx
 * 'use client'
 * import { resetPassword } from '@/lib/supabase/mutations/auth'
 *
 * export function ResetPasswordForm() {
 *   return (
 *     <form action={resetPassword}>
 *       <input name="email" type="email" required />
 *       <button type="submit">Reset Password</button>
 *     </form>
 *   )
 * }
 * ```
 */
export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Update user password
 *
 * @param formData - Form data containing new password
 * @returns Object with error or success message
 *
 * @example
 * ```tsx
 * 'use client'
 * import { updatePassword } from '@/lib/supabase/mutations/auth'
 *
 * export function UpdatePasswordForm() {
 *   return (
 *     <form action={updatePassword}>
 *       <input name="password" type="password" required />
 *       <button type="submit">Update Password</button>
 *     </form>
 *   )
 * }
 * ```
 */
export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const password = formData.get('password') as string

  if (!password) {
    return { error: 'Password is required' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Sign in with Google OAuth
 *
 * This creates the OAuth URL and redirects the user to Google for authentication.
 * After successful auth, Google redirects back to your callback URL.
 *
 * @returns Object with error message if failed
 *
 * @example
 * ```tsx
 * 'use client'
 * import { signInWithGoogle } from '@/lib/supabase/mutations/auth'
 *
 * export function GoogleSignInButton() {
 *   return (
 *     <form action={signInWithGoogle}>
 *       <button type="submit">Sign in with Google</button>
 *     </form>
 *   )
 * }
 * ```
 */
export async function signInWithGoogle(): Promise<ActionResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: 'Failed to get OAuth URL' }
}
