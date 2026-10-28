<div align="center">

<h1>CodeStart FIEC</h1>

<p><strong>Plataforma de apoyo al Curso Propedéutico · Versión beta</strong></p>

<p>Universidad de Panamá<br>
Facultad de Informática, Electrónica y Comunicación</p>

<p><em>Proyecto de la materia Informática Educativa · 2do Semestre 2026</em></p>

<p>
  <a href="https://codestart-fiec.vercel.app">
    <img src="https://img.shields.io/badge/Demo-Ver%20la%20app-0B62A4?style=for-the-badge&amp;logo=vercel&amp;logoColor=white" alt="Ver la aplicación">
  </a>
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&amp;logo=nextdotjs&amp;logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&amp;logo=react&amp;logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&amp;logo=typescript&amp;logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&amp;logo=supabase&amp;logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&amp;logo=tailwindcss&amp;logoColor=white" alt="Tailwind CSS">
</p>

</div>

<p align="center">
  <a href="https://codestart-fiec.vercel.app">
    <img src="docs/captura-dashboard.webp" alt="Dashboard del estudiante" width="900">
  </a>
</p>

> **¿Qué es este repositorio?**
>
> La **aplicación real** de CodeStart FIEC: ocho módulos con lecciones interactivas, retos de C con
> validación estática, evaluaciones, medallas y panel de seguimiento para el docente, construida con
> Next.js y Supabase. Esta es la **versión beta** (`v0.2.0-beta`).
>
> El **prototipo de diseño** vive aparte, en
> **[`Zobercito/codestart-fiec-mockup`](https://github.com/Zobercito/codestart-fiec-mockup)** ·
> demo: <https://zobercito.github.io/codestart-fiec-mockup/>.
>
> Proyecto de la materia **Informática Educativa** (2do Semestre 2026), Facultad de
> Informática, Electrónica y Comunicación, Universidad de Panamá.

---

## El proyecto

**El problema.** Los estudiantes entran al Curso Propedéutico de la FIEC sin haber programado
nunca, y el tiempo de clase se consume explicando lo mismo a ritmos distintos. Quien se atrasa no
tiene dónde practicar, y quien avanza rápido se aburre.

**La respuesta.** CodeStart FIEC es una plataforma web que acompaña al curso: una ruta de ocho
módulos con práctica inmediata, diagnóstico del error en lenguaje natural y una vista del grupo
para el docente. El objetivo es que un estudiante sin experiencia llegue a escribir, leer y
depurar programas sencillos en C antes de iniciar la carrera.

**Para quién.**

- **Estudiantes del propedéutico**: avanzan a su ritmo y reciben retroalimentación al instante.
- **Docente del curso**: ve el avance de su grupo, los errores más frecuentes y asigna la tarea.
- **Coordinación**: crea las cuentas; la interfaz de administración llega después.

**Qué no es.** No ejecuta C (lo analiza estáticamente), no sustituye las clases ni califica fuera
del curso, y no incluye todavía exportación CSV (RF17), editor de contenidos (RF18) ni consola de
administración.

---

## Roles y permisos

| Rol | Puede | No puede |
|---|---|---|
| **Estudiante** | Ver sus módulos, lecciones y retos; entregar intentos; consultar su progreso y sus medallas | Entrar al panel docente, ver datos de otros estudiantes, inscribir a terceros, activar el modo clase |
| **Docente** | Crear grupos, ver los indicadores de **sus** grupos, abrir el detalle de cada estudiante, asignar módulos y previsualizar evaluaciones | Ver grupos ajenos, cambiar roles, alterar intentos o calificaciones |
| **Administrador** | Alta y baja de cuentas y cambio de rol desde la base | — (sin interfaz todavía) |

Nadie se registra por su cuenta: las cuentas las crea el docente con `npm run db:usuarios` y el
estudiante inicia sesión con la que se le asigna. Los permisos se comprueban tres veces: en el
`proxy`, en la capa de datos y en el RLS de Postgres.

---

## Tecnologías

| Pieza | Para qué |
|---|---|
| **Next.js 16** (App Router) | Servidor y rutas: páginas de estudiante y docente, Server Actions para iniciar sesión, inscribirse con código, crear un grupo y asignar un módulo; Route Handlers en `/api/retos/[id]/verificar` y `/borrador`; `proxy.ts` redirige según el rol e `instant = false` marca las páginas que dependen de la sesión |
| **React 19** | Interfaz: componentes de servidor para las pantallas y de cliente para el editor, las pantallas de reto y los formularios (`useActionState`); React Compiler activado |
| **TypeScript 5** | Tipos de extremo a extremo; `types.generados.ts` se genera desde Postgres y `npm run typecheck` lo verifica antes de cada commit |
| **Supabase** (Auth + Postgres + RLS) | Autenticación con correo y contraseña y sesión en cookies (`@supabase/ssr`); Postgres con las 11 tablas del modelo; RLS que aísla a un estudiante de otro y a cada docente con sus grupos; la clave de servicio solo se usa en scripts del servidor |
| **Tailwind CSS 4** | Estilos de toda la interfaz con los tokens en `@theme` (familias `fiec`, `up`, `coder` y escala `slate`); no hay archivo de configuración |
| **CodeMirror 6** | Editor del estudiante: resaltado de C, tema oscuro y un keymap propio para el cierre de llaves |
| **MDX** (`next-mdx-remote` 6) | Lecciones en `src/content`, versionadas en git y compiladas con `blockJS: false` para permitir expresiones |
| **Zod 4** | Validación de lo que entra por las Server Actions: correo y contraseña, código de grupo, nombre del grupo y asignación |
| **Vitest 5** | Pruebas unitarias del analizador de C, del progreso, de la evaluación y de los retos |
| **Playwright 1.64 + axe-core** | Pruebas de extremo a extremo en escritorio, tableta y Firefox, y auditoría de accesibilidad |
| **Supabase CLI + psql** | Migraciones versionadas (`npm run db:migrate`), semilla y generación de tipos; la conexión va por el pooler |
| **Vercel** | Despliegue continuo desde `main`, previsualizaciones por rama y variables de entorno de producción |

En una línea: el navegador pide páginas a Next, Next consulta Supabase con la sesión del usuario a
través de la DAL, y Postgres aplica RLS. **El puntaje y la corrección se calculan solo en el
servidor**; el navegador únicamente envía la respuesta.

---

## Los ocho módulos

| # | Módulo | Contenido | Lecciones | Retos |
|---|---|---|---|---|
| 1 | Introducción a la informática y al computador | Hardware, software, instrucciones y memoria | 1 | 1 |
| 2 | Algoritmos | Descomposición, pseudocódigo y diagramas de flujo | 1 | 1 |
| 3 | De la idea al programa | Compilación frente a interpretación y anatomía de un «Hola Mundo» | 2 | 3 |
| 4 | Variables, tipos de datos y operadores | Enteros, decimales, caracteres, booleanos y memoria | 1 | 1 |
| 5 | Estructuras de control de flujo | Condicionales y ciclos | 1 | 3 |
| 6 | Estructuras de datos básicas | Arreglos, listas e indexación | 1 | 3 |
| 7 | Taller de retos | Ejercicios que combinan variables, control de flujo y arreglos | 1 | 3 |
| 8 | Evaluación formativa final | Cuestionario de los ocho módulos | 1 | 1 |

En total: **9 lecciones y 16 retos** (9 de selección múltiple, 3 de ordenamiento, 3 de
autocompletado y 1 de código), más la **autoevaluación de cada módulo** (5 preguntas) y la
**evaluación final** (15 preguntas, umbral del 70 %).

---

## Qué puedes hacer hoy

| Área | Qué funciona |
|---|---|
| **Acceso** | Inicio de sesión con cuentas institucionales asignadas por el docente, inscripción con código de grupo y tres roles: estudiante, docente y administrador |
| **Estudiante** | Dashboard con avance, ruta de 8 módulos, tarea asignada y medallas; navegación por módulos y lecciones |
| **Lecciones** | Contenido en MDX con componentes interactivos: anatomía del código, simulador de memoria y recorrido de una instrucción |
| **Retos** | Editor CodeMirror con autoguardado, casos de prueba, pistas progresivas y diagnóstico del error |
| **Validación** | Analizador estático de C en el servidor: no ejecuta el código del estudiante, lo analiza y explica por qué falla |
| **Evaluaciones** | Autoevaluación por módulo y evaluación final con umbral de aprobación y áreas a reforzar |
| **Docente** | Panorama del grupo, detalle por estudiante, tarea asignada y patrón de error dominante, solo de sus propios grupos |
| **Modo clase** | Retos sin puntaje para resolver en grupo durante la sesión |

---

## Estado

| | |
|---|---|
| **Versión** | Beta `v0.2.0-beta` |
| **Base de datos** | 11 tablas con políticas de RLS por rol y por grupo |
| **Contenido** | Ocho módulos en MDX, del primero al taller de retos y la evaluación final |
| **Pruebas** | 33 unitarias (Vitest) y 84 de extremo a extremo en escritorio, tableta y Firefox; matriz de RLS y auditoría de contraste |
| **Accesibilidad** | Contraste WCAG 2.1 AA verificado en 7 rutas: 0 fallos; revisión manual pendiente |
| **Rendimiento** | Con red limitada (Fast 3G, CPU 4×): LCP de 1,1–1,3 s. Con 100 usuarios concurrentes **no cumple RNF08**; el detalle está en `docs/INFORME_PRUEBAS.md` |
| **Fuera de la beta** | Exportación CSV (RF17), editor de contenidos (RF18), interfaz de administrador y ejecución real de C |
| **Pendiente para la 1.0** | Validación con estudiantes (RNF04), WebKit y Edge, y correcciones de la validación |

---

## Demo

**Aplicación:** <https://codestart-fiec.vercel.app>

| Correo | Rol |
|---|---|
| `docente@up.ac.pa` | docente |
| `francisco.gonzalez@up.ac.pa` | estudiante |

**Contraseña:** `Codestart2026!`

No hay registro público. Estas cuentas simulan las cuentas institucionales que el docente crea
para el curso; los estudiantes solo inician sesión con la que se les asigna.

El grupo de demostración es **Sección 1 · Verano 2026** y su código de inscripción es
`FIEC-V26-8QK4`. El script de cuentas inscribe automáticamente a cada estudiante en ese grupo,
de modo que su avance e intentos aparecen en el panel del docente; el código sigue disponible
para inscripciones manuales. Los datos son de prueba: no escribas información personal real.

**Recorrido sugerido para ver la beta:**

1. Como estudiante: abre un módulo, entra a una lección, resuelve un reto y mira cómo se actualiza
   el avance y aparece la medalla. Al agotar los intentos de un reto, la corrección sigue
   funcionando pero ya no suma puntos.
2. Como docente: entra a **Panel**, revisa los indicadores del grupo, abre el detalle de un
   estudiante y asigna un módulo. Solo verás tus propios grupos.

---

## Arranque local

Requisitos: **Node.js 20+** y **npm 11+**. El `.npmrc` del repo autoriza los scripts de
instalación que npm 11 exige.

```bash
git clone https://github.com/Zobercito/codestart_fiec.git
cd codestart_fiec
npm install
cp .env.example .env.local   # completa las variables
npm run dev                  # http://localhost:3000
```

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima, la que usa el navegador |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo servidor.** Migraciones, seed y scripts. Nunca con prefijo `NEXT_PUBLIC_` |
| `SUPABASE_DB_PASSWORD` | Contraseña de la base de datos para la CLI |

Antes de commitear:

```bash
npm run typecheck && npm run lint && npm run build
```

---

## Base de datos

El proyecto de Supabase ya está creado y vinculado. Todo el flujo va por el **pooler**: el host
directo no resuelve por IPv6.

```bash
npm run db:migrate    # aplica supabase/migrations/
npm run db:usuarios   # crea los usuarios de prueba y sus perfiles
npm run db:seed       # carga grupo, módulos, lecciones, retos e intentos
npm run db:types      # regenera src/lib/supabase/types.generados.ts
```

---

## Cómo está construido

```text
src/
├── app/            rutas (App Router): públicas, de sesión, del docente y API
├── components/     ui · leccion · retos · evaluacion · docente
├── lib/            supabase (DAL) · auth · validacion (analizador de C)
│                   progreso · insignias · evaluacion · docente · grupos · retos
└── content/        módulos y lecciones en MDX + retos en JSON
supabase/
├── migrations/     esquema, RLS y privilegios versionados
└── seed.sql        datos de demostración
tests/              pruebas E2E con Playwright
scripts/            cuentas, medición de rendimiento, carga, RLS y contraste
docs/               arquitectura, informes y protocolo de usabilidad
```

- **Rutas públicas:** `/`, `/login`, `/privacidad`.
- **Rutas de sesión:** `/dashboard`, `/modulos`, `/modulos/[m]`, `/modulos/[m]/lecciones/[l]`,
  `/retos/[id]`, `/evaluacion/[modulo]`, `/evaluacion/final`, `/medallas`.
- **Rutas del docente:** `/docente`, `/docente/grupo/[id]`, `/docente/estudiante/[id]`,
  `/docente/grupos`, `/docente/asignar`.
- **Seguridad:** la sesión se resuelve en el servidor y el rol se comprueba en el proxy, en la
  capa de datos y en el RLS de Postgres. Un estudiante no entra a `/docente` ni escribiendo la URL.

---

## El motor de validación

Los retos de código se validan **analizando** el programa, no ejecutándolo: C no se puede ejecutar
en el navegador, y además el análisis dice **por qué** falla, no solo que falla.

```text
fuente → tokens → parser → AST → tabla de símbolos con tipos → reglas del reto → diagnóstico
```

Las reglas de cada reto viven en la base de datos (JSONB) y describen **lo que el programa tiene
que hacer**, no cómo escribirlo. El mismo motor corre en el navegador (Web Worker) y en el
servidor; la verificación que cuenta es la del servidor, para que no se pueda falsificar.

Ejemplo del diagnóstico que ve el estudiante:

```text
La comparación con «edad» usa el operador «>», y el reto pide «>=».
Con 18, tu condición `edad > 18` es falsa, y respondió «Menor de edad».
El caso espera «Mayor de edad».
```

```bash
npm test        # 33 pruebas unitarias: motor, progreso, evaluación y retos
```

---

## Contenido de las lecciones

Las lecciones son archivos **MDX versionados en el repositorio** (`src/content/`), no filas de una
tabla. Editar una lección es un commit, con su revisión.

<p align="center">
  <img src="docs/captura-leccion.webp" alt="Lección interactiva" width="900">
</p>

| Componente | Qué hace |
|---|---|
| `<VisorAnatomia>` | Explica cada línea del programa al pasar el cursor, al enfocarla o al tocarla |
| `<SimuladorMemoria>` | Muestra la memoria como casilleros y cómo cambia instrucción a instrucción |
| `<RecorridoInstruccion>` | Sigue las cuatro etapas: fuente, traducción, memoria y salida |
| `<BloqueCodigo>` | Bloque de código con su etiqueta de lenguaje |

---

## Pruebas

```bash
npm test              # unitarias (Vitest)
npm run test:e2e      # E2E en escritorio, tableta y Firefox (Playwright)
npm run test:rls      # matriz de aislamiento entre usuarios y grupos
npm run test:seguridad
npm run auditar:contraste
node scripts/medir-rendimiento.mjs          # Fast 3G + CPU 4×
node --env-file=.env.local scripts/carga.mjs # 100 usuarios concurrentes
```

Las dos últimas necesitan el servidor de producción levantado (`npm run build && npm start`).
Resultados y criterios en **[`docs/INFORME_PRUEBAS.md`](docs/INFORME_PRUEBAS.md)**.

---

## Despliegue

La producción está en Vercel, vinculada al repositorio: **cada push a `main` despliega**, y las
ramas generan un despliegue de previsualización. Para publicar manualmente:

```bash
vercel login
vercel --prod
```

Tras cada despliegue, comprueba `/login` y una lección con una cuenta de prueba. Si el proyecto se
recrea desde cero, ejecuta `vercel link` antes de `vercel --prod`.

---

## Documentación

- **[Arquitectura](docs/ARQUITECTURA.md)** — capas, decisiones de diseño y flujo de datos.
- **[Modelo de datos](docs/MODELO_DATOS.md)** — las 11 tablas, relaciones y políticas de RLS.
- **[Decisiones técnicas](docs/DECISIONES.md)** — ADR, incluida la validación estática de C.
- **[Informe de pruebas](docs/INFORME_PRUEBAS.md)** — qué se ejecutó, con qué resultado y dónde está la evidencia.
- **[Informe del Avance 4](docs/INFORME_A4.md)** — estado de la beta, pendientes, riesgos y plan.
- **[Protocolo de usabilidad](docs/PROTOCOLO_USABILIDAD.md)** — tareas, métricas y umbrales de RNF04.

## Repositorio del prototipo

El diseño de la interfaz —pantallas, tokens de color, storyboard y mapa de navegación— está en
**[`Zobercito/codestart-fiec-mockup`](https://github.com/Zobercito/codestart-fiec-mockup)** ·
demo: <https://zobercito.github.io/codestart-fiec-mockup/>.

---

<div align="center">

**Informática Educativa · 2do Semestre 2026 · Prof. Alvin Blanco**

Francisco Gonzalez · Eira Arrocha · Yasari Ortiz · Domingo de León

Universidad de Panamá · Facultad de Informática, Electrónica y Comunicación

</div>
