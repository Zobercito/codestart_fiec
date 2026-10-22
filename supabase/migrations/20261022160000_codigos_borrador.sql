-- ═══════════════════════════════════════════════════════════════
-- CodeStart FIEC · Borrador de codigo por reto (RF11)
--
-- El RF11 pide "guardado automatico del avance y del ultimo codigo
-- escrito en cada reto para retomarlo despues". Los intentos ya
-- guardan el codigo entregado, pero no el que se esta escribiendo:
-- hace falta una tabla aparte para el borrador.
-- ═══════════════════════════════════════════════════════════════

create table public.codigos (
  id             uuid primary key default gen_random_uuid(),
  usuario_id     uuid not null references public.perfiles (id) on delete cascade,
  reto_id        uuid not null references public.retos (id) on delete cascade,
  codigo         text not null default '',
  pistas_usadas  int not null default 0,
  actualizado_en timestamptz not null default now(),
  unique (usuario_id, reto_id)
);

create index idx_codigos_usuario on public.codigos (usuario_id);

comment on table public.codigos is
  'Borrador: el codigo que el estudiante esta escribiendo ahora mismo, para no perderlo.';

alter table public.codigos enable row level security;

-- Cada uno ve y edita su propio borrador, y nada mas.
create policy codigos_select on public.codigos
  for select using (usuario_id = (select auth.uid()));

create policy codigos_insert on public.codigos
  for insert with check (usuario_id = (select auth.uid()));

create policy codigos_update on public.codigos
  for update using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy codigos_delete on public.codigos
  for delete using (usuario_id = (select auth.uid()));
