-- ============================================================
-- STONE SLAB — Schema inicial (Auth + Perfis)
-- Rode no SQL Editor do Supabase.
-- ============================================================

-- 1. Tipo de conta
create type account_type as enum (
  'pedreira', 'serraria', 'industria', 'marmoraria',
  'arquiteto', 'designer', 'comprador', 'distribuidor'
);

-- 2. Tabela de perfis (estende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_type   account_type not null,
  display_name   text not null,
  username       text not null unique,
  avatar_url     text,
  logo_url       text,
  banner_url     text,
  company_name   text,
  country_code   text,
  city           text,
  bio            text,
  website        text,
  whatsapp       text,
  instagram      text,
  linkedin       text,
  is_verified    boolean not null default false,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  posts_count     integer not null default 0,
  created_at      timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,30}$')
);

create index profiles_username_idx on public.profiles (username);
create index profiles_account_type_idx on public.profiles (account_type);

-- 3. Cria o perfil automaticamente ao registrar (lê o raw_user_meta_data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, account_type, display_name, username, company_name, country_code, city)
  values (
    new.id,
    (new.raw_user_meta_data->>'account_type')::account_type,
    coalesce(new.raw_user_meta_data->>'display_name', 'Usuário'),
    lower(new.raw_user_meta_data->>'username'),
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'country_code',
    new.raw_user_meta_data->>'city'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. RLS
alter table public.profiles enable row level security;

-- Perfis são públicos para leitura (é uma rede social)
create policy "Perfis visíveis para todos"
  on public.profiles for select
  using (true);

-- Cada um só edita o próprio perfil
create policy "Usuário edita o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- NOTA: a verificação de username disponível no signup usa
-- esta tabela com policy de SELECT público — funciona antes
-- mesmo do usuário estar logado, o que é o comportamento desejado.
-- ============================================================
