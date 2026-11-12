-- Comentarios públicos moderados para Evoford News
create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 60),
  body text not null check (char_length(body) between 3 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists article_comments_public_idx
  on public.article_comments(article_id, created_at desc) where status='approved';
alter table public.article_comments enable row level security;
drop policy if exists "Public can read approved article comments" on public.article_comments;
create policy "Public can read approved article comments"
  on public.article_comments for select to anon, authenticated
  using (status='approved');
drop policy if exists "Public can submit pending article comments" on public.article_comments;
create policy "Public can submit pending article comments"
  on public.article_comments for insert to anon, authenticated
  with check (status='pending');
drop policy if exists "Admin manages article comments" on public.article_comments;
create policy "Admin manages article comments"
  on public.article_comments for all to authenticated
  using ((auth.jwt()->>'email')='eepinedacarrasco@gmail.com')
  with check ((auth.jwt()->>'email')='eepinedacarrasco@gmail.com');
