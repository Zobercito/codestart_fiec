# Plan técnico de implementación — Avance 5 (`v1.0.0`)

> **Para qué sirve.** `PLAN_AVANCES.md §6.5` dice *qué* entrega el A5. Este documento dice *cómo*:
> qué se cambia en el código y en la base, en qué orden, cómo se comprueba y qué se recorta si el
> tiempo no alcanza. Sigue el mismo formato que `docs/subplan.md` (A4).
>
> **Punto de partida:** `v0.2.0-beta`, informe A4 entregado el 11 de noviembre de 2026.
> **Entrega:** 25 de noviembre de 2026 (cierre del periodo: 30 de noviembre).
> **Fuente de las cifras:** `docs/INFORME_PRUEBAS.md` y el código del repositorio.

**Supuestos de este plan** (si alguno es falso, hay que revisar el bloque indicado):

1. El A5 es una versión de **cierre y validación**, no de funcionalidad nueva. RF17, RF18, RF08
   completo y el motor de C nivel 2 siguen fuera (`PLAN_AVANCES.md §6.6`). → todos los bloques.
2. El piloto con estudiantes se hará con un grupo reducido y datos de prueba o seudónimos, no con
   datos reales de la facultad. → B4.
3. El Supabase gratuito y Vercel (plan personal) siguen siendo la infraestructura. → B1, B5.
4. Queda abierta la decisión 3 del informe A4: *¿RNF08 se mitiga o se acota el escenario?* Este
   plan hace las dos cosas, y deja la decisión final al profesor con datos (B2).

---

## 1. Objetivo y definición de `v1.0.0`

Cerrar los tres requisitos que la beta dejó sin cumplir o sin verificar y entregar el paquete
documental del calendario.

| Requisito | Estado en la beta | Qué cuenta como cerrado en la 1.0 |
|---|---|---|
| **RNF08** 100 usuarios simultáneos | ❌ p95 54,6 s, 88,7 % de errores | Escenario acordado ejecutado contra producción con p95 y errores dentro del criterio, **o** escenario redefinido por escrito con medición real |
| **RNF04** usabilidad > 8/10 | ❌ no ejecutada | Encuesta aplicada a ≥ 5 personas y reportada tal cual sale |
| **RNF05** disponibilidad ≥ 95 % | 🟡 sin medición | Monitor externo activo ≥ 7 días antes de la entrega, con registro |
| **RNF01** compatibilidad | 🟡 WebKit y Edge sin probar | Suite de compatibilidad ejecutada en WebKit y Edge (CI) |
| **RNF02** < 2 s por lección | 🟡 medido en local | Medido en producción con Lighthouse y red limitada |
| Entrega | — | Tag `v1.0.0`, manuales, acta, plan de mantenimiento, informe A5, sustentación |

**Regla de honestidad (heredada del A4):** si un número no sale, se informa tal cual sale. No se
ajusta el criterio después de medir sin dejarlo escrito y firmado por el profesor.

---

## 2. Diagnóstico técnico de RNF08 (lo que manda el calendario)

La prueba de carga del 28 de octubre dio **2,6 req/s** con 100 usuarios virtuales y una cola de
decenas de segundos. El informe lo atribuye a la latencia por consulta a Supabase. Leyendo el
código, hay causas concretas y medibles, ordenadas por impacto esperado:

| # | Causa observada en el código | Efecto por petición | Fuente |
|---|---|---|---|
| C1 | El proxy llama a `supabase.auth.getUser()` (viaje a Supabase Auth) **y** luego `getClaims()`; después el layout y la DAL vuelven a llamar a `getUser()` | ≥ 2 viajes de red a Auth antes de leer un solo dato; el `cache()` de React solo deduplica dentro del render, no entre proxy y render | `src/lib/supabase/proxy.ts`, `src/lib/auth/dal.ts` |
| C2 | `obtenerMiPerfil()` hace una consulta a `perfiles` en cada petición, aunque el rol ya viene en el JWT | +1 viaje | `src/lib/auth/dal.ts` |
| C3 | `obtenerRutaDeModulos()` lee `modulos` y `lecciones` completos en cada visita; son datos idénticos para los 100 usuarios | 2 consultas redundantes por vista | `src/lib/auth/dal.ts` |
| C4 | `obtenerPanoramaGrupo()` encadena ≥ 6 consultas en dos oleadas y trae **todos** los `intentos` del grupo con `reto → leccion → modulo` anidado, sin límite, para agregarlos en Node | Las rutas del docente son las de p95 46–55 s; crece con los intentos acumulados | `src/lib/docente/dal.ts:305` |
| C5 | `crearClienteSupabase()` llama a `connection()`: todo el árbol se renderiza por petición, sin posibilidad de caché | Descarta cualquier reutilización entre usuarios | `src/lib/supabase/server.ts` |
| C6 | Región: Vercel usa su región por defecto (sin `vercel.json`) y no consta que coincida con la de Supabase | Cada viaje paga RTT transcontinental si no coinciden | por verificar |
| C7 | La medición corrió en la misma máquina que el servidor, con una carpeta sincronizándose, contra un `npm start` local | El resultado es un piso, no la producción | `INFORME_PRUEBAS.md §3.7` |
| C8 | El escenario usa 400 ms de pausa entre peticiones: un estudiante real tarda segundos en leer una lección | 100 VUs a 400 ms son ~250 req/s teóricos, muy por encima de 100 alumnos reales | `scripts/carga.mjs` |

C1–C4 son hipótesis fundadas en el código, **no medidas**: el bloque B1 empieza midiendo antes
de cambiar nada, para no optimizar a ciegas.

---

## 3. Decisiones que hay que congelar antes de codificar

### 3.1 Decisiones de alcance

| # | Decisión | Quién | Fecha límite | Default propuesto |
|---|---|---|---|---|
| E1 | Escenario de aceptación de RNF08 | Profesor | 14 nov | Dos escenarios: **A) estrés** (100 VUs, pausa 400 ms; el actual) y **B) clase real** (100 VUs, pausa 5–10 s). Criterio p95 < 2 s y errores < 1 % en B; A se reporta sin criterio de aceptación |
| E2 | ¿Quiénes participan en el piloto y la encuesta? | Profesor + equipo | 14 nov | 5–8 estudiantes + 1 docente. Plan B: heurística con 3 expertos y RNF04 «parcial» |
| E3 | Instrumento de la encuesta | Equipo | 14 nov | Formulario externo (no dentro de la app): evita código nuevo y datos personales en la base |
| E4 | Forma de la prueba pre/post | Experto en contenido | 14 nov | Reutilizar `/evaluacion/[modulo]` en modo lectura de resultados; ver A5-V2 |
| E5 | Formato de los manuales | Profesor | 14 nov | Word (lo pide el calendario), generados desde Markdown |
| E6 | Congelar alcance de la 1.0 | Equipo | 16 nov | Después solo entran P0/P1 aprobados |

### 3.2 Decisiones técnicas (ADR)

| # | Decisión | Razón | Consecuencia / riesgo |
|---|---|---|---|
| R1 | El proxy deja de llamar a `getUser()` y usa solo `getClaims()`; la DAL también para lecturas | Elimina los viajes a Auth de C1. `getClaims()` verifica firma y caducidad **localmente** si el proyecto usa claves de firma asimétricas | **Condición:** verificar el tipo de clave del proyecto (A5-P1). Con clave simétrica (HS256), `getClaims()` cae a `getUser()` y no se gana nada. Contrapartida: un token revocado sigue válido hasta caducar (≤ 1 h). Las **escrituras** siguen usando `getUser()` |
| R2 | El rol sale del JWT; `perfiles` se consulta solo donde se muestran `nombre` y privacidad | Quita C2 de la ruta caliente | El rol del JWT puede ir desfasado tras `cambiar_rol` hasta el siguiente refresco; ya ocurre hoy en el proxy |
| R3 | `modulos` y `lecciones` se cachean con `"use cache"` + `cacheTag` + `cacheLife`, en un cliente **sin sesión** | Son idénticos para todos y casi inmutables. Quita C3 | Exige que ambas tablas sean legibles sin sesión (política RLS `to anon`, ver A5-P3). **Nunca** cachear `retos`: su `reglas` contiene la solución |
| R4 | El panorama del docente se calcula en Postgres con una función `SECURITY INVOKER` | T5 del A4 ya lo preveía. Una ida y vuelta, datos ya agregados. Quita C4 | Hay que reescribir la agregación y probar que da **los mismos números** que la versión en Node; el RLS sigue aplicando |
| R5 | `vercel.json` fija `regions` a la región de Supabase | Quita C6 | Se decide con la medición de A5-P2, no antes |
| R6 | La prueba de carga se corre contra la URL desplegada, desde una máquina distinta | Quita C7 | Hay que avisar/respetar los límites de uso de Vercel y Supabase gratuitos; ejecutar fuera de horario |

> **Lo que no se toca para cumplir RNF08:** `connection()` (C5) se mantiene. Con cookies de sesión
> el render no es compartible; el beneficio viene de reducir viajes, no de cachear páginas.

---

## 4. Bloques de trabajo

Leyenda: `[ ]` pendiente · **P0** sin esto no hay 1.0 · **P1** necesario · **P2** mejora.
Cada tarea se cierra con el criterio de la columna «Hecho cuando».

### B0 · Limpieza y línea base (12 nov)

| ID | P | Tarea | Archivos | Hecho cuando |
|---|---|---|---|---|
| A5-B0.1 | P0 | Triage de hallazgos del A4: pasar a una tabla única los abiertos de `INFORME_PRUEBAS.md §hallazgos` y cerrar o diferir cada uno con motivo | `docs/INFORME_PRUEBAS.md` | Cero P0/P1 abiertos |
| A5-B0.2 | P1 | Retirar los scripts temporales sin versionar | `scripts/tmp-probar-docente.mjs`, `scripts/tmp-ver-grupo.mjs` | `git status` limpio (borrar, o convertir en script con nombre y documentación) |
| A5-B0.3 | P0 | Regresión completa como línea base | — | `typecheck`, `lint`, `build`, `npm test`, `test:e2e`, `test:rls`, `test:seguridad`, `auditar:contraste` en verde; salida guardada |

### B1 · Rendimiento (RNF08, RNF02) — 12–16 nov

Orden obligatorio: **medir → cambiar de uno en uno → volver a medir**. Una optimización por commit,
con su medición antes/después en el mensaje.

| ID | P | Tarea | Archivos | Hecho cuando |
|---|---|---|---|---|
| A5-P0 | P0 | Instrumentar el tiempo de cada consulta y de cada viaje a Auth en una ruta de estudiante (`/dashboard`) y una de docente (`/docente/grupo/[id]`) | `src/lib/supabase/server.ts` (envoltura temporal), `scripts/medir-rendimiento.mjs` | Tabla «viajes por petición y ms por viaje» en `INFORME_PRUEBAS.md`; confirma o refuta C1–C4 |
| A5-P1 | P0 | Averiguar si el proyecto firma el JWT con clave asimétrica; si es simétrica, migrar a *JWT Signing Keys* en el panel de Supabase | Panel Supabase; `.env.example` si cambia algo | `getClaims()` resuelve sin red (comprobado midiendo A5-P0) |
| A5-P2 | P0 | Averiguar la región del proyecto Supabase y la región de las funciones de Vercel | `docs/DECISIONES.md` | Ambas regiones anotadas; si difieren, añadir `vercel.json` con `regions` y re-medir |
| A5-P3 | P1 | Migración: política de lectura para `anon` en `modulos` y `lecciones` (solo `select`) | `supabase/migrations/2026112xxxxxxx_a5_lectura_referencia.sql` | `test:rls` incluye un caso: `anon` lee módulos/lecciones y **no** lee `retos`, `intentos`, `perfiles` |
| A5-P4 | P1 | R1+R2: proxy y DAL con `getClaims()`; rol desde el JWT; `obtenerMiPerfil()` solo se llama donde se muestra el perfil | `src/lib/supabase/proxy.ts`, `src/lib/auth/dal.ts`, `src/app/(sesion)/layout.tsx` | Viajes a Auth por petición pasan de ≥ 2 a 0; `acceso-por-rol.spec.ts` y `test:seguridad` siguen en verde |
| A5-P5 | P1 | R3: `obtenerModulosYLecciones()` con `"use cache"`, `cacheLife` corto (p. ej. 5 min) y `cacheTag("referencia")`, con un cliente sin cookies | `src/lib/supabase/referencia.ts` (nuevo), `src/lib/auth/dal.ts` | `obtenerRutaDeModulos()` hace 1 consulta (solo `progresos`). Leer antes el comentario de `src/lib/contenido/leer.ts`: ahí ya falló una caché con clave mal elegida |
| A5-P6 | P0 | R4: función SQL `panorama_grupo(p_grupo uuid)` que devuelve por estudiante: lecciones completadas, intentos, aciertos, último acceso, errores frecuentes; y los últimos N intentos | `supabase/migrations/2026112xxxxxxx_a5_panorama_grupo.sql`, `src/lib/docente/dal.ts` | Test de equivalencia: mismo grupo de demo → mismas cifras que la implementación actual (se conserva hasta pasar el test) |
| A5-P7 | P1 | Limitar y paginar las listas de intentos del docente (p. ej. 50 más recientes) | `src/lib/docente/dal.ts`, páginas `/docente/estudiante/[id]` | Una consulta con 10 000 intentos responde en tiempo constante |
| A5-P8 | P2 | Revisar que `Promise.all` cubra todas las consultas independientes de dashboard, módulo y reto | `src/app/(sesion)/**/page.tsx` | Sin cascadas `await` innecesarias |
| A5-P9 | P1 | Índices que falten según `EXPLAIN` de las consultas de A5-P6 | `supabase/migrations/…_a5_indices.sql` | `EXPLAIN` sin `Seq Scan` en tablas grandes |

**Criterio de cierre de B1:** el informe tiene, para cada tarea hecha, la medición anterior y la
posterior. Si tras A5-P1…P6 el escenario B no cumple, se documenta y se escala a la decisión E1.

### B2 · Prueba de carga y escenarios (RNF08) — 16–18 nov

| ID | P | Tarea | Archivos | Hecho cuando |
|---|---|---|---|---|
| A5-C1 | P0 | Parametrizar `scripts/carga.mjs` por escenario (`A` estrés / `B` clase real) y por URL desplegada; añadir ramp-up de 60 s | `scripts/carga.mjs` | Los dos escenarios se lanzan con un comando documentado |
| A5-C2 | P0 | Ejecutar ambos escenarios contra el RC desplegado, desde otra máquina, fuera de horario | — | Salida cruda guardada; tabla de resultados con p50, p95, p99, req/s y errores |
| A5-C3 | P0 | Si falla el escenario B: revisar los límites del plan gratuito (conexiones, rate limit de Auth) para separar «código lento» de «plan insuficiente» | `docs/INFORME_PRUEBAS.md` | Cada fallo clasificado; si es plan, se registra como riesgo con costo estimado |
| A5-C4 | P1 | RNF02: Lighthouse sobre una lección en producción, CPU 4× y Fast 3G | `scripts/medir-rendimiento.mjs` | LCP y TTFB reportados con la URL y la fecha |

### B3 · Release candidate y datos (13–16 nov, en paralelo con B1)

| ID | P | Tarea | Archivos | Hecho cuando |
|---|---|---|---|---|
| A5-R1 | P0 | Congelar el alcance de la 1.0 (decisión E6) | `docs/DECISIONES.md` | Lista de cambios cerrada y firmada |
| A5-R2 | P1 | Seed de demostración reproducible: un comando deja usuarios, grupo, asignación y datos de ejemplo | `package.json`, `supabase/seed.sql`, `scripts/crear-usuarios.mjs` | Desde una base vacía, `db:migrate && db:usuarios && db:seed` deja la demo lista |
| A5-R3 | P0 | Respaldo y restauración: `pg_dump` del esquema y datos, y restauración probada en una base nueva | `scripts/respaldar.sh` (nuevo), `docs/MANTENIMIENTO.md` | Restauración comprobada con `test:rls` en verde sobre la copia |
| A5-R4 | P1 | Verificar variables de entorno de producción frente a `.env.example`; confirmar que `SUPABASE_SERVICE_ROLE_KEY` no tiene prefijo `NEXT_PUBLIC_` ni se importa desde código cliente | `.env.example`, `src/**` | `grep` documentado; ninguna clave en el repositorio |
| A5-R5 | P0 | Tag `v1.0.0-rc` y despliegue del candidato | Git, Vercel | URL de RC verificada con 200 |

### B4 · Validación con usuarios (RNF04) — 17–20 nov

| ID | P | Tarea | Archivos | Hecho cuando |
|---|---|---|---|---|
| A5-V1 | P0 | Protocolo de sesión: guion, tareas críticas, consentimiento con la redacción del aviso de privacidad ya existente | `docs/PROTOCOLO_USABILIDAD.md` (ya existe: actualizar) | Protocolo aprobado por el profesor |
| A5-V2 | P1 | Script de exportación de resultados **seudonimizados** (id → P01…Pn) para la pre/post prueba y las métricas de uso (≥ 70 % completa un módulo asignado) | `scripts/exportar-validacion.mjs` (nuevo, solo lectura, service role, no versionar salidas) | Las salidas no contienen nombre ni correo |
| A5-V3 | P0 | Sesión piloto, pre/post prueba y encuesta | — | Respuestas originales archivadas fuera del repositorio |
| A5-V4 | P0 | Entrevista al docente | — | Notas transcritas con hallazgos |
| A5-V5 | P0 | Pruebas de aceptación RF01–RF16 como acta | `docs/INFORME_VALIDACION.md` | Una fila por RF con resultado y evidencia |
| A5-V6 | P1 | Hallazgos de la sesión: P0/P1 se corrigen antes de `v1.0.0`; el resto va al plan de mantenimiento | issues / `docs/INFORME_VALIDACION.md` | Cada hallazgo con prioridad y destino |

> **Plan B (sin participantes):** evaluación heurística con 3 revisores sobre las tareas críticas;
> RNF04 se declara «parcial». No se simulan respuestas.

### B5 · Disponibilidad, compatibilidad y CI (RNF05, RNF01) — 13–20 nov

| ID | P | Tarea | Archivos | Hecho cuando |
|---|---|---|---|---|
| A5-D1 | P1 | Endpoint de salud que ejecuta una consulta mínima y responde `{ ok }` sin detalles internos | `src/app/api/salud/route.ts` (nuevo); añadir la ruta a las públicas en `src/lib/auth/roles.ts` | `GET /api/salud` → 200 con la base arriba, 503 si cae |
| A5-D2 | P1 | Monitor externo (UptimeRobot o similar) sobre `/api/salud`, cada 5 min, desde ≥ 7 días antes de la entrega | — | Exportación del historial adjunta al informe |
| A5-D3 | P1 | Workflow de CI: `typecheck`, `lint`, `build`, `npm test`, y E2E con matriz `chromium` / `firefox` / `webkit` y canal `msedge` | `.github/workflows/ci.yml` (nuevo), `playwright.config.ts` | Pipeline verde; cierra la limitación «WebKit y Edge no se prueban en el host» |
| A5-D4 | P2 | Los secretos del CI (URL y claves de una base **de pruebas**) van como *secrets* del repositorio; no se usa la base de producción | Ajustes del repositorio | Ningún secreto en el YAML |

### B6 · Documentación y capacitación — 20–23 nov

| ID | P | Entregable | Fuente en el repo |
|---|---|---|---|
| A5-M1 | P0 | Manual del estudiante | `docs/captura-*.webp` y flujos de `tests/flujo-estudiante.spec.ts` |
| A5-M2 | P0 | Manual del docente (grupos, asignaciones, seguimiento, errores, modo clase) | `tests/flujo-docente.spec.ts` |
| A5-M3 | P1 | Manual del administrador (cambio de rol por RPC `cambiar_rol`, usuarios, respaldo) | `supabase/migrations/…privacidad_rol.sql` |
| A5-M4 | P0 | Manual técnico: arquitectura, despliegue, variables, migraciones, pruebas | `docs/ARQUITECTURA.md`, `docs/MODELO_DATOS.md`, README |
| A5-M5 | P0 | Guía de mantenimiento: contenido MDX, respaldos, monitoreo, incidentes, rotación de claves | `docs/MANTENIMIENTO.md` (nuevo) |
| A5-M6 | P1 | Sesión de capacitación: guion, lista de asistencia | — |
| A5-M7 | P2 | FAQ y guía de una página; video corto (D6: solo si sobra tiempo) | — |

### B7 · Cierre — 24–25 nov

| ID | P | Tarea | Hecho cuando |
|---|---|---|---|
| A5-X1 | P0 | `npm run typecheck && npm run lint && npm run build` y suites completas, sin P0/P1 | Salida guardada |
| A5-X2 | P0 | Tag `v1.0.0` y despliegue de producción | URL con 200; README con versión y fecha |
| A5-X3 | P0 | Acta de aceptación y plan de mantenimiento (roadmap de `PLAN_AVANCES.md §6.6`) | Documentos para firma |
| A5-X4 | P0 | Paquete ZIP con nombre `codestart-fiec_v1.0.0_2026-11-25`: código, PDFs, manuales, acta, evidencias | Verificado al descomprimir en limpio |
| A5-X5 | P0 | `docs/INFORME_A5.md` con las 6 secciones del calendario | Revisado por el equipo |
| A5-X6 | P1 | Sustentación: diapositivas, guion, demo en vivo y vídeo de respaldo | Ensayo hecho |

---

## 5. Orden y dependencias

```
B0 línea base ──► B1 medir (P0) ──► P1,P2 ──► P3,P4,P5,P6 ──► P7,P9
                                                  │
B3 congelar alcance (16 nov) ◄────────────────────┘
        │
        ▼
 RC desplegado ──► B2 carga (C1→C2→C3) ──► decisión E1/profesor
        │
        └──► B4 validación (necesita RC estable) ──► V6 correcciones ──► B7
B5 salud/monitor: arrancar YA (necesita 7 días de historial)
B6 manuales: se escriben sobre el RC; se retocan tras V6
```

**Ruta crítica:** A5-P0 → A5-P1 → A5-P4/P6 → RC → A5-C2 → V3 → V6 → X2.

**Arrancar de inmediato, porque dependen del calendario y no del código:** A5-D2 (7 días de
monitoreo), reservar participantes (E2) y fijar fecha de sesión.

### Calendario

| Fechas | Bloques | Hito |
|---|---|---|
| 12–13 nov | B0, A5-P0…P2, arranque de A5-D1/D2 | Línea base y diagnóstico medido |
| 14–16 nov | A5-P3…P9, B3, decisiones E1–E6 | `v1.0.0-rc` desplegado |
| 16–18 nov | B2 | Resultados de carga |
| 17–20 nov | B4, B5 (CI) | Sesión piloto y encuesta |
| 20–23 nov | V6, B6 | Manuales y capacitación |
| 24–25 nov | B7 | `v1.0.0`, ZIP, informe, sustentación |

**Margen:** el calendario tiene ~14 días para ~35 tareas. Si se retrasa, se recorta en este orden:
A5-M7 → A5-D4 → A5-P8 → A5-D3 (webkit/edge) → A5-M3. **No se recortan** B2, B4, B7 ni las tareas P0.

---

## 6. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| El proyecto usa clave de firma simétrica y R1 no ahorra nada | Media | Alto | A5-P1 va primero; si no se puede migrar, bajar el peso de R1 y apoyarse en R3/R4 |
| Reescribir el panorama en SQL cambia cifras del panel | Media | Alto | Test de equivalencia (A5-P6) antes de borrar la versión en Node |
| `anon` con `select` en `modulos`/`lecciones` abre más de lo previsto | Baja | Alto | Política limitada a `select`; caso nuevo en `test:rls`; `/security-review` antes del merge |
| El plan gratuito de Supabase limita conexiones o Auth y no se llega al criterio | Media | Alto | A5-C3 separa causa; se presenta el costo del plan superior y el escenario B como acotación, con firma |
| La prueba de carga contra producción activa límites o bloqueos del proveedor | Media | Medio | Fuera de horario, ramp-up, datos de prueba, avisar antes; si molesta, correr contra un *preview* |
| No hay participantes para el piloto | Media | Alto | E2 se cierra el 14 nov; plan B heurístico con RNF04 «parcial» |
| Datos personales de estudiantes en las evidencias | Media | Alto | Seudonimizar (A5-V2); respuestas originales fuera del repo; aviso de privacidad vigente |
| La suite E2E se rompe por cambios de B1 | Media | Medio | Una optimización por commit y regresión tras cada una |
| Manuales y capacitación se amontonan al final | Alta | Medio | Escribir los manuales sobre el RC (20 nov) y solo retocar |

---

## 7. Seguridad: puntos que tocan este plan

Los cambios de B1 afectan autenticación y acceso a datos. Antes de cerrar el RC, ejecutar
`/security-review` sobre: A5-P3 (política `anon`), A5-P4 (`getClaims()` en lugar de `getUser()`),
A5-P6 (función SQL y su `SECURITY INVOKER`), A5-D1 (endpoint público) y A5-V2 (script con
service role). Reglas:

- `getClaims()` solo para **lecturas**; cualquier escritura, Server Action o cambio de rol sigue
  confirmando con `getUser()`.
- La función `panorama_grupo` es `SECURITY INVOKER` y comprueba el grupo con el RLS; no recibe un
  id de usuario del cliente.
- `/api/salud` no devuelve versiones, mensajes de error ni nombres de tablas.
- El script de exportación valida su entorno y no se ejecuta desde la app.
- La clave de servicio nunca en el cliente ni en el CI.

---

## 8. Definición de terminado (DoD) del A5

- [ ] `npm run typecheck && npm run lint && npm run build` sin errores.
- [ ] `npm test`, `npm run test:e2e`, `npm run test:rls` y `npm run test:seguridad` en verde.
- [ ] `npm run auditar:contraste` sin fallos.
- [ ] CI en verde en `chromium`, `firefox`, `webkit` y `msedge`.
- [ ] RNF08: dos escenarios medidos contra producción y decisión E1 firmada.
- [ ] RNF04: encuesta aplicada y reportada (o declarada «parcial» con el plan B).
- [ ] RNF05: ≥ 7 días de historial de monitoreo adjunto.
- [ ] Respaldo restaurado y probado.
- [ ] Cero P0/P1 abiertos.
- [ ] `v1.0.0` desplegado y etiquetado; README actualizado.
- [ ] Manuales, guía de mantenimiento, acta, informe de validación e `INFORME_A5.md`.
- [ ] Paquete ZIP verificado y sustentación ensayada.
