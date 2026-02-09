
create table if not exists webhook_events (
  id uuid default gen_random_uuid() primary key,
  provider text not null default 'duffel',
  event_type text not null,
  event_id text,
  payload jsonb,
  processed boolean default false,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table webhook_events enable row level security;

-- Policy: Only service role can insert/select
create policy "Service role full access"
  on webhook_events
  for all
  to service_role
  using (true)
  with check (true);

-- Policy: No public access
