-- ═══════════════════════════════════════════════════════════════
-- CodeStart FIEC · Avance 4 · Apoyo al panel docente
--
-- La fecha de "hoy" se pide a Postgres en lugar de crearla con
-- `new Date()` en un Server Component: Next lo marca como valor
-- inestable y el proyecto ya evita esa llamada en el render.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.fecha_actual()
returns date
language sql
stable
as $$
  select current_date;
$$;

grant execute on function public.fecha_actual() to authenticated, service_role;

create index if not exists idx_asignaciones_grupo_creado
  on public.asignaciones (grupo_id, creado_en desc);
