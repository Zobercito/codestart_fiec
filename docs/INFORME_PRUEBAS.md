# Informe de pruebas — CodeStart FIEC

**Avance 4 · Desarrollo (parte 2) y Pruebas**
**Fecha de entrega:** 11 de noviembre de 2026
**Estado:** resultados de la ejecución local del 28 de octubre de 2026. Cada fila se completa con la
salida real del comando indicado; lo que no se pudo ejecutar se marca como tal y nunca se rellena
con datos estimados.

---

## 1. Alcance y entorno

| Elemento | Valor |
|---|---|
| Versión probada | `v0.2.0-beta` |
| Build | `npm run build && npm start` (`next start`, puerto 3000) |
| Base de datos | Supabase del proyecto de prácticas (nunca datos reales de estudiantes) |
| Navegadores ejecutados | Chromium y Firefox (Playwright) |
| Navegadores no verificables en este host | WebKit (faltan dependencias de sistema) y Edge (no instalado) |
| Dispositivos | Escritorio 1440 × 900 y tableta 834 × 1194 con pantalla táctil |
| Sistema | Linux, Node.js 26.3.0 |
| Fecha de la ejecución | 28 de octubre de 2026 |

**Regla de evidencia:** cada resultado es reproducible con el comando que figura en la columna
«Evidencia». Las trazas de Playwright se conservan en `test-results/` cuando un caso falla.

---

## 2. Resumen de resultados

| Frente | Estado | Resultado |
|---|---|---|
| Pruebas unitarias | ✅ PASÓ | 33/33 casos en 5 archivos (`npm test`) |
| Pruebas de integración | ✅ PASÓ | Acciones de servidor contra la base real, cubiertas por la suite E2E |
| Pruebas de extremo a extremo | ✅ PASÓ | 84/84 en 8,1 min (28 por cada configuración) |
| Seguridad y RLS | ✅ PASÓ | 22/22 comprobaciones de la matriz + alta pública cerrada |
| Compatibilidad | 🟡 PARCIAL | Chromium (escritorio y tableta) y Firefox ✅; WebKit y Edge no verificables en este host |
| Rendimiento | ✅ PASÓ | LCP 1,1–1,3 s en las tres pantallas con Fast 3G y CPU 4× |
| Carga | ❌ NO CUMPLE | p95 54,6 s y 88,7 % de peticiones sin respuesta dentro de 30 s (§3.7) |
| Accesibilidad automática | ✅ PASÓ | axe sin violaciones graves en 5 recorridos; contraste ✓ en 7 rutas |
| Usabilidad | ⛔ NO EJECUTADA | Protocolo listo; requiere participantes reales (noviembre) |

---

## 3. Pruebas técnicas

### 3.1 Unitarias

**Comando:** `npm test` · **Resultado:** 5 archivos, 33 casos, 0 fallos.

| Suite | Casos | Requisito | Qué cubre |
|---|---|---|---|
| `src/lib/validacion/motor.test.ts` | 13/13 | RF04, RF10 | Análisis de C: compilación simulada, casos de prueba, errores de sintaxis y de lógica |
| `src/lib/progreso/calculo.test.ts` | 7/7 | RF06, RF11 | Porcentaje de progreso y estados de módulo (bloqueado, en curso, completado) |
| `src/lib/evaluacion/calcular.test.ts` | 5/5 | RF05 | Puntaje de la autoevaluación, umbral de aprobación y áreas a reforzar |
| `src/lib/retos/ordenamiento.test.ts` | 4/4 | RF04 | Corrección del reto de ordenamiento y su mensaje de error |
| `src/lib/retos/autocompletado.test.ts` | 4/4 | RF04 | Corrección del reto de autocompletado |

### 3.2 Integración

Las acciones de servidor se ejercitan sin mocks contra la base de pruebas dentro de la suite E2E:
inscripción por código, registro de progreso, creación de insignia, verificación de retos con
guardado del intento, asignación de módulo y persistencia del borrador. No hay una suite de
integración separada; la evidencia son los casos E2E de §3.3 y las filas de §3.4.

### 3.3 Extremo a extremo (E2E)

**Comando:** `npx playwright test` · Proyectos: `escritorio` (1440 × 900), `tableta` (834 × 1194,
táctil) y `firefox-escritorio` (1440 × 900). **Resultado: 84 pruebas, 84 aprobadas, 0 fallos,
0 reintentos, 8,1 min.**

| Flujo | Requisito | Prueba | Resultado |
|---|---|---|---|
| Estudiante: sesión → lección → reto → progreso | RF01–RF11 | `flujo-estudiante.spec.ts`: entrar, editor, corregir, borrador tras recarga, respuesta falseada, conceptual, ordenamiento y autocompletado | ✅ 28/28 por configuración |
| Docente: grupo → indicadores → asignar → seguimiento | RF07, RF12–RF15 | `flujo-docente.spec.ts` | ✅ |
| Docente no aterriza en el dashboard del estudiante | RNF03, RF07 | `flujo-docente.spec.ts` | ✅ |
| Progreso e insignias persistentes; módulo bloqueado por URL | RF06, RF11 | `flujo-beta.spec.ts` | ✅ |
| Modo clase oculto para el estudiante y no activable por URL | RF16, RNF03 | `flujo-beta.spec.ts` | ✅ |
| Evaluación por módulo, evaluación final y previsualización docente | RF05 | `flujo-evaluacion.spec.ts` | ✅ |
| Acceso sin registro público | RF01 | `flujo-beta.spec.ts` | ✅ |
| Módulo 5 con lección y autoevaluación | RF02, RF05 | `flujo-evaluacion.spec.ts` | ✅ |
| Humo de los tres tamaños y sin violaciones graves de axe | RNF01, RNF06 | `compatibilidad.spec.ts`, `accesibilidad.spec.ts` | ✅ |

### 3.4 Seguridad y RLS

**Comando:** `npm run test:rls` · **Resultado:** `Matriz RLS: PASÓ` (22 comprobaciones).

| Caso | Requisito | Resultado | Evidencia |
|---|---|---|---|
| Estudiante A no lee progresos, intentos, borradores, insignias ni perfil de B | RNF03 | ✅ | 6 comprobaciones `ok` |
| Estudiante A sí lee sus propios datos | RNF03 | ✅ | `ok estudiante A sí ve su propio progreso` |
| Docente A no ve grupos, progresos, intentos ni asignaciones del grupo de B | RNF03 | ✅ | 4 comprobaciones `ok` |
| Docente B sí ve su propio grupo y sus progresos | RF07, RNF03 | ✅ | 2 comprobaciones `ok` |
| Escrituras prohibidas (insignias, progreso ajeno, `cambiar_rol`, PATCH del rol) | RNF03 | ✅ | 7 comprobaciones `ok`, sin filas residuales |
| Límites de rol (crear grupo o asignaciones ajenas) | RNF03 | ✅ | 2 comprobaciones `ok` |
| Alta con rol falsificado | RNF03 | ✅ | `npm run test:seguridad`: alta pública deshabilitada |
| API manipulada | RNF03, RF04 | ✅ | El puntaje y el acierto se calculan en el servidor (`api/retos/[id]/verificar`) |

### 3.5 Compatibilidad (RNF01)

| Navegador | Escritorio | Tableta | Resultado |
|---|---|---|---|
| Chromium | 28/28 | 28/28 | ✅ Todo el recorrido, incluida la pantalla táctil de 834 px |
| Firefox | 28/28 | No aplica (sin perfil móvil) | ✅ |
| WebKit (Safari) | No verificable en este host | No verificable | Declarado como pendiente |
| Edge | No instalado | No instalado | Declarado como pendiente |

### 3.6 Rendimiento (RNF02)

**Comando:** `node scripts/medir-rendimiento.mjs` · Chromium local, Fast 3G (1,6 Mbps / 150 ms) y
CPU 4× contra `next start`.

| Pantalla | TTFB | FCP | LCP | Peso | Resultado |
|---|---|---|---|---|---|
| Dashboard | 192 ms | 1 152 ms | 1 248 ms | 9 KB | ✅ < 2 s |
| Lección | 207 ms | 1 240 ms | 1 276 ms | 10 KB | ✅ < 2 s |
| Editor de retos | 197 ms | 1 052 ms | 1 116 ms | 10 KB | ✅ < 2 s |

Mediana de tres muestras por pantalla. El TTFB mide solo el servidor; el resto del tiempo es la
transferencia simulada de 1,6 Mbps con CPU 4× más lenta. El editor de retos carga CodeMirror bajo
demanda, sin bloquear el primer contenido.

### 3.7 Carga (RNF08)

**Comando:** `node --env-file=.env.local scripts/carga.mjs` (100 usuarios virtuales, 300 s de
recorridos de solo lectura, 400 ms de pausa, sesiones reales contra la base remota).
**Resultado del 28 de octubre de 2026:**

| Escenario | Usuarios | Duración | p50 | p95 | p99 | Errores | Resultado |
|---|---|---|---|---|---|---|---|
| Grupo completo en clase | 100 | 339 s | 41 191 ms | 54 634 ms | 55 170 ms | 766 (88,66 %) | ❌ No cumple |

- 864 peticiones en total: **2,6 req/s**. El servidor no cayó, pero formó cola: las peticiones que
  alcanzaban a responder lo hacían en decenas de segundos y el resto agotó el timeout de 30 s del
  cliente.
- Las rutas del docente son las más caras (p95 46–55 s), porque agregan progreso e intentos de todo
  el grupo con varias consultas a la base remota.
- **Limitación de la medición:** el cliente de carga y el servidor comparten la misma máquina, que
  además sincroniza una carpeta en la nube. El resultado es un **piso**, no lo que daría un servidor
  dedicado o la plataforma de producción, pero sirve para descartar el rendimiento a 100 usuarios
  concurrentes con esta arquitectura y esta base.

**Diagnóstico:** el costo dominante no es la CPU sino la latencia por consulta a Supabase (decenas
de milisegundos por viaje) multiplicada por cada consulta secuencial de la pantalla. Con 100
peticiones simultáneas, cada una encadenando cuatro o cinco viajes, el servidor dedica todo su
tiempo a esperar a la base. Las mitigaciones posibles (caché de datos de referencia, lectura en lote,
pooler más cercano o región local) se evalúan en el A5.

---

## 4. Accesibilidad (RNF06)

### 4.1 Automática

**Comandos:** `npm run auditar:contraste` y `node scripts/chequeo-accesibilidad.mjs`.

| Ruta | axe (críticas/serias) | Contraste | Resultado |
|---|---|---|---|
| `/` | 0 | No auditada (sin sesión) | ✅ axe |
| `/login` | 0 | No auditada | ✅ axe |
| `/privacidad` | 0 | No auditada | ✅ axe |
| `/dashboard` | 0 (recorrido del estudiante) | ✅ | ✅ |
| `/modulos` | 0 (recorrido del estudiante) | ✅ | ✅ |
| `/modulos/[m]` | 0 (recorrido del estudiante) | ✅ (`/modulos/1`, `/modulos/3`) | ✅ |
| `/modulos/[m]/lecciones/[l]` | 0 (recorrido del estudiante) | ✅ (`/modulos/3/lecciones/1`) | ✅ |
| `/retos/[id]` | 0 (recorrido del estudiante) | ✅ (código) y ✅ (conceptual, tras corrección) | ✅ |
| `/docente` | 0 (panel y seguimiento) | — | ✅ axe |

El 28 de octubre la auditoría de contraste encontró un único fallo, ya corregido: el botón
«Comprobar respuesta» deshabilitado quedaba en 2,00:1 (mínimo 4,5:1) por usar `opacity-50`. Se
sustituyó por un estado deshabilitado explícito (`bg-slate-300` + `text-slate-600`, ≈ 5:1) en las
tres pantallas que lo repetían. La auditoría posterior dio 0 textos por debajo de AA.

### 4.2 Revisión manual (WCAG 2.1 AA)

- [x] Foco visible y `prefers-reduced-motion`: reglas globales añadidas en `globals.css`.
- [x] Idioma declarado (`lang="es"`) y logos con `alt`.
- [ ] Teclado: todos los controles alcanzables y operables.
- [ ] Orden lógico de foco y sin trampas de foco.
- [ ] Formularios con etiqueta, ayuda y error asociados (verificado en código, falta prueba manual).
- [ ] Zoom 200 % y reflow a 320 px.
- [ ] Sin dependencia exclusiva del color.
- [ ] Mensajes de estado anunciados.
- [ ] Lector de pantalla en el flujo crítico.

La revisión manual completa requiere una sesión con lector de pantalla y teclado que no se ha
realizado; queda pendiente para la validación de noviembre.

### 4.3 Revisión inicial del 26 de octubre de 2026

| Elemento | Estado | Observación |
|---|---|---|
| `lang="es"` en `<html>` | ✅ | `src/app/layout.tsx` |
| Logos con `alt` | ✅ | `src/components/layout/marca.tsx` |
| Iconos SVG decorativos | ✅ | `aria-hidden="true"` en `IconoModulo` |
| Emojis decorativos | 🟡 | Quedan glifos de estado redundantes con el texto |
| Formularios | ✅ | `Campo` asocia etiqueta, ayuda y error |
| Foco visible | ✅ | Regla `:focus-visible` global en `globals.css` |

---

## 5. Usabilidad (RNF04)

**Estado: no ejecutada.** El protocolo está listo en `docs/PROTOCOLO_USABILIDAD.md` (participantes,
consentimiento, tareas T1–T6, hoja de métricas, SUS y umbrales). No se ha contado con estudiantes
del perfil objetivo, por lo que RNF04 **no se declara verificado** y esta sección no lleva cifras.

---

## 6. Hallazgos y correcciones

| # | Hallazgo | Severidad | Requisito | Corrección | Estado |
|---|---|---|---|---|---|
| 1 | Agotados los intentos, el estudiante seguía sumando puntos (farmeo de puntos) | Alta | RF16, RF04 | El servidor marca el intento como no puntuable (`puntuable = quedan > 0`) en los cinco tipos de reto y la pantalla lo informa | ✅ Corregido (typecheck; prueba automática en el A5) |
| 2 | Botón deshabilitado «Comprobar respuesta» a 2,00:1 de contraste | Media | RNF06 | Estado deshabilitado explícito con ≈ 5:1 en reto conceptual, autocompletado y evaluación | ✅ Corregido |
| 3 | La prueba de carga marcaba 307 en el 100 % de las peticiones | Media | RNF08 | El cliente de Supabase usaba la API `get/set/remove` retirada; ahora usa `getAll/setAll` y la cookie de sesión se propaga | ✅ Corregido |
| 4 | Firefox fallaba al crear un grupo en E2E por superar los 24 caracteres del código | Baja | RNF01, RF12 | El sufijo del código de prueba se acota a fecha y azar, sin el nombre del proyecto | ✅ Corregido |
| 5 | Latencia alta por cascadas de consultas secuenciales a la base remota | Media | RNF02 | Consultas independientes agrupadas con `Promise.all` en módulo, lección, reto y evaluación | ✅ Mitigado |
| 6 | WebKit y Edge no se pueden ejecutar en este host | Media | RNF01 | Se declara como no verificado; Safari y Edge quedan para la validación | ⛔ Abierto |
| 7 | La única evidencia de usabilidad sería artificial | Alta | RNF04 | Se documenta el protocolo y se deja RNF04 sin verificar hasta tener participantes | ⛔ Abierto |
| 8 | Con 100 usuarios concurrentes el p95 llega a 54,6 s y 88,7 % de las peticiones agota el timeout | Alta | RNF08 | Medido y documentado (§3.7). Requiere caché o lectura en lote: se aborda en el A5 | ⛔ Abierto |
| 9 | El cliente de carga se colgaba si una petición no respondía | Baja | proceso | La petición ya tenía timeout de 30 s; el cuelgue era de la ejecución anterior con la sesión vacía. Se relanzó con sesiones válidas | ✅ Corregido |

---

## 7. Evidencias

| Evidencia | Dónde |
|---|---|
| Salida de Vitest (33/33) | Consola de `npm test` |
| Matriz RLS (22/22) | Consola de `npm run test:rls` |
| Alta pública cerrada | Consola de `npm run test:seguridad` |
| Trazas de Playwright | `test-results/` (solo en fallos) |
| Reporte de contraste | Consola de `npm run auditar:contraste` |
| Tabla de rendimiento | Consola de `scripts/medir-rendimiento.mjs` |
| Reporte de carga | Consola de `scripts/carga.mjs` |
| Protocolo de usabilidad | `docs/PROTOCOLO_USABILIDAD.md` |

---

## 8. Conclusión

La beta pasa **todas las pruebas funcionales y de seguridad ejecutadas**: 33/33 unitarias, 84/84
E2E en tres configuraciones (Chromium de escritorio, tableta táctil y Firefox), 22/22 de la matriz
RLS, alta pública cerrada, axe sin violaciones graves y contraste AA en las siete rutas auditadas.
El rendimiento con red limitada también cumple (LCP 1,1–1,3 s en las tres pantallas con Fast 3G y
CPU 4×).

Quedan tres frentes abiertos, declarados sin adornos:

1. **Carga (RNF08): no cumple.** Con 100 usuarios concurrentes el p95 llega a 54,6 s y el 88,7 % de
   las peticiones agota el timeout. Es el hallazgo más serio de este avance y condiciona el uso con
   un grupo completo en clase.
2. **Usabilidad (RNF04): no verificada.** No se sustituye con pruebas automáticas; el protocolo está
   listo y se ejecutará con estudiantes en noviembre.
3. **Compatibilidad (RNF01): parcial.** WebKit y Edge no se pudieron probar en este host.

Ninguno de los tres se presenta como resuelto. El primero entra al A5 con plan de mitigación; los
otros dos, con la validación prevista.
