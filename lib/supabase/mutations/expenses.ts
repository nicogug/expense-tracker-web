"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert } from "@/lib/supabase/types";

export interface ActionResult {
  success?: boolean;
  error?: string;
  data?: any;
}

export async function createExpense(
  expenseData: Omit<TablesInsert<"expenses">, "user_id">
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    // Insert expense
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        ...expenseData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    return { success: true, data };
  } catch (err) {
    return { error: "Failed to create expense" };
  }
}

export async function deleteExpense(expenseId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    return { success: true };
  } catch (err) {
    return { error: "Failed to delete expense" };
  }
}

export async function updateExpense(
  expenseId: string,
  expenseData: Partial<Omit<TablesInsert<"expenses">, "user_id">>
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("expenses")
      .update(expenseData)
      .eq("id", expenseId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    return { success: true, data };
  } catch (err) {
    return { error: "Failed to update expense" };
  }
}

export async function bulkDeleteExpenses(
  expenseIds: string[]
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .in("id", expenseIds)
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    return { success: true };
  } catch (err) {
    return { error: "Failed to delete expenses" };
  }
}
