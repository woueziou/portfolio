-- ============================================================
-- Epic #17 (Performance) — #47: detect failed Deploy Hook calls
-- ============================================================
-- The first version of rebuild_fire_if_due() cleared pending_at as soon as the
-- HTTP call was queued, so a revoked hook or a 4xx/5xx went unnoticed and the
-- rebuild was lost. Now the request id is remembered; on the next run the
-- response is read from net._http_response. A non-2xx answer (or a network
-- error) keeps the rebuild pending so it is retried (3 attempts), and every
-- failure is logged as a Postgres warning (Supabase logs, Postgres source).
--
-- Rollback: re-apply the function body from 20261119110000_rebuild_debounce_queue.sql
-- and drop the two added columns.

alter table public.rebuild_state
  add column if not exists last_request_id bigint,
  add column if not exists attempts int not null default 0;

create or replace function public.rebuild_fire_if_due()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pending timestamptz;
  v_req bigint;
  v_attempts int;
  v_status int;
  v_err text;
  v_found boolean;
  v_url text;
begin
  select pending_at, last_request_id, attempts
    into v_pending, v_req, v_attempts
  from public.rebuild_state
  where id = 1
  for update;

  -- 1. Check the outcome of the previous call, once its response is available.
  if v_req is not null then
    select true, r.status_code, r.error_msg
      into v_found, v_status, v_err
    from net._http_response r
    where r.id = v_req;

    if coalesce(v_found, false) then
      if v_status is null or v_status not between 200 and 299 then
        raise warning 'rebuild: Deploy Hook call % failed (status %, error %), attempt % of 3',
          v_req, coalesce(v_status::text, 'none'), coalesce(v_err, 'none'), v_attempts + 1;

        if v_attempts + 1 < 3 then
          -- keep it pending: retried by the debounce below on a later run
          update public.rebuild_state
          set pending_at = coalesce(pending_at, now() - interval '60 seconds'),
              attempts = v_attempts + 1,
              last_request_id = null
          where id = 1;
        else
          raise warning 'rebuild: giving up after 3 failed Deploy Hook calls, check the hook in Vercel';
          update public.rebuild_state
          set attempts = 0, last_request_id = null
          where id = 1;
        end if;
        v_pending := coalesce(v_pending, now() - interval '60 seconds');
      else
        update public.rebuild_state set attempts = 0, last_request_id = null where id = 1;
      end if;
      v_req := null;
    end if;
  end if;

  -- 2. Fire when edits have settled for 60 s.
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

  update public.rebuild_state
  set pending_at = null,
      last_triggered_at = now(),
      last_request_id = net.http_post(url := v_url)
  where id = 1;
end;
$$;

revoke execute on function public.rebuild_fire_if_due() from public, anon, authenticated;
