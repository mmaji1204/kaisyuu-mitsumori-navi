create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum ('課金', '除外');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status_color') then
    create type lead_status_color as enum ('green', 'red');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_progress') then
    create type lead_progress as enum ('未対応', '現地見積', '商談中', '成約', '失注');
  end if;
end $$;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  status lead_status not null default '課金',
  status_color lead_status_color not null default 'green',
  requested_at timestamptz not null default now(),
  request text not null,
  kana text,
  name text not null,
  address text not null,
  phone text not null,
  fee text not null default '900 円',
  progress lead_progress not null default '未対応',
  estimate text not null default '例: 50000',
  memo text not null default '',
  message text not null default '',
  desired_date text,
  photo_names text[] not null default '{}',
  photo_urls text[] not null default '{}',
  after_photo_names text[] not null default '{}',
  after_photo_urls text[] not null default '{}',
  duplicate_warning boolean not null default false,
  created_at timestamptz not null default now()
);

alter table leads add column if not exists desired_date text;
alter table leads add column if not exists photo_names text[] not null default '{}';
alter table leads add column if not exists photo_urls text[] not null default '{}';
alter table leads add column if not exists after_photo_names text[] not null default '{}';
alter table leads add column if not exists after_photo_urls text[] not null default '{}';
alter table leads add column if not exists duplicate_warning boolean not null default false;

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text,
  service_area text not null default '全国対応',
  status text not null default 'active' check (status in ('active', 'paused')),
  daily_delivery_limit integer,
  monthly_budget_limit integer,
  notification_email text,
  auto_assign_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table partners add column if not exists password_hash text;
alter table partners add column if not exists daily_delivery_limit integer;
alter table partners add column if not exists monthly_budget_limit integer;
alter table partners add column if not exists notification_email text;
alter table partners add column if not exists auto_assign_enabled boolean not null default true;

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

create table if not exists notification_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  partner_id uuid references partners(id) on delete cascade,
  channel text not null check (channel in ('email', 'line', 'sms', 'system')),
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  title text not null,
  body text not null default '',
  error_message text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists billing_items (
  id uuid primary key default gen_random_uuid(),
  lead_delivery_id uuid references lead_deliveries(id) on delete set null,
  partner_id uuid not null references partners(id) on delete cascade,
  amount integer not null default 0,
  billing_month text not null,
  status text not null default 'unbilled' check (status in ('unbilled', 'invoiced', 'paid', 'void')),
  description text not null default '',
  created_at timestamptz not null default now(),
  unique (lead_delivery_id)
);

alter table leads enable row level security;
alter table partners enable row level security;
alter table lead_deliveries enable row level security;
alter table lead_activities enable row level security;
alter table notification_logs enable row level security;
alter table billing_items enable row level security;

grant usage on schema public to service_role;
grant all on table leads to service_role;
grant all on table partners to service_role;
grant all on table lead_deliveries to service_role;
grant all on table lead_activities to service_role;
grant all on table notification_logs to service_role;
grant all on table billing_items to service_role;

drop policy if exists "Service role can manage leads" on leads;
drop policy if exists "Service role can manage partners" on partners;
drop policy if exists "Service role can manage lead deliveries" on lead_deliveries;
drop policy if exists "Service role can manage lead activities" on lead_activities;
drop policy if exists "Service role can manage notification logs" on notification_logs;
drop policy if exists "Service role can manage billing items" on billing_items;

create policy "Service role can manage leads"
  on leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

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

create policy "Service role can manage notification logs"
  on notification_logs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role can manage billing items"
  on billing_items
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
