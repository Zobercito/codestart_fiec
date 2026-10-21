-- ═══════════════════════════════════════════════════════════════
-- CodeStart FIEC · Avance 3 · Esquema inicial
--
-- Modelo de datos de la seccion 16.1 del Avance 1.
--
-- El ODT lista 8 entidades agrupando "modulo y leccion" en una sola.
-- Aqui se separan en dos tablas: el modulo es la unidad del curso y la
-- leccion es la unidad de progreso y de contenido interactivo (un
-- modulo tiene varias lecciones).
--
-- Decisiones de seguridad:
--   - RLS activo en todas las tablas (RNF03).
--   - La autorizacion vive en la base de datos, no en la aplicacion:
--     el cliente nunca decide que puede ver.
--   - El docente solo alcanza los grupos que le pertenecen.
--   - El estudiante solo alcanza lo suyo.
-- ═══════════════════════════════════════════════════════════════

-- ── Tipos enumerados ───────────────────────────────────────────
create type public.rol_usuario as enum ('estudiante', 'docente', 'admin');
create type public.tipo_reto as enum (
  'seleccion_multiple', 'ordenamiento', 'autocompletado', 'codigo'
);
create type public.estado_progreso as enum (
  'pendiente', 'en_progreso', 'completado', 'atrasado'
);

-- ── perfiles (Usuario) ──────────────────────────────────────────
create table public.perfiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null,
  correo      text not null,
  rol         public.rol_usuario not null default 'estudiante',
  creado_en   timestamptz not null default now()
);

comment on table public.perfiles is
  'Usuario de la plataforma. El id coincide con auth.users: el perfil lo crea el trigger de alta.';

-- ── grupos ─────────────────────────────────────────────────────
create table public.grupos (
  id                 uuid primary key default gen_random_uuid(),
  nombre             text not null,
  codigo_inscripcion text not null unique,
  docente_id         uuid not null references public.perfiles (id) on delete restrict,
  periodo_inicio     date,
  periodo_fin        date,
  creado_en          timestamptz not null default now()
);

comment on column public.grupos.codigo_inscripcion is
  'Codigo con el que el estudiante se une al grupo. Se comparte por el canal que use el docente.';

-- ── inscripciones ──────────────────────────────────────────────
create table public.inscripciones (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  grupo_id   uuid not null references public.grupos (id) on delete cascade,
  fecha      timestamptz not null default now(),
  unique (usuario_id, grupo_id)
);

-- ── modulos y lecciones (contenido) ────────────────────────────
create table public.modulos (
  id                uuid primary key default gen_random_uuid(),
  titulo            text not null,
  orden             int not null unique,
  descripcion       text,
  archivo_contenido text not null,
  creado_en         timestamptz not null default now()
);

comment on column public.modulos.archivo_contenido is
  'Ruta del archivo MDX del modulo, versionada en el repositorio (seccion 15.1).';

create table public.lecciones (
  id                uuid primary key default gen_random_uuid(),
  modulo_id         uuid not null references public.modulos (id) on delete cascade,
  titulo            text not null,
  orden             int not null,
  archivo_contenido text not null,
  duracion_min      int,
  unique (modulo_id, orden)
);

-- ── retos ──────────────────────────────────────────────────────
create table public.retos (
  id                 uuid primary key default gen_random_uuid(),
  leccion_id         uuid not null references public.lecciones (id) on delete cascade,
  tipo               public.tipo_reto not null,
  enunciado          text not null,
  enunciado_detalle  text,
  -- reglas y casos de prueba: el ODT los pide en JSONB precisamente
  -- para que el motor de validacion no dependa del lenguaje (15.3)
  reglas             jsonb not null default '{}'::jsonb,
  casos              jsonb not null default '[]'::jsonb,
  pistas             jsonb not null default '[]'::jsonb,
  puntos             int not null default 100,
  intentos_maximos   int not null default 3,
  orden              int not null default 1,
  creado_en          timestamptz not null default now()
);

comment on column public.retos.reglas is
  'Reglas de validacion declarativas. El motor las aplica sobre el AST del codigo del estudiante.';

-- ── asignaciones ───────────────────────────────────────────────
create table public.asignaciones (
  id            uuid primary key default gen_random_uuid(),
  grupo_id      uuid not null references public.grupos (id) on delete cascade,
  modulo_id     uuid references public.modulos (id) on delete cascade,
  reto_id       uuid references public.retos (id) on delete cascade,
  descripcion   text,
  fecha_entrega date not null,
  creada_por    uuid not null references public.perfiles (id),
  creado_en     timestamptz not null default now(),
  -- exactamente un destino: un modulo o un reto
  check (num_nonnulls (modulo_id, reto_id) = 1)
);

-- ── progresos ──────────────────────────────────────────────────
create table public.progresos (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references public.perfiles (id) on delete cascade,
  leccion_id  uuid not null references public.lecciones (id) on delete cascade,
  estado      public.estado_progreso not null default 'pendiente',
  fecha       timestamptz not null default now(),
  unique (usuario_id, leccion_id)
);

-- ── intentos ───────────────────────────────────────────────────
-- La tabla que sostiene el RF15: guarda el codigo enviado y el error
-- detectado, para que el docente vea en que fallo cada estudiante.
create table public.intentos (
  id                uuid primary key default gen_random_uuid(),
  usuario_id        uuid not null references public.perfiles (id) on delete cascade,
  reto_id           uuid not null references public.retos (id) on delete cascade,
  respuesta         text,
  codigo_enviado    text,
  resultado         jsonb not null default '{}'::jsonb,
  error_detectado   text,
  acierto           boolean not null default false,
  puntos_obtenidos  int not null default 0,
  fecha             timestamptz not null default now()
);

comment on column public.intentos.error_detectado is
  'Error clasificado por el analizador, en texto legible para el estudiante. Es lo que el panel docente agrega como patron de error.';

-- ── insignias ──────────────────────────────────────────────────
create table public.insignias (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references public.perfiles (id) on delete cascade,
  tipo        text not null,
  descripcion text,
  fecha       timestamptz not null default now(),
  unique (usuario_id, tipo)
);

-- ── Funciones de apoyo (SECURITY DEFINER: evitan la recursion de RLS) ─
-- Las de lectura se marcan STABLE y se cachean dentro de la misma consulta.
create or replace function public.es_admin(usuario uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = usuario and rol = 'admin'
  );
$$;

create or replace function public.es_docente_de(grupo uuid, usuario uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.grupos
    where id = grupo and docente_id = usuario
  );
$$;

create or replace function public.es_miembro_de(grupo uuid, usuario uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.es_docente_de(grupo, usuario)
      or exists (
        select 1 from public.inscripciones
        where grupo_id = grupo and usuario_id = usuario
      );
$$;

-- ═══════════════════════════════════════════════════════════════
-- Indices
-- ═══════════════════════════════════════════════════════════════
create index idx_inscripciones_grupo    on public.inscripciones (grupo_id);
create index idx_inscripciones_usuario  on public.inscripciones (usuario_id);
create index idx_lecciones_modulo        on public.lecciones (modulo_id, orden);
create index idx_retos_leccion           on public.retos (leccion_id, orden);
create index idx_asignaciones_grupo     on public.asignaciones (grupo_id, fecha_entrega);
create index idx_progresos_usuario       on public.progresos (usuario_id);
create index idx_progresos_leccion       on public.progresos (leccion_id);
create index idx_intentos_usuario_reto  on public.intentos (usuario_id, reto_id);
create index idx_intentos_reto_fecha    on public.intentos (reto_id, fecha desc);
create index idx_insignias_usuario      on public.insignias (usuario_id);

-- ═══════════════════════════════════════════════════════════════
-- Alta de usuario: crea el perfil a partir de los metadatos
-- ═══════════════════════════════════════════════════════════════
create or replace function public.crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, correo, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email,
    -- el rol llega en los metadatos del alta; por defecto, estudiante
    case
      when new.raw_user_meta_data ->> 'rol' = 'docente' then 'docente'::public.rol_usuario
      when new.raw_user_meta_data ->> 'rol' = 'admin'   then 'admin'::public.rol_usuario
      else 'estudiante'::public.rol_usuario
    end
  );
  return new;
end;
$$;

create trigger trg_crear_perfil
  after insert on auth.users
  for each row execute function public.crear_perfil_al_registrarse();
