create table if not exists public.sessions (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_expires_at_idx
  on public.sessions (expires_at);

create index if not exists sessions_user_id_idx
  on public.sessions (user_id);

alter table public.sessions enable row level security;
