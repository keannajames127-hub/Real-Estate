-- ===========================================================================
-- Sarah Danish Properties — 0003: storage bucket + object policies
-- ===========================================================================
-- A single public-read bucket holds every uploaded asset. Objects are namespaced
-- by folder:  properties/<property-id>/<file>, agents/<agent-id>/<file>,
-- site/<file>.  Reads are public (the site has to display the photography);
-- writes require an active administrator.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  15728640, -- 15 MB
  array['image/jpeg','image/jpg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'property-images');

-- Admin write (insert)
drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images' and public.is_admin());

-- Admin update (upsert / replace)
drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin())
  with check (bucket_id = 'property-images' and public.is_admin());

-- Admin delete
drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin());
