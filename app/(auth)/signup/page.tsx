import { requireGuest } from '@/lib/auth/route-protection'
import { SignUpForm } from './signup-form'
import Link from 'next/link'

export const metadata = {
  title: 'Sign Up | Expense Tracker',
  description: 'Create your expense tracker account',
}

export default async function SignUpPage() {
  await requireGuest()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Get Started</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to start tracking expenses
          </p>
        </div>

        <SignUpForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
