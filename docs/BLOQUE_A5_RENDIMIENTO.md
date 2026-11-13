# Bloque A5 — Rendimiento, estados y limpieza

**Fecha:** 12 de noviembre de 2026  
**Rama:** `main`  
**Base:** `v0.2.0-beta` + Fase 0/1

---

## 1. Qué se hizo

| Área | Cambio |
|---|---|
| **L9** | La etiqueta de intentos ya no muestra “Intento 4 de 3”: cuando se agotan, dice “Práctica libre · sin puntos” en los 4 tipos de reto y en la evaluación |
| **L7** | `codigoInicial` y `fragmento` salen de `retos.reglas`; el componente conserva un fallback para retos antiguos |
| **RNF08** | El proxy usa `getClaims()` (verificación local) y solo cae a `getUser()` si el token caducó o la clave es simétrica |
| **RNF08** | `obtenerRutaDeModulos` memoizado con `cache()` de React |
| **RNF08** | Índices nuevos para intentos por reto, inscripciones por grupo, lecciones por módulo, retos por lección, asignaciones por grupo y progresos por lección |
| **RNF05** | Endpoint público `/api/salud` (200 si la app y la base responden; 503 si no) |
| **UX** | `not-found.tsx`, `error.tsx` y `loading.tsx` globales, con los tokens del proyecto |
| **Limpieza** | Borrados los 8 MDX de `src/content/modulos/` (no se renderizaban) y las funciones muertas de `lib/contenido/leer.ts` |

---

## 2. Migraciones aplicadas

- `20261112130000_a5_codigo_inicial.sql`: añade `codigo_inicial` y `fragmento` a `retos.reglas` de los retos de código.
- `20261112140000_a5_indices.sql`: seis índices idempotentes.

Ambas aplicadas el 12/11/2026 por el pooler 6543.

---

## 3. Verificación

| Comando | Resultado |
|---|---|
| `typecheck` | ✅ |
| `lint` | ✅ |
| `npm test` | ✅ 33/33 |
| `npm run build` | ✅ 20 rutas (incluye `/api/salud`) |
| `npm run test:e2e` | ✅ **93/93** |
| `npm run test:rls` | ✅ 29 comprobaciones |
| `npm run test:seguridad` | ✅ |
| `GET /api/salud` | ✅ 200 `{"ok":true}` |

---

## 4. Pendiente, y por qué no se hizo aquí

| Tarea | Motivo |
|---|---|
| Agregación SQL del panorama docente (A5-P6) y paginación de intentos (A5-P7) | La lista de intentos alimenta las métricas de RF15. Paginar sin separar las agregaciones sesgaría la tasa de acierto y los errores frecuentes. Requiere una función SQL y validar que las cifras coincidan con la versión Node. |
| Claves asimétricas y región alineada (A5-P1/P2) | Se configuran en el panel de Supabase y Vercel, no en el código. |
| Prueba de carga A/B (A5-C1/C2) | Depende de decidir el escenario (estrés 100 VUs o clase real con pausas). |
| Contenido real de m01, m02 y m04 | Depende del material y la revisión del experto docente. |
| Usabilidad con estudiantes (RNF04) | Requiere personas. |
| Backups y restauración (A5-R3) | Requiere acceso operativo a la base y un destino de respaldo. |
| Rotación de `DEMO_PASSWORD` | Decisión del equipo; afecta a la demo viva. |
| Tag `v1.0.0` | No debe crearse hasta que el contenido y la validación estén cerrados. |

---

## 5. Nota sobre `/api/salud`

Es pública a propósito (`RUTAS_PUBLICAS`), para que un monitor externo pueda consultarla sin sesión. Solo devuelve `{ ok, servicio }`; no expone datos ni errores internos.
