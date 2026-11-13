create extension if not exists pgcrypto;
create table if not exists public.article_submissions (
 id uuid primary key default gen_random_uuid(),
 sender_name text not null check(char_length(sender_name) between 2 and 120),
 sender_email text not null check(char_length(sender_email) between 5 and 254),
 submission_type text not null check(submission_type in ('noticia','nota_prensa','opinion','otro')),
 title text not null check(char_length(title) between 5 and 180),
 body text not null check(char_length(body) between 50 and 30000),
 attachment_paths text[] not null default '{}',
 status text not null default 'received' check(status in ('received','converted','rejected')),
 article_id uuid references public.articles(id) on delete set null,
 created_at timestamptz not null default now()
);
alter table public.article_submissions enable row level security;
revoke all on public.article_submissions from anon,authenticated;
grant insert on public.article_submissions to anon;
grant select,update on public.article_submissions to authenticated;
drop policy if exists "Public can submit editorial proposals" on public.article_submissions;
create policy "Public can submit editorial proposals" on public.article_submissions for insert to anon
with check(status='received' and article_id is null and submission_type in ('noticia','nota_prensa','opinion','otro')
 and char_length(sender_name) between 2 and 120 and char_length(sender_email) between 5 and 254
 and char_length(title) between 5 and 180 and char_length(body) between 50 and 30000);
drop policy if exists "Evoford editor can read submissions" on public.article_submissions;
create policy "Evoford editor can read submissions" on public.article_submissions for select to authenticated
using((auth.jwt()->>'email')='eepinedacarrasco@gmail.com');
drop policy if exists "Evoford editor can update submissions" on public.article_submissions;
create policy "Evoford editor can update submissions" on public.article_submissions for update to authenticated
using((auth.jwt()->>'email')='eepinedacarrasco@gmail.com')
with check((auth.jwt()->>'email')='eepinedacarrasco@gmail.com');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('news-submissions','news-submissions',false,8388608,array['image/jpeg','image/png','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict(id) do update set public=false,file_size_limit=8388608,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Public can attach files to submissions" on storage.objects;
create policy "Public can attach files to submissions" on storage.objects for insert to anon with check(bucket_id='news-submissions');
drop policy if exists "Evoford editor can read submission attachments" on storage.objects;
create policy "Evoford editor can read submission attachments" on storage.objects for select to authenticated
using(bucket_id='news-submissions' and (auth.jwt()->>'email')='eepinedacarrasco@gmail.com');