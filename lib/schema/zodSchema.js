import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z
    .string()
    .min(1, "Initial balance is required")
    .transform((val) => Number(val)),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    date: z
      .union([z.date(), z.string()])
      .refine((val) => !Number.isNaN(new Date(val).getTime()), {
        message: "Invalid date format",
      })
      .transform((val) => new Date(val)),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    amount: z
      .string()
      .min(1, "Amount is required")
      .transform((val) => Number(val)) // Convert to number
      .refine((num) => !Number.isNaN(num) && num > 0 && num <= 100000, {
        message: "Amount must be a valid number between 1 and 100,000",
      }),
    type: z.enum(["INCOME", "EXPENSE"]),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
    accountId: z.string().min(1, "AccountId is required"),
  })
  .superRefine((data, ctx) => {
    // If transaction is recurring, ensure `recurringInterval` is provided
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }

    // If transaction is **not** recurring, reset `recurringInterval`
    if (!data.isRecurring) {
      data.recurringInterval = undefined;
    }
  });
