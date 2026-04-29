-- Supabase Storage: public bucket for generated booking ticket images (PNG + QR).
-- Run in Supabase SQL Editor once.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'booking-tickets',
  'booking-tickets',
  true,
  10485760,
  array['image/png']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can read (public bucket URLs)
drop policy if exists "Public read booking-tickets" on storage.objects;
create policy "Public read booking-tickets"
on storage.objects for select
to public
using (bucket_id = 'booking-tickets');

-- Logged-in users can upload/update generated ticket images
drop policy if exists "Authenticated insert booking-tickets" on storage.objects;
create policy "Authenticated insert booking-tickets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'booking-tickets');

drop policy if exists "Authenticated update booking-tickets" on storage.objects;
create policy "Authenticated update booking-tickets"
on storage.objects for update
to authenticated
using (bucket_id = 'booking-tickets');

drop policy if exists "Authenticated delete booking-tickets" on storage.objects;
create policy "Authenticated delete booking-tickets"
on storage.objects for delete
to authenticated
using (bucket_id = 'booking-tickets');
