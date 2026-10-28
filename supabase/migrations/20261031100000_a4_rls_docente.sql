-- ═══════════════════════════════════════════════════════════════
-- A4 · RLS: solo un docente (o un admin) crea y edita grupos
--
-- La política original comprobaba `docente_id = auth.uid()`, pero no
-- el rol. Un estudiante podía crear un grupo poniéndose como docente
-- y luego usar ese grupo para asignaciones. No le daba acceso a datos
-- de otros, pero rompía el modelo de roles.
--
-- Se añade `es_docente` y se exige en las escrituras de grupos y
-- asignaciones. El admin sigue pasando por `es_admin`.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.es_docente(usuario uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = usuario and rol in ('docente', 'admin')
  );
$$;

drop policy if exists grupos_select on public.grupos;
create policy grupos_select on public.grupos
  for select using (
    (docente_id = (select auth.uid()) and public.es_docente((select auth.uid())))
    or public.es_admin((select auth.uid()))
    or public.es_miembro_de(id, (select auth.uid()))
  );

drop policy if exists grupos_insert on public.grupos;
create policy grupos_insert on public.grupos
  for insert with check (
    (
      docente_id = (select auth.uid())
      and public.es_docente((select auth.uid()))
    )
    or public.es_admin((select auth.uid()))
  );

drop policy if exists grupos_update on public.grupos;
create policy grupos_update on public.grupos
  for update using (
    (
      docente_id = (select auth.uid())
      and public.es_docente((select auth.uid()))
    )
    or public.es_admin((select auth.uid()))
  ) with check (
    (
      docente_id = (select auth.uid())
      and public.es_docente((select auth.uid()))
    )
    or public.es_admin((select auth.uid()))
  );

drop policy if exists asignaciones_write on public.asignaciones;
create policy asignaciones_write on public.asignaciones
  for all using (
    public.es_admin((select auth.uid()))
    or (
      public.es_docente((select auth.uid()))
      and public.es_docente_de(grupo_id, (select auth.uid()))
    )
  ) with check (
    public.es_admin((select auth.uid()))
    or (
      public.es_docente((select auth.uid()))
      and public.es_docente_de(grupo_id, (select auth.uid()))
    )
  );
