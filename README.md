# CodeStart FIEC

Plataforma de apoyo al **Curso Propedéutico** de la Facultad de Informática, Electrónica y
Comunicación (FIEC) — Universidad de Panamá.

Repositorio del **Avance 3 · Desarrollo y Programación (parte 1)** — versión alfa.

---

## Estado del Avance 3

| Entregable | Estado |
|---|---|
| Navegación completa (dashboard, módulos, lecciones, retos) | ✅ Completa |
| Acceso de usuarios (login, registro, roles, inscripción por código) | ✅ Completa |
| Motor de contenidos (MDX + 4 componentes interactivos) | ✅ Completa |
| Motor de validación de C (análisis estático, 13 pruebas) | ✅ Completa |
| Pantallas A (Dashboard), B (Lección), C (Editor de retos) | ✅ Completa |
| Pruebas E2E (Playwright, 14 tests escritorio + tableta) | ✅ Completa |
| Contraste WCAG AA en todas las rutas | ✅ 0 fallos |
| Despliegue en Vercel | ✅ <https://codestart-fiec.vercel.app> |
| Panel docente con analítica (RF15) | 📋 Próximo (A4) |

Fase actual: **6 · Cierre completada**. El Avance 3 quedó entregado; el A4 empieza con el panel
docente y el circuito de progreso.

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

## Despliegue en Vercel

La versión alfa está desplegada en **<https://codestart-fiec.vercel.app>** (verificada el
26 de octubre de 2026).

Para volver a desplegar:

```bash
# 1. Instalar Vercel CLI (si no la tienes)
npm i -g vercel@latest

# 2. Login en tu cuenta
vercel login

# 3. Desde la raíz del repo
vercel --prod
```

Vercel ya tiene el proyecto vinculado y las variables de entorno configuradas. Las
variables que necesita son:

| Variable | Origen |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` (público) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` (público) |
| `SUPABASE_SERVICE_ROLE_KEY` | Keyring → `cred get codestart-fiec service-role` |
| `SUPABASE_DB_URL` | `.env.local` (público, pooler) |
| `SUPABASE_DB_PASSWORD` | Keyring → `cred get codestart-fiec db-password` |

Tras cada despliegue, comprueba `/login` y una lección con una cuenta de prueba. Si el
proyecto se recrea desde cero, ejecuta `vercel link` antes de `vercel --prod`.

---

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

## Contenido de las lecciones

Las lecciones son archivos **MDX versionados en el repositorio** (`src/content/`), no filas de
una tabla. La base de datos guarda la ruta del archivo, así que cambiar el contenido de una
lección es un commit, con su revisión.

Una lección puede incrustar estos componentes:

| Componente | Qué hace |
|---|---|
| `<VisorAnatomia>` | Cada línea del programa se explica al pasar el cursor, al enfocarla o al tocarla |
| `<SimuladorMemoria>` | La memoria como casilleros numerados, avanzando instrucción a instrucción |
| `<RecorridoInstruccion>` | Las cuatro etapas: fuente, traducción, memoria y salida |

```bash
# Ver el contenido sin la base de datos
cat src/content/lecciones/m03-l1-que-pasa-al-ejecutar.mdx
```

## El motor de validacion

Los retos de codigo se validan **analizando** el codigo del estudiante, no ejecutandolo: C no se
puede ejecutar en el navegador, y ademas el analisis dice **por que** falla, no solo que falla.

```
src/lib/validacion/
├── lexico.ts     → el codigo a tokens
├── sintactico.ts → tokens a AST (parser descendente recursivo)
├── entorno.ts    → tabla de simbolos con tipos y evaluacion de expresiones
├── motor.ts      → reglas del reto, simulacion de camino y diagnostico
├── worker.ts     → el Web Worker donde corre
└── cliente.ts    → el wrapper que usa la interfaz
```

El subconjunto de C es el del propedeutico: variables y tipos, condicionales, retorno y llamadas
de salida. Las reglas de cada reto estan en la base de datos (JSONB) y describen **lo que el
programa tiene que hacer**, no como lo tiene que escribir. Asi el motor no depende del lenguaje.

Ejemplo del diagnostico que ve el estudiante:

```
La comparación con «edad» usa el operador «>», y el reto pide «>=».
Con 18, tu condición `edad > 18` es falsa, y respondió «Menor de edad».
El caso espera «Mayor de edad».
```

```bash
npm test        # 13 pruebas del motor
```

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
