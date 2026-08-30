-- ============================================================
-- PuntoDeSpawn — Esquema del Foro (Supabase / Postgres)
-- Pegar completo en el SQL Editor de Supabase y ejecutar.
-- ============================================================

-- ── Perfiles públicos (se crea uno automáticamente por cada login) ──
create table public.forum_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  is_admin    boolean not null default false,
  is_banned   boolean not null default false
);

-- Crea el perfil automáticamente cuando alguien se loguea por primera vez
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.forum_profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Posts del foro ──
-- Nota: user_id referencia forum_profiles (no auth.users directo) a propósito:
-- así PostgREST puede hacer el "join" automático post → autor en una sola query.
create table public.forum_posts (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references public.forum_profiles(id) on delete cascade,
  titulo         text not null check (char_length(titulo) between 3 and 200),
  contenido      text not null check (char_length(contenido) between 1 and 5000),
  tag            text not null default 'general' check (tag in ('general','gaming','tecnologia','ofertas','patch-notes')),
  created_at     timestamptz not null default now(),
  score          integer not null default 0,
  comment_count  integer not null default 0,
  is_deleted     boolean not null default false
);

create index forum_posts_created_idx on public.forum_posts (created_at desc) where not is_deleted;
create index forum_posts_score_idx   on public.forum_posts (score desc) where not is_deleted;
create index forum_posts_tag_idx     on public.forum_posts (tag) where not is_deleted;

-- ── Comentarios (anidados vía parent_id) ──
create table public.forum_comments (
  id          bigint generated always as identity primary key,
  post_id     bigint not null references public.forum_posts(id) on delete cascade,
  parent_id   bigint references public.forum_comments(id) on delete cascade,
  user_id     uuid not null references public.forum_profiles(id) on delete cascade,
  contenido   text not null check (char_length(contenido) between 1 and 3000),
  created_at  timestamptz not null default now(),
  score       integer not null default 0,
  is_deleted  boolean not null default false
);

create index forum_comments_post_idx on public.forum_comments (post_id, created_at);

-- ── Votos (uno por usuario, a un post O a un comentario) ──
create table public.forum_votes (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.forum_profiles(id) on delete cascade,
  post_id     bigint references public.forum_posts(id) on delete cascade,
  comment_id  bigint references public.forum_comments(id) on delete cascade,
  value       smallint not null check (value in (-1, 1)),
  created_at  timestamptz not null default now(),
  constraint one_target check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  ),
  unique (user_id, post_id),
  unique (user_id, comment_id)
);

-- ── Reportes (moderación) ──
create table public.forum_reports (
  id           bigint generated always as identity primary key,
  reporter_id  uuid not null references public.forum_profiles(id) on delete cascade,
  post_id      bigint references public.forum_posts(id) on delete cascade,
  comment_id   bigint references public.forum_comments(id) on delete cascade,
  motivo       text,
  created_at   timestamptz not null default now(),
  resuelto     boolean not null default false
);

-- ── Triggers para mantener score y comment_count actualizados ──
create function public.handle_vote_change()
returns trigger as $$
declare
  target_post   bigint;
  target_comment bigint;
begin
  target_post    := coalesce(new.post_id, old.post_id);
  target_comment := coalesce(new.comment_id, old.comment_id);

  if target_post is not null then
    update public.forum_posts set score = (
      select coalesce(sum(value), 0) from public.forum_votes where post_id = target_post
    ) where id = target_post;
  end if;

  if target_comment is not null then
    update public.forum_comments set score = (
      select coalesce(sum(value), 0) from public.forum_votes where comment_id = target_comment
    ) where id = target_comment;
  end if;

  return null;
end;
$$ language plpgsql security definer;

create trigger on_vote_change
  after insert or update or delete on public.forum_votes
  for each row execute procedure public.handle_vote_change();

create function public.handle_comment_count()
returns trigger as $$
begin
  update public.forum_posts set comment_count = (
    select count(*) from public.forum_comments where post_id = coalesce(new.post_id, old.post_id) and not is_deleted
  ) where id = coalesce(new.post_id, old.post_id);
  return null;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or update or delete on public.forum_comments
  for each row execute procedure public.handle_comment_count();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.forum_profiles enable row level security;
alter table public.forum_posts    enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_votes    enable row level security;
alter table public.forum_reports  enable row level security;

-- Perfiles: lectura pública, cada uno edita solo el suyo (menos is_admin/is_banned)
create policy "perfiles publicos"        on public.forum_profiles for select using (true);
create policy "editar mi propio perfil"  on public.forum_profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select is_admin from public.forum_profiles where id = auth.uid()) and is_banned = (select is_banned from public.forum_profiles where id = auth.uid()));

-- Posts: lectura pública de lo no borrado, escritura solo logueado y no baneado
create policy "posts publicos"    on public.forum_posts for select using (not is_deleted);
create policy "crear post"        on public.forum_posts for insert with check (
  auth.uid() = user_id
  and not exists (select 1 from public.forum_profiles where id = auth.uid() and is_banned)
);
create policy "borrar mi post"     on public.forum_posts for update using (
  auth.uid() = user_id
  or exists (select 1 from public.forum_profiles where id = auth.uid() and is_admin)
);

-- Comentarios: misma lógica que posts
create policy "comentarios publicos" on public.forum_comments for select using (not is_deleted);
create policy "crear comentario"     on public.forum_comments for insert with check (
  auth.uid() = user_id
  and not exists (select 1 from public.forum_profiles where id = auth.uid() and is_banned)
);
create policy "borrar mi comentario" on public.forum_comments for update using (
  auth.uid() = user_id
  or exists (select 1 from public.forum_profiles where id = auth.uid() and is_admin)
);

-- Votos: cada uno ve y gestiona solo los suyos
create policy "ver mis votos"    on public.forum_votes for select using (auth.uid() = user_id);
create policy "crear mi voto"    on public.forum_votes for insert with check (auth.uid() = user_id);
create policy "cambiar mi voto"  on public.forum_votes for update using (auth.uid() = user_id);
create policy "borrar mi voto"   on public.forum_votes for delete using (auth.uid() = user_id);

-- Reportes: cualquiera logueado reporta, solo admins leen/resuelven
create policy "crear reporte" on public.forum_reports for insert with check (auth.uid() = reporter_id);
create policy "admins ven reportes" on public.forum_reports for select using (
  exists (select 1 from public.forum_profiles where id = auth.uid() and is_admin)
);
create policy "admins resuelven reportes" on public.forum_reports for update using (
  exists (select 1 from public.forum_profiles where id = auth.uid() and is_admin)
);
