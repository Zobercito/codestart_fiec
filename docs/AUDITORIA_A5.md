# Auditoría técnica — CodeStart FIEC · Avance 5 (`v1.0.0`)

**Fecha de auditoría:** 23 de noviembre de 2026 (America/Panama)  
**Entrega declarada:** 25 de noviembre de 2026  
**Repositorio auditado:** `CodeStart_FIEC/`  
**Commit auditado:** `4f1b6d7 perf(a5): acelera el proxy, indexa el panel y cierra estados de UI` (12 nov 2026 21:33 −05:00)  
**Versión del paquete:** `0.2.0-beta`  
**Tags existentes:** `v0.1.0-alpha`, `v0.2.0-beta`  
**Tag `v1.0.0`:** no existe  
**Modo:** la auditoría inicial fue de solo lectura sobre el código; no se hizo commit ni se desplegó y no se rotaron claves. Al restaurarse el backend se ejecutaron las suites del propio proyecto (`test:e2e`, `test:rls`, `test:seguridad`, `auditar:contraste`), que crean y limpian datos temporales de prueba; la suite E2E modifica el estado de la cuenta demo. Después se ejecutó el **Grupo 1** (ver addendum): eso sí modificó código, aplicó una migración y escribió datos de prueba. El resto del informe describe el estado auditado antes de ese grupo.

> **Actualización 23/11 19:35:** el proyecto Supabase `vorhdykyfnklwcfwhfme` volvió a responder. Producción hace login correctamente (`/dashboard`), `/api/salud` devuelve 200 y las suites técnicas ya se pudieron ejecutar. La limitación inicial de backend queda resuelta; se mantiene la distinción entre **verificado**, **no verificado** y **supuesto**.

---

## 1. Veredicto de entrega

### **NO LISTO.**

Hoy no se puede entregar el A5 tal como está definido. El backend ya está restaurado y el flujo principal funciona en producción (login → `/dashboard`; `/api/salud` 200), pero no existe `v1.0.0` ni despliegue etiquetado, y no existe ninguno de los entregables documentales del cierre: informe de validación, manuales, capacitación, acta, mantenimiento, plan de respaldos, informe A5 ni paquete ZIP. Además, RNF04, RNF05, RNF08 y la compatibilidad WebKit/Edge siguen sin evidencia.

**Mínimo imprescindible para poder entregar:**

1. Mantener el backend disponible y repetir el smoke test justo antes de la demo (login real + un módulo completo).
2. Congelar el alcance, desplegar `HEAD` y crear el tag `v1.0.0`; actualizar versión y README.
3. Escribir el paquete A5 (informe de validación, 4 manuales, mantenimiento, respaldos, acta, informe A5, ZIP) y adjuntar la regresión real.
4. Corregir o declarar los P1 abiertos (pistas/respuestas, cambio de rol, rendimiento, contenido 1,2 y 4) y declarar por escrito lo que no se verificó (RNF04, RNF05, RNF08, WebKit/Edge, accesibilidad manual, respaldos).

Aun cumpliendo lo anterior, la entrega sería **«lista con reservas»**, nunca «lista»: la validación con estudiantes y la carga a 100 usuarios no se pueden improvisar en dos días.

---

## 2. Resumen ejecutivo

- **P0 resuelto · Backend restaurado.** El 23/11 a las 19:35 el proyecto Supabase volvió a responder: `/api/salud` 200 local (665 ms) y producción (2,6 s), login de producción → `/dashboard`, pooler con 8 módulos y 2 perfiles. El P0 original queda cerrado; la demo vuelve a ser posible.
- **P0 · El A5 documental no existe.** `docs/` solo tiene los informes del A3/A4 y los planes; no hay `INFORME_VALIDACION.md`, manuales, `MANTENIMIENTO.md`, acta, informe A5, ZIP ni material de sustentación. El checklist §12 del plan está entero sin marcar.
- **P0 · No hay `v1.0.0`.** `git tag -l 'v1*'` no devuelve nada; `package.json` sigue en `0.2.0-beta`; el despliegue de producción no está etiquetado.
- **P1 · Integridad de pistas y respuestas (confirmado en ejecución).** Con un JWT de estudiante, `GET /rest/v1/retos?select=pistas` devuelve 200 con las pistas; `GET /rest/v1/intentos?select=resultado` devuelve `correctas`/`detalle` de evaluaciones y autocompletados. El descuento de 10 puntos y el anonimato de la respuesta correcta son evitables.
- **P1 · El endpoint de pistas está roto.** `POST /api/retos/[id]/pista` devuelve **500** en 603 ms («No se pudo guardar la pista»); escribe `pistas_usadas` con el cliente del usuario, pero la migración A5 solo le concede `codigo` y `actualizado_en`, y además el `upsert` pone `codigo: ""`. La UI ignora `r.ok`, así que el botón «Revelar pista» no hace nada.
- **P1 · Cambio de rol roto.** `cambiar_rol()` actualiza `perfiles.rol` pero no `auth.users.raw_user_meta_data`; el proxy sigue leyendo el rol del JWT. Un estudiante promovido a docente queda en un bucle `/dashboard` ↔ `/docente`; una cuenta creada sin metadatos de rol también.
- **P1 · RNF08 sigue abierto y la región no coincide.** El panorama docente sigue trayendo todos los `intentos` sin límite (`docente/dal.ts:358-371`), no hay función SQL ni paginación, y producción responde con `x-vercel-id: iad1` mientras el pooler está en `aws-1-us-west-2`: cada consulta paga un RTT EE. UU. este ↔ Oregón.
- **P1 · Las cifras y los tests siguen desalineados.** La suite ya corre (93/93 E2E, 32/32 RLS, contraste 0/7), pero los tests tienen UUIDs hardcodeados que cambian al resembrar, el README sigue diciendo 84 E2E/22 RLS y `db:seed`, `db:types` y `db:migrate` siguen sin funcionar en esta máquina.
- **P1 · Contenido 1.0 incompleto.** Tres de las nueve lecciones (`m01`, `m02`, `m04`) son de 11 líneas y dicen «Contenido en preparación»; el README y la portada presentan ocho módulos con actividad interactiva. El módulo 8 se completa leyendo la lección, sin aprobar la evaluación final.

---

## 3. Matriz de cumplimiento A5

Referencias: `docs/PLAN_AVANCES.md §6.5` y `§12`; `docs/subplan_a5.md §8`.

| # | Ítem del checklist A5 | Estado | Evidencia | Qué falta |
|---|---|---|---|---|
| 1 | Hallazgos del A4 corregidos (F01–F20) | **Parcial** | F01, F02, F03, F04, F05, F06, F09 corregidos en código; F15/F16/F20 no; F13/F14 abiertos | Cerrar F16, F20 y los RNF; ver §4 |
| 2 | Regresión completa en verde | **Parcial** | `npm test` 38/38, `lint`, `typecheck`, `build` (20 rutas), **E2E 93/93**, **RLS 32/32**, `test:seguridad` y contraste 0/7 pasan | WebKit/Edge y CI de navegadores; la suite E2E no se ejecuta en CI |
| 3 | Versión 1.0 desplegada | **No hecho** | Producción responde y el login funciona (`/dashboard`), `/api/salud` 200; no hay `v1.0.0` ni despliegue etiquetado | Congelar, versionar, desplegar y etiquetar |
| 4 | Tag `v1.0.0` | **No hecho** | `git tag -l` solo muestra `v0.1.0-alpha` y `v0.2.0-beta` | Crear tag tras congelar |
| 5 | Informe de validación con aprendizaje, usabilidad y uso | **No hecho** | No existe `docs/INFORME_VALIDACION.md`; `INFORME_PRUEBAS.md §5` dice «no ejecutada» | Piloto, pre/post, encuesta, métricas de uso |
| 6 | Manual del estudiante | **No hecho** | `ls docs` no contiene manuales | Documento + capturas |
| 7 | Manual del docente | **No hecho** | Ídem | Grupos, asignar, seguimiento, errores, modo clase |
| 8 | Manual del administrador | **No hecho** | Ídem; además no hay interfaz de administración | RPC `cambiar_rol`, alta/baja, respaldo |
| 9 | Manual técnico | **No hecho** | Solo README/ARQUITECTURA parciales | Arquitectura, despliegue, variables, migraciones, pruebas |
| 10 | Guía de mantenimiento | **No hecho** | No existe `docs/MANTENIMIENTO.md` | Contenido MDX, backups, monitor, incidentes, rotación |
| 11 | Plan de respaldos y restauración probada | **No hecho** | No existe `scripts/respaldar.sh` ni evidencia de `pg_dump`/restore | Script + prueba en base nueva |
| 12 | Capacitación realizada y documentada | **No hecho** | No hay guion, grabación ni lista de asistencia | Sesión + evidencias |
| 13 | Acta de aceptación firmada | **No hecho** | No existe | Documento con RF, resultados y firmas |
| 14 | Paquete comprimido con fecha y versión | **No hecho** | No hay ZIP en el repositorio ni en la raíz | `codestart-fiec_v1.0.0_2026-11-25.zip` |
| 15 | Informe A5 con las 6 secciones | **No hecho** | No existe `docs/INFORME_A5.md` | Redactar y revisar |
| 16 | Sustentación ensayada y material listo | **No hecho** | No hay diapositivas, guion ni video | Material + ensayo |
| 17 | RNF08: dos escenarios medidos contra producción | **No hecho** | `INFORME_PRUEBAS §3.7` solo tiene el escenario de estrés del 28 oct; no hay medición nueva | Escenario A/B, p50/p95/p99, errores |
| 18 | RNF04: encuesta ≥ 5 personas o plan B heurístico | **No hecho** | `INFORME_PRUEBAS §5`: «no ejecutada» | Sesión o heurística de 3 expertos, declarada |
| 19 | RNF05: monitor ≥ 7 días | **No hecho** | No hay configuración de UptimeRobot ni historial; `/api/salud` ya responde 200 | Monitor + exportación |
| 20 | RNF01: WebKit y Edge ejecutados | **No hecho** | `playwright.config.ts` solo tiene Chromium escritorio, tableta y Firefox | Proyectos WebKit/msedge + CI |
| 21 | RNF02: Lighthouse en producción con red limitada | **No hecho** | Solo medición local del 28 oct | Medición contra URL desplegada |
| 22 | CI en verde en Chromium/Firefox/WebKit/Edge | **No hecho** | `.github/workflows/ci.yml` solo hace install/typegen/lint/typecheck/test/build | Matriz de navegadores + E2E/RLS/contraste |
| 23 | Seed reproducible: un comando deja la demo lista | **No hecho** | `npm run db:seed` falla porque no hay `psql`; `db:types` falla porque no hay binario `supabase`; `db:migrate` usa `--linked` y PAT | Script con `pg`/`npx`, entorno documentado |
| 24 | Respaldo restaurado y probado | **No hecho** | Sin script ni evidencia | Ídem #11 |

**Resumen:** 0 ítems «hecho», 2 «parcial» (hallazgos A4 y regresión técnica), 22 «no hecho» y 0 «no verificable». El A5, como entrega de cierre, está prácticamente sin empezar; el código del A4/A5 temprano existe y la regresión técnica pasa, pero el paquete de validación no.

---

## 4. Matriz de requisitos RF/RNF en riesgo

Solo los que están en riesgo o sin evidencia. El estado es el **real**, no el declarado.

| ID | Requisito | Estado real | Evidencia | Riesgo para el 25/11 |
|---|---|---|---|---|
| RF04 | Retos y pistas | **Parcial / integridad rota** | Pistas legibles y enviadas al cliente; endpoint `/pista` no escribe; autocompletado devuelve `correcta` tras fallar | Alto: el estudiante evita el descuento y ve respuestas |
| RF05 | Evaluaciones | **Parcial** | Autoevaluación y final existen; la final no es obligatoria para completar el curso; `intentos.resultado` guarda respuestas correctas | Medio: la nota no certifica el curso |
| RF06 | Progreso e insignias | **Parcial** | Progreso persiste; insignias por trigger; «curso» se obtiene sin aprobar la evaluación final; `primer_reto` se otorga también en evaluaciones | Medio: insignias engañosas |
| RF08 | Administración de usuarios | **Fuera de alcance declarado** | No hay `/admin`; el cambio de rol es por RPC y el JWT se desincroniza | Medio: el manual del administrador no tiene interfaz que describir |
| RF09 | Lecciones multimedia | **Parcial** | 3 de 9 lecciones son placeholders; no hay videos | Alto para la calidad del 1.0 |
| RF16 | Modo clase | **Parcial** | Es una previsualización del docente (`modoClase`), no una ruta `/clase`; en retos de código el botón «Verificar» sigue visible y devuelve 403 | Bajo/medio |
| RF17 | Exportación CSV | **Fuera de alcance** | Declarado fuera | Ninguno si se declara |
| RF18 | Editor de contenidos | **Fuera de alcance** | Declarado fuera | Ninguno si se declara |
| RNF01 | Compatibilidad | **Parcial** | Chromium escritorio/tableta y Firefox en config; WebKit y Edge no | Alto: requisito del A5 |
| RNF02 | < 2 s por lección | **No verificado hoy** | LCP local 1,1–1,3 s del 28 oct; no hay medición de producción | Medio |
| RNF03 | Seguridad por rol | **Parcial** | RLS sólido; F09 corregido; pero el rol del JWT se desincroniza y hay fugas de integridad | Alto |
| RNF04 | Usabilidad > 8/10 | **No ejecutada** | `INFORME_PRUEBAS §5` | Alto: sin datos no se puede declarar |
| RNF05 | Disponibilidad ≥ 95 % | **Parcial / sin medición** | `/api/salud` 200 y login funcionan tras restaurar; no hay monitor ni historial | Alto: no se puede demostrar el 95 % |
| RNF06 | WCAG 2.1 AA | **Parcial** | axe público 3/3; contraste 0/7; estados no visitados con fallos 4,35:1 y 4,23:1; revisión manual pendiente | Medio/alto |
| RNF07 | Código de usuario aislado | **Parcial** | Análisis estático en servidor; el timeout de 5 s se comprueba **después** de analizar; el Worker local es código muerto | Medio |
| RNF08 | 100 usuarios simultáneos | **No cumple** | p95 54,6 s y 88,7 % de timeouts del 28 oct; sin cambios de fondo; región Vercel `iad1` vs Supabase `us-west-2` | Alto: bloquea el uso de clase completa |
| RNF09 | Privacidad (Ley 81) | **Parcial** | Aviso y columnas de aceptación; el script de cuentas marca `acepta_privacidad=true` por el usuario; no hay retención/anonimización | Medio |

### 4.1 Estado de los hallazgos F01–F20

| ID | Estado real | Nota breve |
|---|---|---|
| F01 Progreso no se guarda | **Corregido** | `marcarLeccionVista` hace `upsert` con service_role; **E2E 93/93** incluye «marcar lección persiste» |
| F02 % por filas de progreso | **Corregido** | `obtenerRutaDeModulos` cuenta lecciones reales; test unitario 7/7 |
| F03 Módulos 5–8 sin contenido | **Corregido en estructura** | Hay lección y actividades; 1, 2 y 4 siguen siendo placeholders |
| F04 `/docente` 404 | **Corregido** | La ruta existe y el E2E del docente pasa |
| F05 Panel docente ausente | **Corregido** | Panel, grupo, estudiante, grupos y asignar existen; E2E 93/93 |
| F06 Insignias no se otorgan | **Corregido** | Triggers `SECURITY DEFINER`; el E2E «Primer reto» pasa |
| F07 Sin evaluaciones | **Corregido en estructura** | Autoevaluación 1–7 y final |
| F08 Sin modo clase | **Parcial** | Previsualización docente, sin ruta dedicada |
| F09 Escalada de rol en alta | **Corregido** | El trigger fuerza `estudiante`; el test solo prueba el vector si el alta pública está habilitada |
| F10 Sin aviso de privacidad | **Parcial** | Página y banner; consentimiento no exigido fuera del dashboard |
| F11 RNF07 contradice el diseño | **Documentado, no aprobado** | ADR-001; no hay visto bueno del profesor |
| F12 Textos sin enlace | **Corregido** | «Módulos», «Mis tareas», «Mis medallas» enlazan |
| F13 Cobertura limitada | **Parcial** | 38 unitarias, 93 E2E declaradas, 32 RLS; sin integración separada, sin cobertura |
| F14 A2 sin validación de prototipo | **Abierto** | No hay evidencia de validación |
| F15 Motor sin bucles/arreglos | **Abierto por decisión** | Los módulos 5–6 se validan con conceptuales/ordenamiento |
| F16 `intentos_maximos` no bloquea | **Abierto** | Solo quita puntos; permite práctica indefinida |
| F17 Sin videos | **Fuera de alcance** | Declarado |
| F18 README/A3 con despliegue pendiente | **Parcial** | `INFORME_A4` sigue diciendo «despliegue pendiente de publicación» |
| F19 Sin interfaz de administración | **Fuera de alcance** | Declarado |
| F20 `modulos.archivo_contenido` muerto | **Abierto** | El seed apunta a `modulos/*.mdx` que ya no existen y nadie lee esa columna |

---

## 5. Hallazgos

Ordenados por severidad. «Verificado» = leído en código o ejecutado; «supuesto» = inferencia sin confirmar.

| ID | Sev. | Área | Título | Evidencia | Impacto | Causa raíz | Arreglo mínimo | Esf. (h) | Riesgo del arreglo |
|---|---|---|---|---|---|---|---|---|---|
| A5-01 | **P0 resuelto** | Operación | Backend Supabase estaba caído; restaurado el 23/11 19:35 | Antes: `/api/salud` 503, login «fetch failed», pooler `tenant/user ... not found`. Ahora: `/api/salud` 200 local (665 ms) y producción (2,6 s); login producción → `/dashboard`; pooler con 8 módulos/2 perfiles | Ya no bloquea la demo; queda la fragilidad de no tener respaldo ni monitor | Proyecto pausado/recuperado en Supabase (causa exacta no confirmada) | Mantenerlo activo y monitorizado; hacer respaldo antes de cualquier `seed`/migración | 0,5 (verificación) | Bajo ahora; alto si vuelve a pausarse sin respaldo |
| A5-02 | **P0** | Entrega | Paquete documental A5 ausente | `ls docs` solo lista informes A3/A4/planes; `find` no encuentra manuales, acta, validación, mantenimiento, ZIP; §12 sin marcar | No se puede entregar el A5 aunque la app funcione | El A5 se abandonó el 12 nov; solo se hizo Fase 0/1 | Escribir los 6 documentos + 4 manuales + acta + ZIP; o declarar formalmente el A5 incompleto | 12–16 | Bajo técnico; alto si se inventan métricas |
| A5-03 | **P0** | Entrega | No existe `v1.0.0` ni despliegue etiquetado | `git tag -l 'v1*'` vacío; `package.json:3` `0.2.0-beta`; README «beta» | La entrega no tiene versión congelada ni trazabilidad | No se llegó a la fase B7 | Bump a 1.0.0, tag, deploy y verificación | 0,5 | Bajo |
| A5-04 | **P0** | Validación | No hay informe de validación ni métricas de aprendizaje/usabilidad/uso | No existe `docs/INFORME_VALIDACION.md`; `INFORME_PRUEBAS.md:202-206` declara RNF04 no ejecutada | RNF04/RNF05/RNF08 sin evidencia; el A5 pierde su propósito | No hubo pilotos ni sesión de usabilidad | Hacer piloto/heurística y reportar tal cual; si no hay participantes, declarar «no verificado» | 6–8 + sesión | Alto si se simulan resultados (prohibido) |
| A5-05 | **P1 → corregido en código (Grupo 1); pendiente deploy** | Integridad | Pistas y respuestas correctas filtradas al cliente (confirmado en ejecución) | `a5_integridad.sql:27-39` concede `pistas`; con JWT de estudiante `GET /rest/v1/retos?select=pistas` → 200 con pistas; `GET /rest/v1/intentos?select=resultado` → 200 con `correctas`/`detalle`; `POST /api/retos/.../pista` → 500 en 603 ms | El estudiante ve pistas gratis y respuestas correctas; el descuento de 10 pts es evitable | Se protegió `reglas` pero no `pistas` ni `intentos.resultado`; el endpoint de pista usa el cliente del usuario | Enviar solo pistas reveladas; revocar `select(pistas)`; guardar resultados saneados (sin `correctas`/`detalle.correcta`); el docente solo necesita `regla_incumplida` | 2 | Medio: toca API, 4 pantallas y panel |
| A5-06 | **P1** | Acceso | Cambio de rol desincronizado: bucle de redirección | `roles.ts:57-62` lee `user_metadata.rol`; `proxy.ts:31,39-41` redirige; `cambiar_rol` (`a4_privacidad_rol.sql:102-104`) solo actualiza `perfiles`; `dashboard/page.tsx:25` redirige a `/docente` | Un usuario promovido no entra; una cuenta sin metadatos de rol puede quedar en bucle | El JWT no se actualiza al cambiar el rol; el proxy asume que el metadato siempre existe | Actualizar `auth.users.raw_user_meta_data` en `cambiar_rol` y en el alta; si `rol` es null, no bloquear en el proxy y dejar decidir a la DAL | 1,5 | Medio: toca Auth y proxy |
| A5-07 | **P1** | Rendimiento | RNF08 sin cerrar; panorama docente sin límite; región desalineada | `docente/dal.ts:358-371` trae todos los `intentos` con joins; `subplan_a5.md:53`; `INFORME_PRUEBAS.md:131-141` p95 54,6 s; producción `x-vercel-id: iad1`, pooler `aws-1-us-west-2`; no hay `vercel.json` | Un grupo completo no puede usar el panel; la demo se percibe lenta | Agregación en Node, sin paginación ni SQL; Vercel y Supabase en regiones distintas | A corto: fijar región Vercel `pdx1` (us-west-2) y limitar intentos a 50; a medio: función SQL `panorama_grupo` + índices reales | 1 (región) / 8 (SQL) | Medio: la función SQL puede cambiar cifras; probar equivalencia |
| A5-08 | **P1** | Pruebas | Suite ejecutada, pero frágil por UUIDs y cifras obsoletas | **93/93 E2E pasan en 9,6 min**; 32/32 RLS; contraste 0/7. Pero `npx playwright test --list` → 93 y README/INFORME dicen 84; `INFORME_PRUEBAS` 22 RLS vs 30; IDs en `flujo-estudiante:14-16`, `flujo-beta:12`, `flujo-evaluacion:14-15`, `accesibilidad:16`, `compatibilidad:14`, `auditar-contraste:39-40`, `medir-rendimiento:24`, `carga:38-39` | Al resembrar cambian los UUID y la suite falla; las cifras del informe no son las del código | Tests acoplados a datos del seed y documentación no actualizada | Resolver ids por enunciado/tipo desde la BD o sembrar UUIDs fijos; actualizar cifras | 3 | Medio: toca todos los specs |
| A5-09 | **P1** | Reproducibilidad | Comandos de demo rotos y seed destructivo | `npm run db:seed` → `psql: orden no encontrada`; `npm run db:types` → falla (spawn `supabase` ausente); `db:migrate` usa `--linked`; `seed.sql:18-26` borra intentos/progresos/insignias/grupos/módulos | No hay «un comando deja la demo lista»; un `db:seed` contra producción destruye el avance real | Dependencias de sistema no declaradas; un solo Supabase para demo y datos | Reescribir seed con `pg`/`npx supabase`, o documentar `psql`; separar base de demo; añadir confirmación y backup previo | 2 | Alto: el seed borra datos; no ejecutar sin respaldo |
| A5-10 | **P1** | CI | CI no ejecuta E2E/RLS/contraste/compatibilidad | `.github/workflows/ci.yml:26-37` solo install/typegen/lint/typecheck/test/build; `playwright.config.ts` sin WebKit/msedge | El pipeline puede estar verde con el flujo principal roto | Faltan secretos de una base de pruebas y la matriz de navegadores | Añadir jobs con base de pruebas y matriz Chromium/Firefox/WebKit/msedge; RLS/contraste | 2–3 | Medio: secretos y coste de CI |
| A5-11 | **P1** | Contenido | Tres lecciones del 1.0 son placeholders | `m01`, `m02`, `m04` tienen 11 líneas y «Contenido en preparación»; `modulos/page.tsx:24-25` promete explicación + actividad + autoevaluación en cada módulo | El curso no enseña los módulos 1, 2 y 4; el 1.0 queda incompleto | El material del experto no llegó (declarado en `BLOQUE_A5:55`) | Escribir el contenido o declararlo abiertamente y ajustar README/portada | 8–12 | Bajo técnico; alto de tiempo |
| A5-12 | **P1** | Seguridad | Sin CSP/XFO/Referrer-Policy; cookies de sesión sin `httpOnly`/`Secure`; Next 16.4.1 con avisos | `next.config.ts` sin `headers`; respuesta de producción solo HSTS; `server.ts:30-33` y `proxy.ts:14-17` sin `cookieOptions`; `@supabase/ssr` default `httpOnly:false`; `npm audit --omit=dev` 1 moderate (Next 16.4.1) | Clickjacking, robo de sesión si hubiera XSS, y avisos de caché/cookie | Configuración por defecto; no se endureció | Añadir cabeceras, `cookieOptions {httpOnly:true, secure:true, sameSite:'lax'}`, actualizar Next a 16.4.6 | 1,5 | Medio: CSP puede romper estilos/CodeMirror; empezar en report-only |
| A5-13 | **P1** | Operación | No se pueden provisionar 5–8 estudiantes ni exportar validación | `crear-usuarios.mjs:28-31` solo crea 2 cuentas fijas; no existe `scripts/exportar-validacion.mjs` (A5-V2); no hay seudonimización | El piloto del A5 no se puede ejecutar sin editar código o usar el panel de Supabase a mano | Script pensado para demo, no para curso | Aceptar lista CSV/env de estudiantes; exportar resultados seudonimizados; documentar alta | 3 | Bajo/medio |
| A5-14 | **P2** | Integridad | `intentos_maximos` solo avisa; doble envío puede puntuar dos veces | `verificar/route.ts:147-158` calcula `quedan` y `puntuable`; no hay retorno temprano; UI `pantalla-reto.tsx:169-171`; conteo e inserción no son atómicos | Se puede practicar indefinidamente y farmear puntos con peticiones paralelas | Decisión D9 no aplicada como bloqueo; sin idempotencia | Bloquear tras el máximo o declarar «práctica sin puntos» y añadir clave de idempotencia/unique | 2 | Medio: cambia UX y tests |
| A5-15 | **P2** | Motor C | El motor no cubre lo que promete el subconjunto | `tipos.ts:35-57` sin bucles/arreglos; `sintactico.ts:126-152`; `motor.ts:105-111` no sustituye `%d`; `motor.ts:187-188` ejecuta ambas ramas y muta el entorno; `:200-201` `return` es no-op; `verificarReglas` exige el operador literal (`18 <= edad` se rechaza) | Diagnósticos falsos y límites ocultos; no valida programas con variables impresas | Subconjunto deliberadamente pequeño; simulación incompleta | Documentar el subconjunto y los límites; añadir tests de no-tomada de rama/return; ampliar solo si el contenido lo exige | 4–8 | Alto si se amplía; bajo si se documenta |
| A5-16 | **P2** | API | Validación de entrada y robustez insuficientes; timeout no aborta | `verificar/route.ts:107-125` no valida forma (body `null` → 500); `:324-337` comprueba 5 s **después** de analizar; `:349` ignora el error del insert; `borrador:47` devuelve `error.message`; sin rate limit | 500 por entrada malformada; CPU sin cota real; intentos perdidos | Falta Zod/early returns/timeout real | Esquema Zod, timeout con worker/abort, `await` y comprobar inserts, rate limit, 401 JSON para `/api/**` | 3 | Medio |
| A5-17 | **P2** | Analítica | El panel docente pierde el patrón de error en intentos nuevos | `verificar/route.ts:353-361` no guarda `regla_incumplida`; `docente/dal.ts:641-643` agrupa por mensaje exacto; top 5; sin paginar | RF15 menos útil; agrupación fragmentada | El campo se calcula pero no se persiste | Persistir `reglaIncumplida` y agrupar por regla; paginar | 2 | Bajo |
| A5-18 | **P2** | Progreso | El curso se completa sin la evaluación final ni los retos | `calcularEstadosModulos` completa el módulo 8 con su única lección; `evaluacion/final/page.tsx:20-31` exige 1–7, no aprobar; el trigger `curso` solo mira lecciones | La insignia «Curso completo» no certifica aprendizaje | El progreso se define por lecciones, no por evaluación | Exigir la evaluación final para el módulo 8/insignia `curso`, o renombrar la insignia | 3 | Medio |
| A5-19 | **P2** | Fechas | Desfase UTC/Panamá en fechas de entrega y «vencida» | `docente/acciones.ts:214` usa `new Date().toISOString()`; `a4_docente.sql:9-15` usa `current_date` del servidor; `docente/dal.ts:509` compara strings | Después de las 19:00 de Panamá, «hoy» es mañana en UTC: asignaciones vencidas antes de tiempo | Zona horaria no fijada | Calcular fechas en `America/Panama` o en Postgres con la zona del curso | 1 | Bajo |
| A5-20 | **P2** | Accesibilidad | Fallos de contraste en estados no auditados; navegación móvil incompleta; `href="#"` | `modulos/[modulo]/page.tsx:109` y `lecciones/page.tsx:97` `bg-slate-100 text-slate-500` = 4,34:1 a 10 px; `simulador-memoria.tsx:78` `text-slate-400` sobre blanco = 2,56:1; `pantalla-reto.tsx:317` `text-slate-500` sobre `slate-950` = 4,24:1; `modulos/page.tsx:42` `href="#"`; `navbar.tsx:24` oculta enlaces en móvil | AA incumplido en estados reales; teclado/ móvil degradados | El auditor solo visita el estado feliz de 7 rutas | Corregir colores; auditar estados vacío/pendiente/pestañas; sustituir `#` por tarjeta no enlazada; menú móvil | 2 | Bajo |
| A5-21 | **P2** | Privacidad | Consentimiento automático y retención sin mecanismo | `crear-usuarios.mjs:102-103` marca `acepta_privacidad=true`; el banner solo está en `/dashboard`; el aviso promete eliminación/anonimización sin job | RNF09/Ley 81 débil; evidencia de consentimiento no válida para cuentas reales | Script de demo reutilizado como alta real | Consentimiento explícito en el primer acceso; job de retención; exportación seudonimizada | 4 | Bajo/medio |
| A5-22 | **P2** | Pruebas RLS | La matriz no cubre admin, anon ni endpoints; negativos pueden pasar por error | `probar-rls.mjs` 30 `comprobar`; no crea admin; no prueba `anon`; `comprobar(!ok)` acepta 500/red; `probar-escalada-rol.mjs:68-78` sale 0 si el alta está deshabilitada | Falsa sensación de cobertura | Matriz incompleta y aserciones negativas laxas | Añadir rol admin, anon, endpoints y comprobar códigos 401/403 | 2 | Bajo |
| A5-23 | **P2** | Pruebas E2E | Los E2E mutan la demo y dependen del orden/seed | `flujo-beta.spec.ts:58-75` marca el módulo 4; `flujo-estudiante` inserta intentos; no hay reset; `playwright.config.ts:74` reutiliza servidor existente | La demo queda alterada y la suite no es idempotente | Sin base de pruebas separada ni setup/teardown global | Base de pruebas, usuarios únicos y reset; no reutilizar `next dev` | 4 | Medio |
| A5-24 | **P2** | API/UX | El proxy redirige las APIs al login (307) en vez de 401 | `proxy.ts:23-27`; `RUTAS_PUBLICAS` solo `/api/salud`; producción `/api/retos/.../pista` → 307 a `/login` | Los `fetch` reciben HTML; la UI muestra «no se pudo conectar» | El matcher incluye `/api/**` sin excepción JSON | Si `ruta.startsWith('/api/')`, devolver `401 {error}` | 0,5 | Bajo |
| A5-25 | **P3** | Deuda | Código/columna/índices muertos | `src/lib/supabase/client.ts` sin importadores; `validacion/cliente.ts`/`worker.ts` sin uso; `exigirMiPerfil`, `formatearFechaCorta` sin uso; `modulos.archivo_contenido` apunta a MDX borrados; la migración de índices A5 duplica índices existentes | Confusión y mantenimiento | Limpiezas a medias | Borrar o anotar; migración para `archivo_contenido`; eliminar índices duplicados | 2 | Bajo |
| A5-26 | **P3** | Documentación | README/informes se contradicen y la UI exagera | README 84 E2E, INFORME 84/22, BLOQUE 93/29; `INFORME_A4:28` «despliegue pendiente»; `pantalla-reto.tsx:369` «El código no sale del equipo»; `README:119-121` dice 9 lecciones/16 retos pero 3 son placeholders | El evaluador no puede confiar en las cifras | Sin revisión final de coherencia | Actualizar todas las cifras/estados y corregir el texto de la UI | 1,5 | Bajo |
| A5-27 | **P3** | Demo | El seed usa un curso de julio/agosto de 2026 y una tarea vencida | `seed.sql:31-35` período 6 jul–14 ago; `:169` entrega 17 jul; hoy 23 nov | La demo se ve como un curso terminado y atrasado | Datos congelados del mockup | Actualizar a un período vigente o congelar la fecha de demo | 0,5 | Bajo |
| A5-28 | **P3** | Entrega | `docs/INFORME_A3.md` está en `.gitignore` | `.gitignore` línea final; el archivo existe localmente | Un ZIP construido desde git no incluirá el informe A3 | Se ignoró para no versionarlo | Incluirlo en el ZIP o quitar la regla | 0,1 | Bajo |

---

## 6. Seguridad

### 6.1 Lo que sí se comprobó

- **No hay claves en el repositorio.** `grep` de `eyJ...` solo encuentra `.env.local` (ignorado, permisos 600) y el lockfile. `.env.local` define `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_DB_PASSWORD`, `DEMO_PASSWORD`; no se imprime ningún valor.
- **No hay claves de servicio en el bundle cliente.** `grep` de `service_role`, `SUPABASE_SERVICE_ROLE_KEY`, `eyJ...` en `.next/static` no devuelve nada.
- **RLS activo en las 11 tablas**, 26 políticas por nombre final, todas las funciones `SECURITY DEFINER` con `search_path = ''` (script de lectura sobre las migraciones) y **matriz RLS 32/32 ejecutada** contra la base.
- **F09:** el trigger `crear_perfil_al_registrarse` fuerza `estudiante` (`a4_privacidad_rol.sql:41-52`). Un `signUp` directo con `rol: "admin"` no crea admin.
- **Escrituras sensibles:** `progresos`, `intentos` y `codigos` no se pueden escribir desde el cliente; `insignias` solo por trigger; `retos.reglas` está revocado para `authenticated`.
- **Sin XSS evidente:** no hay `dangerouslySetInnerHTML`, `innerHTML`, `eval` ni `new Function`; el MDX es contenido del repositorio, no de usuarios; React escapa.
- **Sin traversal:** `leerContenidoPorRuta` confina a `src/content` y exige `.mdx`.
- **Sin secretos hardcodeados** en `src`, `tests`, `scripts` ni workflows.

### 6.2 Hallazgos explotables o de riesgo

| ID | Sev. | Vector | Precondiciones | Impacto | Prueba de concepto (no destructiva) |
|---|---|---|---|---|---|
| S-01 | **P1** | Fuga de pistas y respuestas correctas | Sesión de estudiante válida | El estudiante obtiene pistas gratis y respuestas correctas; puede aprobar con puntos sin resolver | **Ejecutado 23/11:** con JWT de estudiante, `GET /rest/v1/retos?select=pistas` → 200 con pistas; `GET /rest/v1/intentos?select=resultado` → 200 con `correctas`/`detalle`; `retos?select=reglas` → 403 (control correcto). No se modificó ningún dato. |
| S-02 | **P2** | Cookies de sesión sin `httpOnly`/`Secure` | XSS o acceso al navegador | Robo de tokens de sesión | `@supabase/ssr` default `httpOnly:false` (`node_modules/@supabase/ssr/dist/main/utils/constants.js:4-8`); no se pasa `cookieOptions` en `server.ts:30-33` ni `proxy.ts:14-17`. |
| S-03 | **P2** | Sin CSP, `X-Frame-Options` ni `frame-ancestors` | Página pública | Clickjacking/UI redress sobre login y paneles | `curl -I https://codestart-fiec.vercel.app/login` no devuelve `content-security-policy`, `x-frame-options` ni `referrer-policy`; solo HSTS. |
| S-04 | **P2** | Sin rate limiting en login/verificar/pista | Red | Fuerza bruta de contraseñas, inflado de `intentos`, consumo de CPU/DB | `POST /api/retos/[id]/verificar` en bucle; no hay límite en `route.ts`. No ejecutado. |
| S-05 | **P2** | Rol del JWT editable por el usuario | Sesión válida | El proxy puede enrutar a `/docente`; no hay acceso a datos por la DAL/RLS, pero se puede provocar un bucle | `supabase.auth.updateUser({ data: { rol: 'docente' } })`; el proxy lee `user_metadata.rol` (`roles.ts:57-62`). La DAL sigue leyendo `perfiles.rol`. |
| S-06 | **P3** | `unirse_por_codigo` sin límite de intentos | Código de grupo de 11 caracteres | Unirse a un grupo ajeno si se adivina el código; solo ve tareas, no datos de otros | Repetir `rpc/unirse_por_codigo`; no hay rate limit ni bloqueo. No ejecutado. |

**Conclusión de seguridad:** la matriz RLS pasó 32/32 y no se encontró una fuga de datos entre estudiantes o grupos; el aislamiento está bien planteado. Los problemas graves son de **integridad** (pistas/respuestas, confirmados en ejecución), de **configuración** (cookies/cabeceras) y de **cobertura de pruebas** (admin/anon/endpoints). No hay secretos en el repositorio ni en el bundle.

---

## 7. Cosas a medio hacer

- **Contenido:** `m01-introduccion.mdx`, `m02-algoritmos.mdx` y `m04-variables.mdx` son placeholders de 11 líneas. `m05`–`m08` están marcados como provisionales.
- **Progreso:** el módulo 8 se completa con la lección, sin la evaluación final; los retos no son obligatorios para desbloquear.
- **Pistas:** el endpoint está roto y las pistas viajan completas al cliente.
- **Modo clase:** es una previsualización, no la ruta `/clase` que proponía el plan; en retos de código el botón de verificar sigue visible.
- **Administración:** no hay interfaz `/admin` (declarado fuera); el cambio de rol es una RPC que no sincroniza el JWT.
- **Evaluación:** la final reutiliza preguntas factuales de las autoevaluaciones; el texto de `m08` promete lectura de código que no aparece.
- **Datos:** `modulos.archivo_contenido` apunta a `modulos/*.mdx` borrados; nadie lee esa columna.
- **Código muerto:** `src/lib/supabase/client.ts`, `src/lib/validacion/cliente.ts`, `src/lib/validacion/worker.ts`, `exigirMiPerfil`, `formatearFechaCorta`.
- **Scripts:** `db:seed` depende de `psql`; `db:types` depende del binario `supabase`; `db:migrate` usa `--linked`; no hay `respaldar.sh` ni `exportar-validacion.mjs`.
- **Documentación:** no hay manuales, acta, informe de validación, mantenimiento ni A5; `INFORME_A4` dice «despliegue pendiente»; README e INFORME_PRUEBAS tienen cifras obsoletas.
- **UI:** «El código no sale del equipo» es falso; `href="#"` en módulos bloqueados; navbar sin menú móvil.
- **Demo:** período julio/agosto 2026 y tarea del 17 de julio, vencida en noviembre.
- **Operación:** no hay `vercel.json` (región), monitor, respaldos ni plan de incidentes.

---

## 8. Pruebas ejecutadas

Entorno: Linux, Node **v26.13.1**, npm **12.2.3**, commit `4f1b6d7`. Servidor local `next start` en `:3000`; producción `https://codestart-fiec.vercel.app`.

| Comando | Resultado real | Duración | Diferencia con lo declarado |
|---|---|---|---|
| `npm ci` | ✅ 547 paquetes; 8 moderate | 3 min 12,9 s | README no lo declara; AGENTS decía 5 altas |
| `npm run typegen` | ✅ Types generated | 1,3 s | — |
| `npm run lint` | ✅ Sin salida de error | 13,8 s | — |
| `npm run typecheck` | ✅ Sin errores | 15,6 s | — |
| `npm test` | ✅ 6 archivos, **38/38**, 0 fallos | 3,8 s (Vitest 1,0 s) | README sigue diciendo 33; se añadieron 5 del saneo |
| `npm run build` (1.º intento) | ❌ `SecurityFatalError`: Next 16.4.1 afectado por vulnerabilidad conocida; pide actualizar | 30,8 s | No declarado |
| `npm run build` (2.º intento) | ✅ 20 rutas; incluye `/api/salud` | 13,1 s | Coincide con BLOQUE_A5 (20 rutas) |
| `npx playwright test --list` | ✅ **93 tests** en 7 archivos (31 × 3 proyectos) | 1 s | README/INFORME dicen 84; BLOQUE dice 93 |
| `npx playwright test` (suite completa) | ✅ **93/93** en 9,6 min | 9 min 36 s | Coincide con BLOQUE_A5 (93), no con README/INFORME (84) |
| `npx playwright test accesibilidad --grep "rutas públicas"` | ✅ 3/3 (/, /login, /privacidad) | 10,3 s | Coincide con la parte pública |
| `npm run test:rls` | ✅ **32/32**, `Matriz RLS: PASÓ`; limpieza de 4 usuarios y 2 grupos | 13,6 s | INFORME dice 22; el script tiene 30 |
| `npm run test:seguridad` | ✅ Alta pública deshabilitada; vector F09 cerrado | 0,76 s | No prueba el trigger con alta habilitada |
| `npm run auditar:contraste` | ✅ **0 textos bajo AA en 7 rutas** | 22,8 s | No cubre estados vacíos/pendientes/pestañas |
| Contraste en estados no visitados | ❌ 1 fallo en `/modulos/5` y `/modulos/5/lecciones/1` (4,35:1) y 3 en la pestaña `casos_prueba.txt` (4,23:1) | <1 min | El auditor solo ve el estado feliz de 7 rutas |
| `npm audit --omit=dev` | ⚠️ 1 moderate: `next 16.0.0–16.4.4`; fix 16.4.6 | ~3 s | AGENTS decía 5 altas |
| `npm audit` | ⚠️ 8 moderate (Next + tooling eslint) | ~3 s | — |
| `npm run db:seed` | ❌ `sh: psql: orden no encontrada` | <1 s | README dice que carga la demo |
| `npm run db:types` | ❌ «La generacion de tipos fallo» (spawn `supabase` ENOENT); archivo intacto | 0,39 s | AGENTS dice que funciona |
| `GET http://localhost:3000/api/salud` | ✅ 200 `{"ok":true,"servicio":"codestart-fiec"}` | 665 ms | Coincide con BLOQUE_A5 tras restaurar |
| `GET https://codestart-fiec.vercel.app/api/salud` | ✅ 200 `{"ok":true,"servicio":"codestart-fiec"}` | 2,59 s | Coincide tras restaurar |
| Login de producción con cuenta demo | ✅ Llega a `/dashboard`; H1 «¡Hola, Francisco!» | ~10 s | README dice que la demo funciona |
| `GET /` y `/login` producción | ✅ 200 | 0,2–1,7 s | — |
| `GET /dashboard` sin sesión | ✅ 307 a `/login?desde=/dashboard` | 0,1 s | — |
| `HEAD /login` producción | ⚠️ HSTS sí; sin CSP, XFO, Referrer-Policy ni X-Content-Type-Options | — | No declarado |
| Pooler Supabase (5432/6543) | ✅ Conecta; `modulos=8`, `perfiles=2` | <1 s | Coincide |
| Fuga de pistas (JWT estudiante) | ❌ `GET /rest/v1/retos?select=pistas` → 200 con pistas | 1,2 s | No declarado |
| Fuga de respuestas (JWT estudiante) | ❌ `GET /rest/v1/intentos?select=resultado` → 200 con `correctas`/`detalle` | 1,2 s | No declarado |
| `POST /api/retos/[id]/pista` | ❌ 500 «No se pudo guardar la pista» | 603 ms | La UI no muestra error; el botón no revela nada |

**Salidas crudas relevantes (recortadas):**

```text
# npm test
Test Files  5 passed (5)
Tests       33 passed (33)
Duration    1.27s

# npx playwright test --list
Total: 93 tests in 7 files

# npx playwright test
93 passed (9.6m)

# npm run test:rls
Matriz RLS: PASÓ
Limpieza: 4 usuarios y 2 grupos temporales eliminados.

# npm run test:seguridad
ok  alta pública deshabilitada: el vector de F09 está cerrado
Prueba de escalada de rol: PASÓ (sin alta pública)

# npm run auditar:contraste
✓ /dashboard
✓ /modulos
✓ /modulos/1
✓ /modulos/3
✓ /modulos/3/lecciones/1
✓ /retos/a3c0bec8-453b-4b1d-bcc3-92445276e359
✓ /retos/cb534a18-b206-4da7-8128-9533ee7631d3
══ 0 textos por debajo de AA ══

# salud y login
GET /api/salud (local) -> 200 en 665 ms {"ok":true,"servicio":"codestart-fiec"}
GET /api/salud (prod)  -> 200 en 2588 ms {"ok":true,"servicio":"codestart-fiec"}
login prod -> https://codestart-fiec.vercel.app/dashboard

# pooler
select current_database(), count(modulos), count(perfiles) -> postgres | 8 | 2

# fugas confirmadas
GET /rest/v1/retos?select=pistas -> 200 (pistas visibles con JWT de estudiante)
GET /rest/v1/intentos?select=resultado -> 200 (incluye "correctas" y "detalle")
POST /api/retos/a3c0.../pista -> 500 en 603 ms {"error":"No se pudo guardar la pista."}

# contraste en estados no auditados
/modulos/5 -> "○ Sin ver" 4,35:1 (mín. 4,5)
/modulos/5/lecciones/1 -> "○ Sin ver" 4,35:1
/retos/... pestaña casos_prueba.txt -> 4,23:1 (mín. 4,5)
```

**Histórico (antes de restaurar, 23/11 ~18:50):** `/api/salud` 503, login «fetch failed», `test:rls`/`test:seguridad` `fetch failed`, pooler `tenant/user ... not found`. Todo eso quedó resuelto al restaurar Supabase; se conserva como evidencia de la causa.

**No ejecutado:** rendimiento con red limitada contra producción, carga de 100 usuarios, `db:migrate`, restauración de respaldo, WebKit/Edge, revisión manual de accesibilidad y prueba de usabilidad. La causa ya no es el backend, sino la falta de esas configuraciones/sesiones.

---

## 9. Quick wins (< 2 h, alto impacto)

1. **Backend: ya restaurado.** Smoke test repetido: login, `/api/salud` 200, un módulo. Mantenerlo activo y monitorizado.
2. **Congelar y etiquetar** (0,5 h): bump `1.0.0`, `git tag -a v1.0.0`, deploy, verificar URL.
3. **Arreglar pistas** (2 h): usar `crearClienteAdmin`, no tocar `codigo`, devolver solo la pista nueva; enviar al cliente solo las reveladas; comprobar `r.ok` en las 4 pantallas.
4. **Sincronizar rol** (1,5 h): actualizar `auth.users.raw_user_meta_data` en `cambiar_rol`; no bloquear en el proxy cuando `rol` es null; probar promoción y degradación.
5. **Región Vercel** (0,25 h + deploy): `vercel.json` con `"regions": ["pdx1"]` o ajuste en el proyecto; volver a medir.
6. **Cabeceras y cookies** (1,5 h): `X-Frame-Options: DENY`, `Referrer-Policy`, `X-Content-Type-Options`, CSP mínima/report-only; `cookieOptions` con `httpOnly` y `secure`.
7. **IDs de los tests** (2 h): resolver retos por enunciado/tipo o fijar UUIDs en el seed; actualizar cifras 84→93 y 22→30.
8. **Scripts de demo** (2 h): `db:seed` con `pg` o documentar `psql`; `db:types` con `npx supabase`; añadir `respaldar.sh`.
9. **`href="#"` y menú móvil** (0,5 h): tarjeta bloqueada sin enlace; menú o enlaces visibles en móvil.
10. **Sanear `intentos.resultado`** (2 h): guardar solo diagnóstico/casos, sin `correctas` ni `detalle.correcta`.
11. **Actualizar README/informes** (1 h): una sola tabla de cifras y estados; quitar «el código no sale del equipo».
12. **Fecha de la demo** (0,5 h): período y asignación vigentes.

---

## 10. Plan de cierre 23–25/11

Supuesto de equipo: 4 personas (Dev A datos/backend, Dev B frontend, Contenido/experto, QA/Documentación). Si son menos, recortar en el orden indicado.

### Lunes 23 (tarde/noche) — desbloquear

| Responsable | Tarea | Criterio de hecho |
|---|---|---|
| Dev A | **Backend ya restaurado**; smoke test de login y `/api/salud`; empezar pistas/rol | `/api/salud` 200 y login real (hecho) |
| Dev B | Verificar que producción corre `HEAD`; preparar bump a `1.0.0` y tag `v1.0.0-rc` | RC desplegado y etiquetado |
| QA | **Suite ya ejecutada: 38 unit, 93 E2E, 32 RLS, seguridad y contraste 0/7**; registrar salida y abrir los fallos de estados no auditados | Informe con salida real (hecho) |
| Todos | Congelar alcance: solo P0/P1 | Lista cerrada |

### Martes 24 — corregir y documentar

| Responsable | Tarea | Criterio de hecho |
|---|---|---|
| Dev A | Pistas, saneo de `resultado`, rol/JWT, endpoint API 401, rate limit básico | Tests manuales y unitarios; sin fugas |
| Dev B | Región, cabeceras/cookies, `href="#"`, menú móvil, fechas | Smoke test y axe/contraste en estados nuevos |
| Contenido | `m01`, `m02`, `m04` si el material llega; si no, declararlo | Lecciones reales o declaración |
| QA | Arreglar UUIDs, base de pruebas, reset; ejecutar suite completa; contrastes privados | Evidencia adjunta |
| Documentación | Manuales estudiante/docente/admin/técnico, mantenimiento, respaldos, informe de validación (con lo que haya) | Documentos en `docs/` |

### Miércoles 25 — cerrar

| Responsable | Tarea | Criterio de hecho |
|---|---|---|
| Dev A/B | Regresión final; tag `v1.0.0`; deploy; `/api/salud` y login | URL con 200 y tag |
| QA | Acta de aceptación con RF01–RF16 y resultados reales; matriz requisito↔prueba | Acta para firma |
| Documentación | `INFORME_A5.md` (6 secciones), ZIP `codestart-fiec_v1.0.0_2026-11-25`, diapositivas y guion | ZIP verificado en limpio |
| Todos | Ensayo de sustentación y demo de respaldo (capturas/video) | Ensayo hecho |

### Qué recortar si no llega

En este orden: video de sustentación → manual del administrador detallado → evidencia de carga nueva (declarar la del A4) → prueba de usabilidad (declarar no verificada). **No recortar:** backend activo, login, tag/deploy, informe de validación aunque sea «no ejecutado», acta, manuales de estudiante/docente/técnico, plan de respaldos, informe A5.

### Declarar honestamente como no hecho si no se alcanza

- **RNF04** usabilidad y encuesta (o plan B heurístico declarado).
- **RNF05** disponibilidad y monitor de 7 días.
- **RNF08** 100 usuarios; el escenario B y la decisión E1.
- **RNF01** WebKit y Edge.
- **RNF02** medición en producción.
- **RNF06** revisión manual (teclado, lector, zoom 200 %, reflow 320 px).
- **RNF09** retención/anonimización y consentimiento real.
- **Respaldos** y restauración probada.
- **Piloto** con estudiantes, pre/post, ≥70 % de finalización, entrevista al docente.
- **Capacitación** (guion, grabación, asistencia).
- **Contenido real** de m01, m02 y m04 si no llega.
- **Acta firmada** si no hay firma; entregar borrador y decirlo.

---

## 11. Anexo

### 11.1 Entorno

- Linux, Node **v26.13.1**, npm **12.2.3**.
- `next 16.4.1`, `react 19.3.0`, `vitest 5.0.4`, `@playwright/test 1.64.1`.
- Commit `4f1b6d7` (12 nov 2026 21:33 −05:00); `git status` solo muestra `.gitignore` modificado y `.agents/`/`skills-lock.json` sin versionar (pre-existentes).
- Base de datos: proyecto `vorhdykyfnklwcfwhfme`, pooler `aws-1-us-west-2.pooler.supabase.com`.
- Producción: `https://codestart-fiec.vercel.app`, `x-vercel-id: iad1`, HSTS presente.

### 11.2 Variables de entorno (solo nombres y formato)

`.env.local` existe, permisos `600`, ignorado por git. Define:

| Variable | Estado |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | definida, 40 caracteres, host `*.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | definida, 46 caracteres |
| `SUPABASE_SERVICE_ROLE_KEY` | definida, 219 caracteres, JWT `eyJ...`, **sin** prefijo `NEXT_PUBLIC_` |
| `SUPABASE_DB_URL` | definida, 109 caracteres, host del pooler |
| `SUPABASE_DB_PASSWORD` | definida, 16 caracteres |
| `DEMO_PASSWORD` | definida, 14 caracteres |

No se imprime ningún valor. No hay claves hardcodeadas en `src`, `tests`, `scripts` ni en el bundle estático.

### 11.3 Comandos ejecutados (resumen)

```bash
npm ci
npm run typegen
npm run lint
npm run typecheck
npm test
npm run build            # dos veces: la primera la bloquea el aviso de seguridad de Next
npx playwright test --list
npx playwright test                     # suite completa, 93/93
npm run test:rls
npm run test:seguridad
npm run auditar:contraste
npm audit --omit=dev
npm audit
npm run db:seed
npm run db:types
# + smoke test local/producción, login, pooler y consultas REST con JWT de estudiante
```

### 11.4 Supuestos y cosas no verificables

1. **Supabase estuvo caído y se restauró:** el 23/11 ~18:50 el pooler decía «tenant/user not found» y Auth/REST no resolvían; a las 19:35 el proyecto respondió, el pooler conectó y producción hizo login. La causa exacta (pausa/restauración) no se confirmó en el panel; es un **hecho** que volvió, no una certeza de por qué.
2. **Variables de Vercel:** el token de la skill `vercel-agent` es válido (`vercel-setup check` → `codestart válido`), pero el CLI `vercel` no está instalado, así que no se listaron las variables con `env ls`. `/api/salud` 200 y el login confirman que la URL, la anon key y la service role están operativas.
3. **RLS:** ahora sí se ejecutó la matriz completa: **32/32** y limpieza correcta. Los casos de admin, anon y endpoints siguen sin cubrirse (A5-22).
4. **Contraste:** se midieron los estados privados con el mismo instrumento. Se confirmaron 4,35:1 en el chip «○ Sin ver» de `/modulos/5` y `/modulos/5/lecciones/1`, y 4,23:1 en la pestaña `casos_prueba.txt` del reto de código. El 2,56:1 del índice del simulador no se pudo reproducir porque el botón «Ejecutar línea» no estaba en la lección visitada; la clase `text-slate-400` sobre blanco sigue en el código y es un fallo latente.
5. **Rendimiento:** no se repitieron las mediciones; se usan las del 28 oct como evidencia histórica y el análisis estático del código actual.
6. **Cifras de los informes:** se tratan como afirmaciones del autor, no como evidencia. Las que se pudieron contar (38 unitarias, 93 E2E, 32 RLS, 20 rutas, 16 migraciones, 11 tablas, 26 políticas) se contrastaron con el código.
7. **`npm run build` y el aviso de seguridad:** la primera ejecución se detuvo con `SecurityFatalError` de Next 16.4.1; el reintento compiló. El aviso es consistente con `npm audit` (1 moderate en runtime, 8 en total). Se recomienda actualizar a `next@16.4.6`.

### 11.5 Conteos verificados

| Elemento | Conteo | Fuente |
|---|---|---|
| Módulos | 8 | `seed.sql`, migración A4 |
| Lecciones | 9 | 5 del seed + 4 de la migración A4 |
| Lecciones placeholder | 3 | `m01`, `m02`, `m04` |
| Retos | 16 | 2 del seed + 6 de 5–7 + 7 autoevaluaciones + 1 final |
| Migraciones | 16 | `supabase/migrations/` (incluye las de los Grupos 1, 2 y 3) |
| Tablas | 11 | migraciones |
| Políticas RLS (nombres finales) | 26 | migraciones |
| Pruebas unitarias | 38 | `npm test` |
| Pruebas E2E | 93 ejecuciones (31 × 3) | `npx playwright test --list` |
| Comprobaciones RLS | 32 | `npm run test:rls` (`ok`) |
| Rutas de build | 20 | `npm run build` |

---

**Fin de la auditoría original.**  
La auditoría inicial fue de solo lectura y no desplegó ni imprimió secretos. Después se ejecutó el Grupo 1, documentado en el addendum siguiente; esa ejecución sí modificó código, aplicó una migración y escribió datos de prueba. Las acciones restantes de §10 siguen siendo recomendaciones.

---

## Addendum · Grupo 1 ejecutado (23/11/2026, ~20:00–21:00)

**Alcance:** integridad de pistas y respuestas guardadas. Se implementó y verificó; **no se desplegó a producción**.

### Cambios

| Archivo | Cambio |
|---|---|
| `src/app/api/retos/[id]/pista/route.ts` | Reescrito: valida estudiante, lee el reto con `service_role`, devuelve **solo la pista nueva** y actualiza `pistas_usadas` sin tocar `codigo`. |
| `src/app/(sesion)/retos/[id]/page.tsx` | Solo envía al navegador las pistas ya reveladas (`pistasReveladas`) y pasa `totalPistas`/`pistasUsadas`. |
| `src/components/retos/pantalla-reto.tsx` | Estado local de pistas reveladas; comprueba `r.ok`; muestra error si falla; el botón usa `totalPistas`. |
| `src/components/retos/pantalla-ordenamiento.tsx` | Ídem. |
| `src/components/retos/pantalla-autocompletado.tsx` | Ídem. |
| `src/components/retos/pantalla-reto-conceptual.tsx` | Ídem. |
| `src/app/api/retos/[id]/verificar/route.ts` | Guarda resultados saneados: sin `correctas` ni `detalle`; en código añade `regla_incumplida`. |
| `src/lib/retos/resultado.ts` + `.test.ts` | Funciones puras de saneo y 5 pruebas unitarias. |
| `supabase/migrations/20261123190000_a5_pistas_integridad.sql` | Revoca `select(pistas)` a `authenticated`/`anon` y limpia `intentos.resultado` existentes. Aplicada manualmente con `pg` (el `db:migrate` del repo sigue roto). |
| `scripts/probar-rls.mjs` | Nueva comprobación: el estudiante no puede leer `retos.pistas`. |

### Verificación

- `npm run typecheck` ✅, `npm run lint` ✅, `npm run build` ✅ (20 rutas).
- `npm test` ✅ **38/38** (6 archivos; 5 nuevas).
- `npm run test:rls` ✅ **32/32**, incluida «estudiante no puede leer `retos.pistas`».
- `npx playwright test flujo-estudiante flujo-evaluacion flujo-docente --project=escritorio` ✅ **19/19**.
- `POST /api/retos/[id]/pista` ✅ **200**, devuelve la pista nueva; `codigo` del borrador sigue igual (233 → 233 caracteres) y `pistas_usadas` sube 0 → 1.
- `GET /rest/v1/retos?select=pistas` con JWT de estudiante ❌ **403** (antes 200).
- `GET /rest/v1/intentos?select=resultado` con JWT de estudiante ✅ 200, sin `correctas` ni `detalle`; las filas antiguas se sanearon (106 con `correctas` y 108 con `detalle` → 0).
- La página inicial no contiene el texto de una pista no revelada; tras pagarla, aparece.

### Pendiente de este grupo

- **Desplegar** el código a producción: la base ya tiene la migración, pero el frontend desplegado sigue con el código anterior; el endpoint de pistas sigue roto allí hasta el deploy.
- El test de pistas de la UI no se añadió a la suite E2E (se verificó con Playwright manual y con RLS/unitarias). Se puede añadir en el Grupo 6.
- **Suite completa después de los cambios: 93/93 E2E en 10,0 min** (Chromium escritorio, tableta y Firefox). El endpoint de pistas quedó cubierto por el test RLS (32/32) y la verificación manual; falta un E2E específico de la UI para el Grupo 6.

---

## Addendum · Grupo 2 ejecutado (24/11/2026, ~01:00–02:00)

**Alcance:** rol y sesión. Se implementó, migró y verificó; **no se desplegó a producción**.

### Cambios

| Archivo | Cambio |
|---|---|
| `supabase/migrations/20261123203000_a5_rol_sesion.sql` | `cambiar_rol()` actualiza `perfiles.rol` **y** `auth.users.raw_user_meta_data.rol`; backfill de todos los usuarios existentes. Aplicada manualmente con `pg`. |
| `src/proxy.ts` | Deja de bloquear rutas por rol. El rol del JWT solo elige la pantalla de inicio; la DAL y el RLS autorizan. Esto elimina el bucle `/dashboard` ↔ `/docente` cuando el token y el perfil no coinciden. |
| `src/lib/auth/roles.ts` | Eliminadas `rolAdmiteRuta` y las constantes de prefijos, ya sin uso. |
| `scripts/crear-usuarios.mjs` | Sincroniza `user_metadata.rol` con el perfil al crear o actualizar las cuentas. |
| `scripts/probar-rls.mjs` | Nueva comprobación: `cambiar_rol` sincroniza `user_metadata.rol`. |

### Verificación

- `npm run typecheck` ✅ y `npm run lint` ✅; `npm run build` ✅ (20 rutas).
- `npm run test:rls` ✅ **32/32**, incluida la sincronización de `user_metadata.rol`.
- `npx playwright test acceso-por-rol flujo-docente flujo-beta --project=escritorio` ✅ **11/11**.
- **Suite completa después de los cambios: 93/93 E2E en 8,5 min.**
- Prueba manual con usuario temporal (creado y eliminado):
  - Alta como estudiante → `cambiar_rol` a docente → perfil **docente** y metadata **docente**; login → `/docente`.
  - Perfil docente con metadata **estudiante** (token desfasado) → login → `/dashboard` → `/docente`, **sin bucle**.
  - Estudiante entrando a `/docente` → `/dashboard`.
- `npm run db:usuarios` ✅; sincroniza perfil y metadato de las dos cuentas demo.
- Backfill: 2 usuarios, 0 desfasados antes/después (los demo ya estaban sincronizados). Backup en `/tmp/opencode/auth-users-antes-grupo2.json` y `/tmp/opencode/perfiles-antes-grupo2.json`.

### Pendiente de este grupo

- **Desplegar** el código: la migración y el backfill ya están en la base compartida, pero el frontend de producción sigue con el proxy anterior. Allí el bucle puede reproducirse hasta el deploy.
- La prueba del bucle es manual (usuario temporal); no se añadió un spec E2E permanente. La sincronización del metadato sí quedó cubierta por `test:rls`.

---

## Addendum · Grupo 3 ejecutado (24/11/2026, ~02:00–03:30)

**Alcance:** rendimiento y región. Se implementó y verificó en local; **no se desplegó a producción**.

### Cambios

| Archivo | Cambio |
|---|---|
| `vercel.json` | Región `pdx1` (us-west-2, la misma del pooler de Supabase). |
| `supabase/migrations/20261123210000_a5_agregados_grupo.sql` | RPC `agregados_intentos_grupo(uuid[])` y `aciertos_reto_grupo(uuid[])`, `SECURITY INVOKER`, con RLS. Aplicada con `pg`. |
| `src/lib/docente/dal.ts` | La consulta pesada de intentos se limita a **50**; los totales, la tasa de acierto, el último intento y los retos aprobados salen de las RPC. Nuevo `obtenerIntentosEstudiante` paginado (50 por página). `PanoramaGrupo.totalIntentos`. |
| `src/app/(sesion)/docente/page.tsx` y `grupo/[id]/page.tsx` | Usan `panorama.totalIntentos`, no `panorama.intentos.length`. |
| `src/app/(sesion)/docente/estudiante/[id]/page.tsx` | Tabla paginada con `?offset=`, total real y enlaces «Anteriores/Siguientes». |
| `src/lib/supabase/types.generados.ts` | Regenerado con `npx supabase gen types` (incluye las RPC y `es_docente`). |
| `scripts/probar-rls.mjs` | Dos comprobaciones nuevas: las RPC respetan RLS y no ven intentos de otro estudiante. |

### Medición (base actual: 386 intentos del grupo demo)

| Consulta | Filas | Bytes | Tiempo |
|---|---:|---:|---:|
| Antes: todos los intentos con joins | 386 | 328.759 | 551 ms |
| Después: 50 intentos con joins | 50 | 41.687 | 232 ms |
| Agregados por RPC | 1 fila por estudiante | pequeño | 194 ms |

- El payload pesado baja ~8× y deja de crecer con el histórico.
- Páginas locales (3 muestras, mediana): `/docente` 2.028 ms; `/docente/grupo` 2.158 ms; `/docente/estudiante` 2.265 ms. Sigue por encima de 2 s en local; la región `pdx1` y la medición en producción quedan para el Grupo 7. **RNF08 no se declara cerrado.**
- Paginación verificada: 50 filas, «Mostrando 1–50 de 386»; `?offset=50` → «Mostrando 51–100 de 386».

### Verificación

- `typecheck`, `lint` y `build` ✅.
- RLS ✅ (32/32; incluye las dos RPC).
- **Suite E2E completa: 93/93 en 11,0 min.**
- `agregados_intentos_grupo` devolvió 386 intentos/278 aciertos para el estudiante demo; `aciertos_reto_grupo` 7 retos.

### Pendiente de este grupo

- **Desplegar** `vercel.json` y el código: producción sigue en `iad1` y con el DAL anterior.
- La medición de producción con red limitada y la prueba de carga siguen en el Grupo 7.
- La función SQL completa `panorama_grupo` (una sola ida y vuelta para todo) sigue en el Grupo 8; estas RPC son el paso intermedio.

---

## Addendum · Grupos 4–6 ejecutados (24/11/2026)

**Alcance:** UX/accesibilidad/fechas, robustez de APIs/seguridad y reproducibilidad de pruebas. Se implementó y verificó en local; **el despliegue final sigue pendiente**.

### Cambios principales

| Área | Cambio |
|---|---|
| Contraste | `slate-500` sobre `slate-100` → `slate-600`; índices y `$` del simulador y visor sobre fondo oscuro → `slate-400`; placeholders → `slate-500`. |
| Navegación | Tarjetas bloqueadas ya no son `href="#"`; enlaces del navbar visibles también en móvil. |
| Fechas | `fecha_actual()` en `America/Panama`; helper `fechaISOEnPanama`; seed y demo con período 3 nov–18 dic 2026 y entrega 4 dic. |
| APIs | Zod + cuerpo máximo (64 KB), código máximo (20 KB), profundidad máxima 120, 401 JSON en `/api/**`, 413, 429 por usuario, errores de insert comprobados y errores genéricos. |
| Seguridad | CSP, XFO, Referrer-Policy, Permissions-Policy, nosniff, HSTS, `poweredByHeader: false`; cookies `httpOnly`, `secure` solo en Vercel y `sameSite=lax`. |
| Pruebas | UUIDs resueltos por enunciado en tests/scripts; `db:seed` con `pg` (y `SEED_DRY_RUN=1`); `db:types` con `npx`; cifras del README actualizadas. |
| Documentación | Manuales de estudiante, docente, administrador y técnico; mantenimiento; informe de validación; informe A5; acta; ZIP; script de respaldo. |

### Verificación (local)

- `typecheck`, `lint`, `build` ✅.
- `npm test` ✅ 38/38.
- RLS ✅ 32/32; seguridad ✅.
- Contraste ✅ 0/7 rutas; estados no auditados (`/modulos/5`, pestaña `casos_prueba.txt`, simulador) ✅ 0 fallos con el instrumento WCAG.
- API sin sesión ✅ 401 JSON; `{}` ✅ 400; 70 KB ✅ 413.
- Cookies de sesión: `httpOnly=true`, `secure=false` en local (en Vercel `secure=true`).
- `fecha_actual()` devuelve 2026-11-24 mientras UTC ya era 2026-11-25.
- `npm run db:seed` con `SEED_DRY_RUN=1` ✅ sin escribir.
- `npm run db:types` ✅.
- **Suite E2E completa: 93/93 en 10,1 min con `--retries=1`.** Las pasadas anteriores tuvieron timeouts de red puntuales contra Supabase; los casos aislados pasaron al repetirlos. La salida está en `/tmp/opencode/e2e-final3.log`.

### Pendiente

- **Deploy final** y tag `v1.0.0` (la base y el código local ya están listos).
- Repetir la suite completa en un entorno estable y adjuntar la salida.
- RNF04, RNF05, RNF08, WebKit/Edge, accesibilidad manual y restauración de respaldo.
- Contenido real de `m01`, `m02` y `m04`.
