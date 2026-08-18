alter table partners add column if not exists daily_delivery_limit integer;
alter table partners add column if not exists monthly_budget_limit integer;
alter table partners add column if not exists notification_email text;
alter table partners add column if not exists auto_assign_enabled boolean not null default true;
alter table leads add column if not exists desired_date text;
alter table leads add column if not exists photo_names text[] not null default '{}';
alter table leads add column if not exists photo_urls text[] not null default '{}';
alter table leads add column if not exists after_photo_names text[] not null default '{}';
alter table leads add column if not exists after_photo_urls text[] not null default '{}';
alter table leads add column if not exists duplicate_warning boolean not null default false;

update partners
set
  daily_delivery_limit = coalesce(daily_delivery_limit, 10),
  monthly_budget_limit = coalesce(monthly_budget_limit, 300000),
  notification_email = coalesce(notification_email, email),
  auto_assign_enabled = coalesce(auto_assign_enabled, true);

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

alter table notification_logs enable row level security;
alter table billing_items enable row level security;

grant usage on schema public to service_role;
grant all on table notification_logs to service_role;
grant all on table billing_items to service_role;

drop policy if exists "Service role can manage notification logs" on notification_logs;
drop policy if exists "Service role can manage billing items" on billing_items;

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

insert into billing_items (
  lead_delivery_id,
  partner_id,
  amount,
  billing_month,
  description
)
select
  lead_deliveries.id,
  lead_deliveries.partner_id,
  coalesce(nullif(regexp_replace(lead_deliveries.fee, '[^0-9]', '', 'g'), ''), '0')::integer,
  to_char(lead_deliveries.created_at, 'YYYY-MM'),
  '案件配信料'
from lead_deliveries
on conflict (lead_delivery_id) do nothing;
