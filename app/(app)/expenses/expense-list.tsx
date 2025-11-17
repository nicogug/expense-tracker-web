"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  LayoutGrid,
  LayoutList,
  Receipt,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { deleteExpense, bulkDeleteExpenses } from "@/lib/supabase/mutations/expenses";
import { EditExpenseDialog } from "./edit-expense-dialog";
import type { TransactionWithCategory } from "@/lib/supabase/queries/expenses";
import type { Category } from "@/lib/supabase/queries/categories";
import { cn, parseLocalDate } from "@/lib/utils";

interface ExpenseListProps {
  expenses: TransactionWithCategory[];
  categories: Category[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

type ViewMode = "table" | "card";

const paymentMethodLabels: Record<string, string> = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

export function ExpenseList({ expenses, categories, pagination }: ExpenseListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    new Set()
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] =
    useState<TransactionWithCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`?${params.toString()}`);
  };

  const generatePageNumbers = () => {
    const { currentPage, totalPages } = pagination;
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

  const toggleExpense = (expenseId: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId);
    } else {
      newSelected.add(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  const toggleAll = () => {
    if (selectedExpenses.size === expenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(expenses.map((e) => e.id)));
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    setIsDeleting(true);
    const result = await deleteExpense(expenseToDelete);

    if (result.error) {
      toast.error("Failed to delete expense", {
        description: result.error,
      });
    } else {
      toast.success("Expense deleted successfully");
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
    setIsDeleting(false);
  };

  const handleBulkDelete = async () => {
    if (selectedExpenses.size === 0) return;

    setIsDeleting(true);
    const result = await bulkDeleteExpenses(Array.from(selectedExpenses));

    if (result.error) {
      toast.error("Failed to delete expenses", {
        description: result.error,
      });
    } else {
      toast.success(`${selectedExpenses.size} expense(s) deleted successfully`);
      setBulkDeleteDialogOpen(false);
      setSelectedExpenses(new Set());
    }
    setIsDeleting(false);
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-muted-foreground">
            No expenses found
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or add a new expense to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedExpenses.size > 0 && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {selectedExpenses.size} selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExpenses(new Set())}
                >
                  Clear selection
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-2"
            >
              <LayoutList className="h-4 w-4" />
              Table
            </Button>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Cards
            </Button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === "table" && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedExpenses.size === expenses.length &&
                        expenses.length > 0
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedExpenses.has(expense.id)}
                        onCheckedChange={() => toggleExpense(expense.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(parseLocalDate(expense.expense_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {expense.description || "—"}
                        </div>
                        {expense.notes && (
                          <div className="text-sm text-muted-foreground">
                            {expense.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <span>{expense.category_icon}</span>
                        <span>{expense.category_name}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expense.payment_method ? (
                        <span className="text-sm">
                          {paymentMethodLabels[expense.payment_method]}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingExpense(expense)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setExpenseToDelete(expense.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Card View */}
        {viewMode === "card" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
              <Card
                key={expense.id}
                className={cn(
                  "p-4 relative",
                  selectedExpenses.has(expense.id) && "ring-2 ring-primary"
                )}
              >
                <div className="absolute top-4 left-4">
                  <Checkbox
                    checked={selectedExpenses.has(expense.id)}
                    onCheckedChange={() => toggleExpense(expense.id)}
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingExpense(expense)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setExpenseToDelete(expense.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <span>{expense.category_icon}</span>
                        <span>{expense.category_name}</span>
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {format(parseLocalDate(expense.expense_date), "MMM dd, yyyy")}
                    </div>

                    {expense.description && (
                      <div className="font-medium text-sm">
                        {expense.description}
                      </div>
                    )}

                    {expense.payment_method && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="h-3 w-3" />
                        {paymentMethodLabels[expense.payment_method]}
                      </div>
                    )}

                    {expense.notes && (
                      <div className="text-xs text-muted-foreground">
                        {expense.notes}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.currentPage > 1) {
                        navigateToPage(pagination.currentPage - 1);
                      }
                    }}
                    aria-disabled={pagination.currentPage === 1}
                    className={cn(
                      pagination.currentPage === 1 &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {generatePageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToPage(page);
                        }}
                        isActive={pagination.currentPage === page}
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
                      if (pagination.currentPage < pagination.totalPages) {
                        navigateToPage(pagination.currentPage + 1);
                      }
                    }}
                    aria-disabled={
                      pagination.currentPage === pagination.totalPages
                    }
                    className={cn(
                      pagination.currentPage === pagination.totalPages &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Expenses</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedExpenses.size} expense
              {selectedExpenses.size === 1 ? "" : "s"}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          categories={categories}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
        />
      )}
    </>
  );
}
