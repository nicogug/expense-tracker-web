"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

export function DynamicBreadcrumb() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.title} className="flex items-center gap-1">
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {breadcrumb.href && index < breadcrumbs.length - 1 ? (
                <BreadcrumbLink href={breadcrumb.href}>
                  {breadcrumb.title}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
