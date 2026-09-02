-- Orders table for persistent order storage
create table if not exists public.orders (
  id text primary key,
  order_number text,
  user_id text references public.users(id) on delete set null,
  customer_name text,
  customer_email text,
  customer_phone text,
  items jsonb,
  order_type text,
  total_amount numeric(12, 2),
  currency text,
  payment_status text,
  payment_gateway text,
  transaction_ref text,
  delivery_address text,
  delivery_city text,
  express_delivery boolean,
  created_at timestamptz,
  estimated_delivery_date timestamptz,
  assigned_tailor jsonb,
  current_stage_index integer,
  milestones jsonb,
  measurements_summary jsonb,
  special_instructions text,
  updated_at timestamptz,
  updated_by text references public.users(id) on delete set null
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_number') THEN
    ALTER TABLE public.orders ADD COLUMN order_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_id') THEN
    ALTER TABLE public.orders ADD COLUMN user_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_name') THEN
    ALTER TABLE public.orders ADD COLUMN customer_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_email') THEN
    ALTER TABLE public.orders ADD COLUMN customer_email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE public.orders ADD COLUMN customer_phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'items') THEN
    ALTER TABLE public.orders ADD COLUMN items jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_type') THEN
    ALTER TABLE public.orders ADD COLUMN order_type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'total_amount') THEN
    ALTER TABLE public.orders ADD COLUMN total_amount numeric(12, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'currency') THEN
    ALTER TABLE public.orders ADD COLUMN currency text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_status') THEN
    ALTER TABLE public.orders ADD COLUMN payment_status text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_gateway') THEN
    ALTER TABLE public.orders ADD COLUMN payment_gateway text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'transaction_ref') THEN
    ALTER TABLE public.orders ADD COLUMN transaction_ref text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_address') THEN
    ALTER TABLE public.orders ADD COLUMN delivery_address text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_city') THEN
    ALTER TABLE public.orders ADD COLUMN delivery_city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'express_delivery') THEN
    ALTER TABLE public.orders ADD COLUMN express_delivery boolean;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'created_at') THEN
    ALTER TABLE public.orders ADD COLUMN created_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'estimated_delivery_date') THEN
    ALTER TABLE public.orders ADD COLUMN estimated_delivery_date timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'assigned_tailor') THEN
    ALTER TABLE public.orders ADD COLUMN assigned_tailor jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'current_stage_index') THEN
    ALTER TABLE public.orders ADD COLUMN current_stage_index integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'milestones') THEN
    ALTER TABLE public.orders ADD COLUMN milestones jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'measurements_summary') THEN
    ALTER TABLE public.orders ADD COLUMN measurements_summary jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'special_instructions') THEN
    ALTER TABLE public.orders ADD COLUMN special_instructions text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'updated_at') THEN
    ALTER TABLE public.orders ADD COLUMN updated_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'updated_by') THEN
    ALTER TABLE public.orders ADD COLUMN updated_by text;
  END IF;
END $$;

UPDATE public.orders
SET
  order_number = COALESCE(order_number, 'ORD-' || id),
  customer_name = COALESCE(customer_name, 'Unknown customer'),
  customer_email = COALESCE(customer_email, 'unknown@example.com'),
  items = COALESCE(items, '[]'::jsonb),
  order_type = COALESCE(order_type, 'bespoke'),
  total_amount = COALESCE(total_amount, 0),
  currency = COALESCE(currency, 'USD'),
  payment_status = COALESCE(payment_status, 'pending'),
  payment_gateway = COALESCE(payment_gateway, 'Manual'),
  express_delivery = COALESCE(express_delivery, false),
  created_at = COALESCE(created_at, now()),
  current_stage_index = COALESCE(current_stage_index, 0),
  milestones = COALESCE(milestones, '[]'::jsonb),
  updated_at = COALESCE(updated_at, now())
WHERE order_number IS NULL
   OR customer_name IS NULL
   OR customer_email IS NULL
   OR items IS NULL
   OR order_type IS NULL
   OR total_amount IS NULL
   OR currency IS NULL
   OR payment_status IS NULL
   OR payment_gateway IS NULL
   OR express_delivery IS NULL
   OR created_at IS NULL
   OR current_stage_index IS NULL
   OR milestones IS NULL
   OR updated_at IS NULL;

alter table public.orders alter column customer_name set default 'Unknown customer';
alter table public.orders alter column customer_email set default 'unknown@example.com';
alter table public.orders alter column items set default '[]'::jsonb;
alter table public.orders alter column order_type set default 'bespoke';
alter table public.orders alter column total_amount set default 0;
alter table public.orders alter column currency set default 'USD';
alter table public.orders alter column payment_status set default 'pending';
alter table public.orders alter column payment_gateway set default 'Manual';
alter table public.orders alter column express_delivery set default false;
alter table public.orders alter column created_at set default now();
alter table public.orders alter column current_stage_index set default 0;
alter table public.orders alter column milestones set default '[]'::jsonb;
alter table public.orders alter column updated_at set default now();

alter table public.orders alter column order_number set not null;
alter table public.orders alter column customer_name set not null;
alter table public.orders alter column customer_email set not null;
alter table public.orders alter column items set not null;
alter table public.orders alter column order_type set not null;
alter table public.orders alter column total_amount set not null;
alter table public.orders alter column currency set not null;
alter table public.orders alter column payment_status set not null;
alter table public.orders alter column payment_gateway set not null;
alter table public.orders alter column express_delivery set not null;
alter table public.orders alter column created_at set not null;
alter table public.orders alter column current_stage_index set not null;
alter table public.orders alter column milestones set not null;
alter table public.orders alter column updated_at set not null;

alter table public.orders drop constraint if exists orders_order_type_check;
alter table public.orders add constraint orders_order_type_check check (order_type in ('bespoke', 'ready-made', 'alteration'));

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check check (payment_status in ('pending', 'completed', 'failed', 'refunded'));

create unique index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;
