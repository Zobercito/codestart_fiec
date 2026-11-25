-- ═══════════════════════════════════════════════════════════════
-- A5 · Fecha del curso en la zona de Panamá
--
-- `current_date` usa la zona del servidor de Postgres (UTC en Supabase).
-- A partir de las 19:00 de Panamá ya es el día siguiente, así que una
-- asignación con entrega "hoy" aparecía vencida y el formulario no
-- dejaba elegir la fecha de hoy.
--
-- `fecha_actual()` pasa a devolver el día en America/Panama. El resto
-- del panel compara cadenas ISO contra ese valor.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.fecha_actual()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Panama')::date;
$$;

comment on function public.fecha_actual() is
  'Fecha de hoy en America/Panama, para comparar fechas de entrega del curso.';

grant execute on function public.fecha_actual() to authenticated, service_role;
