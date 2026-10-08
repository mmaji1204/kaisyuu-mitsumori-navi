-- Store the wording version and server time of the applicant's consent.
-- Existing requests remain NULL; historical consent is never inferred.
alter table public.leads add column if not exists consent_version text;
alter table public.leads add column if not exists consented_at timestamptz;
