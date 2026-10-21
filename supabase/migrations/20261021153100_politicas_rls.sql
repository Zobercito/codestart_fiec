-- ═══════════════════════════════════════════════════════════════
-- CodeStart FIEC · Politicas RLS
--
-- La autorizacion se resuelve aqui, no en la aplicacion (RNF03):
-- un cliente que manipule la consulta no puede leer lo que no le toca.
--
-- Reglas por rol
--   estudiante  solo lo suyo
--   docente     lo suyo + los grupos que le pertenecen
--   admin       todo
--
-- Cada politica se apoya en las funciones de public.es_admin,
-- public.es_docente_de y public.es_miembro_de, que son SECURITY
-- DEFINER para no dispararse a si mismas.
-- ═══════════════════════════════════════════════════════════════

alter table public.perfiles     enable row level security;
alter table public.grupos       enable row level security;
alter table public.inscripciones enable row level security;
alter table public.modulos      enable row level security;
alter table public.lecciones     enable row level security;
alter table public.retos         enable row level security;
alter table public.asignaciones  enable row level security;
alter table public.progresos     enable row level security;
alter table public.intentos      enable row level security;
alter table public.insignias     enable row level security;

-- ── perfiles ───────────────────────────────────────────────────
-- El estudiante ve su perfil; el docente ve los de su grupo;
-- el admin ve todos.
create policy perfiles_select on public.perfiles
  for select using (
    id = (select auth.uid())
    or public.es_admin((select auth.uid()))
    or exists (
      select 1
      from public.inscripciones i
      join public.grupos g on g.id = i.grupo_id
      where i.usuario_id = perfiles.id
        and g.docente_id = (select auth.uid())
    )
  );

create policy perfiles_update on public.perfiles
  for update using (
    id = (select auth.uid()) or public.es_admin((select auth.uid()))
  ) with check (
    id = (select auth.uid()) or public.es_admin((select auth.uid()))
  );

-- El alta la hace el trigger; solo el admin puede crear a mano.
create policy perfiles_insert_admin on public.perfiles
  for insert with check (public.es_admin((select auth.uid())));

-- ── grupos ─────────────────────────────────────────────────────
create policy grupos_select on public.grupos
  for select using (
    docente_id = (select auth.uid())
    or public.es_admin((select auth.uid()))
    or public.es_miembro_de(id, (select auth.uid()))
  );

create policy grupos_insert on public.grupos
  for insert with check (
    docente_id = (select auth.uid()) or public.es_admin((select auth.uid()))
  );

create policy grupos_update on public.grupos
  for update using (
    docente_id = (select auth.uid()) or public.es_admin((select auth.uid()))
  ) with check (
    docente_id = (select auth.uid()) or public.es_admin((select auth.uid()))
  );

-- ── inscripciones ──────────────────────────────────────────────
-- El alta no se permite por INSERT directo: se hace con la funcion
-- unirse_por_codigo, que valida el codigo del grupo.
create policy inscripciones_select on public.inscripciones
  for select using (
    usuario_id = (select auth.uid())
    or public.es_admin((select auth.uid()))
    or public.es_docente_de(grupo_id, (select auth.uid()))
  );

create policy inscripciones_delete on public.inscripciones
  for delete using (
    public.es_admin((select auth.uid()))
    or public.es_docente_de(grupo_id, (select auth.uid()))
  );

-- ── contenido (modulos, lecciones, retos) ─────────────────────
-- El contenido del curso lo puede leer cualquier usuario autenticado:
-- un modulo puede estar abierto aunque aun no se haya hecho.
create policy modulos_select on public.modulos
  for select using (auth.uid() is not null);
create policy modulos_write on public.modulos
  for all using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

create policy lecciones_select on public.lecciones
  for select using (auth.uid() is not null);
create policy lecciones_write on public.lecciones
  for all using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

create policy retos_select on public.retos
  for select using (auth.uid() is not null);
create policy retos_write on public.retos
  for all using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- ── asignaciones ───────────────────────────────────────────────
create policy asignaciones_select on public.asignaciones
  for select using (
    public.es_admin((select auth.uid()))
    or public.es_docente_de(grupo_id, (select auth.uid()))
    or public.es_miembro_de(grupo_id, (select auth.uid()))
  );

create policy asignaciones_write on public.asignaciones
  for all using (
    public.es_admin((select auth.uid()))
    or public.es_docente_de(grupo_id, (select auth.uid()))
  ) with check (
    public.es_admin((select auth.uid()))
    or public.es_docente_de(grupo_id, (select auth.uid()))
  );

-- ── progresos ──────────────────────────────────────────────────
create policy progresos_select on public.progresos
  for select using (
    usuario_id = (select auth.uid())
    or public.es_admin((select auth.uid()))
    or exists (
      select 1
      from public.inscripciones i
      join public.grupos g on g.id = i.grupo_id
      where i.usuario_id = progresos.usuario_id
        and g.docente_id = (select auth.uid())
    )
  );

create policy progresos_write on public.progresos
  for all using (
    usuario_id = (select auth.uid()) or public.es_admin((select auth.uid()))
  ) with check (
    usuario_id = (select auth.uid()) or public.es_admin((select auth.uid()))
  );

-- ── intentos ───────────────────────────────────────────────────
-- El estudiante ve sus intentos; el docente, los de los estudiantes
-- de su grupo. Esta es la consulta que sostiene el RF15.
create policy intentos_select on public.intentos
  for select using (
    usuario_id = (select auth.uid())
    or public.es_admin((select auth.uid()))
    or exists (
      select 1
      from public.inscripciones i
      join public.grupos g on g.id = i.grupo_id
      where i.usuario_id = intentos.usuario_id
        and g.docente_id = (select auth.uid())
    )
  );

create policy intentos_insert on public.intentos
  for insert with check (
    usuario_id = (select auth.uid()) or public.es_admin((select auth.uid()))
  );

-- ── insignias ──────────────────────────────────────────────────
create policy insignias_select on public.insignias
  for select using (
    usuario_id = (select auth.uid())
    or public.es_admin((select auth.uid()))
    or exists (
      select 1
      from public.inscripciones i
      join public.grupos g on g.id = i.grupo_id
      where i.usuario_id = insignias.usuario_id
        and g.docente_id = (select auth.uid())
    )
  );

-- Las insignias las otorga el sistema al completar un modulo, no el
-- estudiante: la escritura pasa por una funcion SECURITY DEFINER.
create policy insignias_write on public.insignias
  for all using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- ═══════════════════════════════════════════════════════════════
-- Unirse a un grupo con codigo (RF12)
--
-- Se hace con una funcion y no con un INSERT abierto: el codigo se
-- valida aqui y la inscripcion queda ligada al usuario que llama.
-- ═══════════════════════════════════════════════════════════════
create or replace function public.unirse_por_codigo(codigo text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  grupo uuid;
begin
  select g.id into grupo
  from public.grupos g
  where g.codigo_inscripcion = upper(trim(codigo))
    and exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'estudiante'
    );

  if grupo is null then
    raise exception 'codigo de inscripcion invalido'
      using errcode = 'no_data_found';
  end if;

  insert into public.inscripciones (usuario_id, grupo_id)
  values (auth.uid(), grupo)
  on conflict (usuario_id, grupo_id) do nothing;

  return grupo;
end;
$$;

grant execute on function public.unirse_por_codigo(text) to authenticated;
