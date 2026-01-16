import { z } from "zod";

export const userFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  // Password is managed separately via Change Password flow
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;
