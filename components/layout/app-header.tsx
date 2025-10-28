import { getCurrentUser } from '@/lib/supabase/queries/auth'
import { UserMenu } from './user-menu'
import { ModeToggle } from '@/components/mode-toggle'
import Link from 'next/link'
import { Wallet } from 'lucide-react'

export async function AppHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Expense Tracker
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  )
}
