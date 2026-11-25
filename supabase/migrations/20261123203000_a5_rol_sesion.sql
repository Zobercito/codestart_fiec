-- ═══════════════════════════════════════════════════════════════
-- A5 · Sincronización del rol entre `perfiles` y el JWT
--
-- El proxy lee el rol de `user_metadata` para elegir la pantalla de
-- inicio. `cambiar_rol()` solo actualizaba `perfiles.rol`, así que un
-- usuario promovido seguía llevando el rol viejo en el JWT y podía
-- acabar en un bucle /dashboard <-> /docente.
--
-- Esta migración:
--   1. Hace que `cambiar_rol` actualice también
--      `auth.users.raw_user_meta_data.rol`.
--   2. Rellena el metadato de todos los usuarios existentes a partir de
--      su perfil, para corregir los que ya estaban desfasados.
--
-- El proxy deja de bloquear rutas por rol (la DAL y el RLS siguen
-- siendo la frontera), así que un token antiguo tampoco puede provocar
-- el bucle. La sincronización es la que mantiene el routing correcto.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.cambiar_rol(
  p_usuario uuid,
  p_rol public.rol_usuario
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (
    public.es_admin(auth.uid())
    or coalesce(auth.role(), '') = 'service_role'
  ) then
    raise exception 'no autorizado para cambiar roles'
      using errcode = 'insufficient_privilege';
  end if;

  update public.perfiles
  set rol = p_rol
  where id = p_usuario;

  if not found then
    raise exception 'perfil no encontrado'
      using errcode = 'no_data_found';
  end if;

  -- El rol del JWT sale de este metadato. Sin esta línea, un usuario
  -- promovido sigue viendo el rol anterior hasta que se toque el token.
  update auth.users
  set raw_user_meta_data =
    coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('rol', p_rol::text)
  where id = p_usuario;

  if not found then
    raise exception 'usuario de auth no encontrado'
      using errcode = 'no_data_found';
  end if;
end;
$$;

revoke all on function public.cambiar_rol(uuid, public.rol_usuario)
  from public, anon;
grant execute on function public.cambiar_rol(uuid, public.rol_usuario)
  to authenticated, service_role;

-- Backfill: corrige los perfiles que ya existían antes de esta migración.
update auth.users u
set raw_user_meta_data =
  coalesce(u.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('rol', p.rol::text)
from public.perfiles p
where p.id = u.id
  and coalesce(u.raw_user_meta_data ->> 'rol', '') is distinct from p.rol::text;
