<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Qué es este repositorio

CodeStart FIEC — plataforma de apoyo al Curso Propedéutico de la FIEC. Esto es el **Avance 3**
(versión alfa, 28 de octubre de 2026).

El repositorio hermano `codestart-fiec-mockup` contiene el **mockup de diseño del Avance 2**:
es la fuente de verdad de la interfaz (pantallas, textos, tokens, tablas de contraste). Cuando
dudas de cómo debe verse algo, mira el mockup, no lo inventes.

El plan de trabajo por fases está en `plan.md`, que **no se versiona** (está en `.gitignore`).

## La regla que más se va a incumplir

**El lenguaje de práctica es C. C no se ejecuta en el navegador.** No escribas nada que asuma
que se puede ejecutar C en un Web Worker: no existe un motor de C en el navegador, y `clang.wasm`
pesa ~30 MB (mata el RNF02 de carga en menos de 2 s).

La validación de retos es **análisis estático**: `fuente → tokens → parser → AST → tabla de
símbolos con tipos → reglas del reto`. El único motor que corre en el navegador es ese analizador,
escrito en TypeScript. La ejecución real de C es una etapa posterior.

El análisis estático da además un **mejor diagnóstico** que la ejecución: «tu condición `edad > 18`
es falsa con edad = 18, así que el programa cae al `else`» en lugar de «código incorrecto». Es lo
que el panel docente convierte en el patrón de error dominante.

## Comandos

```bash
npm run dev        # desarrollo, Turbopack, http://localhost:3000
npm run build      # build de producción
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

Antes de commitear, en este orden: `npm run typecheck && npm run lint && npm run build`.

- **`npm install` falla sin el `.npmrc` del repo**: npm 11+ exige autorizar los scripts de
  instalación de forma explícita. No lo borres ni lo muevas.
- `npm audit` reporta 5 vulnerabilidades altas en `braces`/`micromatch`, todas dentro de
  `eslint-config-next`: son tooling de desarrollo, no runtime. El arreglo que ofrece degrada
  `eslint-config-next` a la 14 y no se aplica.

## Dónde vive cada cosa

| Ruta | Contenido |
|---|---|
| `src/app/` | Rutas. App Router. Grupos: `(auth)`, `(estudiante)`, `(docente)` |
| `src/components/` | `ui/`, `leccion/`, `retos/`, `docente/` |
| `src/lib/supabase/` | Cliente de Supabase y la **DAL** (Data Access Layer) |
| `src/lib/auth/` | Roles y guardas de sesión |
| `src/lib/validacion/` | El analizador de C: parser, AST, tipos, motor de reglas |
| `src/content/` | Módulos y retos en **MDX + JSON**, versionados en el repo (no en la base de datos) |
| `supabase/migrations/` | SQL versionado · `supabase/seed.sql` |

## Next.js 16 — lo que rompe y no aparece en tus datos de entrenamiento

- **`middleware.ts` ya no existe: es `proxy.ts`**, en la raíz del proyecto o junto a `app/`.
  Solo uno por proyecto, y sirve para comprobaciones optimistas, no como gestión de sesión.
- `params` y `searchParams` son **`Promise`**: `const { slug } = await params`.
- `cookies()` y `headers()` son **async**: `await cookies()`.
- Los tipos de props de página y layout son **globales**: `LayoutProps<"/">`, `PageProps<"/ruta">`.
  No se importan de `next`.
- `next.config.ts` tiene `cacheComponents: true`, `partialPrefetching: true` y `reactCompiler: true`.
- **Tailwind v4 no tiene `tailwind.config.js`.** Los tokens van en `@theme` dentro de
  `src/app/globals.css`. Si añades un token, va ahí.
- `next dev` re-genera el bloque `nextjs-agent-rules` de este archivo. No lo edites ni lo borres.
- La documentación **de la versión instalada** está en `node_modules/next/dist/docs/`. Léela antes
  de escribir código; es más fiable que tu memoria.

## Convenciones

- **Interfaz, comentarios e identificadores en español.** El proyecto lo lee un equipo
  hispanohablante y toda la documentación de origen está en español: `obtenerProgreso`, no
  `getProgress`. Rutas y endpoints también en español.
- **Los datos se acceden solo por la DAL** (`src/lib/supabase/`), con `import 'server-only'`.
  Ahí se comprueban sesión y rol. Nunca consultes Supabase desde un componente cliente, y nunca
  confíes en que un componente ya filtró: la autorización se comprueba en la DAL, no en la vista.
- **Roles**: `estudiante`, `docente`, `admin`. El docente solo ve sus grupos (RLS de Postgres).
- `intentos` guarda el código enviado **y el error detectado**. Ese campo es la base del análisis de
  errores que ve el docente (RF15): no lo sacrifiques ni lo recalcules en el cliente.
- **Commits**: uno por fase, y el mensaje explica el porqué, no solo el qué.

## Diseño

- Los tokens están en `src/app/globals.css`. **No inventes colores**: deriva de las familias
  `fiec`, `up`, `coder` o de la escala `slate`.
- **Contraste AA obligatorio.** Los pares permitidos y prohibidos, con su ratio medido, están en la
  guía de estilo del mockup (pestaña «Diseño» → «Guía de estilo»). En resumen: `slate-400` no sirve
  para texto sobre fondo claro (2,6:1) → usa `slate-500`; `up-500` y `up-600` tampoco → usa `up-700`
  o `up-800`; `coder-500` y `coder-600` → `coder-700`.
- **No uses `opacity` para atenuar estados**: reduce el contraste del texto de forma no
  controlada. Usa colores explícitos.
- Es Tailwind v4, no v3: `bg-linear-to-*` (no `bg-gradient-to-*`) y `ring-3` (un `ring` a secas
  es 1 px).
- Todo lo que responde al cursor necesita equivalente por teclado y por toque
  (`hover:` + `focus-visible:` + clic): el dispositivo real del curso es la tableta.

## Fuera de esta fase

Panel docente completo · exportación CSV (RF17) · editor de contenidos (RF18) · motor de ejecución
de C · módulos 5-8 · evaluación final · administrador con interfaz. El detalle está en `plan.md`.

## Entorno

- `codegraph` está inicializado (`.codegraph/`): úsalo para explorar el código en vez de
  grep + lectura. Reindexa si notas el índice atrasado.
- Este repositorio está anidado dentro del repo del mockup, que lo ignora. `plan.md` y
  `.codegraph/` no se versionan.

### Credenciales

**No están en el repositorio, ni en el archivo de credenciales, ni en el `.env.local` versionado.**
Las sensibles viven en el **keyring del sistema** (gnome-keyring):

```bash
secret-tool lookup service codestart-fiec key supabase-token   # PAT, solo para crear el proyecto
secret-tool lookup service codestart-fiec key db-password      # contraseña de Postgres
secret-tool lookup service codestart-fiec key service-role     # clave service_role
```

`~/.config/codestart-fiec/credenciales.env` solo contiene datos **públicos** (URL del proyecto,
project ref, anon key y connection string). `.env.local` se genera a partir del keyring y está en
el `.gitignore` con permisos `600`.

### La base de datos solo es accesible por el pooler

El host directo `db.<ref>.supabase.co` **solo resuelve a IPv6**, y esta máquina no tiene ruta
IPv6: cualquier conexión directa falla con «la red es inaccesible». Usa siempre el pooler:

```
host=aws-1-us-west-2.pooler.supabase.com  port=5432
user=postgres.<project-ref>  dbname=postgres  sslmode=require
```

Ojo: el host del pooler es **`aws-1-us-west-2`**, no `aws-0`. Y el usuario lleva el ref pegado.
La CLI lo escribe bien en `supabase/.temp/pooler-url` tras hacer `supabase link`.

Además, todo el flujo funciona **sin el PAT**: las migraciones se aplican con `psql` y los tipos
se generan con `supabase gen types typescript --db-url "<connection string>"`. El PAT solo hizo
falta para crear el proyecto, y se puede revocar.
