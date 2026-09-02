-- Products table for persistent catalog
create table if not exists public.products (
  id text primary key,
  title text not null,
  subtitle text,
  category text not null,
  gender text not null check (gender in ('men', 'women', 'unisex', 'all')),
  price numeric(10, 2) not null,
  original_price numeric(10, 2),
  rating numeric(2, 1) default 5,
  review_count integer default 0,
  images jsonb default '[]'::jsonb,
  fabric jsonb,
  description text,
  highlights jsonb default '[]'::jsonb,
  colors jsonb default '[]'::jsonb,
  sizes jsonb default '[]'::jsonb,
  is_bespoke_customizable boolean default false,
  craft_time_days integer,
  badge text,
  in_stock boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text references public.users(id) on delete set null
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_gender_idx on public.products (gender);
create index if not exists products_in_stock_idx on public.products (in_stock);

alter table public.products enable row level security;
