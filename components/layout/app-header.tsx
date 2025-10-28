import { getCurrentUser } from "@/lib/supabase/queries/auth";
import { UserMenu } from "./user-menu";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { Wallet } from "lucide-react";

export async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center">
        {/* Mobile header - full width */}
        <div className="flex w-full items-center justify-between px-6 lg:hidden">
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
            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="text-xs text-muted-foreground">No user</div>
            )}
          </div>
        </div>

        {/* Desktop header - accounts for sidebar */}
        <div className="hidden lg:flex w-full">
          {/* Sidebar space */}
          <div className="w-64 flex items-center px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="font-bold">Expense Tracker</span>
            </Link>
          </div>

          {/* Main content area - aligned with dashboard content */}
          <div className="flex-1 flex items-center justify-end px-8">
            <div className="w-full max-w-7xl flex items-center justify-end gap-2">
              <ModeToggle />
              {user ? (
                <UserMenu user={user} />
              ) : (
                <div className="text-xs text-muted-foreground">No user</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
