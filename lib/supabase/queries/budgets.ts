import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export interface BudgetData {
  id: string
  month: string
  amount: number
  created_at: string
  updated_at: string
}

export const getBudgetForMonth = cache(async (month: string): Promise<BudgetData | null> => {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .single()

  if (error || !data) {
    return null
  }

  return data
})

export const getCurrentMonthBudget = cache(async (): Promise<BudgetData | null> => {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  return getBudgetForMonth(currentMonth)
})
