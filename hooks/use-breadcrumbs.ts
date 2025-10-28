"use client";

import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  title: string;
  href?: string;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
    "/dashboard": [
      { title: "Expense Tracker", href: "/dashboard" },
      { title: "Dashboard" },
    ],
    "/expenses": [
      { title: "Expense Tracker", href: "/dashboard" },
      { title: "History" },
    ],
    "/expenses/add": [
      { title: "Expense Tracker", href: "/dashboard" },
      { title: "Expenses", href: "/expenses" },
      { title: "Add Expense" },
    ],
    "/analytics": [
      { title: "Expense Tracker", href: "/dashboard" },
      { title: "Analytics" },
    ],
    "/settings": [
      { title: "Expense Tracker", href: "/dashboard" },
      { title: "Settings" },
    ],
  };

  return (
    breadcrumbMap[pathname] || [
      { title: "Expense Tracker", href: "/dashboard" },
      { title: "Dashboard" },
    ]
  );
}
