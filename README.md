# CodeStart FIEC

Plataforma de apoyo al **Curso Propedéutico** de la Facultad de Informática, Electrónica y
Comunicación (FIEC) — Universidad de Panamá.

Repositorio del **Avance 3 · Desarrollo y Programación (parte 1)** — versión alfa.

---

## Estado

| Entregable de A3 | Estado |
|---|---|
| Navegación completa | Pendiente (fase 4) |
| Acceso de usuarios | Pendiente (fase 2) |
| Motor de contenidos | Pendiente (fase 3) |
| Primeras actividades | Pendiente (fase 5) |

Fase actual: **0 · cimientos** (proyecto, tokens del diseño, estructura).

## Requisitos

- Node.js 20 o superior (probado con 26.8.2)
- npm 11 o superior — el `.npmrc` del repo autoriza los scripts de instalación que npm 11 exige

## Arranque

```bash
npm install
npm run dev          # http://localhost:3000
```

Antes de commitear:

```bash
npm run typecheck && npm run lint && npm run build
```

## Variables de entorno

Copia `.env.example` a `.env.local` y rellénalo. Ninguna se versiona.

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima, la que usa el navegador |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo servidor.** Para migraciones y el seed. Nunca `NEXT_PUBLIC_` |

## Base de datos

El proyecto de Supabase ya está creado y vinculado. El esquema son 10 tablas con RLS por rol.

```bash
npm run db:migrate    # aplica las migraciones (supabase/migrations/)
npm run db:usuarios  # crea los 6 usuarios de prueba y sus perfiles
npm run db:seed      # carga los datos de prueba (grupo, 8 modulos, retos, intentos)
npm run db:types     # regenera src/lib/supabase/types.generados.ts
```

**Usuarios de prueba** (contraseña `Codestart2026!`):

| Correo | Rol |
|---|---|
| `docente@up.ac.pa` | docente |
| `julieth.rojas@up.ac.pa` | estudiante |
| `luis.martinez@up.ac.pa` | estudiante |
| `camila.rios@up.ac.pa` | estudiante |
| `andres.perez@up.ac.pa` | estudiante |
| `sofia.bernal@up.ac.pa` | estudiante |

El grupo es `Sección 1 · Verano 2026` con el código de inscripción `FIEC-V26-8QK4`.

## Estructura

```
src/
├── app/            rutas (App Router)
├── components/     ui · leccion · retos · docente
├── lib/            supabase (DAL) · auth (roles) · validacion (analizador de C)
└── content/        módulos y retos en MDX + JSON, versionados en el repo
supabase/
├── migrations/     SQL versionado
└── seed.sql
```

## Documentos relacionados

- **`codestart-fiec-mockup`** — el mockup de diseño del Avance 2. Es la fuente de verdad de la
  interfaz: pantallas, textos, tokens de color y las tablas de contraste WCAG verificadas.
  <https://zobercito.github.io/codestart-fiec-mockup/>
- **Avance 1 — Análisis y Planificación** — 21 secciones, 18 requisitos funcionales, 9 no
  funcionales. Se versiona aparte.

## Nota sobre el lenguaje de práctica

El lenguaje de práctica es **C**, el mismo en que se programa en primer año. Como C no se puede
ejecutar en el navegador, los retos de código se validan **analizando cómo está construido el
programa** (parser → AST → tabla de símbolos con tipos), no compilándolo. El diagnóstico que ve el
estudiante es del tipo «tu condición `edad > 18` es falsa con edad = 18», que es lo que después el
panel docente convierte en el patrón de error del grupo.

---

**Materia:** Informática Educativa · 2do Semestre 2026 · Prof. Alvin Blanco
**Equipo:** Francisco Gonzalez · Eira Arrocha · Yasari Ortiz · Domingo de León
