-- Password recovery tokens table for forgot/reset password flows
create table if not exists public.password_recovery_tokens (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.users(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  token_type text not null check (token_type in ('password_reset', 'email_verification')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  is_valid boolean not null default true,
  ip_address text,
  user_agent text
);

create index if not exists password_recovery_tokens_user_id_idx
  on public.password_recovery_tokens (user_id);

create index if not exists password_recovery_tokens_email_idx
  on public.password_recovery_tokens (email);

create index if not exists password_recovery_tokens_expires_at_idx
  on public.password_recovery_tokens (expires_at);

create index if not exists password_recovery_tokens_is_valid_idx
  on public.password_recovery_tokens (is_valid);

alter table public.password_recovery_tokens enable row level security;
