import { z } from "zod";

export const CreateReportSchema = z.object({
  category: z.enum([
    "harassment",
    "suspicious_activity",
    "poor_lighting",
    "unsafe_road",
    "accident",
    "theft",
    "isolated_area",
    "other"
  ]).default("other"),
  description: z.string().min(5, "Description must be at least 5 characters long"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  approximateLocationName: z.string().min(2, "Location name is required"),
  severity: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]).optional(),
});
