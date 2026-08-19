import { z } from "zod";

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
});

export const CreateJourneySchema = z.object({
  originName: z.string().min(2, "Origin name is required"),
  originCoords: CoordinatesSchema,
  destinationName: z.string().min(2, "Destination name is required"),
  destinationCoords: CoordinatesSchema,
  expectedDurationMins: z.number().min(1).max(240).default(20),
  checkInIntervalMins: z.number().min(3).max(60).default(10),
});

export const CheckInSchema = z.object({
  journeyId: z.string().min(1, "Journey ID is required"),
  currentCoords: CoordinatesSchema.optional(),
  statusMessage: z.string().optional(),
});
