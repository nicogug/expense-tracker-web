import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { Tables } from "@/lib/supabase/types";

export type Category = Tables<"categories">;

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // Get both user categories and default categories
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
});
