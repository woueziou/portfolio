-- ============================================================
-- Epic #20 — #35: case-study fields and featured ordering for projects
-- ============================================================
-- Project pages were a sentence and badges. These columns hold the case study
-- (problem, role, technical choices, outcome, screenshots) and let the home
-- page pin the strongest projects first.
--
-- All columns are optional or defaulted, so existing rows and the admin keep
-- working unchanged. Rollback:
--   alter table public.projects
--     drop column problem, drop column role, drop column tech_choices,
--     drop column outcome, drop column screenshots,
--     drop column featured, drop column sort_order;

alter table public.projects
  add column if not exists problem text,
  add column if not exists role text,
  add column if not exists tech_choices text,
  add column if not exists outcome text,
  add column if not exists screenshots text[] not null default '{}',
  add column if not exists featured boolean not null default false,
  add column if not exists sort_order integer not null default 0;

comment on column public.projects.problem is 'Case study: the problem the project solves';
comment on column public.projects.role is 'Case study: my role and scope';
comment on column public.projects.tech_choices is 'Case study: technical choices and why';
comment on column public.projects.outcome is 'Case study: result, with figures when possible';
comment on column public.projects.screenshots is 'Case study: screenshot URLs, shown in order';
comment on column public.projects.featured is 'Pinned first on the home page';
comment on column public.projects.sort_order is 'Order among featured projects (ascending)';
