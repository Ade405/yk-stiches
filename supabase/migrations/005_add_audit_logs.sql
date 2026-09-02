-- Audit logs for compliance and security monitoring
create table if not exists public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  event_type text not null check (event_type in ('auth_login', 'auth_logout', 'auth_register', 'password_reset', 'password_change', 'email_verify', 'order_created', 'order_updated', 'order_deleted', 'payment_processed', 'admin_user_edit', 'admin_product_edit', 'admin_order_update', 'file_upload', 'access_denied', 'suspicious_activity')),
  actor_id text references public.users(id) on delete set null,
  actor_email text,
  actor_name text,
  resource_type text,
  resource_id text,
  resource_name text,
  action text not null,
  details jsonb,
  ip_address text,
  user_agent text,
  status text not null default 'success' check (status in ('success', 'failure', 'blocked')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_event_type_idx on public.audit_logs (event_type);
create index if not exists audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index if not exists audit_logs_resource_type_id_idx on public.audit_logs (resource_type, resource_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_status_idx on public.audit_logs (status);

alter table public.audit_logs enable row level security;
