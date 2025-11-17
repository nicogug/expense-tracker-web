import { requireAuth } from "@/lib/auth/route-protection";
import { getCurrentUser } from "@/lib/supabase/queries/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  const user = await getCurrentUser();

  return (
    <SidebarProvider>
      <AppSidebar user={user || undefined} />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-20 md:pb-4 lg:gap-6 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
