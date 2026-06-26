-- ============================================================
-- STONE SLAB — Schema do Feed (v1.1.3)
-- Rode no SQL Editor do Supabase, DEPOIS do schema.sql inicial.
-- ============================================================

-- 1. Tipo de disponibilidade
create type availability as enum ('disponivel', 'reservado', 'vendido', 'nenhuma');

-- 2. Catálogo de pedras (alimenta as futuras "Páginas das Pedras")
create table public.stones (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  stone_type text,            -- granito, marmore, quartzito, onix, dolomite...
  created_at timestamptz not null default now()
);

create index stones_slug_idx on public.stones (slug);

-- 3. Publicações
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  caption text,
  availability availability not null default 'nenhuma',
  location text,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index posts_author_idx on public.posts (author_id);
create index posts_created_idx on public.posts (created_at desc);

-- 4. Mídia das publicações (preparado para várias fotos; UI usa 1 por enquanto)
create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  width integer,
  height integer,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index post_media_post_idx on public.post_media (post_id);

-- 5. Relação post <-> pedras
create table public.post_stones (
  post_id uuid not null references public.posts(id) on delete cascade,
  stone_id uuid not null references public.stones(id) on delete cascade,
  primary key (post_id, stone_id)
);

-- 6. Curtidas
create table public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- 7. Salvos
create table public.saved_posts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- ============================================================
-- TRIGGERS DE CONTADORES
-- ============================================================

-- likes_count em posts
create or replace function public.bump_likes_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  end if;
  return null;
end; $$;

create trigger likes_count_trg
  after insert or delete on public.likes
  for each row execute function public.bump_likes_count();

-- posts_count em profiles
create or replace function public.bump_posts_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.profiles set posts_count = posts_count + 1 where id = new.author_id;
  elsif (tg_op = 'DELETE') then
    update public.profiles set posts_count = greatest(0, posts_count - 1) where id = old.author_id;
  end if;
  return null;
end; $$;

create trigger posts_count_trg
  after insert or delete on public.posts
  for each row execute function public.bump_posts_count();

-- ============================================================
-- RLS
-- ============================================================

alter table public.stones enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_stones enable row level security;
alter table public.likes enable row level security;
alter table public.saved_posts enable row level security;

-- Pedras: leitura pública, qualquer logado pode criar
create policy "stones legíveis" on public.stones for select using (true);
create policy "stones criáveis por logados" on public.stones for insert
  to authenticated with check (true);

-- Posts: leitura pública; autor cria/edita/apaga o próprio
create policy "posts legíveis" on public.posts for select using (true);
create policy "posts criáveis pelo autor" on public.posts for insert
  to authenticated with check (auth.uid() = author_id);
create policy "posts editáveis pelo autor" on public.posts for update
  using (auth.uid() = author_id);
create policy "posts apagáveis pelo autor" on public.posts for delete
  using (auth.uid() = author_id);

-- Mídia: leitura pública; autor do post gerencia
create policy "media legível" on public.post_media for select using (true);
create policy "media gerenciada pelo autor" on public.post_media for all
  to authenticated using (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  ) with check (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  );

-- post_stones: leitura pública; autor do post gerencia
create policy "post_stones legível" on public.post_stones for select using (true);
create policy "post_stones gerenciada pelo autor" on public.post_stones for all
  to authenticated using (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  ) with check (
    exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  );

-- Likes: leitura pública; cada um cria/apaga a própria curtida
create policy "likes legíveis" on public.likes for select using (true);
create policy "likes criáveis pelo dono" on public.likes for insert
  to authenticated with check (auth.uid() = user_id);
create policy "likes apagáveis pelo dono" on public.likes for delete
  using (auth.uid() = user_id);

-- Salvos: privados — cada um só vê/gerencia os próprios
create policy "salvos visíveis ao dono" on public.saved_posts for select
  using (auth.uid() = user_id);
create policy "salvos criáveis pelo dono" on public.saved_posts for insert
  to authenticated with check (auth.uid() = user_id);
create policy "salvos apagáveis pelo dono" on public.saved_posts for delete
  using (auth.uid() = user_id);

-- ============================================================
-- STORAGE — bucket público para as fotos das publicações
-- ============================================================

insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

-- Qualquer um lê (bucket público); logado envia para sua própria pasta (user_id/...)
create policy "post-media leitura pública"
  on storage.objects for select
  using (bucket_id = 'post-media');

create policy "post-media envio por logado"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "post-media remoção pelo dono"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'post-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- DADOS DE EXEMPLO — pedras populares do mercado
-- ============================================================
insert into public.stones (slug, name, stone_type) values
  ('patagonia', 'Patagonia', 'quartzito'),
  ('taj-mahal', 'Taj Mahal', 'quartzito'),
  ('blue-roma', 'Blue Roma', 'quartzito'),
  ('cristallo', 'Cristallo', 'quartzito'),
  ('calacatta', 'Calacatta', 'marmore'),
  ('nero-marquina', 'Nero Marquina', 'marmore'),
  ('verde-ubatuba', 'Verde Ubatuba', 'granito'),
  ('preto-sao-gabriel', 'Preto São Gabriel', 'granito'),
  ('onix-mel', 'Ônix Mel', 'onix')
on conflict (slug) do nothing;
