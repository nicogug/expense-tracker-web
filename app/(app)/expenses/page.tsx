import { requireAuth } from "@/lib/auth/route-protection";
import { getFilteredExpenses } from "@/lib/supabase/queries/expenses";
import { getCategories } from "@/lib/supabase/queries/categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseList } from "./expense-list";
import { ExpenseFilters } from "./expense-filters";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { FloatingAddButton } from "@/components/floating-add-button";

export const metadata = {
  title: "Expense History | Expense Tracker",
  description: "View and manage all your expenses",
};

interface ExpensesPageProps {
  searchParams: Promise<{
    search?: string;
    startDate?: string;
    endDate?: string;
    categories?: string;
    paymentMethods?: string;
    minAmount?: string;
    maxAmount?: string;
    page?: string;
  }>;
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const user = await requireAuth();
  const params = await searchParams;

  // Parse filter params
  const filters = {
    search: params.search,
    startDate: params.startDate,
    endDate: params.endDate,
    categoryIds: params.categories?.split(",").filter(Boolean),
    paymentMethods: params.paymentMethods?.split(",").filter(Boolean),
    minAmount: params.minAmount ? parseFloat(params.minAmount) : undefined,
    maxAmount: params.maxAmount ? parseFloat(params.maxAmount) : undefined,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 20,
  };

  // Fetch data
  const [paginatedExpenses, categories] = await Promise.all([
    getFilteredExpenses(filters),
    getCategories(),
  ]);

  const totalAmount = paginatedExpenses.data.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Expense History
          </h1>
          <p className="text-muted-foreground">
            View and manage all your expenses
          </p>
        </div>
        <AddExpenseDialog categories={categories} />
      </div>

      <ExpenseFilters categories={categories} currentFilters={filters} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Expenses</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {paginatedExpenses.totalCount} {paginatedExpenses.totalCount === 1 ? "expense" : "expenses"}{" "}
                total • Page {paginatedExpenses.page} of {paginatedExpenses.totalPages} • ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ExpenseList
            expenses={paginatedExpenses.data}
            categories={categories}
            pagination={{
              currentPage: paginatedExpenses.page,
              totalPages: paginatedExpenses.totalPages,
              totalCount: paginatedExpenses.totalCount,
            }}
          />
        </CardContent>
      </Card>

      <FloatingAddButton categories={categories} />
    </div>
  );
}
