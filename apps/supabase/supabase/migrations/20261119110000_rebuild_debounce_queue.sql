-- ============================================================
-- Epic #17 (Performance) — #24: debounced site rebuild
-- ============================================================
-- The site is prerendered, so content edits made in the admin must trigger a
-- Vercel build. Triggers on the content tables stamp `rebuild_state.pending_at`;
-- a pg_cron job runs every minute and, once nothing has changed for 60 s, calls
-- the Vercel Deploy Hook through pg_net. A burst of edits (the admin issues
-- several writes per save) therefore produces a single build.
--
-- The Deploy Hook URL is a secret: it lives in Supabase Vault under the name
-- `vercel_deploy_hook_url` and is NOT part of this migration. Create it once:
--   select vault.create_secret('<hook url>', 'vercel_deploy_hook_url', 'Vercel deploy hook');
-- Until it exists, pending rebuilds are kept and a warning is logged.
--
-- Rollback:
--   select cron.unschedule('rebuild-if-due');
--   select cron.unschedule('rebuild-weekly');
--   drop trigger if exists rebuild_projects on public.projects; (same for the other tables)
--   drop function if exists public.rebuild_mark_pending(), public.rebuild_fire_if_due();
--   drop table if exists public.rebuild_state;

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- --- State: a single row ---
create table if not exists public.rebuild_state (
  id int primary key default 1 check (id = 1),
  pending_at timestamptz,
  last_triggered_at timestamptz
);

insert into public.rebuild_state (id) values (1) on conflict (id) do nothing;

alter table public.rebuild_state enable row level security;
revoke all on public.rebuild_state from anon, authenticated;

-- --- Trigger function: mark a rebuild as pending ---
-- Draft edits must not trigger builds: for projects, articles and
-- project_techstacks only changes that touch published content count.
create or replace function public.rebuild_mark_pending()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_relevant boolean := true;
begin
  if tg_table_name = 'projects' then
    v_relevant := coalesce(old.publication_status::text, '') = 'published'
               or coalesce(new.publication_status::text, '') = 'published';
  elsif tg_table_name = 'articles' then
    v_relevant := coalesce(old.status::text, '') = 'published'
               or coalesce(new.status::text, '') = 'published';
  elsif tg_table_name = 'project_techstacks' then
    v_relevant := exists (
      select 1 from public.projects p
      where p.id = coalesce(new.project_id, old.project_id)
        and p.publication_status::text = 'published'
    );
  end if;

  if v_relevant then
    update public.rebuild_state set pending_at = now() where id = 1;
  end if;

  return null;
end;
$$;

revoke execute on function public.rebuild_mark_pending() from public, anon, authenticated;

-- Row-level triggers where the published status matters
drop trigger if exists rebuild_projects on public.projects;
create trigger rebuild_projects
  after insert or update or delete on public.projects
  for each row execute function public.rebuild_mark_pending();

drop trigger if exists rebuild_articles on public.articles;
create trigger rebuild_articles
  after insert or update or delete on public.articles
  for each row execute function public.rebuild_mark_pending();

drop trigger if exists rebuild_project_techstacks on public.project_techstacks;
create trigger rebuild_project_techstacks
  after insert or update or delete on public.project_techstacks
  for each row execute function public.rebuild_mark_pending();

-- Statement-level triggers for small, always-public tables
drop trigger if exists rebuild_techstacks on public.techstacks;
create trigger rebuild_techstacks
  after insert or update or delete on public.techstacks
  for each statement execute function public.rebuild_mark_pending();

drop trigger if exists rebuild_profiles on public.profiles;
create trigger rebuild_profiles
  after insert or update or delete on public.profiles
  for each statement execute function public.rebuild_mark_pending();

drop trigger if exists rebuild_site_config on public.site_config;
create trigger rebuild_site_config
  after insert or update or delete on public.site_config
  for each statement execute function public.rebuild_mark_pending();

-- --- Debounce worker: fire the Deploy Hook once edits have settled ---
create or replace function public.rebuild_fire_if_due()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pending timestamptz;
  v_url text;
begin
  select pending_at into v_pending
  from public.rebuild_state
  where id = 1
  for update;

  if v_pending is null or v_pending > now() - interval '60 seconds' then
    return;
  end if;

  select decrypted_secret into v_url
  from vault.decrypted_secrets
  where name = 'vercel_deploy_hook_url'
  limit 1;

  if v_url is null then
    raise warning 'rebuild: Vault secret vercel_deploy_hook_url is missing, rebuild kept pending';
    return;
  end if;

  perform net.http_post(url := v_url);

  update public.rebuild_state
  set pending_at = null, last_triggered_at = now()
  where id = 1;
end;
$$;

revoke execute on function public.rebuild_fire_if_due() from public, anon, authenticated;

-- --- Schedules ---
-- Every minute: fire if the last change is older than 60 s.
select cron.unschedule('rebuild-if-due')
where exists (select 1 from cron.job where jobname = 'rebuild-if-due');

select cron.schedule('rebuild-if-due', '* * * * *', $$select public.rebuild_fire_if_due()$$);

-- Weekly rebuild (Monday 05:00 UTC) so values computed at build time (years of
-- experience) never go stale. It only stamps the queue; the job above fires it.
select cron.unschedule('rebuild-weekly')
where exists (select 1 from cron.job where jobname = 'rebuild-weekly');

select cron.schedule(
  'rebuild-weekly',
  '0 5 * * 1',
  $$update public.rebuild_state set pending_at = now() - interval '2 minutes' where id = 1$$
);
