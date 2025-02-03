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
