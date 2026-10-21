-- ═══════════════════════════════════════════════════════════════
-- CodeStart FIEC · Privilegios y proteccion del perfil
--
-- Dos cosas que no cubren las migraciones anteriores:
--
-- 1. Los GRANT por defecto de Supabase sobre el esquema public. Al
--    recrear el esquema (drop schema public cascade) se pierden, y sin
--    ellos ni anon ni authenticated ni service_role pueden tocar las
--    tablas. El RLS sigue siendo lo que decide que se ve: estos
--    GRANT solo quitan el "permission denied" antes de que el RLS
--    haga su trabajo.
--
-- 2. La escalada de privilegios por el campo rol. La politica de
--    actualizacion de perfiles deja que cada usuario actualice su
--    propia fila, y rol esta ahi. Sin proteccion, un estudiante
--    podria hacerse admin. El trigger lo cierra.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Privilegios sobre el esquema public ─────────────────────
grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables    in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;

-- para las tablas que se creen en el futuro
alter default privileges in schema public
  grant all on tables    to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to postgres, anon, authenticated, service_role;

-- ── 2. El rol y el id de un perfil no los cambia el propio usuario ──
create or replace function public.proteger_campos_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- el rol solo lo cambia quien ya es admin
  if not public.es_admin(auth.uid()) then
    new.rol := old.rol;
  end if;

  -- el id y la fecha de alta son inmutables siempre
  new.id        := old.id;
  new.creado_en := old.creado_en;

  return new;
end;
$$;

create trigger trg_proteger_campos_perfil
  before update on public.perfiles
  for each row execute function public.proteger_campos_perfil();
