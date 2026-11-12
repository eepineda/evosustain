-- Publicación inmediata con filtro automático y límites anti-spam.
-- Los comentarios que superen los controles se publican; los que no, se rechazan.
alter table public.article_comments
  alter column status set default 'approved';

create or replace function public.guard_article_comment()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  clean_body text;
begin
  if auth.uid() is null or new.user_id is distinct from auth.uid() then
    raise exception 'Debes iniciar sesión para comentar.';
  end if;

  new.status := 'approved';
  new.author_name := left(trim(coalesce(new.author_name, 'Lector')), 60);
  clean_body := lower(coalesce(new.body, ''));

  if char_length(trim(coalesce(new.body, ''))) < 3
     or char_length(new.body) > 2000 then
    raise exception 'El comentario debe tener entre 3 y 2000 caracteres.';
  end if;

  if clean_body ~ '\m(p[uú]ta|puto|put[a@]s|cabro[nñ]|mierda|j[oó]der|co[nñ]o| polla |verga|maric[oó]n|gilipollas|imb[eé]cil|idiota|fuck|shit|bitch|cunt|nigger)\M' then
    raise exception 'El comentario contiene lenguaje ofensivo. Modifica el texto e inténtalo de nuevo.';
  end if;

  if clean_body ~ '(https?://|www\.)' or
     (length(new.body) - length(replace(new.body, '@', ''))) > 2 then
    raise exception 'No se permiten enlaces ni mensajes promocionales en los comentarios.';
  end if;

  if clean_body ~ '(.)\1{7,}' or
     (length(regexp_replace(new.body, '[^A-Z]', '', 'g')) > 20
      and length(regexp_replace(new.body, '[^A-Za-z]', '', 'g')) > 0
      and length(regexp_replace(new.body, '[^A-Z]', '', 'g'))::numeric /
          length(regexp_replace(new.body, '[^A-Za-z]', '', 'g')) > 0.75) then
    raise exception 'El comentario parece contener texto repetitivo o spam.';
  end if;

  if exists (
    select 1 from public.article_comments c
    where c.user_id = new.user_id
      and c.created_at > now() - interval '30 seconds'
  ) then
    raise exception 'Espera unos segundos antes de publicar otro comentario.';
  end if;

  return new;
end;
$$;

drop trigger if exists article_comments_guard on public.article_comments;
create trigger article_comments_guard
before insert on public.article_comments
for each row execute function public.guard_article_comment();

drop policy if exists "Authenticated users can submit pending article comments" on public.article_comments;
drop policy if exists "Authenticated users can submit approved comments" on public.article_comments;
create policy "Authenticated users can submit approved comments"
  on public.article_comments for insert to authenticated
  with check (auth.uid() = user_id and status = 'approved');
