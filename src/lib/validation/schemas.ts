import { z } from "zod";

/**
 * A single source of truth for validation. Every form on the site — public and
 * admin — validates with these schemas on the server before touching the
 * database, and the client reuses them for instant inline feedback.
 *
 * Written against the stable core of Zod so it works on both v3 and v4.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PHONE_REGEX = /^[+()\-.\s\d]{7,25}$/;

const email = z
  .string()
  .trim()
  .min(1, "Email address is required")
  .max(200, "Email address is too long")
  .regex(EMAIL_REGEX, "Enter a valid email address");

const phone = z
  .string()
  .trim()
  .regex(PHONE_REGEX, "Enter a valid phone number")
  .max(25, "Phone number is too long");

const optionalPhone = z
  .union([phone, z.literal("")])
  .optional()
  .transform((value) => (value ? value : null));

/** Turns "1,234" / "" / undefined into a number or null. */
function optionalNumber(options: { min?: number; max?: number } = {}) {
  return z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === null || value === undefined) return null;
      if (typeof value === "number") return Number.isFinite(value) ? value : null;
      const cleaned = value.replace(/[$,\s]/g, "");
      if (cleaned === "") return null;
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine((value) => value === null || !Number.isNaN(value), {
      message: "Enter a valid number",
    })
    .refine(
      (value) =>
        value === null ||
        ((options.min === undefined || value >= options.min) &&
          (options.max === undefined || value <= options.max)),
      { message: "Number is out of the allowed range" },
    )
    // Same Zod v4 caveat as `optionalText`: a union that merely *contains*
    // `undefined` still requires the key to be present. `.optional()` makes the
    // key optional and the final transform normalises an absent value to `null`.
    .optional()
    .transform((value) => value ?? null);
}

function requiredNumber(options: { min?: number; max?: number } = {}) {
  return optionalNumber(options).refine((value) => value !== null, {
    message: "This field is required",
  });
}

const optionalText = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    })
    .refine((value) => value === null || value.length <= max, {
      message: `Please keep this under ${max} characters`,
    })
    // A union that merely *contains* `undefined` still requires the key to be
    // present, so an omitted form field would be rejected. `.optional()` marks
    // the key itself as optional; the final transform normalises an absent
    // value back to `null` so the output type stays `string | null`.
    .optional()
    .transform((value) => value ?? null);

// ---------------------------------------------------------------------------
// Public: enquiry forms
// ---------------------------------------------------------------------------
export const ENQUIRY_TYPES = [
  "general",
  "property_enquiry",
  "private_viewing",
  "more_information",
] as const;

export const CONTACT_METHODS = ["email", "phone", "either"] as const;

export const enquirySchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "Please keep your name under 120 characters"),
  email,
  phone: optionalPhone,
  enquiry_type: z.enum(ENQUIRY_TYPES),
  preferred_contact_method: z.enum(CONTACT_METHODS),
  property_id: optionalText(64),
  property_title_snapshot: optionalText(200),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more (at least 10 characters)")
    .max(4000, "Please keep your message under 4000 characters"),
  source_page: optionalText(300),
  /** Honeypot — real people never fill this in. */
  company_website: z.string().max(0, "Submission rejected").optional().default(""),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

/** The same form, but with every field optional — used for "request more information". */
export const quickEnquirySchema = enquirySchema.extend({
  message: z
    .string()
    .trim()
    .max(4000, "Please keep your message under 4000 characters")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : "Request for more information")),
});

// ---------------------------------------------------------------------------
// Admin: authentication
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Enter your username or email address")
    .max(200, "That value is too long"),
  password: z
    .string()
    .min(8, "Passwords are at least 8 characters")
    .max(200, "That password is too long"),
  next: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const passwordResetRequestSchema = z.object({
  email,
});

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(200, "That password is too long")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The two passwords do not match",
    path: ["confirm_password"],
  });

// ---------------------------------------------------------------------------
// Admin: properties
// ---------------------------------------------------------------------------
export const PROPERTY_TYPES = [
  "house",
  "villa",
  "apartment",
  "penthouse",
  "townhouse",
  "estate",
  "land",
] as const;

export const LISTING_STATUSES = ["for_sale", "for_rent", "pending", "sold"] as const;

export const PRICE_PERIODS = ["total", "month", "year"] as const;

export const propertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give the listing a title")
    .max(160, "Please keep the title under 160 characters"),
  slug: z
    .string()
    .trim()
    .max(80, "Please keep the URL slug under 80 characters")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and single hyphens only",
    )
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  description: z
    .string()
    .trim()
    .min(40, "Write at least a short paragraph (40 characters)")
    .max(8000, "Please keep the description under 8000 characters"),
  price: requiredNumber({ min: 0, max: 999_999_999_999 }),
  price_period: z.enum(PRICE_PERIODS),
  street_address: z
    .string()
    .trim()
    .min(3, "Street address is required")
    .max(200, "That address is too long"),
  city: z.string().trim().min(2, "City is required").max(80, "City name is too long"),
  state: z.string().trim().min(2, "State is required").max(80, "State is too long"),
  zip_code: z
    .string()
    .trim()
    .min(3, "ZIP / postal code is required")
    .max(12, "That ZIP code is too long"),
  neighborhood: optionalText(120),
  property_type: z.enum(PROPERTY_TYPES),
  listing_status: z.enum(LISTING_STATUSES),
  bedrooms: requiredNumber({ min: 0, max: 100 }),
  bathrooms: requiredNumber({ min: 0, max: 100 }),
  square_feet: optionalNumber({ min: 0, max: 10_000_000 }),
  lot_size: optionalNumber({ min: 0, max: 100_000_000 }),
  lot_size_unit: z.enum(["sqft", "acres", "hectares"]).default("sqft"),
  year_built: optionalNumber({ min: 1500, max: 2200 }),
  latitude: optionalNumber({ min: -90, max: 90 }),
  longitude: optionalNumber({ min: -180, max: 180 }),
  amenities: z.array(z.string().trim().min(1).max(80)).max(60).default([]),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  hero_image_url: optionalText(1000),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const propertyImageSchema = z.object({
  url: z.string().trim().min(1).max(1000),
  storage_path: optionalText(500),
  alt_text: optionalText(300),
  sort_order: z.number().int().min(0).max(999).default(0),
  is_cover: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Admin: agents
// ---------------------------------------------------------------------------
export const agentSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  title: optionalText(120),
  bio: optionalText(2000),
  email: z
    .union([email, z.literal("")])
    .optional()
    .transform((value) => (value ? value : null)),
  phone: optionalPhone,
  photo_url: optionalText(1000),
  license_number: optionalText(60),
  specialties: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  sort_order: z.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export type AgentInput = z.infer<typeof agentSchema>;

// ---------------------------------------------------------------------------
// Admin: settings
// ---------------------------------------------------------------------------
export const settingsSchema = z.object({
  business_name: z.string().trim().min(2, "Business name is required").max(120),
  tagline: optionalText(240),
  contact_email: z
    .union([email, z.literal("")])
    .optional()
    .transform((value) => (value ? value : null)),
  contact_phone: optionalPhone,
  office_address: optionalText(300),
  notification_email: z
    .union([email, z.literal("")])
    .optional()
    .transform((value) => (value ? value : null)),
  about_text: optionalText(6000),
  footer_note: optionalText(300),
  hero_headline: optionalText(160),
  hero_subheadline: optionalText(300),
  hero_image_url: optionalText(1000),
  instagram: optionalText(300),
  facebook: optionalText(300),
  linkedin: optionalText(300),
  youtube: optionalText(300),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

// ---------------------------------------------------------------------------
// Admin: enquiry management
// ---------------------------------------------------------------------------
export const ENQUIRY_STATUSES = ["new", "contacted", "in_progress", "closed"] as const;

export const enquiryUpdateSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES).optional(),
  note: z
    .string()
    .trim()
    .max(4000, "Please keep notes under 4000 characters")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const uuidSchema = z.string().uuid("Not a valid identifier");

/** Flattens a ZodError into `{ fieldName: "first message" }`. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/** Converts FormData into a plain object, expanding `name[]` / repeated keys. */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [rawKey, value] of formData.entries()) {
    const isArray = rawKey.endsWith("[]");
    const key = isArray ? rawKey.slice(0, -2) : rawKey;
    const normalised = typeof value === "string" ? value : value;

    if (isArray) {
      const existing = result[key];
      if (Array.isArray(existing)) existing.push(normalised);
      else result[key] = [normalised];
    } else if (key in result) {
      const existing = result[key];
      result[key] = Array.isArray(existing) ? [...existing, normalised] : [existing, normalised];
    } else {
      result[key] = normalised;
    }
  }

  return result;
}

/** FormData checkboxes only appear when ticked. */
export function checkbox(value: unknown): boolean {
  return value === "on" || value === "true" || value === true;
}
