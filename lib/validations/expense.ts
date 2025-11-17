import { z } from "zod";

export const expenseFormSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(999999999.99, "Amount is too large"),
  category_id: z.string().uuid("Please select a category"),
  expense_date: z.date({
    message: "Please select a date",
  }),
  description: z.string().optional(),
  payment_method: z
    .enum(["credit_card", "debit_card", "cash", "bank_transfer", "other"])
    .optional(),
  notes: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
