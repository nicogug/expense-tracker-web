"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setBudget } from "@/lib/supabase/mutations/budgets";
import { Settings } from "lucide-react";

interface BudgetSetterDialogProps {
  currentBudget?: number;
  currentMonth: string;
  trigger?: React.ReactNode;
}

export function BudgetSetterDialog({
  currentBudget,
  currentMonth,
  trigger,
}: BudgetSetterDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(currentBudget?.toString() || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const budgetAmount = parseFloat(amount);

    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    startTransition(async () => {
      const result = await setBudget(currentMonth, budgetAmount);

      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Set Budget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <DialogTitle>Set Monthly Budget</DialogTitle>
            <DialogDescription>
              Set your spending limit for{" "}
              {(() => {
                const [year, month] = currentMonth.split("-");
                return new Date(
                  parseInt(year),
                  parseInt(month) - 1,
                  1
                ).toLocaleDateString("default", {
                  month: "long",
                  year: "numeric",
                });
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="amount">Budget Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="2000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
