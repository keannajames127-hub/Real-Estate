/**
 * Hand-maintained database types.
 *
 * These mirror `supabase/migrations/*.sql` exactly. If you change the schema,
 * update this file too (or regenerate with
 * `npx supabase gen types typescript --project-id <ref>`).
 */

export type PropertyType =
  | "house"
  | "villa"
  | "apartment"
  | "penthouse"
  | "townhouse"
  | "estate"
  | "land";

export type ListingStatus = "for_sale" | "for_rent" | "pending" | "sold";

export type EnquiryType =
  | "general"
  | "property_enquiry"
  | "private_viewing"
  | "more_information";

export type ContactMethod = "email" | "phone" | "either";

export type EnquiryStatus = "new" | "contacted" | "in_progress" | "closed";

export type AdminRole = "owner" | "admin" | "editor";

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  price_period: "total" | "month" | "year";
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  property_type: PropertyType;
  listing_status: ListingStatus;
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  lot_size: number | null;
  lot_size_unit: string;
  year_built: number | null;
  amenities: string[];
  hero_image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

/** A property row joined with its gallery, as returned by the site queries. */
export interface PropertyWithImages extends Property {
  property_images: PropertyImage[];
}

export interface Agent {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  license_number: string | null;
  specialties: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  reference: string;
  property_id: string | null;
  property_title_snapshot: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  enquiry_type: EnquiryType;
  preferred_contact_method: ContactMethod;
  message: string | null;
  status: EnquiryStatus;
  source_page: string | null;
  email_notified_at: string | null;
  email_error: string | null;
  created_at: string;
  updated_at: string;
}

/** Enquiry plus the joined property (used by the leads table and detail view). */
export interface EnquiryWithProperty extends Enquiry {
  property: Pick<Property, "id" | "slug" | "title" | "city" | "state"> | null;
}

export interface EnquiryNote {
  id: string;
  enquiry_id: string;
  author_id: string | null;
  author_name: string | null;
  note: string;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  business_name: string;
  tagline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  office_address: string | null;
  notification_email: string | null;
  about_text: string | null;
  social_links: Record<string, string>;
  hero_headline: string | null;
  hero_subheadline: string | null;
  hero_image_url: string | null;
  footer_note: string | null;
  updated_at: string;
}

/** The public-safe projection exposed through the `public_site_settings` view. */
export type PublicSiteSettings = Omit<SiteSettings, "notification_email" | "updated_at">;

/** Aggregated statistics shown on the admin dashboard. */
export interface DashboardStats {
  totalProperties: number;
  publishedProperties: number;
  draftProperties: number;
  forSale: number;
  forRent: number;
  pending: number;
  sold: number;
  featured: number;
  totalEnquiries: number;
  newEnquiries: number;
  activeLeads: number;
  closedEnquiries: number;
  enquiriesLast7Days: number;
}

/** Sort orders offered on the listings page. */
export type PropertySort =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "beds_desc"
  | "sqft_desc";
