-- ===========================================================================
-- Sarah Danish Properties — 0002: authorization helpers, grants, RLS policies
-- ===========================================================================
-- Model
--   * anon          : may read published properties + public site data, and
--                     nothing else. Enquiry inserts only ever happen server-side
--                     through the service-role key, so anon gets no write access.
--   * authenticated : same as anon, plus (if a row exists in admin_users and
--                     is_active) full management of listings and enquiries.
--   * service_role  : bypasses RLS, used only by trusted server code.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- is_admin(): the single source of truth for "is this user an administrator?"
-- SECURITY DEFINER so it can read admin_users without recursing into RLS.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.id = uid
      and au.is_active
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated, service_role;

comment on function public.is_admin(uuid) is
  'Returns true when the given user id belongs to an active administrator.';

-- ---------------------------------------------------------------------------
-- email_for_username(): lets the login form accept a username OR an email
-- without exposing the whole admin_users table to anonymous visitors.
-- ---------------------------------------------------------------------------
create or replace function public.email_for_username(p_username text)
returns text
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select au.email
  from public.admin_users au
  where lower(au.username) = lower(trim(p_username))
    and au.is_active
  limit 1;
$$;

revoke all on function public.email_for_username(text) from public;
grant execute on function public.email_for_username(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

-- Public read surface
grant select on public.properties      to anon, authenticated;
grant select on public.property_images to anon, authenticated;
grant select on public.agents          to anon, authenticated;

-- Admin-only tables: no anon/authenticated grants beyond what RLS permits.
grant select, insert, update, delete on public.admin_users    to authenticated;
grant select, insert, update, delete on public.properties     to authenticated;
grant select, insert, update, delete on public.property_images to authenticated;
grant select, insert, update, delete on public.agents         to authenticated;
grant select, insert, update, delete on public.enquiries      to authenticated;
grant select, insert, update, delete on public.enquiry_notes  to authenticated;
grant select, update                 on public.site_settings  to authenticated;

-- Sequence-less schema, but keep parity for any future sequences.
grant usage, select on all sequences in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------
alter table public.admin_users     enable row level security;
alter table public.properties      enable row level security;
alter table public.property_images enable row level security;
alter table public.agents          enable row level security;
alter table public.enquiries       enable row level security;
alter table public.enquiry_notes   enable row level security;
alter table public.site_settings   enable row level security;

-- ===========================================================================
-- admin_users
-- ===========================================================================
drop policy if exists "admin_users_select_self_or_admin" on public.admin_users;
create policy "admin_users_select_self_or_admin"
  on public.admin_users for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "admin_users_update_admin" on public.admin_users;
create policy "admin_users_update_admin"
  on public.admin_users for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_users_insert_admin" on public.admin_users;
create policy "admin_users_insert_admin"
  on public.admin_users for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admin_users_delete_admin" on public.admin_users;
create policy "admin_users_delete_admin"
  on public.admin_users for delete
  to authenticated
  using (public.is_admin() and id <> auth.uid());

-- ===========================================================================
-- properties — published rows are world-readable, everything else is admin-only
-- ===========================================================================
drop policy if exists "properties_select_published" on public.properties;
create policy "properties_select_published"
  on public.properties for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "properties_select_admin" on public.properties;
create policy "properties_select_admin"
  on public.properties for select
  to authenticated
  using (public.is_admin());

drop policy if exists "properties_insert_admin" on public.properties;
create policy "properties_insert_admin"
  on public.properties for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "properties_update_admin" on public.properties;
create policy "properties_update_admin"
  on public.properties for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "properties_delete_admin" on public.properties;
create policy "properties_delete_admin"
  on public.properties for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- property_images — readable when the parent property is public
-- ===========================================================================
drop policy if exists "property_images_select_public" on public.property_images;
create policy "property_images_select_public"
  on public.property_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
        and p.is_published = true
    )
  );

drop policy if exists "property_images_select_admin" on public.property_images;
create policy "property_images_select_admin"
  on public.property_images for select
  to authenticated
  using (public.is_admin());

drop policy if exists "property_images_write_admin" on public.property_images;
create policy "property_images_write_admin"
  on public.property_images for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "property_images_update_admin" on public.property_images;
create policy "property_images_update_admin"
  on public.property_images for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "property_images_delete_admin" on public.property_images;
create policy "property_images_delete_admin"
  on public.property_images for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- agents
-- ===========================================================================
drop policy if exists "agents_select_active" on public.agents;
create policy "agents_select_active"
  on public.agents for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "agents_select_admin" on public.agents;
create policy "agents_select_admin"
  on public.agents for select
  to authenticated
  using (public.is_admin());

drop policy if exists "agents_insert_admin" on public.agents;
create policy "agents_insert_admin"
  on public.agents for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "agents_update_admin" on public.agents;
create policy "agents_update_admin"
  on public.agents for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "agents_delete_admin" on public.agents;
create policy "agents_delete_admin"
  on public.agents for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- enquiries — admins only. Visitors submitting a form go through a server
-- action that writes with the service-role key, so there is deliberately no
-- anon INSERT policy here: the table can never be written directly from a
-- browser session.
-- ===========================================================================
drop policy if exists "enquiries_select_admin" on public.enquiries;
create policy "enquiries_select_admin"
  on public.enquiries for select
  to authenticated
  using (public.is_admin());

drop policy if exists "enquiries_insert_admin" on public.enquiries;
create policy "enquiries_insert_admin"
  on public.enquiries for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "enquiries_update_admin" on public.enquiries;
create policy "enquiries_update_admin"
  on public.enquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "enquiries_delete_admin" on public.enquiries;
create policy "enquiries_delete_admin"
  on public.enquiries for delete
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- enquiry_notes — admins only
-- ===========================================================================
drop policy if exists "enquiry_notes_all_admin" on public.enquiry_notes;
create policy "enquiry_notes_all_admin"
  on public.enquiry_notes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================================================================
-- site_settings — admins read/write directly; the public reads the
-- public_site_settings view instead (which omits notification_email).
-- ===========================================================================
drop policy if exists "site_settings_select_admin" on public.site_settings;
create policy "site_settings_select_admin"
  on public.site_settings for select
  to authenticated
  using (public.is_admin());

drop policy if exists "site_settings_update_admin" on public.site_settings;
create policy "site_settings_update_admin"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
