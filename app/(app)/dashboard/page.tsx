import { requireAuth } from "@/lib/auth/route-protection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Activity,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { ExpensesPieChart } from "./expenses-pie-chart";
import { BudgetSetterDialog } from "@/components/budget-setter-dialog";
import { TransactionsTable } from "@/components/transactions-table";
import { getCurrentMonthBudget } from "@/lib/supabase/queries/budgets";
import {
  getCurrentMonthTotal,
  getCurrentMonthExpenses,
  getCurrentMonthCategoryTotals,
  getCurrentMonthTransactionsWithCategories,
} from "@/lib/supabase/queries/expenses";

export const metadata = {
  title: "Dashboard | Expense Tracker",
  description: "View your expense summary and analytics",
};

export default async function DashboardPage() {
  const user = await requireAuth();

  // Get current month in YYYY-MM format
  const now = new Date();
  const currentMonthKey = now.toISOString().slice(0, 7);
  const currentMonth = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Fetch real data
  const [
    budget,
    totalExpenses,
    expenses,
    categoryTotals,
    transactionsWithCategories,
  ] = await Promise.all([
    getCurrentMonthBudget(),
    getCurrentMonthTotal(),
    getCurrentMonthExpenses(),
    getCurrentMonthCategoryTotals(),
    getCurrentMonthTransactionsWithCategories(),
  ]);

  // Calculate stats
  const transactionCount = expenses.length;
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const averageDaily = transactionCount > 0 ? totalExpenses / now.getDate() : 0;
  const budgetAmount = budget?.amount || 0;
  const budgetPercentage =
    budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;
  const budgetRemaining = budgetAmount - totalExpenses;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email?.split("@")[0]}
          </p>
        </div>
        <Link href="/expenses/add">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {transactionCount}{" "}
              {transactionCount === 1 ? "transaction" : "transactions"} this
              month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {transactionCount === 0
                ? "No transactions this month"
                : `${currentMonth}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageDaily.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {now.getDate()} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {budgetAmount > 0 ? (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-2xl font-bold">
                    ${budgetRemaining.toFixed(2)}
                  </div>
                  <BudgetSetterDialog
                    currentBudget={budgetAmount}
                    currentMonth={currentMonthKey}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </Button>
                    }
                  />
                </div>
                <Progress
                  value={Math.min(budgetPercentage, 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {budgetPercentage.toFixed(0)}% of ${budgetAmount.toFixed(2)}{" "}
                  budget used
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No budget set</p>
                <BudgetSetterDialog currentMonth={currentMonthKey} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <CardDescription>
              Your expenses by category for {currentMonth}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensesPieChart categoryTotals={categoryTotals} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>
              Your spending by category this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryTotals.length > 0 ? (
              <div className="space-y-4">
                {categoryTotals.slice(0, 5).map((category) => {
                  const percentage =
                    totalExpenses > 0
                      ? (category.total / totalExpenses) * 100
                      : 0;
                  return (
                    <div key={category.category_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {category.category_icon}
                          </span>
                          <span className="text-sm font-medium">
                            {category.category_name}
                          </span>
                        </div>
                        <span className="text-sm font-bold">
                          ${category.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="h-2" />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No category data available
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Start adding expenses to see insights
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest expense entries</CardDescription>
            </div>
            <Link href="/expenses">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={transactionsWithCategories} />
        </CardContent>
      </Card>
    </div>
  );
}
