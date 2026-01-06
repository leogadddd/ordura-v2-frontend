import { z } from "zod";

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Name is too long"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  cost: z
    .string()
    .min(1, "Cost price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Cost must be a valid number greater than or equal to 0",
    }),
  sellingPrice: z
    .string()
    .min(1, "Selling price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message:
        "Selling price must be a valid number greater than or equal to 0",
    }),
  notes: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
