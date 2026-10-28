-- ═══════════════════════════════════════════════════════════════
-- CodeStart FIEC · Avance 4 · Insignias automáticas
--
-- Las insignias las otorga el sistema, no el estudiante. La función es
-- SECURITY DEFINER porque la política de escritura de `insignias` solo
-- permite al admin: el trigger necesita insertar sin abrir la tabla.
--
-- Tipos:
--   primer_reto       primer intento con acierto
--   modulo_1..8       todas las lecciones del módulo completadas
--   curso             todos los módulos con lecciones completados
-- ═══════════════════════════════════════════════════════════════

create or replace function public.otorgar_insignias_por_progreso()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_modulo_id              uuid;
  v_modulo_orden           int;
  v_total                  int;
  v_completadas            int;
  v_modulos_con_lecciones  int;
  v_modulos_completados    int;
begin
  -- Solo interesa cuando la lección queda completada.
  if new.estado <> 'completado' then
    return new;
  end if;

  select l.modulo_id into v_modulo_id
  from public.lecciones l
  where l.id = new.leccion_id;

  if v_modulo_id is null then
    return new;
  end if;

  select m.orden into v_modulo_orden
  from public.modulos m
  where m.id = v_modulo_id;

  select count(*)::int into v_total
  from public.lecciones l
  where l.modulo_id = v_modulo_id;

  select count(*)::int into v_completadas
  from public.lecciones l
  join public.progresos p
    on p.leccion_id = l.id
   and p.usuario_id = new.usuario_id
   and p.estado = 'completado'
  where l.modulo_id = v_modulo_id;

  if v_total > 0 and v_completadas >= v_total then
    insert into public.insignias (usuario_id, tipo, descripcion)
    values (
      new.usuario_id,
      'modulo_' || v_modulo_orden,
      'Módulo ' || v_modulo_orden || ' completado'
    )
    on conflict (usuario_id, tipo) do nothing;
  end if;

  -- Curso completo: todos los módulos que ya tienen lecciones están
  -- completos. Si un módulo aún no tiene contenido, no cuenta para el
  -- denominador, pero tampoco se puede completar.
  select count(*)::int into v_modulos_con_lecciones
  from public.modulos m
  where exists (
    select 1 from public.lecciones l where l.modulo_id = m.id
  );

  select count(*)::int into v_modulos_completados
  from public.modulos m
  where exists (
    select 1 from public.lecciones l where l.modulo_id = m.id
  )
  and not exists (
    select 1
    from public.lecciones l
    where l.modulo_id = m.id
      and not exists (
        select 1
        from public.progresos p
        where p.usuario_id = new.usuario_id
          and p.leccion_id = l.id
          and p.estado = 'completado'
      )
  );

  if v_modulos_con_lecciones > 0
     and v_modulos_completados = v_modulos_con_lecciones then
    insert into public.insignias (usuario_id, tipo, descripcion)
    values (new.usuario_id, 'curso', 'Curso completado')
    on conflict (usuario_id, tipo) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_otorgar_insignias_progreso on public.progresos;
create trigger trg_otorgar_insignias_progreso
  after insert or update of estado on public.progresos
  for each row execute function public.otorgar_insignias_por_progreso();

create or replace function public.otorgar_insignia_primer_reto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.acierto then
    insert into public.insignias (usuario_id, tipo, descripcion)
    values (new.usuario_id, 'primer_reto', 'Primer reto aprobado')
    on conflict (usuario_id, tipo) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_otorgar_insignia_primer_reto on public.intentos;
create trigger trg_otorgar_insignia_primer_reto
  after insert on public.intentos
  for each row execute function public.otorgar_insignia_primer_reto();
