# Fase 1 — Integridad y seguridad (A5)

**Fecha:** 12 de noviembre de 2026  
**Rama:** `main`  
**Punto de partida:** `v0.2.0-beta`  
**Objetivo:** cerrar los hallazgos L1–L10 de la auditoría antes de `v1.0.0`.

---

## 1. Tareas ejecutadas

| ID | Hallazgo | Cambio | Archivos |
|---|---|---|---|
| 1.1 | L1 · Respuestas de autocompletado al cliente | Se envía solo `{ id, etiqueta, opciones }`; `correcta` y `explicacion` se quedan en el servidor | `src/lib/retos/autocompletado.ts`, `src/app/(sesion)/retos/[id]/page.tsx`, `src/components/retos/pantalla-autocompletado.tsx` |
| 1.2 | L2 · Pistas declaradas por el cliente | Nuevo `POST /api/retos/[id]/pista`; el contador lo incrementa el servidor. El borrador ya no acepta `pistasUsadas` | `src/app/api/retos/[id]/pista/route.ts`, `borrador/route.ts`, 4 pantallas de retos |
| 1.3 | L3 · `retos.reglas` legible por el cliente | `revoke select` y `grant` por columnas; las rutas del servidor leen con `service_role` | `supabase/migrations/20261112120000_a5_integridad.sql`, `src/lib/supabase/admin.ts`, `retos/[id]/page.tsx`, `verificar/route.ts`, `evaluacion/dal.ts` |
| 1.4 | L4 · `intentos`/`progresos` falsificables | Escritura solo con `service_role`; el cliente conserva la lectura (RLS) | Migración, `verificar/route.ts`, `progreso/acciones.ts` |
| 1.5 | L5 · Retos de módulos bloqueados | La página y la API comprueban el estado del módulo | `retos/[id]/page.tsx`, `verificar/route.ts` |
| 1.6 | L6 · Evaluación final sin requisitos | Exige los módulos 1–7 completos; el docente entra en modo demostración | `evaluacion/final/page.tsx` |
| 1.7 | L8 · Sin límite ni timeout | 64 KB de cuerpo, 20 KB de código y tope de 5 s de análisis | `verificar/route.ts` |
| 1.8 | L10 · `Math.random()` en el código de grupo | `crypto.getRandomValues` | `lib/docente/acciones.ts` |
| 1.9 | Contraseña demo en el repo | `DEMO_PASSWORD` desde el entorno; tests y scripts ya no la contienen | `scripts/*.mjs`, `tests/*.spec.ts`, `playwright.config.ts`, `README.md`, `docs/subplan.md`, `.env.example` |

---

## 2. Migración aplicada

`supabase/migrations/20261112120000_a5_integridad.sql`

- `retos`: `authenticated` solo puede leer las columnas públicas (`reglas` queda fuera).
- `intentos` y `progresos`: sin `insert/update/delete` para `anon` ni `authenticated`.
- `codigos`: el cliente solo escribe `codigo` y `actualizado_en`; no puede tocar `pistas_usadas` ni borrar la fila.

Aplicada el 12/11/2026. Verificación: `information_schema.column_privileges` confirma que `authenticated` no tiene `SELECT` sobre `reglas`.

> **Nota de entorno:** el pooler en el puerto 5432 no respondió desde este host; la migración se aplicó por el puerto **6543** (transaction pooler). El script de tests (`tests/ayudas-db.ts`) intenta 6543 y cae al puerto de la URL.

---

## 3. Pruebas ejecutadas

| Comando | Resultado |
|---|---|
| `npm run typecheck` | ✅ Sin errores |
| `npm run lint` | ✅ Sin errores |
| `npm test` | ✅ 5 archivos, 33 pruebas |
| `npm run build` | ✅ 20 rutas (incluye `/api/retos/[id]/pista`) |
| `npm run test:e2e` | ✅ **93/93** (escritorio, tableta, Firefox) |
| `npm run test:rls` | ✅ **29 comprobaciones**, 7 nuevas de L2–L4 |
| `npm run test:seguridad` | ✅ Alta pública cerrada |
| `npm run auditar:contraste` | ✅ 0 textos por debajo de AA (7 rutas) |

### Pruebas negativas nuevas (`test:rls`)

- El estudiante no puede leer `retos.reglas`.
- El estudiante sí lee las columnas públicas del reto.
- No puede insertar intentos ni progresos.
- No puede reescribir `codigos.pistas_usadas`.
- No puede borrar su borrador (reiniciaría las pistas).
- Sí puede guardar el código de su borrador.

### Ajustes de pruebas

- `tests/ayudas-db.ts` usa `pg` en vez de `psql` (el host no trae el cliente de Postgres). `pg` y `@types/pg` quedan como `devDependencies`.
- `acceso-por-rol` y `flujo-docente` se alinearon con los textos reales del panel.
- La prueba de la evaluación final ahora comprueba el bloqueo (estudiante) y la vista del docente en modo clase.

---

## 4. Pendientes (no bloquean el código, sí el despliegue)

1. **`SUPABASE_SERVICE_ROLE_KEY` en Vercel.** Las rutas de retos y evaluaciones la usan en runtime. Debe estar configurada en el proyecto de Vercel antes de desplegar; si falta, `crearClienteAdmin()` lanza un error explícito.
2. **Rotar `DEMO_PASSWORD`.** El repositorio ya no contiene la contraseña, pero la base de demostración sigue con el valor anterior. Rotarla es una decisión del equipo (afecta a la demo viva):
   ```bash
   DEMO_PASSWORD='<nueva>' npm run db:usuarios
   ```
   y actualizar `DEMO_PASSWORD` en `.env.local` y en el entorno de pruebas.
3. **`casos` sigue visible** a propósito: la pantalla del reto los muestra como ejemplos del enunciado. `reglas` es lo que contiene las respuestas y ya no sale del servidor.

---

## 5. Estado de git

Los cambios de esta fase están sin commitear. Archivos principales:

```
M  .env.example
M  AGENTS.md
M  package.json
M  package-lock.json
M  README.md
M  playwright.config.ts
M  docs/subplan.md
A  docs/subplan_a5.md
A  docs/LINEA_BASE_FASE_0.md
A  docs/FASE_1_INTEGRIDAD.md
A  src/lib/supabase/admin.ts
A  src/app/api/retos/[id]/pista/route.ts
A  supabase/migrations/20261112120000_a5_integridad.sql
M  src/app/(sesion)/retos/[id]/page.tsx
M  src/app/(sesion)/evaluacion/final/page.tsx
M  src/app/api/retos/[id]/borrador/route.ts
M  src/app/api/retos/[id]/verificar/route.ts
M  src/lib/docente/acciones.ts
M  src/lib/evaluacion/dal.ts
M  src/lib/progreso/acciones.ts
M  src/lib/retos/autocompletado.ts
M  src/components/retos/pantalla-*.tsx
M  scripts/*.mjs
M  tests/*.ts
```

---

**Fase 1 completada.** La verificación autoritativa ya no depende de datos que el cliente pueda falsear.
