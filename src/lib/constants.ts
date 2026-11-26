import type {
  ContactMethod,
  EnquiryStatus,
  EnquiryType,
  ListingStatus,
  PropertySort,
  PropertyType,
} from "@/types/database";

export const SITE_NAME = "Danish Home Properties";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: "House",
  villa: "Villa",
  apartment: "Apartment",
  penthouse: "Penthouse",
  townhouse: "Townhouse",
  estate: "Estate",
  land: "Land",
};

export const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as PropertyType, label }),
);

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  for_sale: "For Sale",
  for_rent: "For Rent",
  pending: "Pending",
  sold: "Sold",
};

export const LISTING_STATUS_OPTIONS = Object.entries(LISTING_STATUS_LABELS).map(
  ([value, label]) => ({ value: value as ListingStatus, label }),
);

/** Tailwind classes used to tint status pills consistently across the site. */
export const LISTING_STATUS_STYLES: Record<ListingStatus, string> = {
  for_sale: "bg-emerald-950/80 text-emerald-100 ring-1 ring-emerald-400/30",
  for_rent: "bg-sky-950/80 text-sky-100 ring-1 ring-sky-400/30",
  pending: "bg-amber-950/80 text-amber-100 ring-1 ring-amber-400/30",
  sold: "bg-neutral-900/85 text-neutral-300 ring-1 ring-white/20",
};

export const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  general: "General enquiry",
  property_enquiry: "Property enquiry",
  private_viewing: "Private viewing",
  more_information: "Request more information",
};

export const ENQUIRY_TYPE_OPTIONS = Object.entries(ENQUIRY_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as EnquiryType, label }),
);

export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  email: "Email",
  phone: "Phone",
  either: "Either",
};

export const CONTACT_METHOD_OPTIONS = Object.entries(CONTACT_METHOD_LABELS).map(
  ([value, label]) => ({ value: value as ContactMethod, label }),
);

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  closed: "Closed",
};

export const ENQUIRY_STATUS_OPTIONS = Object.entries(ENQUIRY_STATUS_LABELS).map(
  ([value, label]) => ({ value: value as EnquiryStatus, label }),
);

export const ENQUIRY_STATUS_BADGE_STYLES: Record<EnquiryStatus, string> = {
  new: "bg-amber-100 text-amber-900 ring-1 ring-amber-300",
  contacted: "bg-sky-100 text-sky-900 ring-1 ring-sky-300",
  in_progress: "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-300",
  closed: "bg-neutral-200 text-neutral-700 ring-1 ring-neutral-300",
};

export const PROPERTY_SORT_OPTIONS: { value: PropertySort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "beds_desc", label: "Most bedrooms" },
  { value: "sqft_desc", label: "Largest interior" },
];

export const PROPERTY_SORT_LABELS: Record<PropertySort, string> = Object.fromEntries(
  PROPERTY_SORT_OPTIONS.map((o) => [o.value, o.label]),
) as Record<PropertySort, string>;

export const PAGE_SIZE = 9;
export const ADMIN_PAGE_SIZE = 12;

/** Suggested amenities offered as one-click chips in the property form. */
export const AMENITY_SUGGESTIONS = [
  "Heated pool",
  "Saltwater pool",
  "Infinity pool",
  "Spa bath",
  "Wine cellar",
  "Wine room",
  "Elevator",
  "Smart home",
  "Home theatre",
  "Gym",
  "Guest house",
  "Guest cottage",
  "3-car garage",
  "EV charger",
  "Whole-house generator",
  "Chef kitchen",
  "Butler's pantry",
  "Screened porch",
  "Covered terrace",
  "Outdoor kitchen",
  "Fire pit",
  "Terraced gardens",
  "Walled garden",
  "Oceanfront",
  "Lakefront",
  "Mountain views",
  "Golf course frontage",
  "Equestrian",
  "Historic district",
  "Gated entry",
];

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY",
  "LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH",
  "OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

/** Price brackets used by the homepage and listings-page search bar. */
export const PRICE_BRACKETS = [
  { label: "Any price", min: "", max: "" },
  { label: "Up to $1M", min: "", max: "1000000" },
  { label: "$1M – $2.5M", min: "1000000", max: "2500000" },
  { label: "$2.5M – $5M", min: "2500000", max: "5000000" },
  { label: "$5M – $10M", min: "5000000", max: "10000000" },
  { label: "$10M+", min: "10000000", max: "" },
];

export const BEDROOM_OPTIONS = [
  { label: "Any", value: "" },
  { label: "1+", value: "1" },
  { label: "2+", value: "2" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
  { label: "5+", value: "5" },
  { label: "6+", value: "6" },
];

export const BATHROOM_OPTIONS = [
  { label: "Any", value: "" },
  { label: "1+", value: "1" },
  { label: "2+", value: "2" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
  { label: "5+", value: "5" },
  { label: "6+", value: "6" },
];

export const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Advisors" },
  { href: "/contact", label: "Contact" },
];

export const STORAGE_BUCKET = "property-images";
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
