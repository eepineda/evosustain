create table if not exists public.academy_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  course_title text not null default 'Inteligencia artificial aplicada',
  status text not null default 'active' check (status in ('active','suspended','completed')),
  approved_by text not null,
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, course_slug)
);

create table if not exists public.academy_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_index integer not null check (lesson_index between 0 and 19),
  completed_at timestamptz not null default now(),
  unique (user_id, course_slug, lesson_index)
);

alter table public.academy_enrollments enable row level security;
alter table public.academy_progress enable row level security;

revoke all on public.academy_enrollments from anon, authenticated;
revoke all on public.academy_progress from anon, authenticated;
grant select on public.academy_enrollments to authenticated;
grant select, insert, update on public.academy_progress to authenticated;

drop policy if exists "Students can read their own academy enrollment" on public.academy_enrollments;
create policy "Students can read their own academy enrollment"
on public.academy_enrollments for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Students can read their own academy progress" on public.academy_progress;
create policy "Students can read their own academy progress"
on public.academy_progress for select to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.academy_enrollments e
    where e.user_id = (select auth.uid())
      and e.course_slug = academy_progress.course_slug
      and e.status = 'active'
  )
);

drop policy if exists "Students can save their own academy progress" on public.academy_progress;
create policy "Students can save their own academy progress"
on public.academy_progress for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.academy_enrollments e
    where e.user_id = (select auth.uid())
      and e.course_slug = academy_progress.course_slug
      and e.status = 'active'
  )
);

drop policy if exists "Students can update their own academy progress" on public.academy_progress;
create policy "Students can update their own academy progress"
on public.academy_progress for update to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.academy_enrollments e
    where e.user_id = (select auth.uid())
      and e.course_slug = academy_progress.course_slug
      and e.status = 'active'
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.academy_enrollments e
    where e.user_id = (select auth.uid())
      and e.course_slug = academy_progress.course_slug
      and e.status = 'active'
  )
);

create index if not exists academy_progress_user_course_idx
on public.academy_progress (user_id, course_slug);
create index if not exists academy_enrollments_user_status_idx
on public.academy_enrollments (user_id, status);
