-- Exigir inicio de sesión social para comentar
alter table public.article_comments
  add column if not exists user_id uuid references auth.users(id) on delete set null;

drop policy if exists "Public can submit pending article comments" on public.article_comments;
drop policy if exists "Authenticated users can submit pending article comments" on public.article_comments;
create policy "Authenticated users can submit pending article comments"
  on public.article_comments for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
  );
