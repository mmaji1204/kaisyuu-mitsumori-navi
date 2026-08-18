create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text,
  service_area text not null default '全国対応',
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now()
);

alter table partners add column if not exists password_hash text;

create table if not exists lead_deliveries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  partner_id uuid not null references partners(id) on delete cascade,
  delivery_status lead_status not null default '課金',
  fee text not null default '900 円',
  created_at timestamptz not null default now(),
  unique (lead_id, partner_id)
);

create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  partner_id uuid not null references partners(id) on delete cascade,
  action_type text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table partners enable row level security;
alter table lead_deliveries enable row level security;
alter table lead_activities enable row level security;

grant usage on schema public to service_role;
grant all on table partners to service_role;
grant all on table lead_deliveries to service_role;
grant all on table lead_activities to service_role;

drop policy if exists "Service role can manage partners" on partners;
drop policy if exists "Service role can manage lead deliveries" on lead_deliveries;
drop policy if exists "Service role can manage lead activities" on lead_activities;

create policy "Service role can manage partners"
  on partners
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role can manage lead deliveries"
  on lead_deliveries
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role can manage lead activities"
  on lead_activities
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into partners (name, email, service_area, status)
values ('クリーンリンク', 'partner@example.com', '広島県・近隣エリア', 'active')
on conflict (email) do update
set
  name = excluded.name,
  service_area = excluded.service_area,
  status = excluded.status;

update partners
set password_hash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'
where email = 'partner@example.com' and password_hash is null;

insert into lead_deliveries (lead_id, partner_id, delivery_status, fee)
select leads.id, partners.id, leads.status, leads.fee
from leads
cross join partners
where partners.email = 'partner@example.com'
on conflict (lead_id, partner_id) do nothing;
