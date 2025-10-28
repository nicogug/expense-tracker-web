import { requireAuth } from '@/lib/auth/route-protection'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="flex">
        <AppSidebar />

        <main className="flex-1 p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
