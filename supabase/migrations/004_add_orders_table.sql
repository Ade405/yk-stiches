-- Orders table for persistent order storage
create table if not exists public.orders (
  id text primary key,
  order_number text unique not null,
  user_id text references public.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  items jsonb not null default '[]'::jsonb,
  order_type text not null default 'bespoke' check (order_type in ('bespoke', 'ready-made', 'alteration')),
  total_amount numeric(12, 2) not null,
  currency text default 'USD',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  payment_gateway text default 'Manual',
  transaction_ref text,
  delivery_address text,
  delivery_city text,
  express_delivery boolean default false,
  created_at timestamptz not null default now(),
  estimated_delivery_date timestamptz,
  assigned_tailor jsonb,
  current_stage_index integer default 0,
  milestones jsonb default '[]'::jsonb,
  measurements_summary jsonb,
  special_instructions text,
  updated_at timestamptz not null default now(),
  updated_by text references public.users(id) on delete set null
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;
