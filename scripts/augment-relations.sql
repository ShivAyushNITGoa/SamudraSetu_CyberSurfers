-- Augment relations to connect existing tables and enable features
-- Safe to run multiple times

-- 1) Optional department FK on profiles (keep existing text column for compatibility)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='department_id'
  ) then
    alter table public.profiles add column department_id uuid;
  end if;

  -- Add FK if not present
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema='public' and table_name='profiles' and constraint_name='profiles_department_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_department_id_fkey foreign key (department_id)
      references public.departments(id) on delete set null;
  end if;
end$$;

-- 2) Normalize report media
create table if not exists public.report_media (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.ocean_hazard_reports(id) on delete cascade,
  storage_path text not null,
  media_type text check (media_type in ('image','video','other')) default 'image',
  created_at timestamptz default now()
);

create index if not exists idx_report_media_report_id on public.report_media(report_id);

-- RLS for report_media
alter table public.report_media enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='report_media' and policyname='media read linked'
  ) then
    create policy "media read linked" on public.report_media for select
      using (
        exists (
          select 1 from public.ocean_hazard_reports r
          where r.id = report_id and (
            r.is_public or r.user_id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('analyst','admin','dmf_head'))
          )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='report_media' and policyname='media write owner'
  ) then
    create policy "media write owner" on public.report_media for insert
      with check (
        exists (select 1 from public.ocean_hazard_reports r where r.id = report_id and r.user_id = auth.uid())
      );
  end if;
end $$;

-- 3) Link official_data_feeds to sources (optional FK)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='official_data_sources') then
    if not exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='official_data_feeds' and column_name='source_id'
    ) then
      alter table public.official_data_feeds add column source_id uuid;
    end if;

    if not exists (
      select 1 from information_schema.table_constraints
      where table_schema='public' and table_name='official_data_feeds' and constraint_name='official_data_feeds_source_id_fkey'
    ) then
      alter table public.official_data_feeds
        add constraint official_data_feeds_source_id_fkey foreign key (source_id)
        references public.official_data_sources(id) on delete set null;
    end if;
  end if;
end$$;

-- 4) Alert recipients table to log deliveries
create table if not exists public.alert_recipients (
  id uuid primary key default uuid_generate_v4(),
  alert_id uuid not null references public.alert_notifications(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  delivery_channel text not null, -- 'email'|'sms'|'push'
  delivery_status text not null default 'queued', -- 'queued'|'sent'|'failed'
  metadata jsonb,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_alert_recipients_alert_id on public.alert_recipients(alert_id);
create index if not exists idx_alert_recipients_profile_id on public.alert_recipients(profile_id);

alter table public.alert_recipients enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='alert_recipients' and policyname='alert recipients write aa'
  ) then
    create policy "alert recipients write aa" on public.alert_recipients for all
      using (exists (select 1 from public.profiles where id = auth.uid() and role in ('analyst','admin','dmf_head')))
      with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('analyst','admin','dmf_head')));
  end if;
end $$;

-- 5) Add created_by to alert_rules (optional owner)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='alert_rules' and column_name='created_by'
  ) then
    alter table public.alert_rules add column created_by uuid;
  end if;

  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema='public' and table_name='alert_rules' and constraint_name='alert_rules_created_by_fkey'
  ) then
    alter table public.alert_rules
      add constraint alert_rules_created_by_fkey foreign key (created_by)
      references public.profiles(id) on delete set null;
  end if;
end$$;

-- 6) Admin-facing denormalized reports view
create or replace view public.v_admin_reports as
select
  r.*,
  p.name as reporter_name,
  p.email as reporter_email,
  p.department_id
from public.ocean_hazard_reports r
join public.profiles p on p.id = r.user_id;

-- 7) Ensure uniqueness for social media posts and connect NLP via views
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='social_media_feeds') then
    if not exists (
      select 1 from information_schema.table_constraints
      where table_schema='public' and table_name='social_media_feeds' and constraint_name='social_media_feeds_platform_post_id_unique'
    ) then
      alter table public.social_media_feeds
        add constraint social_media_feeds_platform_post_id_unique unique (platform, post_id);
    end if;
  end if;
end$$;

-- Validation trigger for NLP sources (polymorphic check)
create or replace function public.validate_nlp_source() returns trigger language plpgsql as $$
declare
  exists_row boolean;
begin
  if new.source_type = 'social_media' then
    select exists(select 1 from public.social_media_feeds where id = new.source_id) into exists_row;
    if not exists_row then raise exception 'NLP source not found in social_media_feeds: %', new.source_id; end if;
  elsif new.source_type = 'report' then
    select exists(select 1 from public.ocean_hazard_reports where id = new.source_id) into exists_row;
    if not exists_row then raise exception 'NLP source not found in ocean_hazard_reports: %', new.source_id; end if;
  elsif new.source_type = 'official_feed' then
    select exists(select 1 from public.official_data_feeds where id = new.source_id) into exists_row;
    if not exists_row then raise exception 'NLP source not found in official_data_feeds: %', new.source_id; end if;
  else
    raise exception 'Invalid source_type: %', new.source_type;
  end if;
  return new;
end$$;

do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='nlp_processing_results') then
    if not exists (
      select 1 from information_schema.triggers
      where event_object_table='nlp_processing_results' and trigger_name='trg_validate_nlp_source'
    ) then
      create trigger trg_validate_nlp_source
        before insert or update on public.nlp_processing_results
        for each row execute function public.validate_nlp_source();
    end if;
  end if;
end$$;

-- Drop first to avoid column order/name conflicts when source table changes
drop view if exists public.v_social_with_nlp cascade;
create view public.v_social_with_nlp as
select
  s.*, n.sentiment_score as nlp_sentiment_score, n.sentiment_label, n.hazard_classification,
  n.keywords_extracted, n.confidence_score as nlp_confidence, n.processed_at as nlp_processed_at
from public.social_media_feeds s
left join public.nlp_processing_results n
  on n.source_type = 'social_media' and n.source_id = s.id;

grant select on public.v_social_with_nlp to authenticated;

-- 8) Helper function: reports within km of a point
create or replace function public.reports_within_km(lat double precision, lon double precision, km double precision)
returns table (
  id uuid,
  title text,
  hazard_type hazard_type,
  severity severity_level,
  status report_status,
  distance_m double precision
) language sql stable as $$
  select r.id, r.title, r.hazard_type, r.severity, r.status,
         st_distance(r.location, st_setsrid(st_makepoint(lon, lat),4326)::geography) as distance_m
  from public.ocean_hazard_reports r
  where st_dwithin(r.location, st_setsrid(st_makepoint(lon, lat),4326)::geography, km*1000);
$$;

-- 9) Views to inspect alert deliveries
create or replace view public.v_alert_deliveries as
select ar.id as delivery_id, an.id as alert_id, an.title, an.severity, ar.delivery_channel,
       ar.delivery_status, ar.sent_at, pr.id as profile_id, pr.name as recipient_name, pr.email as recipient_email
from public.alert_recipients ar
join public.alert_notifications an on an.id = ar.alert_id
join public.profiles pr on pr.id = ar.profile_id;

grant select on public.v_alert_deliveries to authenticated;

-- 10) Indexes for performance
create index if not exists idx_profiles_department_id on public.profiles(department_id);

-- 11) Grant selects on views to anon/authenticated for frontend use
grant select on public.v_admin_reports to authenticated;

-- Done

-- 12) Connect social media feeds to configs and ownership
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='social_media_configs') then
    -- created_by on configs/templates
    if not exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='social_media_configs' and column_name='created_by'
    ) then
      alter table public.social_media_configs add column created_by uuid;
    end if;
    if not exists (
      select 1 from information_schema.table_constraints where table_schema='public' and table_name='social_media_configs' and constraint_name='social_media_configs_created_by_fkey'
    ) then
      alter table public.social_media_configs add constraint social_media_configs_created_by_fkey
        foreign key (created_by) references public.profiles(id) on delete set null;
    end if;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='notification_templates') then
    if not exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='notification_templates' and column_name='created_by'
    ) then
      alter table public.notification_templates add column created_by uuid;
    end if;
    if not exists (
      select 1 from information_schema.table_constraints where table_schema='public' and table_name='notification_templates' and constraint_name='notification_templates_created_by_fkey'
    ) then
      alter table public.notification_templates add constraint notification_templates_created_by_fkey
        foreign key (created_by) references public.profiles(id) on delete set null;
    end if;
  end if;

  -- Optional: default template on alert_rules for FK link
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='alert_rules') then
    if not exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='alert_rules' and column_name='default_template_id'
    ) then
      alter table public.alert_rules add column default_template_id uuid;
    end if;
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='notification_templates') then
      if not exists (
        select 1 from information_schema.table_constraints where table_schema='public' and table_name='alert_rules' and constraint_name='alert_rules_default_template_id_fkey'
      ) then
        alter table public.alert_rules add constraint alert_rules_default_template_id_fkey
          foreign key (default_template_id) references public.notification_templates(id) on delete set null;
      end if;
    end if;
  end if;

  -- Link social posts to a config optionally
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='social_media_feeds') then
    if not exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='social_media_feeds' and column_name='source_config_id'
    ) then
      alter table public.social_media_feeds add column source_config_id uuid;
    end if;
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='social_media_configs') then
      if not exists (
        select 1 from information_schema.table_constraints where table_schema='public' and table_name='social_media_feeds' and constraint_name='social_media_feeds_source_config_id_fkey'
      ) then
        alter table public.social_media_feeds add constraint social_media_feeds_source_config_id_fkey
          foreign key (source_config_id) references public.social_media_configs(id) on delete set null;
      end if;
    end if;
  end if;
end$$;

-- 13) Hotspot membership mapping to connect reports to hotspots
create table if not exists public.hazard_hotspot_members (
  hotspot_id uuid not null references public.hazard_hotspots(id) on delete cascade,
  report_id uuid not null references public.ocean_hazard_reports(id) on delete cascade,
  distance_m double precision,
  primary key (hotspot_id, report_id)
);

create index if not exists idx_hotspot_members_report on public.hazard_hotspot_members(report_id);

-- RLS (read-all, write by analyst/admin)
alter table public.hazard_hotspot_members enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='hazard_hotspot_members' and policyname='hotspot members read all'
  ) then
    create policy "hotspot members read all" on public.hazard_hotspot_members for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='hazard_hotspot_members' and policyname='hotspot members write aa'
  ) then
    create policy "hotspot members write aa" on public.hazard_hotspot_members for all
      using (exists (select 1 from public.profiles where id = auth.uid() and role in ('analyst','admin','dmf_head')))
      with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('analyst','admin','dmf_head')));
  end if;
end$$;

-- Refresh function to populate hotspot_members based on radius
create or replace function public.refresh_hotspot_members(hotspot uuid)
returns void language plpgsql as $$
begin
  delete from public.hazard_hotspot_members where hotspot_id = hotspot;
  insert into public.hazard_hotspot_members (hotspot_id, report_id, distance_m)
  select h.id, r.id,
         st_distance(r.location, h.center_location)
  from public.hazard_hotspots h
  join public.ocean_hazard_reports r on st_dwithin(r.location, h.center_location, h.radius_meters)
  where h.id = hotspot;
end$$;

-- View to inspect hotspots with member counts
create or replace view public.v_hotspots_with_counts as
select h.*, coalesce(m.cnt,0) as member_count
from public.hazard_hotspots h
left join (
  select hotspot_id, count(*) as cnt
  from public.hazard_hotspot_members
  group by hotspot_id
) m on m.hotspot_id = h.id;

grant select on public.v_hotspots_with_counts to authenticated;

-- 14) Multilingual content usage view for hazard/severity/status labels
create or replace view public.v_report_labels_i18n as
select r.id as report_id, r.hazard_type,
  (select translated_text from public.multilingual_content mc where mc.content_type='hazard_type' and mc.content_key = r.hazard_type::text and mc.language_code = coalesce(p.language_preference,'en') limit 1) as hazard_label,
  r.severity,
  (select translated_text from public.multilingual_content mc where mc.content_type='severity' and mc.content_key = r.severity::text and mc.language_code = coalesce(p.language_preference,'en') limit 1) as severity_label,
  r.status,
  (select translated_text from public.multilingual_content mc where mc.content_type='status' and mc.content_key = r.status::text and mc.language_code = coalesce(p.language_preference,'en') limit 1) as status_label,
  p.language_preference
from public.ocean_hazard_reports r
join public.profiles p on p.id = r.user_id;

grant select on public.v_report_labels_i18n to authenticated;

-- 15) System analytics helper view to aggregate reports (frontend can read; backend inserts to system_analytics)
create or replace view public.v_reports_analytics as
select
  date_trunc('day', created_at) as day,
  count(*) as total,
  count(*) filter (where status='verified') as verified,
  count(*) filter (where status='unverified') as unverified
from public.ocean_hazard_reports
group by 1
order by 1 desc;

grant select on public.v_reports_analytics to authenticated;

-- 16) Connect ML hotspots similarly: membership + refresh and counts
create table if not exists public.hazard_hotspots_ml_members (
  hotspot_ml_id uuid not null references public.hazard_hotspots_ml(id) on delete cascade,
  report_id uuid not null references public.ocean_hazard_reports(id) on delete cascade,
  distance_m double precision,
  primary key (hotspot_ml_id, report_id)
);

create index if not exists idx_hotspot_ml_members_report on public.hazard_hotspots_ml_members(report_id);

alter table public.hazard_hotspots_ml_members enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='hazard_hotspots_ml_members' and policyname='ml hotspot members read all'
  ) then
    create policy "ml hotspot members read all" on public.hazard_hotspots_ml_members for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='hazard_hotspots_ml_members' and policyname='ml hotspot members write aa'
  ) then
    create policy "ml hotspot members write aa" on public.hazard_hotspots_ml_members for all
      using (exists (select 1 from public.profiles where id = auth.uid() and role in ('analyst','admin','dmf_head')))
      with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('analyst','admin','dmf_head')));
  end if;
end$$;

create or replace function public.refresh_hotspot_ml(hotspot uuid)
returns void language plpgsql as $$
declare
  center geography;
  radius integer;
  reports_count int;
  social_count int;
  official_count int;
begin
  select h.center_location, h.radius_meters into center, radius from public.hazard_hotspots_ml h where h.id = hotspot;
  if center is null then return; end if;

  -- Refresh members from reports
  delete from public.hazard_hotspots_ml_members where hotspot_ml_id = hotspot;
  insert into public.hazard_hotspots_ml_members (hotspot_ml_id, report_id, distance_m)
  select hotspot, r.id, st_distance(r.location, center)
  from public.ocean_hazard_reports r
  where st_dwithin(r.location, center, radius);

  select count(*) into reports_count from public.hazard_hotspots_ml_members where hotspot_ml_id = hotspot;

  -- Counts of social posts within radius
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='social_media_feeds') then
    select count(*) into social_count from public.social_media_feeds s where s.location is not null and st_dwithin(s.location, center, radius);
  else
    social_count := 0;
  end if;

  -- Counts of official feeds within radius
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='official_data_feeds') then
    select count(*) into official_count from public.official_data_feeds f where f.location is not null and st_dwithin(f.location, center, radius);
  else
    official_count := 0;
  end if;

  update public.hazard_hotspots_ml
  set report_count = coalesce(reports_count,0),
      social_media_count = coalesce(social_count,0),
      official_data_count = coalesce(official_count,0),
      updated_at = now()
  where id = hotspot;
end$$;

create or replace view public.v_hotspots_ml_with_counts as
select h.*, coalesce(m.cnt,0) as member_count
from public.hazard_hotspots_ml h
left join (
  select hotspot_ml_id, count(*) as cnt
  from public.hazard_hotspots_ml_members
  group by hotspot_ml_id
) m on m.hotspot_ml_id = h.id;

grant select on public.v_hotspots_ml_with_counts to authenticated;

-- 17) Spatial reference system connections: enforce SRID=4326 where applicable and expose SRID usage
do $$ begin
  -- Add SRID checks on geography columns via geometry casts
  perform 1; -- no-op wrapper
end$$;

-- Add checks if not exist for key columns
do $$ begin
  if not exists (select 1 from pg_constraint where conname='chk_profiles_location_4326') then
    alter table public.profiles add constraint chk_profiles_location_4326 check (
      location is null or st_srid(location::geometry) = 4326
    );
  end if;
  if not exists (select 1 from pg_constraint where conname='chk_reports_location_4326') then
    alter table public.ocean_hazard_reports add constraint chk_reports_location_4326 check (
      st_srid(location::geometry) = 4326
    );
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='social_media_feeds' and column_name='location') then
    if not exists (select 1 from pg_constraint where conname='chk_social_location_4326') then
      alter table public.social_media_feeds add constraint chk_social_location_4326 check (
        location is null or st_srid(location::geometry) = 4326
      );
    end if;
  end if;
  if not exists (select 1 from pg_constraint where conname='chk_hotspots_center_4326') then
    alter table public.hazard_hotspots add constraint chk_hotspots_center_4326 check (
      st_srid(center_location::geometry) = 4326
    );
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='hazard_hotspots_ml') then
    if not exists (select 1 from pg_constraint where conname='chk_hotspots_ml_center_4326') then
      alter table public.hazard_hotspots_ml add constraint chk_hotspots_ml_center_4326 check (
        st_srid(center_location::geometry) = 4326
      );
    end if;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='official_data_feeds' and column_name='location') then
    if not exists (select 1 from pg_constraint where conname='chk_official_feeds_location_4326') then
      alter table public.official_data_feeds add constraint chk_official_feeds_location_4326 check (
        location is null or st_srid(location::geometry) = 4326
      );
    end if;
  end if;
end$$;

-- View to expose SRID details from spatial_ref_sys (connection through SRID usage)
create or replace view public.v_spatial_usage as
with srids as (
  select 4326 as srid
)
select s.srid, s.auth_name, s.auth_srid, s.srtext, s.proj4text
from public.spatial_ref_sys s
join srids on srids.srid = s.srid;

grant select on public.v_spatial_usage to authenticated;

-- 18) Stronger spatial_ref_sys linkage: normalize SRID=4326 and introspect usage
-- Normalize incoming geometries/geographies to SRID 4326
create or replace function public.normalize_geography_4326(g geography)
returns geography language sql immutable as $$
  select case
    when g is null then null
    when st_srid(g::geometry) = 0 then (st_setsrid(g::geometry, 4326))::geography
    when st_srid(g::geometry) <> 4326 then (st_transform(g::geometry, 4326))::geography
    else g
  end
$$;

-- Apply normalization on core tables before insert/update
-- Create specific normalization trigger functions
create or replace function public.fn_norm_profiles_location() returns trigger language plpgsql as $$
begin
  new.location := public.normalize_geography_4326(new.location);
  return new;
end$$;

create or replace function public.fn_norm_reports_location() returns trigger language plpgsql as $$
begin
  new.location := public.normalize_geography_4326(new.location);
  return new;
end$$;

create or replace function public.fn_norm_social_location() returns trigger language plpgsql as $$
begin
  new.location := public.normalize_geography_4326(new.location);
  return new;
end$$;

create or replace function public.fn_norm_hotspots_center() returns trigger language plpgsql as $$
begin
  new.center_location := public.normalize_geography_4326(new.center_location);
  return new;
end$$;

create or replace function public.fn_norm_hotspots_ml_center() returns trigger language plpgsql as $$
begin
  new.center_location := public.normalize_geography_4326(new.center_location);
  return new;
end$$;

create or replace function public.fn_norm_official_feeds_location() returns trigger language plpgsql as $$
begin
  new.location := public.normalize_geography_4326(new.location);
  return new;
end$$;

-- Attach triggers if missing
do $$ begin
  if not exists (select 1 from information_schema.triggers where event_object_table='profiles' and trigger_name='trg_profiles_norm_loc') then
    create trigger trg_profiles_norm_loc before insert or update on public.profiles
    for each row execute function public.fn_norm_profiles_location();
  end if;

  if not exists (select 1 from information_schema.triggers where event_object_table='ocean_hazard_reports' and trigger_name='trg_reports_norm_loc') then
    create trigger trg_reports_norm_loc before insert or update on public.ocean_hazard_reports
    for each row execute function public.fn_norm_reports_location();
  end if;

  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='social_media_feeds' and column_name='location') then
    if not exists (select 1 from information_schema.triggers where event_object_table='social_media_feeds' and trigger_name='trg_social_norm_loc') then
      create trigger trg_social_norm_loc before insert or update on public.social_media_feeds
      for each row execute function public.fn_norm_social_location();
    end if;
  end if;

  if not exists (select 1 from information_schema.triggers where event_object_table='hazard_hotspots' and trigger_name='trg_hotspots_norm_center') then
    create trigger trg_hotspots_norm_center before insert or update on public.hazard_hotspots
    for each row execute function public.fn_norm_hotspots_center();
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='hazard_hotspots_ml') then
    if not exists (select 1 from information_schema.triggers where event_object_table='hazard_hotspots_ml' and trigger_name='trg_hotspots_ml_norm_center') then
      create trigger trg_hotspots_ml_norm_center before insert or update on public.hazard_hotspots_ml
      for each row execute function public.fn_norm_hotspots_ml_center();
    end if;
  end if;

  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='official_data_feeds' and column_name='location') then
    if not exists (select 1 from information_schema.triggers where event_object_table='official_data_feeds' and trigger_name='trg_official_feeds_norm_loc') then
      create trigger trg_official_feeds_norm_loc before insert or update on public.official_data_feeds
      for each row execute function public.fn_norm_official_feeds_location();
    end if;
  end if;
end$$;

-- Introspection view: list geo columns and validate against spatial_ref_sys(4326)
drop view if exists public.v_spatial_columns_usage cascade;
create view public.v_spatial_columns_usage as
with cols as (
  select 'profiles'::text as table_name, 'location'::text as column_name, (select 4326) as srid
  union all select 'ocean_hazard_reports','location',4326
  union all select 'social_media_feeds','location',4326 where exists (select 1 from information_schema.columns where table_schema='public' and table_name='social_media_feeds' and column_name='location')
  union all select 'hazard_hotspots','center_location',4326
  union all select 'hazard_hotspots_ml','center_location',4326 where exists (select 1 from information_schema.tables where table_schema='public' and table_name='hazard_hotspots_ml')
  union all select 'official_data_feeds','location',4326 where exists (select 1 from information_schema.columns where table_schema='public' and table_name='official_data_feeds' and column_name='location')
)
select c.table_name, c.column_name, c.srid,
       s.auth_name, s.auth_srid, (s.srtext is not null) as srtext_present
from cols c
join public.spatial_ref_sys s on s.srid = c.srid;

grant select on public.v_spatial_columns_usage to authenticated;

-- 19) Explicit SRID linkage via generated columns + FK to spatial_ref_sys(srid)
do $$ begin
  -- profiles.location_srid
  if not exists (
    select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='location_srid'
  ) then
    alter table public.profiles add column location_srid int generated always as (st_srid(location::geometry)) stored;
  end if;
  if not exists (
    select 1 from information_schema.table_constraints where table_schema='public' and table_name='profiles' and constraint_name='profiles_location_srid_fkey'
  ) then
    alter table public.profiles add constraint profiles_location_srid_fkey foreign key (location_srid)
      references public.spatial_ref_sys(srid) on update no action on delete no action;
  end if;

  -- ocean_hazard_reports.location_srid
  if not exists (
    select 1 from information_schema.columns where table_schema='public' and table_name='ocean_hazard_reports' and column_name='location_srid'
  ) then
    alter table public.ocean_hazard_reports add column location_srid int generated always as (st_srid(location::geometry)) stored;
  end if;
  if not exists (
    select 1 from information_schema.table_constraints where table_schema='public' and table_name='ocean_hazard_reports' and constraint_name='ohr_location_srid_fkey'
  ) then
    alter table public.ocean_hazard_reports add constraint ohr_location_srid_fkey foreign key (location_srid)
      references public.spatial_ref_sys(srid) on update no action on delete no action;
  end if;

  -- social_media_feeds.location_srid
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='social_media_feeds' and column_name='location') then
    if not exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='social_media_feeds' and column_name='location_srid'
    ) then
      alter table public.social_media_feeds add column location_srid int generated always as (st_srid(location::geometry)) stored;
    end if;
    if not exists (
      select 1 from information_schema.table_constraints where table_schema='public' and table_name='social_media_feeds' and constraint_name='smf_location_srid_fkey'
    ) then
      alter table public.social_media_feeds add constraint smf_location_srid_fkey foreign key (location_srid)
        references public.spatial_ref_sys(srid) on update no action on delete no action;
    end if;
  end if;

  -- hazard_hotspots.center_srid
  if not exists (
    select 1 from information_schema.columns where table_schema='public' and table_name='hazard_hotspots' and column_name='center_srid'
  ) then
    alter table public.hazard_hotspots add column center_srid int generated always as (st_srid(center_location::geometry)) stored;
  end if;
  if not exists (
    select 1 from information_schema.table_constraints where table_schema='public' and table_name='hazard_hotspots' and constraint_name='hotspots_center_srid_fkey'
  ) then
    alter table public.hazard_hotspots add constraint hotspots_center_srid_fkey foreign key (center_srid)
      references public.spatial_ref_sys(srid) on update no action on delete no action;
  end if;

  -- hazard_hotspots_ml.center_srid
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='hazard_hotspots_ml') then
    if not exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='hazard_hotspots_ml' and column_name='center_srid'
    ) then
      alter table public.hazard_hotspots_ml add column center_srid int generated always as (st_srid(center_location::geometry)) stored;
    end if;
    if not exists (
      select 1 from information_schema.table_constraints where table_schema='public' and table_name='hazard_hotspots_ml' and constraint_name='hotspots_ml_center_srid_fkey'
    ) then
      alter table public.hazard_hotspots_ml add constraint hotspots_ml_center_srid_fkey foreign key (center_srid)
        references public.spatial_ref_sys(srid) on update no action on delete no action;
    end if;
  end if;

  -- official_data_feeds.location_srid
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='official_data_feeds' and column_name='location') then
    if not exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='official_data_feeds' and column_name='location_srid'
    ) then
      alter table public.official_data_feeds add column location_srid int generated always as (st_srid(location::geometry)) stored;
    end if;
    if not exists (
      select 1 from information_schema.table_constraints where table_schema='public' and table_name='official_data_feeds' and constraint_name='odf_location_srid_fkey'
    ) then
      alter table public.official_data_feeds add constraint odf_location_srid_fkey foreign key (location_srid)
        references public.spatial_ref_sys(srid) on update no action on delete no action;
    end if;
  end if;
end$$;


