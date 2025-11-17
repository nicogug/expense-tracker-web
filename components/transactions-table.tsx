"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/lib/supabase/queries/expenses";
import { cn, parseLocalDate } from "@/lib/utils";

interface TransactionWithCategory extends Expense {
  category_name: string;
  category_icon: string;
  category_color: string;
}

interface TransactionsTableProps {
  transactions: TransactionWithCategory[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const generatePageNumbers = (currentPage: number, totalPages: number) => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const columns: ColumnDef<TransactionWithCategory>[] = React.useMemo(
    () => [
      {
        accessorKey: "expense_date",
        header: "Date",
        cell: ({ row }) => {
          const dateString = row.getValue("expense_date") as string;
          const date = parseLocalDate(dateString);
          return (
            <div className="font-medium">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const description = row.getValue("description") as string;
          return (
            <div className="max-w-[200px] truncate">
              {description || "No description"}
            </div>
          );
        },
      },
      {
        accessorKey: "category_name",
        header: "Category",
        cell: ({ row }) => {
          const transaction = row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="text-lg">{transaction.category_icon}</span>
              <span className="text-sm">{transaction.category_name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "payment_method",
        header: "Payment Method",
        cell: ({ row }) => {
          const paymentMethod = row.getValue("payment_method") as string;
          return (
            <Badge variant="outline" className="capitalize">
              {paymentMethod?.replace("_", " ") || "Other"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"));
          return (
            <div className="text-right font-medium">${amount.toFixed(2)}</div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-4 opacity-50">📝</div>
          </div>
          <p className="text-sm text-muted-foreground">
            No transactions found for this month
          </p>
          <p className="text-xs text-muted-foreground">
            Start adding expenses to see your transaction history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {table.getPageCount() > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (table.getCanPreviousPage()) {
                      table.previousPage();
                    }
                  }}
                  aria-disabled={!table.getCanPreviousPage()}
                  className={cn(
                    !table.getCanPreviousPage() &&
                      "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>

              {generatePageNumbers(
                table.getState().pagination.pageIndex + 1,
                table.getPageCount()
              ).map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        table.setPageIndex(page - 1);
                      }}
                      isActive={
                        table.getState().pagination.pageIndex === page - 1
                      }
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (table.getCanNextPage()) {
                      table.nextPage();
                    }
                  }}
                  aria-disabled={!table.getCanNextPage()}
                  className={cn(
                    !table.getCanNextPage() && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
