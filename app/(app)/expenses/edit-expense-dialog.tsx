"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  expenseFormSchema,
  type ExpenseFormData,
} from "@/lib/validations/expense";
import { updateExpense } from "@/lib/supabase/mutations/expenses";
import type { Category } from "@/lib/supabase/queries/categories";
import type { TransactionWithCategory } from "@/lib/supabase/queries/expenses";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CalendarIcon,
  CreditCard,
  Banknote,
  Building2,
  HelpCircle,
} from "lucide-react";

interface EditExpenseDialogProps {
  expense: TransactionWithCategory;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentMethods = [
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "debit_card", label: "Debit Card", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "other", label: "Other", icon: HelpCircle },
] as const;

export function EditExpenseDialog({
  expense,
  categories,
  open,
  onOpenChange,
}: EditExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExpenseFormData>({
    // @ts-expect-error - zod v4 type compatibility issue with @hookform/resolvers
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: expense.amount,
      category_id: expense.category_id || "",
      expense_date: new Date(expense.expense_date),
      description: expense.description || "",
      payment_method: expense.payment_method as any,
      notes: expense.notes || "",
    },
  });

  // Reset form when expense changes
  useEffect(() => {
    form.reset({
      amount: expense.amount,
      category_id: expense.category_id || "",
      expense_date: new Date(expense.expense_date),
      description: expense.description || "",
      payment_method: expense.payment_method as any,
      notes: expense.notes || "",
    });
  }, [expense, form]);

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);

    try {
      const result = await updateExpense(expense.id, {
        amount: data.amount,
        category_id: data.category_id,
        expense_date: format(data.expense_date, "yyyy-MM-dd"),
        description: data.description || null,
        payment_method: data.payment_method || null,
        notes: data.notes || null,
      });

      if (result.error) {
        toast.error("Failed to update expense", {
          description: result.error,
        });
      } else {
        toast.success("Expense updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Failed to update expense", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the details of your expense below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-2"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        value={field.value || ""}
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expense_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{method.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Grocery shopping"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
