import { z } from "zod";

export const SERVICE_TYPES = [
  "residential",
  "commercial",
  "emergency",
  "seasonal",
] as const;

export const PROPERTY_TYPES = [
  "house",
  "semi",
  "townhouse",
  "duplex",
  "condo",
  "building",
  "retail",
  "office",
  "industrial",
  "other",
] as const;

/** Canadian postal code, with or without the middle space. */
const postalRe = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

export const estimateSchema = z.object({
  serviceType: z.enum(SERVICE_TYPES),

  propertyType: z.enum(PROPERTY_TYPES),
  vehicles: z.coerce.number().int().min(0).max(50),
  /** Whether the driveway is covered by a Tempo car shelter (abri d'auto). */
  tempo: z.boolean(),

  walkways: z.boolean(),
  garage: z.boolean(),
  stairs: z.boolean(),
  sidewalk: z.boolean(),
  deicing: z.boolean(),
  obstacles: z.string().trim().max(1000),
  notes: z.string().trim().max(2000),

  photos: z
    .array(
      z.object({
        // Empty when storage isn't configured yet — the file is still recorded
        // so the owner knows photos exist and can ask for them directly.
        url: z.string().url().or(z.literal("")),
        name: z.string().max(255),
        size: z.number().int().nonnegative(),
        type: z.string().max(100),
      }),
    )
    .max(20)
    .default([]),

  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length === 10, "phoneInvalid"),
  email: z.string().trim().email().max(254),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(postalRe, "postalInvalid"),

  consent: z.literal(true),
  locale: z.enum(["fr", "en"]),

  /**
   * Honeypot. Deliberately NOT constrained to empty here — if zod rejected a
   * filled value the request would 422, telling a bot exactly which field
   * caught it. The route accepts the payload and returns a normal success
   * response instead, then silently drops it.
   */
  website: z.string().max(500).optional(),
});

export type EstimateInput = z.infer<typeof estimateSchema>;

/** The subset collected before the contact step, used for per-step validation. */
export const stepSchemas = {
  service: estimateSchema.pick({ serviceType: true }),
  property: estimateSchema.pick({
    propertyType: true,
    vehicles: true,
    tempo: true,
  }),
  details: estimateSchema.pick({
    walkways: true,
    garage: true,
    stairs: true,
    sidewalk: true,
    deicing: true,
    obstacles: true,
    notes: true,
  }),
  contact: estimateSchema.pick({
    name: true,
    phone: true,
    email: true,
    address: true,
    city: true,
    postalCode: true,
    consent: true,
  }),
} as const;

export const defaultEstimate: Partial<EstimateInput> = {
  vehicles: 2,
  tempo: false,
  walkways: true,
  garage: true,
  stairs: false,
  sidewalk: false,
  deicing: false,
  obstacles: "",
  notes: "",
  photos: [],
  consent: false as unknown as true,
};
