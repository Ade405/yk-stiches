-- Products table for persistent catalog
create table if not exists public.products (
  id text primary key,
  title text,
  subtitle text,
  category text,
  gender text,
  price numeric(10, 2),
  original_price numeric(10, 2),
  rating numeric(2, 1),
  review_count integer,
  images jsonb,
  fabric jsonb,
  description text,
  highlights jsonb,
  colors jsonb,
  sizes jsonb,
  is_bespoke_customizable boolean,
  craft_time_days integer,
  badge text,
  in_stock boolean,
  created_at timestamptz,
  updated_at timestamptz,
  updated_by text references public.users(id) on delete set null
);

-- Safely add any missing columns when the table already exists from an earlier partial migration.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'title') THEN
    ALTER TABLE public.products ADD COLUMN title text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'subtitle') THEN
    ALTER TABLE public.products ADD COLUMN subtitle text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category') THEN
    ALTER TABLE public.products ADD COLUMN category text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'gender') THEN
    ALTER TABLE public.products ADD COLUMN gender text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'price') THEN
    ALTER TABLE public.products ADD COLUMN price numeric(10, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'original_price') THEN
    ALTER TABLE public.products ADD COLUMN original_price numeric(10, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'rating') THEN
    ALTER TABLE public.products ADD COLUMN rating numeric(2, 1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'review_count') THEN
    ALTER TABLE public.products ADD COLUMN review_count integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'images') THEN
    ALTER TABLE public.products ADD COLUMN images jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'fabric') THEN
    ALTER TABLE public.products ADD COLUMN fabric jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'description') THEN
    ALTER TABLE public.products ADD COLUMN description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'highlights') THEN
    ALTER TABLE public.products ADD COLUMN highlights jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'colors') THEN
    ALTER TABLE public.products ADD COLUMN colors jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'sizes') THEN
    ALTER TABLE public.products ADD COLUMN sizes jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_bespoke_customizable') THEN
    ALTER TABLE public.products ADD COLUMN is_bespoke_customizable boolean;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'craft_time_days') THEN
    ALTER TABLE public.products ADD COLUMN craft_time_days integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'badge') THEN
    ALTER TABLE public.products ADD COLUMN badge text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'in_stock') THEN
    ALTER TABLE public.products ADD COLUMN in_stock boolean;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'created_at') THEN
    ALTER TABLE public.products ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE public.products ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'updated_by') THEN
    ALTER TABLE public.products ADD COLUMN updated_by text;
  END IF;
END $$;

UPDATE public.products
SET
  title = COALESCE(title, 'Untitled product'),
  category = COALESCE(category, 'Tailored Staples'),
  gender = COALESCE(gender, 'all'),
  price = COALESCE(price, 0),
  rating = COALESCE(rating, 5),
  review_count = COALESCE(review_count, 0),
  images = COALESCE(images, '[]'::jsonb),
  highlights = COALESCE(highlights, '[]'::jsonb),
  colors = COALESCE(colors, '[]'::jsonb),
  sizes = COALESCE(sizes, '[]'::jsonb),
  is_bespoke_customizable = COALESCE(is_bespoke_customizable, false),
  in_stock = COALESCE(in_stock, true),
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(updated_at, now())
WHERE title IS NULL
   OR category IS NULL
   OR gender IS NULL
   OR price IS NULL
   OR rating IS NULL
   OR review_count IS NULL
   OR images IS NULL
   OR highlights IS NULL
   OR colors IS NULL
   OR sizes IS NULL
   OR is_bespoke_customizable IS NULL
   OR in_stock IS NULL
   OR created_at IS NULL
   OR updated_at IS NULL;

alter table public.products alter column title set default 'Untitled product';
alter table public.products alter column category set default 'Tailored Staples';
alter table public.products alter column gender set default 'all';
alter table public.products alter column price set default 0;
alter table public.products alter column rating set default 5;
alter table public.products alter column review_count set default 0;
alter table public.products alter column images set default '[]'::jsonb;
alter table public.products alter column highlights set default '[]'::jsonb;
alter table public.products alter column colors set default '[]'::jsonb;
alter table public.products alter column sizes set default '[]'::jsonb;
alter table public.products alter column is_bespoke_customizable set default false;
alter table public.products alter column in_stock set default true;
alter table public.products alter column created_at set default now();
alter table public.products alter column updated_at set default now();

alter table public.products alter column title set not null;
alter table public.products alter column category set not null;
alter table public.products alter column gender set not null;
alter table public.products alter column price set not null;
alter table public.products alter column rating set not null;
alter table public.products alter column review_count set not null;
alter table public.products alter column images set not null;
alter table public.products alter column highlights set not null;
alter table public.products alter column colors set not null;
alter table public.products alter column sizes set not null;
alter table public.products alter column is_bespoke_customizable set not null;
alter table public.products alter column in_stock set not null;
alter table public.products alter column created_at set not null;
alter table public.products alter column updated_at set not null;

alter table public.products drop constraint if exists products_gender_check;
alter table public.products add constraint products_gender_check check (gender in ('men', 'women', 'unisex', 'all'));

create index if not exists products_category_idx on public.products (category);
create index if not exists products_gender_idx on public.products (gender);
create index if not exists products_in_stock_idx on public.products (in_stock);

alter table public.products enable row level security;
