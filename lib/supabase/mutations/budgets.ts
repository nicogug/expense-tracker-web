'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ActionResult {
  success?: boolean
  error?: string
  data?: any
}

export async function setBudget(
  month: string,
  amount: number
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Check if budget exists for this month
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('month', month)
      .single()

    if (existing) {
      // Update existing budget
      const { error: updateError } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', existing.id)

      if (updateError) {
        return { error: updateError.message }
      }
    } else {
      // Insert new budget
      const { error: insertError } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          month,
          amount,
        })

      if (insertError) {
        return { error: insertError.message }
      }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to set budget' }
  }
}

export async function deleteBudget(month: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', user.id)
      .eq('month', month)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to delete budget' }
  }
}
