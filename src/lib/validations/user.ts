import { z } from "zod";

export const TrustedContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(7, "Valid phone number is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  relationship: z.string().min(2, "Relationship is required"),
  notifyOnHighRisk: z.boolean().default(true),
  notifyOnSos: z.boolean().default(true),
});

export const UserProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "Phone number is required"),
  emergencyNotes: z.string().optional(),
});
