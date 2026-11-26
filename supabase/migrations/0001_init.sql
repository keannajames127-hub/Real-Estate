-- ===========================================================================
-- Sarah Danish Properties — 0001: schema, enums, indexes, triggers
-- Safe to run repeatedly (idempotent).
-- ===========================================================================

create extension if not exists "pgcrypto" with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_type') then
    create type public.property_type as enum
      ('house','villa','apartment','penthouse','townhouse','estate','land');
  end if;

  if not exists (select 1 from pg_type where typname = 'listing_status') then
    create type public.listing_status as enum
      ('for_sale','for_rent','pending','sold');
  end if;

  if not exists (select 1 from pg_type where typname = 'enquiry_type') then
    create type public.enquiry_type as enum
      ('general','property_enquiry','private_viewing','more_information');
  end if;

  if not exists (select 1 from pg_type where typname = 'contact_method') then
    create type public.contact_method as enum ('email','phone','either');
  end if;

  if not exists (select 1 from pg_type where typname = 'enquiry_status') then
    create type public.enquiry_status as enum ('new','contacted','in_progress','closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'admin_role') then
    create type public.admin_role as enum ('owner','admin','editor');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Shared trigger helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_users — one row per administrator, keyed to auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text        not null,
  username      text        not null,
  full_name     text,
  role          public.admin_role not null default 'admin',
  is_active     boolean     not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint admin_users_username_format
    check (username ~ '^[A-Za-z0-9._-]{3,32}$'),
  constraint admin_users_email_format
    check (position('@' in email) > 1)
);

create unique index if not exists admin_users_email_lower_key    on public.admin_users (lower(email));
create unique index if not exists admin_users_username_lower_key on public.admin_users (lower(username));

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
create table if not exists public.properties (
  id              uuid primary key default gen_random_uuid(),
  slug            text        not null unique,
  title           text        not null,
  description     text,
  price           numeric(14,2) not null check (price >= 0),
  currency        text        not null default 'USD',
  price_period    text        not null default 'total'
                    check (price_period in ('total','month','year')),
  street_address  text        not null,
  city            text        not null,
  state           text        not null,
  zip_code        text        not null,
  neighborhood    text,
  country         text        not null default 'United States',
  latitude        double precision check (latitude between -90 and 90),
  longitude       double precision check (longitude between -180 and 180),
  property_type   public.property_type  not null,
  listing_status  public.listing_status not null default 'for_sale',
  bedrooms        integer     not null default 0 check (bedrooms >= 0 and bedrooms <= 100),
  bathrooms       numeric(4,1) not null default 0 check (bathrooms >= 0 and bathrooms <= 100),
  square_feet     integer     check (square_feet is null or square_feet >= 0),
  lot_size        numeric(14,2) check (lot_size is null or lot_size >= 0),
  lot_size_unit   text        not null default 'sqft',
  year_built      integer     check (year_built is null or (year_built between 1500 and 2200)),
  amenities       text[]      not null default '{}',
  hero_image_url  text,
  is_featured     boolean     not null default false,
  is_published    boolean     not null default false,
  published_at    timestamptz,
  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint properties_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists properties_published_created_idx
  on public.properties (is_published, created_at desc);
create index if not exists properties_status_idx
  on public.properties (listing_status) where is_published;
create index if not exists properties_type_idx
  on public.properties (property_type) where is_published;
create index if not exists properties_price_idx
  on public.properties (price) where is_published;
create index if not exists properties_featured_idx
  on public.properties (is_featured, created_at desc) where is_published;
create index if not exists properties_city_idx
  on public.properties (lower(city)) where is_published;
create index if not exists properties_zip_idx
  on public.properties (zip_code) where is_published;
create index if not exists properties_created_by_idx
  on public.properties (created_by);

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- Keep published_at in sync with is_published
create or replace function public.sync_published_at()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.published_at := case
      when new.is_published then coalesce(new.published_at, now())
      else null
    end;
  else
    new.published_at := case
      when new.is_published then coalesce(new.published_at, old.published_at, now())
      else null
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists properties_sync_published_at on public.properties;
create trigger properties_sync_published_at
  before insert or update of is_published on public.properties
  for each row execute function public.sync_published_at();

-- ---------------------------------------------------------------------------
-- property_images
-- ---------------------------------------------------------------------------
create table if not exists public.property_images (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties (id) on delete cascade,
  url          text not null,
  storage_path text,
  alt_text     text,
  sort_order   integer not null default 0,
  is_cover     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists property_images_property_idx
  on public.property_images (property_id, sort_order);

-- Only one cover image per property
create unique index if not exists property_images_one_cover_idx
  on public.property_images (property_id) where is_cover;

-- ---------------------------------------------------------------------------
-- agents
-- ---------------------------------------------------------------------------
create table if not exists public.agents (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  title          text,
  bio            text,
  email          text,
  phone          text,
  photo_url      text,
  license_number text,
  specialties    text[] not null default '{}',
  sort_order     integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists agents_active_idx on public.agents (is_active, sort_order);

drop trigger if exists agents_set_updated_at on public.agents;
create trigger agents_set_updated_at
  before update on public.agents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- enquiries
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id                       uuid primary key default gen_random_uuid(),
  reference                text not null unique
                             default 'ENQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  property_id              uuid references public.properties (id) on delete set null,
  property_title_snapshot  text,
  full_name                text not null,
  email                    text not null,
  phone                    text,
  enquiry_type             public.enquiry_type      not null default 'general',
  preferred_contact_method public.contact_method    not null default 'email',
  message                  text,
  status                   public.enquiry_status    not null default 'new',
  source_page              text,
  email_notified_at        timestamptz,
  email_error              text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint enquiries_full_name_len check (char_length(full_name) between 2 and 120),
  constraint enquiries_email_format  check (position('@' in email) > 1)
);

create index if not exists enquiries_status_created_idx
  on public.enquiries (status, created_at desc);
create index if not exists enquiries_created_idx
  on public.enquiries (created_at desc);
create index if not exists enquiries_property_idx
  on public.enquiries (property_id);
create index if not exists enquiries_email_idx
  on public.enquiries (lower(email));

drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- enquiry_notes
-- ---------------------------------------------------------------------------
create table if not exists public.enquiry_notes (
  id          uuid primary key default gen_random_uuid(),
  enquiry_id  uuid not null references public.enquiries (id) on delete cascade,
  author_id   uuid references auth.users (id) on delete set null,
  author_name text,
  note        text not null check (char_length(note) between 1 and 4000),
  created_at  timestamptz not null default now()
);

create index if not exists enquiry_notes_enquiry_idx
  on public.enquiry_notes (enquiry_id, created_at desc);

-- ---------------------------------------------------------------------------
-- site_settings (singleton row, id is always 1)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                 smallint primary key default 1 check (id = 1),
  business_name      text not null default 'Sarah Danish Properties',
  tagline            text,
  contact_email      text,
  contact_phone      text,
  office_address     text,
  notification_email text,
  about_text         text,
  social_links       jsonb not null default '{}'::jsonb,
  hero_headline      text,
  hero_subheadline   text,
  hero_image_url     text,
  footer_note        text,
  updated_at         timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- Public-safe subset of the settings (never exposes notification_email)
create or replace view public.public_site_settings
with (security_invoker = false) as
  select
    id,
    business_name,
    tagline,
    contact_email,
    contact_phone,
    office_address,
    about_text,
    social_links,
    hero_headline,
    hero_subheadline,
    hero_image_url,
    footer_note
  from public.site_settings
  where id = 1;

grant select on public.public_site_settings to anon, authenticated;
