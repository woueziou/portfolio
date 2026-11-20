-- ============================================================
-- Audit #61, point 3: writes limited to the owner
-- ============================================================
-- site_config and project_techstacks accepted writes from any authenticated
-- account (policy `true`). projects, articles and profiles were already scoped
-- to their owner. Now:
--   * project_techstacks: only the owner of the parent project.
--   * site_config (single shared row, no owner column): only an account that
--     owns a profile row, i.e. the portfolio owner.
--
-- Rollback: recreate the policies below with `using (true)` / `with check (true)`.

drop policy if exists project_techstacks_authenticated_insert on public.project_techstacks;
drop policy if exists project_techstacks_authenticated_update on public.project_techstacks;
drop policy if exists project_techstacks_authenticated_delete on public.project_techstacks;

create policy project_techstacks_owner_insert on public.project_techstacks
  for insert to authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = project_techstacks.project_id and p.user_id = (select auth.uid())
  ));

create policy project_techstacks_owner_update on public.project_techstacks
  for update to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_techstacks.project_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = project_techstacks.project_id and p.user_id = (select auth.uid())
  ));

create policy project_techstacks_owner_delete on public.project_techstacks
  for delete to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_techstacks.project_id and p.user_id = (select auth.uid())
  ));

drop policy if exists site_config_authenticated_insert on public.site_config;
drop policy if exists site_config_authenticated_update on public.site_config;

create policy site_config_owner_insert on public.site_config
  for insert to authenticated
  with check (exists (select 1 from public.profiles where id = (select auth.uid())));

create policy site_config_owner_update on public.site_config
  for update to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid())))
  with check (exists (select 1 from public.profiles where id = (select auth.uid())));
