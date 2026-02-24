-- ============================================
-- Fix: Enable RLS on usage_logs & webhook_events
-- Resolves Supabase Security Advisor errors
-- ============================================

-- 1. usage_logs: Enable RLS + service-role-only policy
alter table if exists public.usage_logs enable row level security;

create policy "Service role full access on usage_logs"
  on public.usage_logs
  for all
  to service_role
  using (true)
  with check (true);

-- 2. webhook_events: Enable RLS (migration existed but wasn't applied)
--    The policy may already exist, so use IF NOT EXISTS-style approach
alter table if exists public.webhook_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'webhook_events'
      and policyname = 'Service role full access'
  ) then
    create policy "Service role full access"
      on public.webhook_events
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;
