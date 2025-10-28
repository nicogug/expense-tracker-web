import { optionalAuth } from '@/lib/auth/route-protection'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ModeToggle } from '@/components/mode-toggle'
import { Wallet, BarChart3, TrendingUp, Lightbulb } from 'lucide-react'

export default async function Home() {
  const user = await optionalAuth()

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="font-bold">Expense Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Track Your Expenses with Ease
            </h1>
            <p className="text-xl text-muted-foreground">
              Take control of your finances. Track expenses, analyze spending patterns, and make better financial decisions.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Track Expenses</h3>
                  <p className="text-muted-foreground">
                    Easily record and categorize your daily expenses in seconds
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Analyze Spending</h3>
                  <p className="text-muted-foreground">
                    Get insights into your spending habits with detailed analytics
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Make Better Decisions</h3>
                  <p className="text-muted-foreground">
                    Use data-driven insights to improve your financial health
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Expense Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
