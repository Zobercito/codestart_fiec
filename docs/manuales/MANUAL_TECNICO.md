# Manual técnico — CodeStart FIEC 1.0

**Versión:** 1.0.0 · **Última actualización:** 24/11/2026

## 1. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components, React Compiler) |
| UI | React 19, Tailwind CSS 4 (tokens en `src/app/globals.css`) |
| Datos | PostgreSQL en Supabase, Auth, RLS |
| Contenido | MDX versionado (`next-mdx-remote` 6) |
| Editor | CodeMirror 6 |
| Validación de C | Analizador estático propio (léxico → parser → AST → tipos → reglas) |
| Pruebas | Vitest 5, Playwright 1.64, axe-core |
| Despliegue | Vercel |

## 2. Estructura

```text
src/app/                 rutas (públicas, sesión, docente, API)
src/components/          ui, leccion, retos, evaluacion, docente
src/lib/auth/            roles, guardas y acciones de acceso
src/lib/supabase/        clientes y DAL
src/lib/docente/         DAL y acciones del panel
src/lib/validacion/      motor de C y tipos
src/lib/retos/           corrección y saneo de resultados
src/content/lecciones/   MDX
supabase/migrations/     16 migraciones SQL
supabase/seed.sql        datos de demostración
tests/                   Playwright
scripts/                 cuentas, seed, tipos, RLS, contraste, rendimiento, carga
docs/                    arquitectura, informes, manuales
```

## 3. Rutas

Públicas: `/`, `/login`, `/privacidad`, `/api/salud`.

Sesión: `/dashboard`, `/modulos`, `/modulos/[modulo]`,
`/modulos/[modulo]/lecciones/[leccion]`, `/retos/[id]`, `/medallas`,
`/evaluacion/[modulo]`, `/evaluacion/final`.

Docente/admin: `/docente`, `/docente/grupo/[id]`,
`/docente/estudiante/[id]`, `/docente/grupos`, `/docente/asignar`.

API: `POST /api/retos/[id]/verificar`, `PUT /api/retos/[id]/borrador`,
`POST /api/retos/[id]/pista`, `GET /api/salud`.

## 4. Variables de entorno

| Variable | Dónde | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | cliente/servidor | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente/servidor | clave pública; RLS protege |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo servidor/scripts** | leer reglas y escribir intentos/progresos |
| `SUPABASE_DB_URL` | scripts | migraciones, seed, tipos, respaldos |
| `SUPABASE_DB_PASSWORD` | CLI | operaciones de Supabase |
| `DEMO_PASSWORD` | scripts/tests | cuentas de demostración |

Nunca pongas `SUPABASE_SERVICE_ROLE_KEY` con prefijo `NEXT_PUBLIC_` ni la importes desde un componente cliente. `src/lib/supabase/admin.ts` tiene `import "server-only"`.

## 5. Modelo de datos

11 tablas: `perfiles`, `grupos`, `inscripciones`, `modulos`, `lecciones`,
`retos`, `asignaciones`, `progresos`, `intentos`, `insignias`, `codigos`.

- `perfiles.id` = `auth.users.id`; el rol vive en `perfiles.rol` y se sincroniza con `auth.users.raw_user_meta_data.rol`.
- `progresos` e `intentos` solo los escribe el servidor con `service_role`.
- `insignias` se otorgan por triggers `SECURITY DEFINER` (`modulo_N`, `primer_reto`, `curso`).
- `retos.reglas` no es legible por el cliente; `retos.pistas` tampoco (se piden al endpoint).
- `codigos` es el borrador; el cliente solo puede escribir `codigo` y `actualizado_en`.

## 6. RLS y autorización

- RLS activo en las 11 tablas; 26 políticas.
- Estudiante: solo lo suyo. Docente: sus grupos. Admin: todo.
- El proxy hace una comprobación optimista de sesión; **no** es la frontera de autorización. Cada página llama a `exigirDocente`/DAL y Postgres aplica RLS.
- Las funciones `SECURITY DEFINER` usan `set search_path = ''`.
- `cambiar_rol` es la única vía prevista para cambiar roles; sincroniza perfil y metadato.
- Las RPC de agregados del panel son `SECURITY INVOKER` (RLS aplica).

## 7. Comandos

```bash
npm ci
npm run typegen
npm run lint
npm run typecheck
npm test
npm run build
npm start

npm run test:e2e        # 93 ejecuciones (3 proyectos)
npm run test:rls        # 32 comprobaciones
npm run test:seguridad
npm run auditar:contraste
npm run db:types        # regenera types.generados.ts
npm run db:usuarios     # crea/sincroniza cuentas demo
npm run db:seed         # demo (destructivo; soporta SEED_DRY_RUN=1)
```

`npm run db:migrate` sigue dependiendo de la CLI de Supabase y del PAT; en este host las migraciones se aplican con `psql`/`pg` y `SUPABASE_DB_URL`.

## 8. Flujo de una verificación

1. El estudiante envía código/respuesta a `POST /api/retos/[id]/verificar`.
2. El servidor valida sesión, rol y módulo desbloqueado.
3. Lee el reto con `service_role` (reglas, casos, pistas).
4. Corrige con el motor estático o con las funciones de reto.
5. Guarda un intento saneado (sin respuestas correctas) y devuelve el detalle al navegador.
6. El docente ve el error agregado en su panel.

Límites: 64 KB de cuerpo, 20 KB de código, profundidad máxima de 120, 30 verificaciones/minuto por usuario en memoria y comprobación de duración de 5 s. **No hay un timeout que aborte el análisis**; el motor es lineal y el límite de tamaño/densidad lo acota. Un timeout real requiere worker/aislamiento y queda como deuda.

## 9. Pruebas

- Unitarias: motor, progreso, evaluación, retos y saneo de resultados.
- E2E: estudiante, docente, evaluación, accesibilidad y compatibilidad.
- RLS: aislamiento entre estudiantes/grupos, escrituras prohibidas, pistas/reglas y RPC de agregados.
- Contraste: 7 rutas del estudiante; no cubre todos los estados (pendiente, pestañas, simulador).
- Las pruebas E2E usan la cuenta demo y **modifican su estado**; conviene resembrar antes de una demo.

## 10. Rendimiento

- `obtenerPanoramaGrupo` trae los últimos 50 intentos con detalle y calcula totales en Postgres con `agregados_intentos_grupo`.
- El detalle de un estudiante pagina de 50 en 50.
- `vercel.json` fija `pdx1` (us-west-2) para acercar Vercel al pooler de Supabase.
- RNF08 (100 usuarios) no está cerrado; la última medición conocida es p95 54,6 s y 88,7 % de timeouts en el escenario de estrés. No se debe presentar como cumplido.

## 11. Despliegue

```bash
npm run build
vercel --prod
```

Variables de Vercel: las mismas del `.env.example` (sin `SUPABASE_DB_URL` en runtime). Tras el deploy:

1. `GET /api/salud` → 200.
2. Login de estudiante y docente.
3. Un módulo, un reto y una pista.
4. Revisar `x-vercel-id` para confirmar la región.

## 12. Limitaciones conocidas

- C no se ejecuta; se analiza un subconjunto (sin bucles ni arreglos en retos de código).
- `m01`, `m02` y `m04` son contenido provisional.
- No hay administración UI, CSV ni editor de contenidos.
- RNF04/RNF05/RNF08, WebKit/Edge y la revisión manual de accesibilidad no están cerrados.
