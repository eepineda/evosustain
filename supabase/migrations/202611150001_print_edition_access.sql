create table if not exists public.print_edition_access (
  email text primary key,
  approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint print_edition_access_email_check check (email = lower(btrim(email)) and position('@' in email) > 1)
);

alter table public.print_edition_access enable row level security;
revoke all on public.print_edition_access from anon, authenticated;
grant select, insert, update, delete on public.print_edition_access to authenticated;

drop policy if exists "Print edition access admin only" on public.print_edition_access;
create policy "Print edition access admin only"
on public.print_edition_access
for all
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eepinedacarrasco@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eepinedacarrasco@gmail.com');

insert into public.print_edition_access(email, approved)
values ('eepinedacarrasco@gmail.com', true)
on conflict (email) do update set approved = true, updated_at = now();
