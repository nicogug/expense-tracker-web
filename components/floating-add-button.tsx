"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import type { Category } from "@/lib/supabase/queries/categories";

interface FloatingAddButtonProps {
  categories: Category[];
}

export function FloatingAddButton({ categories }: FloatingAddButtonProps) {
  return (
    <div className="fixed bottom-20 right-4 z-50 md:hidden">
      <AddExpenseDialog
        categories={categories}
        trigger={
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Expense</span>
          </Button>
        }
      />
    </div>
  );
}
