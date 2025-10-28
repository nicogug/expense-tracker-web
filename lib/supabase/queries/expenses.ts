import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export interface Expense {
  id: string
  user_id: string
  amount: number
  currency: string
  expense_date: string
  category_id: string | null
  description: string | null
  payment_method: string | null
  created_at: string
  updated_at: string
}

export interface CategoryTotal {
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  total: number
}

export const getExpensesForMonth = cache(async (month: string): Promise<Expense[]> => {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  // Get first and last day of the month
  const [year, monthNum] = month.split('-')
  const firstDay = `${year}-${monthNum}-01`
  const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate()
  const lastDayStr = `${year}-${monthNum}-${lastDay.toString().padStart(2, '0')}`

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .gte('expense_date', firstDay)
    .lte('expense_date', lastDayStr)
    .order('expense_date', { ascending: false })

  if (error || !data) {
    return []
  }

  return data
})

export const getCurrentMonthExpenses = cache(async (): Promise<Expense[]> => {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  return getExpensesForMonth(currentMonth)
})

export const getTotalForMonth = cache(async (month: string): Promise<number> => {
  const expenses = await getExpensesForMonth(month)
  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
})

export const getCurrentMonthTotal = cache(async (): Promise<number> => {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return getTotalForMonth(currentMonth)
})

export const getCategoryTotalsForMonth = cache(async (month: string): Promise<CategoryTotal[]> => {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  const [year, monthNum] = month.split('-')
  const firstDay = `${year}-${monthNum}-01`
  const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate()
  const lastDayStr = `${year}-${monthNum}-${lastDay.toString().padStart(2, '0')}`

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      amount,
      category_id,
      categories (
        name,
        icon,
        color
      )
    `)
    .eq('user_id', user.id)
    .gte('expense_date', firstDay)
    .lte('expense_date', lastDayStr)

  if (error || !data) {
    return []
  }

  // Group by category and sum amounts
  const categoryMap = new Map<string, CategoryTotal>()

  data.forEach((expense: any) => {
    const categoryId = expense.category_id || 'uncategorized'
    const category = expense.categories || {
      name: 'Uncategorized',
      icon: '📝',
      color: '#64748b'
    }

    if (categoryMap.has(categoryId)) {
      const existing = categoryMap.get(categoryId)!
      existing.total += expense.amount
    } else {
      categoryMap.set(categoryId, {
        category_id: categoryId,
        category_name: category.name,
        category_icon: category.icon,
        category_color: category.color,
        total: expense.amount
      })
    }
  })

  return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)
})

export const getCurrentMonthCategoryTotals = cache(async (): Promise<CategoryTotal[]> => {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return getCategoryTotalsForMonth(currentMonth)
})
