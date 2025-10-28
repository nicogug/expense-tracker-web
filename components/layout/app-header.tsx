import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DynamicBreadcrumb } from "./dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";

export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DynamicBreadcrumb />
      </div>

      <div className="ml-auto px-4">
        <ModeToggle />
      </div>
    </header>
  );
}
