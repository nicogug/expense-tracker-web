import { requireGuest } from '@/lib/auth/route-protection'
import { SignInForm } from './signin-form'
import Link from 'next/link'

export const metadata = {
  title: 'Sign In | Expense Tracker',
  description: 'Sign in to your expense tracker account',
}

export default async function SignInPage() {
  await requireGuest()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue tracking your expenses
          </p>
        </div>

        <SignInForm />

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
