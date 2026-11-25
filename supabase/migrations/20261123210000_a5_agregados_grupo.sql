-- ═══════════════════════════════════════════════════════════════
-- A5 · Agregados del grupo para el panel docente (RNF08)
--
-- El panel necesita, por estudiante, cuántos intentos hay, cuántos
-- acertó y cuál fue el último. Antes se traían todos los `intentos` con
-- `reto → leccion → modulo` anidado y se agregaban en Node. Con un grupo
-- grande eso crece sin límite.
--
-- Estas dos funciones devuelven solo el resultado agregado y son
-- `SECURITY INVOKER`: el RLS de `intentos` sigue aplicando, así que un
-- docente solo ve los intentos de sus estudiantes.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.agregados_intentos_grupo(p_alumnos uuid[])
returns table (
  usuario_id uuid,
  total bigint,
  aciertos bigint,
  ultimo_reto uuid,
  ultima_fecha timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    i.usuario_id,
    count(*)::bigint,
    count(*) filter (where i.acierto)::bigint,
    (array_agg(i.reto_id order by i.fecha desc))[1],
    max(i.fecha)
  from public.intentos i
  where i.usuario_id = any(p_alumnos)
  group by i.usuario_id;
$$;

comment on function public.agregados_intentos_grupo(uuid[]) is
  'Totales de intentos y aciertos por estudiante, sin traer las filas. RLS aplica (security invoker).';

grant execute on function public.agregados_intentos_grupo(uuid[])
  to authenticated, service_role;

create or replace function public.aciertos_reto_grupo(p_alumnos uuid[])
returns table (usuario_id uuid, reto_id uuid)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct i.usuario_id, i.reto_id
  from public.intentos i
  where i.usuario_id = any(p_alumnos)
    and i.acierto;
$$;

comment on function public.aciertos_reto_grupo(uuid[]) is
  'Retos aprobados por estudiante, para calcular asignaciones. RLS aplica (security invoker).';

grant execute on function public.aciertos_reto_grupo(uuid[])
  to authenticated, service_role;
