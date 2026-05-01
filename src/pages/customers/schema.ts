import { z } from "zod";

export const customerFormSchema = z.object({
  isActive: z.boolean().optional(),
  displayName: z.string().min(1, "Display name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  gender: z
    .enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"])
    .optional(),
  dateOfBirth: z.string().optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),

  tagsText: z.string().optional(),
  emergencyContacts: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        relationship: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .optional(),
  foodAllergies: z
    .array(
      z.object({
        allergen: z.string().min(1, "Allergen is required"),
        severity: z.enum(["UNKNOWN", "MILD", "MODERATE", "SEVERE"]).optional(),
        reaction: z.string().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
