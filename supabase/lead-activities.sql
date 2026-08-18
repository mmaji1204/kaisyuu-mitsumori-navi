create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  partner_id uuid not null references partners(id) on delete cascade,
  action_type text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table lead_activities enable row level security;

grant usage on schema public to service_role;
grant all on table lead_activities to service_role;

drop policy if exists "Service role can manage lead activities" on lead_activities;

create policy "Service role can manage lead activities"
  on lead_activities
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
