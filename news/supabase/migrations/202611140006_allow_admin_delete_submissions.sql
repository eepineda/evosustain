-- Allow the authorised Evoford News editor to permanently delete submissions.
-- Existing SELECT/UPDATE policies remain unchanged.
grant delete on table public.article_submissions to authenticated;

drop policy if exists "Admin deletes article submissions" on public.article_submissions;
create policy "Admin deletes article submissions"
on public.article_submissions
for delete
to authenticated
using (
  lower(coalesce(auth.jwt()->>'email','')) = 'eepinedacarrasco@gmail.com'
);
