-- ═══════════════════════════════════════════════════════════════
-- CodeStart FIEC · Avance 4 · Privacidad y cierre de F09
--
-- 1. El alta pública crea SIEMPRE un estudiante. El rol que llegue en
--    user_metadata es solo una pista para el JWT, no una autorización.
--    Un signUp directo con `rol: admin` ya no crea un administrador.
--
-- 2. El script de usuarios (service_role) sí puede asignar roles. Para
--    eso se permite el cambio cuando el JWT es service_role y se ofrece
--    una RPC explícita, `cambiar_rol`, que también valida al admin.
--
-- 3. RNF09: se guarda si el usuario aceptó el aviso de privacidad y
--    cuándo lo hizo. Los usuarios existentes quedan en false hasta que
--    acepten desde el dashboard; no se les atribuye una aceptación que
--    no dieron.
-- ═══════════════════════════════════════════════════════════════

alter table public.perfiles
  add column if not exists acepta_privacidad boolean not null default false,
  add column if not exists fecha_aceptacion timestamptz;

comment on column public.perfiles.acepta_privacidad is
  'El usuario aceptó el aviso de privacidad (RNF09).';
comment on column public.perfiles.fecha_aceptacion is
  'Momento en que aceptó el aviso; null si aún no lo ha hecho.';

-- ── Alta: rol fijo y aceptación de privacidad ─────────────────
create or replace function public.crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_acepta boolean;
begin
  v_acepta := lower(
    coalesce(new.raw_user_meta_data ->> 'acepta_privacidad', 'false')
  ) in ('true', 't', '1', 'on');

  insert into public.perfiles (
    id, nombre, correo, rol, acepta_privacidad, fecha_aceptacion
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email,
    -- El alta pública nunca crea docentes ni admins.
    'estudiante'::public.rol_usuario,
    v_acepta,
    case when v_acepta then now() else null end
  );

  return new;
end;
$$;

-- ── Protección del rol en updates ─────────────────────────────
create or replace function public.proteger_campos_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- El rol solo lo cambia un admin o el service_role. El segundo caso
  -- es el que usa scripts/crear-usuarios.mjs para preparar docentes.
  if not (
    public.es_admin(auth.uid())
    or coalesce(auth.role(), '') = 'service_role'
  ) then
    new.rol := old.rol;
  end if;

  -- El id y la fecha de alta son inmutables siempre.
  new.id        := old.id;
  new.creado_en := old.creado_en;

  return new;
end;
$$;

-- ── RPC explícita para asignar un rol ─────────────────────────
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
end;
$$;

revoke all on function public.cambiar_rol(uuid, public.rol_usuario)
  from public, anon;
grant execute on function public.cambiar_rol(uuid, public.rol_usuario)
  to authenticated, service_role;
