import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  expense_date: string;
  category_id: string | null;
  description: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryTotal {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
}

export const getExpensesForMonth = cache(
  async (month: string): Promise<Expense[]> => {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Get first and last day of the month
    const [year, monthNum] = month.split("-");
    const firstDay = `${year}-${monthNum}-01`;
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const lastDayStr = `${year}-${monthNum}-${lastDay
      .toString()
      .padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("expense_date", firstDay)
      .lte("expense_date", lastDayStr)
      .order("expense_date", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  }
);

export const getCurrentMonthExpenses = cache(async (): Promise<Expense[]> => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  return getExpensesForMonth(currentMonth);
});

export const getTotalForMonth = cache(
  async (month: string): Promise<number> => {
    const expenses = await getExpensesForMonth(month);
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }
);

export const getCurrentMonthTotal = cache(async (): Promise<number> => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return getTotalForMonth(currentMonth);
});

export const getCategoryTotalsForMonth = cache(
  async (month: string): Promise<CategoryTotal[]> => {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    const [year, monthNum] = month.split("-");
    const firstDay = `${year}-${monthNum}-01`;
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const lastDayStr = `${year}-${monthNum}-${lastDay
      .toString()
      .padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
      amount,
      category_id,
      categories (
        name,
        icon,
        color
      )
    `
      )
      .eq("user_id", user.id)
      .gte("expense_date", firstDay)
      .lte("expense_date", lastDayStr);

    if (error || !data) {
      return [];
    }

    // Group by category and sum amounts
    const categoryMap = new Map<string, CategoryTotal>();

    data.forEach((expense: any) => {
      const categoryId = expense.category_id || "uncategorized";
      const category = expense.categories || {
        name: "Uncategorized",
        icon: "📝",
        color: "#64748b",
      };

      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.total += expense.amount;
      } else {
        categoryMap.set(categoryId, {
          category_id: categoryId,
          category_name: category.name,
          category_icon: category.icon,
          category_color: category.color,
          total: expense.amount,
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
  }
);

export const getCurrentMonthCategoryTotals = cache(
  async (): Promise<CategoryTotal[]> => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return getCategoryTotalsForMonth(currentMonth);
  }
);

export interface TransactionWithCategory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  expense_date: string;
  category_id: string | null;
  description: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category_name: string;
  category_icon: string;
  category_color: string;
}

export const getCurrentMonthTransactionsWithCategories = cache(
  async (): Promise<TransactionWithCategory[]> => {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Get current month
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const [year, monthNum] = currentMonth.split("-");
    const firstDay = `${year}-${monthNum}-01`;
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const lastDayStr = `${year}-${monthNum}-${lastDay
      .toString()
      .padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
      *,
      categories (
        name,
        icon,
        color
      )
    `
      )
      .eq("user_id", user.id)
      .gte("expense_date", firstDay)
      .lte("expense_date", lastDayStr)
      .order("expense_date", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((expense: any) => ({
      ...expense,
      category_name: expense.categories?.name || "Uncategorized",
      category_icon: expense.categories?.icon || "📝",
      category_color: expense.categories?.color || "#64748b",
    }));
  }
);

export interface ExpenseFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  paymentMethods?: string[];
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedExpenses {
  data: TransactionWithCategory[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getFilteredExpenses(
  filters: ExpenseFilters
): Promise<PaginatedExpenses> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: [],
      totalCount: 0,
      page: filters.page || 1,
      pageSize: filters.pageSize || 20,
      totalPages: 0,
    };
  }

  // Set pagination defaults
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const offset = (page - 1) * pageSize;

  // Build base query for data
  let query = supabase
    .from("expenses")
    .select(
      `
      *,
      categories (
        name,
        icon,
        color
      )
    `
    )
    .eq("user_id", user.id);

  // Build count query (same filters, no pagination)
  let countQuery = supabase
    .from("expenses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Apply filters to both queries
  if (filters.startDate) {
    query = query.gte("expense_date", filters.startDate);
    countQuery = countQuery.gte("expense_date", filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte("expense_date", filters.endDate);
    countQuery = countQuery.lte("expense_date", filters.endDate);
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    query = query.in("category_id", filters.categoryIds);
    countQuery = countQuery.in("category_id", filters.categoryIds);
  }

  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    query = query.in("payment_method", filters.paymentMethods);
    countQuery = countQuery.in("payment_method", filters.paymentMethods);
  }

  if (filters.minAmount !== undefined) {
    query = query.gte("amount", filters.minAmount);
    countQuery = countQuery.gte("amount", filters.minAmount);
  }

  if (filters.maxAmount !== undefined) {
    query = query.lte("amount", filters.maxAmount);
    countQuery = countQuery.lte("amount", filters.maxAmount);
  }

  // Apply ordering and pagination to data query only
  query = query.order("expense_date", { ascending: false });

  // Execute queries in parallel
  const [{ data, error }, { count, error: countError }] = await Promise.all([
    query.range(offset, offset + pageSize - 1),
    countQuery,
  ]);

  if (error || !data || countError) {
    return {
      data: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  let results = data.map((expense: any) => ({
    ...expense,
    category_name: expense.categories?.name || "Uncategorized",
    category_icon: expense.categories?.icon || "📝",
    category_color: expense.categories?.color || "#64748b",
  }));

  // Apply search filter (client-side for description search)
  let totalCount = count || 0;
  if (filters.search && filters.search.trim()) {
    const searchLower = filters.search.toLowerCase();
    results = results.filter(
      (expense) =>
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.category_name.toLowerCase().includes(searchLower) ||
        expense.notes?.toLowerCase().includes(searchLower)
    );
    // Note: When using client-side search, totalCount may not be accurate
    // For accurate count with search, consider using full-text search in Supabase
    totalCount = results.length;
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: results,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
