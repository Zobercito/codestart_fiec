# Arquitectura

CodeStart FIEC adopta un **modelo cliente-servidor con arquitectura de tres capas** (§16 del
documento de Avance 1). Este documento describe cómo quedó implementada esa estructura en el
Avance 3, y sobre todo **por qué** el motor de validación vive donde vive.

---

## Las tres capas

| Capa | Qué hace | Tecnología | Dónde está |
|---|---|---|---|
| **Presentación** | Aplicación web interactiva y responsiva: lecciones, editor de código, panel de estudiante | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, CodeMirror 6 | `src/app/`, `src/components/` |
| **Lógica de negocio** | Verificación de retos, entrega de contenido, registro de intentos, guardado de progreso, grupos, asignaciones | Rutas de servidor y Server Actions de Next.js (Node.js) | `src/app/api/`, `src/app/**/acciones.ts`, `src/lib/` |
| **Datos y acceso** | Perfiles, grupos, avance, intentos y catálogo educativo; autenticación y control de acceso por rol | PostgreSQL con RLS + Supabase Auth | Supabase (remoto), `supabase/migrations/` |

### Presentación

- Rutas del App Router, agrupadas por tipo de sesión: `(auth)`, `(sesion)`.
- El contenido de las lecciones es **MDX versionado en el repositorio** (`src/content/`); la base
  de datos solo guarda la ruta del archivo. Cambiar una lección es un commit, no una fila que
  actualizar.
- Componentes interactivos propios: `VisorAnatomia` (línea por línea), `SimuladorMemoria`,
  `RecorridoInstruccion`, `BloqueCodigo`.
- El editor de retos usa **CodeMirror 6** (`@codemirror/lang-cpp`, `theme-one-dark`).

### Lógica de negocio

La regla que ordena todo el proyecto:

> **Quien decide si una respuesta es correcta es el servidor, nunca el navegador.**

`POST /api/retos/[id]/verificar` recibe el código del estudiante, lee las **reglas y los casos de
prueba desde la base de datos**, corre el motor de análisis y devuelve el resultado. El navegador
solo muestra lo que le devolvieron.

Si el análisis se hiciera en el cliente, falsear la respuesta bastaría para aprobar cualquier
reto. Además, la tabla `intentos` guarda el error detectado: es la base del análisis de errores
que ve el docente (RF15), y eso solo tiene sentido si el veredicto lo emite el servidor.

Por la misma razón, **las pistas reveladas las cuenta el servidor**: las lee de
`codigos.pistas_usadas` (su propio borrador), no del `fetch` del cliente. Si las aceptara del
cliente, el estudiante podría pedir pistas y no pagar los 10 puntos.

### Datos y acceso

- **PostgreSQL en Supabase**, con RLS activo en las 11 tablas (26 políticas).
- Las funciones de apoyo (`es_admin`, `es_docente_de`, `es_miembro_de`) se usan dentro de las
  políticas, para que la autorización no dependa de que la vista la compruebe.
- **Trigger `trg_proteger_campos_perfil`**: bloquea que alguien sepromueva a sí mismo el campo
  `rol` de su perfil. El rol lo pone el trigger de registro, no el cliente.
- **Autenticación**: Supabase Auth por correo. El acceso lo controla `src/proxy.ts` (en Next 16
  `middleware.ts` ya no existe), pero la comprobación de verdad está en la DAL
  (`src/lib/auth/dal.ts`): una ruta nunca confía en que otra ya filtró.

---

## El motor de validación: análisis estático, no ejecución

**C no se ejecuta en el navegador.** No existe un motor de C en el navegador, y `clang.wasm` pesa
~30 MB, lo que mata el RNF02 de carga en menos de 2 s.

Así que la validación es **análisis estático**:

```
fuente → tokens → parser → AST → tabla de símbolos con tipos → reglas del reto → diagnóstico
```

| Archivo | Qué hace |
|---|---|
| `src/lib/validacion/lexico.ts` | Tokens: identificadores, números, cadenas, operadores, comentarios |
| `src/lib/validacion/sintactico.ts` | Parser descendente recursivo → AST |
| `src/lib/validacion/entorno.ts` | Tabla de símbolos con tipos |
| `src/lib/validacion/motor.ts` | Reglas del reto, simulación del camino y diagnóstico |
| `src/lib/validacion/worker.ts` | Envoltura en Web Worker (análisis local mientras se escribe) |
| `src/lib/validacion/tipos.ts` | Los tipos que comparten todos los anteriores |

El análisis estático da además un **mejor diagnóstico** que la ejecución: no dice solo «el
resultado no cuadra», sino «con 18, tu condición `edad > 18` es falsa, y respondió “Menor de
edad”; el caso espera “Mayor de edad”». Eso es lo que el panel docente convierte en el patrón de
error dominante.

### Las reglas viven en la base de datos

Cada reto guarda sus reglas en una columna **JSONB**. Describen **lo que el programa tiene que
hacer**, no cómo hay que escribirlo:

```json
{
  "impresiones": { "verdadero": "Mayor de edad", "falso": "Menor de edad" },
  "comparaciones": [{ "variable": "edad", "operador": ">=", "valor": 18 }],
  "declaraciones": [{ "nombre": "edad", "tipo": "int" }],
  "requiere_ramas": 2
}
```

Por eso el motor **no depende del lenguaje**: el mismo motor valida los retos de C y los de
JavaScript, porque lo que describe son intenciones, no sintaxis.

### El motor es una función pura

`analizar(codigo, reglas, casos)` no toca nada de fuera: ni red, ni base de datos, ni reloj. Por
eso se prueba en Node con Vitest (13 pruebas) sin levantar un navegador, y el mismo código corre
en el Web Worker y en el servidor.

---

## El contenido: MDX versionado

El contenido de las lecciones vive en `src/content/` como **MDX**, y la base de datos guarda la
ruta del archivo (`lecciones/m03-l1-....mdx`). Tres decisiones que costaron tiempo:

1. **`next-mdx-remote` v6 compila con `blockJS: true`**, y ese plugin **borra los atributos con
   expresión** de los componentes (`<Componente datos={[{...}]} />` llega sin props). Hay que pasar
   `options={{ blockJS: false, blockDangerousJS: true }}`: se permiten las expresiones y siguen
   bloqueados `eval`, `Function`, `require` y `process`. Es aceptable porque el contenido lo
   escribe el equipo, no un visitante.
2. **El contenido NO va con `"use cache"`.** La clave de esa caché es la ruta, así que al editar
   un `.mdx` se seguía sirviendo la versión vieja. Se lee siempre del disco, que es lo rápido, y
   las rutas que lo usan se renderizan en request-time con `export const instant = false`.
3. **`@supabase/ssr` usa `Date.now()` por dentro**, y con Cache Components eso rompe el
   prerenderizado. Se resuelve con `await connection()` en `crearClienteSupabase()`, en un solo
   sitio.

---

## Rendimiento

Medido sobre el build de producción, con la base de datos real:

| Pantalla | TTFB | First Contentful Paint | Peso |
|---|---|---|---|
| A · Dashboard | 196 ms | 984 ms | 238 KB |
| B · Lección | 186 ms | 1 420 – 1 840 ms | 242 KB |
| C · Editor de retos | 223 ms | — | 407 KB |

El RNF02 pide que **una lección cargue en menos de 2 segundos**: se cumple, aunque con el
margen justo que da el renderizado en request-time del MDX.

El editor de retos es la pantalla más pesada porque CodeMirror pesa, y **se carga bajo demanda**:
solo baja cuando el estudiante abre un reto, nunca al abrir una lección. Por eso el RNF02
(«el editor de código y su motor de ejecución se cargan bajo demanda, al abrir un reto») se
cumple por construcción.

---

## Accesibilidad

- **Contraste WCAG AA comprobado, no estimado.** `scripts/auditar-contraste.mjs` recorre las
  siete rutas con sesión iniciada, calcula el contraste real de cada texto visible contra su
  fondo y falla si alguno no llega al mínimo. Está en 0 fallos.
  - El auditor tiene que pasar los colores por un canvas: Tailwind v4 los devuelve en `oklab`
    (`lab(...)`), no en `rgb(...)`, y un auditor que solo entienda `rgb()` no ve ningún color.
  - Regla práctica: sobre `slate-50` o `slate-100` → `slate-600`; sobre `slate-900` o
    `slate-950` → `slate-400`. `slate-500` sobre `slate-50` da 4,35:1 y no llega.
- Todo lo que responde al cursor tiene equivalente por teclado y por toque
  (`hover:` + `focus-visible:` + clic), porque el dispositivo real del curso es la tableta.
