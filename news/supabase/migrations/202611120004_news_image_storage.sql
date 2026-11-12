-- Evoford News image storage. Run once in Supabase SQL Editor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('news-images', 'news-images', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Public can view Evoford News images" on storage.objects;
create policy "Public can view Evoford News images" on storage.objects for select using (bucket_id = 'news-images');
drop policy if exists "Admin can upload Evoford News images" on storage.objects;
create policy "Admin can upload Evoford News images" on storage.objects for insert to authenticated
with check (bucket_id = 'news-images' and (auth.jwt() ->> 'email') = 'eepinedacarrasco@gmail.com');
drop policy if exists "Admin can update Evoford News images" on storage.objects;
create policy "Admin can update Evoford News images" on storage.objects for update to authenticated
using (bucket_id = 'news-images' and (auth.jwt() ->> 'email') = 'eepinedacarrasco@gmail.com')
with check (bucket_id = 'news-images' and (auth.jwt() ->> 'email') = 'eepinedacarrasco@gmail.com');
drop policy if exists "Admin can delete Evoford News images" on storage.objects;
create policy "Admin can delete Evoford News images" on storage.objects for delete to authenticated
using (bucket_id = 'news-images' and (auth.jwt() ->> 'email') = 'eepinedacarrasco@gmail.com');