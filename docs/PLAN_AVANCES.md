# Plan de avances — CodeStart FIEC (A1 → A5)

> **Documento de trabajo del equipo.** Reúne el estado real del proyecto al 26 de octubre de
> 2026, lo que falta para cerrar cada avance y el plan detallado del A4 y del A5.
>
> **Ejecución detallada del A4:** `docs/subplan.md` (tareas, archivos, dependencias, calendario y
> criterios de aceptación).
>
> **Fuente de verdad de las fechas:** `documentacion/contexto/Calendario de Avances.pdf`
> (30 sep – 25 nov de 2026, 5 entregas quincenales; cierre del periodo el 30 de noviembre).
>
> **Repositorios:**
> - Aplicación: `Zobercito/codestart_fiec` (`CodeStart_FIEC/`, repositorio independiente).
> - Mockup y documentación: `Zobercito/codestart-fiec-mockup` (este repositorio).
> - URL desplegada: <https://codestart-fiec.vercel.app> (responde 200 al 26 oct 2026).

---

## 0. Cómo leer este plan

### Leyenda de estado

| Símbolo | Significado |
|---|---|
| ✅ | Completo y verificado |
| 🟡 | Parcial: existe, pero no cubre el requisito |
| ❌ | Ausente |
| ⏭ | Fuera del alcance de este avance (posterior) |

### Estructura de cada avance

1. **Qué pide** el calendario y el Avance 1.
2. **Qué hay** (evidencia).
3. **Qué falta** (tareas).
4. **Criterio de cierre** (cómo se sabe que está terminado).

### Definición de terminado (DoD) de cualquier avance

- [ ] `npm run typecheck && npm run lint && npm run build` sin errores.
- [ ] `npm test` y `npm run test:e2e` en verde.
- [ ] `npm run auditar:contraste` sin fallos.
- [ ] Sin errores P0/P1 abiertos.
- [ ] Desplegado en Vercel y URL verificada.
- [ ] `README.md` y el informe del avance actualizados.
- [ ] Tag de git con fecha y versión (`v0.1.0-alpha`, `v0.2.0-beta`, `v1.0.0`).
- [ ] Evidencias guardadas (capturas, salidas de pruebas, matriz requisito ↔ prueba).
- [ ] Informe de avance con las 6 secciones del calendario.

---

## 1. Resumen ejecutivo

| Avance | Fecha | Estado | Lectura |
|---|---|---|---|
| **A1** Análisis y planificación | 30 sep 2026 | ✅ | Informe de 21 secciones, 18 RF, 9 RNF, ADDIE y cronograma. Entregado. |
| **A2** Diseño instruccional e interfaz | 14 oct 2026 | 🟡 | Mockup de 4 pantallas, guía de estilo, storyboard y mapa de navegación. **Falta la validación del prototipo con usuarios** que pedía el calendario. |
| **A3** Desarrollo, parte 1 (alfa) | 28 oct 2026 | 🟡 | Navegación, acceso, contenido, editor y motor de C funcionando; desplegado. Faltan cierre documental, enlaces rotos y el circuito de progreso. |
| **A4** Desarrollo, parte 2 y pruebas (beta) | 11 nov 2026 | ❌ | **Foco actual.** Faltan panel docente, progreso real, contenido 5–8, evaluaciones, modo clase y todo el aparato de pruebas e informes. |
| **A5** Validación e implementación (1.0) | 25 nov 2026 | ⏭ | Validación con usuarios, manuales, capacitación, acta de aceptación, mantenimiento y sustentación. |

### Los cinco hallazgos que mandan en el A4

1. **El progreso no se guarda.** No existe ningún `insert`/`upsert` en `progresos`; el curso se
   queda bloqueado en el módulo 1 para cualquier estudiante nuevo.
2. **El porcentaje por módulo está mal calculado.** Cuenta filas de progreso, no lecciones del
   módulo; un módulo con 4 lecciones y 1 vista puede aparecer como 100 %.
3. **Los módulos 5 a 8 no tienen lecciones.** Hay filas en la base de datos, pero cero archivos
   MDX y cero retos: no se pueden recorrer ni completar.
4. **El panel docente no existe.** `/docente` devuelve 404 y la barra de navegación ya enlaza
   ahí. Son cinco requisitos MVP (RF07, RF12, RF13, RF14, RF15).
5. **El informe de pruebas no se puede escribir todavía.** Solo hay 13 pruebas unitarias, 14 E2E
   en Chromium y una auditoría de contraste. Faltan RLS, compatibilidad, carga, rendimiento con
   red limitada, accesibilidad completa y la prueba de usabilidad con personas.

### Capacidad y margen

- Del 26 de octubre al 11 de noviembre hay **16 días naturales**.
- Con 4 personas a tiempo parcial (≈4 h/día) la capacidad es de **≈28 días-persona**.
- El alcance mínimo del A4 se estima en **26–30 días-persona**.
- **No hay holgura.** Todo lo opcional (CSV, panel de administración, videos, ampliación del motor
  a bucles y arreglos) se corta o se pasa al A5. La lista de recortes está en §10.

---

## 2. Línea de tiempo

| Ventana | Foco | Hito verificable |
|---|---|---|
| **26–28 oct** | Cierre del A3 | Tag `v0.1.0-alpha`, informe actualizado, URL |
| **29 oct – 1 nov** | A4 · Bloque 1: progreso e insignias | Un estudiante nuevo recorre el módulo 1 y desbloquea el 2 |
| **2–5 nov** | A4 · Bloque 2: panel docente | Pantalla D operativa con datos reales |
| **3–7 nov** | A4 · Bloque 3: contenido y actividades | 8 módulos recorribles, evaluaciones y modo clase |
| **6–9 nov** | A4 · Bloque 4: pruebas | Suite técnica + accesibilidad + usabilidad |
| **9–11 nov** | A4 · Bloque 5: informes y entrega | Beta desplegada + `INFORME_PRUEBAS.md` + `INFORME_A4.md` |
| **12–16 nov** | A5 · Correcciones | Release candidate 1.0 |
| **17–20 nov** | A5 · Validación | Informe de validación con métricas |
| **20–23 nov** | A5 · Manuales y capacitación | Manuales + sesión de capacitación |
| **24–25 nov** | A5 · Cierre | Acta de aceptación + tag `v1.0.0` |
| **26–30 nov** | Buffer y sustentación | Cierre del periodo |

---

## 3. Inventario de lo construido (26 oct 2026)

### 3.1 Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.4.1 (App Router, Turbopack, Cache Components, React Compiler) |
| UI | React 19.3, Tailwind CSS 4 (tokens en `@theme`), CodeMirror 6 |
| Datos | PostgreSQL en Supabase + Auth + RLS |
| Contenido | MDX versionado en el repositorio (`next-mdx-remote` 6) |
| Validación | Analizador estático de C en TypeScript (léxico → parser → AST → tipos → reglas) |
| Pruebas | Vitest 5, Playwright 1.64 |
| Despliegue | Vercel (`codestart-fiec.vercel.app`) |

### 3.2 Rutas existentes

| Ruta | Qué hace | Estado |
|---|---|---|
| `/` | Portada pública | ✅ |
| `/login` | Inicio de sesión | ✅ |
| `/registro` | Alta de estudiante | ✅ |
| `/dashboard` | Panel del estudiante | 🟡 (sin medallas reales) |
| `/modulos` | Ruta de los 8 módulos | 🟡 (5–8 vacíos) |
| `/modulos/[modulo]` | Lecciones del módulo | 🟡 |
| `/modulos/[modulo]/lecciones/[leccion]` | Lección MDX + retos | ✅ |
| `/retos/[id]` | Editor / reto conceptual | ✅ |
| `POST /api/retos/[id]/verificar` | Corrección en el servidor | ✅ |
| `PUT /api/retos/[id]/borrador` | Autoguardado del borrador | ✅ |
| `/docente` | Panel docente | ❌ **404** (el navbar lo enlaza) |
| `/admin` | Administración | ❌ |

### 3.3 Base de datos (11 tablas)

| Tabla | Para qué |
|---|---|
| `perfiles` | Usuario, rol (`estudiante`, `docente`, `admin`) |
| `grupos` | Sección del docente + código de inscripción |
| `inscripciones` | Estudiante ↔ grupo |
| `modulos` | 8 módulos del curso |
| `lecciones` | Unidad de progreso y de contenido |
| `retos` | Retos con reglas, casos, pistas y puntos (JSONB) |
| `asignaciones` | Módulo o reto con fecha de entrega |
| `progresos` | Estado por estudiante y lección |
| `intentos` | Respuesta/código + error detectado (base del RF15) |
| `insignias` | Reconocimientos |
| `codigos` | Borrador del reto (RF11) |

**RLS:** 26 políticas; estudiante solo lo suyo, docente solo sus grupos, admin todo. Hay una
función `unirse_por_codigo` y un trigger que impide cambiar el propio rol por `UPDATE`.

### 3.4 Contenido

| Elemento | Cantidad | Observación |
|---|---|---|
| Módulos en la base | 8 | Todos con título y descripción |
| Lecciones | 5 | Solo de los módulos 1, 2, 3 (dos) y 4 |
| Archivos MDX de lección | 5 | `src/content/lecciones/` |
| Archivos MDX de módulo | 1 | Solo el 3; el campo no lo usa la interfaz |
| Retos | 2 | Ambos del módulo 3, lección 1: uno de código y uno conceptual |
| Videos | 0 | RF09 los menciona, pero no hay material |
| Evaluaciones | 0 | No existe autoevaluación ni evaluación final |

### 3.5 Pruebas y calidad

| Comprobación | Resultado | Alcance |
|---|---|---|
| Vitest | 13/13 | Motor de validación de C |
| Playwright | 14/14 | Flujo del estudiante, Chromium escritorio (1440) y tableta (834) |
| Contraste | 0 fallos | 7 rutas, WCAG AA |
| Typecheck / lint / build | Sin errores | — |
| Cobertura | No medida | — |
| RLS / seguridad | Sin pruebas automatizadas | — |
| Firefox / WebKit / Edge | Sin probar | — |
| Carga | Sin probar | — |
| Accesibilidad completa | Solo contraste | — |
| Usabilidad con personas | No realizada | — |

### 3.6 Despliegue

- Producción responde en <https://codestart-fiec.vercel.app> (200; `/login` también).
- El proyecto de Vercel está vinculado (`.vercel/project.json`).
- **El `README.md` y el `INFORME_A3.md` todavía dicen que el despliegue está pendiente.**
  Hay que corregirlo: es un dato falso en la documentación entregada.

---

## 4. Matriz de requisitos

### 4.1 Requisitos funcionales

| ID | Requisito | Estado | Evidencia | Qué falta | Avance |
|---|---|---|---|---|---|
| RF01 | Registro y autenticación | ✅ | Supabase Auth, roles, RLS | — | — |
| RF02 | Visualización de módulos | 🟡 | `/modulos`, `/modulos/[m]` | Lecciones de 5–8 | A4 |
| RF03 | Visor interactivo de código | ✅ | `VisorAnatomia`, `RecorridoInstruccion` | — | — |
| RF04 | Módulo de retos y pistas | 🟡 | Retos de código y selección múltiple | Faltan `ordenamiento` y `autocompletado`; solo 2 retos | A4 |
| RF05 | Evaluaciones | ❌ | — | Autoevaluación por módulo y evaluación final | A4 |
| RF06 | Muro de progreso e insignias | 🟡 | Dashboard con % y ruta | Progreso no se escribe; insignias no se otorgan; no hay página de medallas | A4 |
| RF07 | Panel docente | ❌ | — | Pantalla D completa | A4 |
| RF08 | Administración de usuarios | 🟡 | Roles y RLS | Interfaz de alta/baja/cambio de rol | Decisión |
| RF09 | Lecciones multimedia | 🟡 | MDX + componentes interactivos | Contenido 5–8; videos | A4 |
| RF10 | Editor de código integrado | ✅ | CodeMirror + verificación en servidor | — | — |
| RF11 | Guardado de progreso | 🟡 | Borrador del reto | Avance de lección/módulo | A4 |
| RF12 | Gestión de grupos | 🟡 | Inscripción por código | Crear y gestionar grupos desde la UI | A4 |
| RF13 | Asignación de módulos y tareas | 🟡 | El estudiante ve su tarea | El docente no puede asignar | A4 |
| RF14 | Seguimiento de cumplimiento | ❌ | — | Lista por asignación con estados | A4 |
| RF15 | Análisis de errores | ❌ | `intentos` ya guarda el error | Agregación y pantalla | A4 |
| RF16 | Modo clase | ❌ | — | Vista de proyección | A4 |
| RF17 | Exportación CSV | ⏭ | — | Posterior (A1 lo marca «Posterior») | A5/piloto |
| RF18 | Gestión de contenidos desde la UI | ⏭ | — | Posterior | Piloto |

> **MVP del A1 = RF01–RF16.** RF17 y RF18 no son requisito del A4.

### 4.2 Requisitos no funcionales

| ID | Requisito | Estado | Evidencia | Qué falta | Avance |
|---|---|---|---|---|---|
| RNF01 | Compatibilidad y adaptabilidad | 🟡 | Chromium escritorio/tableta; responsive 390/768/1500 en el mockup | Firefox, WebKit/Safari, Edge; 1500 px en la app | A4 |
| RNF02 | Rendimiento (<2 s por lección) | 🟡 | 1,4–1,8 s medido | Medir con red limitada y en producción | A4 |
| RNF03 | Seguridad y acceso por rol | 🟡 | 26 políticas RLS, trigger de perfil | Pruebas cruzadas; corregir escalada en el alta | A4 |
| RNF04 | Usabilidad (>8/10) | ❌ | — | Prueba con usuarios + encuesta | A4 |
| RNF05 | Disponibilidad ≥95 % | 🟡 | Vercel + Supabase | Monitoreo y registro de disponibilidad | A5 |
| RNF06 | Accesibilidad WCAG 2.1 | 🟡 | Contraste 0 fallos | Teclado, foco, alt, formularios, zoom, lector, movimiento | A4 |
| RNF07 | Código de usuario aislado | 🟡 | Análisis estático; no se ejecuta C | Redacción del requisito; límite de tiempo explícito | A4 |
| RNF08 | 100 usuarios simultáneos | ❌ | — | Prueba de carga | A4 |
| RNF09 | Privacidad (Ley 81 de 2019) | ❌ | — | Aviso y aceptación en el registro | A4 |

---

## 5. Hallazgos y brechas

### 5.1 Tabla priorizada

| ID | Prioridad | Hallazgo | Impacto | Avance |
|---|---|---|---|---|
| F01 | **P0** | El progreso nunca se guarda | El curso queda bloqueado para todo estudiante nuevo | A4 · B1 |
| F02 | **P0** | El % por módulo cuenta filas de progreso, no lecciones | Indicadores falsos (100 % con una lección vista) | A4 · B1 |
| F03 | **P0** | Módulos 5–8 sin lecciones ni retos | La beta no se puede recorrer completa | A4 · B3 |
| F04 | **P0** | `/docente` no existe y el navbar lo enlaza | 404 en la versión entregada | A3/A4 |
| F05 | **P0** | Panel docente ausente | 5 requisitos MVP sin cubrir | A4 · B2 |
| F06 | P1 | Las insignias nunca se otorgan; la política solo permite escribirlas al admin | RF06 incompleto | A4 · B1 |
| F07 | P1 | No hay evaluaciones (RF05) | Requisito alto sin cubrir | A4 · B3 |
| F08 | P1 | No hay modo clase (RF16) | Requisito medio sin cubrir | A4 · B3 |
| F09 | P1 | Escalada de rol en el alta: el trigger confía en `user_metadata.rol` | Un `signUp` directo con la clave anónima puede crear un docente/admin | A4 · B1 |
| F10 | P1 | No hay aviso de privacidad en el registro | RNF09 y Ley 81 incumplidos | A4 · B1 |
| F11 | P1 | RNF07 dice «validar solo en el navegador», pero el análisis corre en el servidor | Requisito y diseño se contradicen en el informe | A4 · decisión |
| F12 | P2 | «Mis tareas», «Mis medallas» y «Módulos» son textos sin enlace | Navegación incompleta | A4 |
| F13 | P2 | Cobertura de pruebas limitada | El A4 exige informes que hoy no se pueden sustentar | A4 · B4 |
| F14 | P2 | El A2 no validó el prototipo con usuarios | Deuda heredada del calendario | A4 · B4 |
| F15 | P2 | El motor no soporta bucles ni arreglos, pero los módulos 5–6 los enseñan | Retos de esos módulos no se pueden validar por ejecución | A4 · decisión |
| F16 | P2 | `intentos_maximos` no se aplica: avisa, pero permite seguir intentando | Regla del reto no se cumple | A4/A5 · decisión |
| F17 | P3 | No hay videos (RF09) | Requisito parcial | A4/A5 |
| F18 | P3 | `README.md` e `INFORME_A3.md` dicen que el despliegue está pendiente | Documentación incorrecta | A3 |
| F19 | P3 | No hay interfaz de administración (RF08) | Requisito MVP parcial | Decisión |
| F20 | P3 | `modulos.archivo_contenido` apunta a archivos inexistentes en 1, 2 y 4 | Campo muerto; confunde | A4 |

### 5.2 Detalle de los hallazgos críticos

#### F01 · El progreso no se guarda

- **Evidencia:** en `src/` solo hay `upsert`/`insert` en `codigos` e `intentos`
  (`src/app/api/retos/[id]/borrador/route.ts`, `.../verificar/route.ts`). `progresos` solo se lee
  (`src/lib/auth/dal.ts`, páginas de módulo).
- **Consecuencia:** un estudiante nuevo abre el módulo 1, lee la lección y no pasa nada. El módulo
  nunca se completa y los siguientes quedan bloqueados por `calcularEstadosModulos`.
- **Solución:** acción de servidor `marcarLeccionVista(leccionId)` que hace `upsert` en
  `progresos`; botón explícito «Marcar como vista y continuar» (nada de escrituras durante el
  render) y marcado automático al pulsar «Siguiente».
- **Aceptación:** cuenta nueva → lección 1 completada → módulo 1 al 100 % → módulo 2 desbloqueado.

#### F02 · Cálculo del porcentaje

- **Evidencia:** `obtenerRutaDeModulos` (`src/lib/auth/dal.ts:87`) cuenta las filas devueltas por
  `progresos`, no las lecciones del módulo. `total` empieza en 0 y solo sube cuando hay una fila.
- **Consecuencia:** módulos sin actividad nunca se completan (total 0) y módulos con una sola fila
  pueden darse por completados.
- **Solución:** consultar el número real de lecciones por módulo y comparar contra las completadas.
  Un módulo con 0 lecciones no debe considerarse completado ni bloquear la cadena.
- **Aceptación:** prueba unitaria con 4 lecciones y 1/2/4 completadas.

#### F03 · Contenido 5–8

- **Evidencia:** `src/content/lecciones/` solo tiene `m01`, `m02`, `m03-l1`, `m03-l2` y `m04`. El
  seed crea módulos 5–8, pero sin lecciones; el módulo 8 no tiene evaluación.
- **Consecuencia:** no se puede recorrer el curso completo ni llegar al 100 %.
- **Solución:** una lección por módulo (5, 6, 7 y 8) + retos + evaluación final. Contenido
  revisado por el experto (docente del propedéutico).
- **Aceptación:** las 8 tarjetas abren una lección; cada módulo tiene al menos una actividad
  corregible.

#### F04/F05 · Panel docente

- **Evidencia:** no existe `src/app/(docente)/`; `PREFIJOS_DE_DOCENTE = ["/docente"]` y el navbar
  enlaza a `/docente` para docente y admin.
- **Consecuencia:** 404 en producción para el rol que da la clase; RF07, RF12, RF13, RF14 y RF15
  sin cubrir.
- **Solución:** ver §6.4, bloque 2.

#### F09 · Escalada de rol en el alta

- **Evidencia:** `crear_perfil_al_registrarse()` (`supabase/migrations/...esquema_inicial.sql:219`)
  lee `new.raw_user_meta_data ->> 'rol'` y acepta `docente` o `admin`. El formulario de la app
  siempre manda `estudiante` (`src/lib/auth/acciones.ts:62`), pero la clave anónima es pública: un
  `signUp` directo contra Supabase con `options.data.rol = "admin"` crearía el perfil con ese rol.
- **Solución:** el trigger crea siempre `estudiante`; el rol se asigna después con service role
  (el script `scripts/crear-usuarios.mjs` ya lo hace) o desde el panel de administración.
- **Aceptación:** prueba automatizada que intenta un alta con `rol: "admin"` y obtiene
  `estudiante`.

#### F11 · RNF07

- **Texto del requisito:** «El código escrito por el estudiante se ejecuta o valida únicamente en
  el navegador […] nunca se ejecuta en el servidor».
- **Realidad:** el análisis estático corre en el servidor (`/api/retos/[id]/verificar`) para que
  nadie pueda falsear la corrección. **No se ejecuta código de usuario**, se analiza.
- **Decisión recomendada:** mantener el diseño y precisar la redacción del requisito en el informe
  («no se ejecuta código de usuario; se analiza estáticamente, también en el servidor»). Pedir
  visto bueno al profesor. No mover el análisis al cliente: rompería la integridad de `intentos`.
- **Complemento:** añadir límite de tiempo al analizador (5 s) con terminación del Web Worker, para
  cumplir la parte de «un bucle infinito se detiene».

---

## 6. Plan por avance

### 6.1 A1 · Análisis y planificación — 30 de septiembre de 2026 · ✅

**Entregado**

- Informe de 21 secciones: problema, público, objetivos SMART, ADDIE, 18 RF, 9 RNF, arquitectura,
  modelo de datos, cronograma, presupuesto, riesgos, síntesis y anexos.
- Fuente editable: `CodeStart_FIEC_-_INF_EDUC_v2.odt`; PDF en `documentacion/entregables/`.

**Deuda que hay que arrastrar y resolver**

- [ ] Actualizar el documento final (A5) con el cronograma real de 5 avances: la §18 describe
      10 semanas y no coincide con el calendario del profesor.
- [ ] Confirmar los supuestos del Anexo A (material del propedéutico, tamaño del grupo, lenguaje C).

**Criterio de cierre:** cumplido. No se toca salvo la actualización final del A5.

---

### 6.2 A2 · Diseño instruccional e interfaz — 14 de octubre de 2026 · 🟡

**Entregado**

- Mockup navegable de 4 pantallas: dashboard, lección, editor de retos y panel docente.
- Documentación de diseño: guía de estilo con contrastes medidos, storyboard anotado y mapa de
  navegación con guardas por rol.
- https://zobercito.github.io/codestart-fiec-mockup/

**Deuda heredada**

- [ ] **Validación del prototipo con usuarios.** El calendario la pedía en el A2; el `INFORME_A3`
      registra que se descartó. Se cubre con la prueba de usabilidad de la beta en el A4 (§7.4) y
      se documenta la correspondencia.
- [ ] Confirmar con el profesor si la prueba de la beta sustituye la validación del prototipo o si
      hace falta una sesión específica sobre el mockup.

**Criterio de cierre:** el mockup es la fuente de verdad de la interfaz; la deuda se salda en el A4.

---

### 6.3 A3 · Desarrollo, parte 1 (alfa) — 28 de octubre de 2026 · 🟡

**Qué pide:** versión alfa con navegación completa, acceso de usuarios, motor de contenidos y
primeras actividades.

**Entregado (y verificado)**

- Navegación y acceso con 3 roles, RLS y código de inscripción.
- Motor MDX con `VisorAnatomia`, `SimuladorMemoria`, `RecorridoInstruccion` y `BloqueCodigo`.
- Editor CodeMirror con autoguardado, pistas progresivas y corrección en el servidor.
- Analizador estático de C con diagnóstico explicativo (13 pruebas).
- Dashboard con progreso, ruta, tarea y datos reales.
- Despliegue en Vercel y auditoría de contraste.

**Tareas de cierre (26–28 de octubre)**

| # | Tarea | Esfuerzo | Responsable | Criterio |
|---|---|---|---|---|
| A3.1 | Actualizar `README.md` e `INFORME_A3.md`: despliegue ya activo, estado real, URL | 0,25 d | Equipo | Sin afirmaciones falsas |
| A3.2 | Resolver enlaces rotos: ocultar o poner página «en construcción» en `/docente`; quitar «Mis tareas» y «Mis medallas» de la navbar hasta el A4 | 0,25 d | Dev | Ningún 404 en la alpha |
| A3.3 | Etiquetar `v0.1.0-alpha` y publicar en `origin/main` | 0,1 d | Dev | Tag visible en GitHub |
| A3.4 | Pasar la batería completa: typecheck, lint, build, Vitest, Playwright, contraste | 0,25 d | QA | Todo en verde |
| A3.5 | Revisión con el experto en contenido y acta breve | 0,25 d | Contenido | Firma/confirmación |
| A3.6 | Guardar el informe como PDF con fecha y versión | 0,1 d | Equipo | Archivo en `documentacion/entregables/` |

**Criterio de cierre:** tag `v0.1.0-alpha`, informe con las 6 secciones, URL pública y cero enlaces
rotos.

> **No meter trabajo del A4 en la entrega del A3.** El A3 cierra como alpha; el A4 empieza el 29.

---

### 6.4 A4 · Desarrollo, parte 2 y pruebas (beta) — 11 de noviembre de 2026 · ❌

**Qué pide:** versión beta completa + informe de pruebas técnicas, de usabilidad y de
accesibilidad.

**Definición de «beta completa» para este proyecto**

- RF01–RF16 funcionando de punta a punta (RF17 y RF18 quedan fuera).
- Los 8 módulos recorribles, con lección y actividad corregible.
- Estudiante: progreso real, insignias, evaluaciones y modo clase.
- Docente: grupos, indicadores, seguimiento, asignación y errores frecuentes.
- Pruebas e informes con evidencia.

#### Bloque 0 · Cierre del A3 y decisiones (26–28 oct)

| # | Tarea | Esfuerzo | Responsable |
|---|---|---|---|
| 0.1 | Cerrar el A3 (§6.3) | 1 d | Equipo |
| 0.2 | Reunión de decisiones D1–D10 (§10) y congelar alcance | 0,5 d | Todos |
| 0.3 | Agendar la prueba de usabilidad (6–7 nov) y reclutar 5–8 estudiantes + 1 docente | 0,5 d | QA |
| 0.4 | Confirmar contenido 5–8 con el experto y fecha de entrega | 0,25 d | Contenido |

#### Bloque 1 · Circuito del estudiante (29 oct – 1 nov)

| # | Tarea | Detalle | Esfuerzo |
|---|---|---|---|
| 1.1 | Acción `marcarLeccionVista` | `upsert` en `progresos`; `en_progreso` al abrir, `completado` al confirmar | 0,5 d |
| 1.2 | Corregir `obtenerRutaDeModulos` y `calcularEstadosModulos` | `total` = lecciones reales; módulos sin contenido no completan | 0,5 d |
| 1.3 | Insignias | Trigger `SECURITY DEFINER` al completar módulo/curso y al primer reto aprobado | 1 d |
| 1.4 | Página `/medallas` y enlace en la navbar | Insignias reales, no maqueta | 0,5 d |
| 1.5 | Enlazar «Módulos», «Mis tareas» y «Mis medallas» | O convertirlos en rutas reales; nada de textos muertos | 0,25 d |
| 1.6 | Corregir el alta de usuarios (F09) | Trigger crea siempre `estudiante`; rol por service role | 0,25 d |
| 1.7 | Aviso de privacidad (RNF09) | Checkbox + texto + columnas `acepta_privacidad`, `fecha_aceptacion` | 0,5 d |
| 1.8 | Pruebas | Unitarias de progreso/estados + E2E «cuenta nueva completa el módulo 1» | 1 d |

**Aceptación del bloque:** cuenta nueva → lee lección → módulo 1 al 100 % → módulo 2 desbloqueado →
insignia visible → el alta con rol `admin` sigue siendo `estudiante`.

#### Bloque 2 · Panel docente (2–5 nov)

| # | Tarea | Detalle | Esfuerzo |
|---|---|---|---|
| 2.1 | DAL del docente | `obtenerMisGrupos`, indicadores, seguimiento, errores, detalle de estudiante; guardas de rol | 1 d |
| 2.2 | Layout y panel `/docente` | KPIs del mockup: cumplimiento, tasa de acierto, atrasados, punto crítico | 1 d |
| 2.3 | Grupos | Listar, crear y copiar el código de inscripción | 0,5 d |
| 2.4 | Seguimiento `/docente/grupo/[id]` | Tabla por estudiante: estado, avance, último reto, intentos, acción | 1 d |
| 2.5 | Detalle `/docente/estudiante/[id]` | Progreso, intentos, errores, evolución | 0,5 d |
| 2.6 | Asignar `/docente/asignar` | Módulo o reto + fecha de entrega + descripción | 0,5 d |
| 2.7 | Errores frecuentes | Agregación de `intentos.error_detectado`, tasa de acierto por reto, patrón dominante y «próxima acción» | 1 d |
| 2.8 | Pruebas | E2E docente + RLS: el estudiante no entra a `/docente`; el docente solo ve su grupo | 1 d |

**Aceptación:** el docente entra, ve sus indicadores, asigna el módulo 5 y el estudiante lo ve como
tarea; ningún dato de otro grupo es visible.

#### Bloque 3 · Contenido y actividades (3–7 nov, en paralelo)

| # | Tarea | Detalle | Esfuerzo |
|---|---|---|---|
| 3.1 | Módulo 5 | Lección de control de flujo + 4 retos (predicción, ordenamiento, condicional) | 1 d |
| 3.2 | Módulo 6 | Lección de arreglos/índices + 4 retos (índice vs. valor) | 1 d |
| 3.3 | Módulo 7 | Lección de taller + 6 retos integradores | 1 d |
| 3.4 | Módulo 8 | Evaluación final de 15–20 preguntas + reporte de áreas por reforzar | 1 d |
| 3.5 | Autoevaluación (RF05) | 5 preguntas por módulo, nota, reintento y retroalimentación | 1 d |
| 3.6 | Modo clase (RF16) | Texto ampliado, sin soluciones ni pistas, salida clara; decidir si exige sesión | 1 d |
| 3.7 | Ordenamiento / autocompletado (RF04) | Al menos un tipo nuevo de reto; reutilizar el motor | 1 d |
| 3.8 | Revisión del experto | Corrección pedagógica y de lenguaje; aviso de «provisional» si falta material | 0,5 d |

**Aceptación:** las 8 tarjetas abren contenido; cada módulo tiene una actividad corregible y una
autoevaluación; el módulo 8 da nota y áreas a reforzar; el modo clase oculta las respuestas.

> **Decisión F15:** no ampliar el motor a bucles y arreglos en el A4. Los módulos 5 y 6 se validan
> con retos conceptuales, de ordenamiento y de estructura. La ampliación del motor es etapa
> posterior (A5/piloto). Ampliarlo ahora consume 2–3 días y pone en riesgo las pruebas.

#### Bloque 4 · Pruebas (6–9 nov)

El detalle está en §7. Resumen:

| # | Frente | Esfuerzo |
|---|---|---|
| 4.1 | Unitarias e integración | 1 d |
| 4.2 | E2E del estudiante + docente + admin (si entra) | 1 d |
| 4.3 | Seguridad y RLS | 0,5 d |
| 4.4 | Accesibilidad (axe + manual) | 1 d |
| 4.5 | Rendimiento con red limitada | 0,5 d |
| 4.6 | Carga (100 usuarios) | 0,5 d |
| 4.7 | Usabilidad con personas | 1 d + sesión |

#### Bloque 5 · Informes y entrega (9–11 nov)

| # | Entregable | Contenido |
|---|---|---|
| 5.1 | `docs/INFORME_PRUEBAS.md` | Técnicas, usabilidad y accesibilidad con métricas, evidencias y hallazgos |
| 5.2 | `docs/INFORME_A4.md` | Las 6 secciones del calendario |
| 5.3 | `README.md` | Estado beta, URL, comandos, usuarios de prueba |
| 5.4 | Tag `v0.2.0-beta` + deploy | Versión congelada y URL |
| 5.5 | Paquete de evidencias | Capturas, logs, resultados CSV, matriz requisito ↔ prueba |

**Criterio de cierre del A4**

- [ ] Beta desplegada y estable.
- [ ] Los 8 módulos se recorren de principio a fin.
- [ ] Panel docente operativo con datos reales.
- [ ] Progreso e insignias persisten.
- [ ] `INFORME_PRUEBAS.md` con las tres secciones y evidencias.
- [ ] `INFORME_A4.md` con las 6 secciones.
- [ ] Cero P0/P1 abiertos.

---

### 6.5 A5 · Validación e implementación (1.0) — 25 de noviembre de 2026 · ⏭

**Qué pide:** versión 1.0, informe de validación, manuales, capacitación, acta de aceptación, plan
de mantenimiento y sustentación. Herramientas: Word, archivo comprimido y sustentación.

#### Fase A5.1 · Correcciones y release candidate (12–16 nov)

| # | Tarea | Criterio |
|---|---|---|
| 5.1.1 | Triage de hallazgos del A4 (P0/P1 primero) | Cero P0/P1 |
| 5.1.2 | Regresión completa | Suite en verde |
| 5.1.3 | Congelar alcance de la 1.0 | Lista de cambios cerrada |
| 5.1.4 | Datos de demostración y seed reproducible | Un comando deja la demo lista |
| 5.1.5 | Respaldo de base de datos y plan de restauración | Restauración probada |
| 5.1.6 | Tag `v1.0.0-rc` y deploy de candidato | URL de RC |

#### Fase A5.2 · Validación (17–20 nov)

| # | Tarea | Criterio |
|---|---|---|
| 5.2.1 | Piloto con estudiantes (grupo reducido o sección real) | Sesión documentada |
| 5.2.2 | Pre/post prueba de aprendizaje | Métrica antes/después |
| 5.2.3 | Encuesta de usabilidad | Promedio > 8/10 (RNF04) |
| 5.2.4 | Entrevista con el docente | Hallazgos cualitativos |
| 5.2.5 | Métricas de uso | ≥70 % completa un módulo asignado |
| 5.2.6 | Pruebas de aceptación (RF01–RF16) | Acta de resultados |
| 5.2.7 | `docs/INFORME_VALIDACION.md` | Evidencia cuantitativa y cualitativa + recomendaciones |

#### Fase A5.3 · Manuales y capacitación (20–23 nov)

| # | Entregable | Contenido mínimo |
|---|---|---|
| 5.3.1 | Manual del estudiante | Acceso, inscripción, lecciones, retos, progreso, medallas |
| 5.3.2 | Manual del docente | Grupos, asignaciones, seguimiento, errores, modo clase, reportes |
| 5.3.3 | Manual del administrador | Usuarios, roles, contenido, respaldo |
| 5.3.4 | Manual técnico | Arquitectura, despliegue, variables, migraciones, pruebas |
| 5.3.5 | Guía de mantenimiento | Actualización de contenido, backups, monitoreo, incidentes |
| 5.3.6 | Sesión de capacitación | Guion + grabación + lista de asistencia |
| 5.3.7 | Material de apoyo | FAQ, video corto de 3–5 min, guía de una página |

#### Fase A5.4 · Cierre (24–25 nov)

| # | Entregable | Detalle |
|---|---|---|
| 5.4.1 | Versión 1.0 desplegada | Tag `v1.0.0` + URL |
| 5.4.2 | Acta de aceptación | Requisitos, resultados, firmas (profesor/facultad) |
| 5.4.3 | Plan de mantenimiento | Responsables, frecuencia, backups, soporte, roadmap |
| 5.4.4 | Paquete de entrega | ZIP con código, PDFs, manuales, acta y evidencias |
| 5.4.5 | Informe A5 | Las 6 secciones del calendario |
| 5.4.6 | Sustentación | Diapositivas, guion, demo en vivo y video de respaldo |

**Criterio de cierre del A5**

- [ ] Versión 1.0 desplegada y etiquetada.
- [ ] Informe de validación con métricas de aprendizaje, usabilidad y uso.
- [ ] Manuales de estudiante, docente, administrador y técnico.
- [ ] Capacitación realizada y documentada.
- [ ] Acta de aceptación firmada.
- [ ] Plan de mantenimiento.
- [ ] Sustentación ensayada y material listo.
- [ ] Paquete comprimido con nombre, fecha y versión.

---

### 6.6 Después del A5 (piloto y etapa posterior)

No forma parte de la entrega, pero conviene dejarlo escrito en el plan de mantenimiento:

- Piloto real en el curso propedéutico de verano, con autorización de la facultad.
- RF17 · exportación CSV de reportes.
- RF18 · editor de contenidos desde la interfaz.
- Interfaz de administración completa (RF08).
- Motor de validación nivel 2: bucles, arreglos y ejecución aislada.
- Videos por módulo y más banco de retos.
- Monitoreo, respaldos automáticos y métricas de uso.
- Acceso institucional (SSO) si la universidad lo ofrece.

---

## 7. Plan de pruebas del A4

### 7.1 Estrategia

- **Prioridad:** flujos críticos y requisitos de seguridad antes que cobertura exhaustiva.
- **Entorno:** build de producción (`npm run build && npm start`) contra la base real de pruebas;
  nunca datos reales de estudiantes.
- **Evidencia:** cada prueba deja salida, captura o reporte enlazado desde el informe.
- **Trazabilidad:** toda prueba referencia el RF/RNF que cubre.

### 7.2 Pruebas por tipo

| Tipo | Qué se prueba | Herramienta | Criterio de aceptación | Evidencia |
|---|---|---|---|---|
| **Unitarias** | Motor de C (13 actuales), cálculo de progreso, estados de módulo, agregaciones del panel, validaciones zod, guardas de rol | Vitest | 100 % en verde; cobertura ≥80 % en lógica de negocio | Salida + reporte de cobertura |
| **Integración** | Acciones de servidor + base; verificación de retos; asignaciones; insignias; borrador | Vitest + Supabase de pruebas | Flujo completo sin mocks de base | Log + datos creados |
| **E2E estudiante** | Registro → inscripción → lección → progreso → reto → resultado → insignia | Playwright | 100 % de los flujos críticos | Traza/video en fallo |
| **E2E docente** | Login → grupo → indicadores → asignar → seguimiento → detalle → errores | Playwright | Flujo completo | Traza |
| **E2E admin** (si entra) | Alta/baja y cambio de rol | Playwright | Sin escalada | Traza |
| **Seguridad / RLS** | Estudiante A no ve datos de B; docente solo sus grupos; borrador ajeno; alta con rol falsificado; API manipulada | SQL + Playwright | 0 fugas entre grupos | Matriz de casos |
| **Compatibilidad** | Chromium, Firefox, WebKit (Safari) y Edge; 390, 768, 1500 px | Playwright projects + prueba manual | Flujos críticos verdes en todos | Capturas |
| **Accesibilidad** | axe-core en 8 rutas + checklist manual WCAG 2.1 AA | axe + revisión manual + lector | 0 violaciones críticas/serias; 0 pares <4,5:1 | Reporte axe + checklist |
| **Rendimiento** | Lección <2 s; TTFB, FCP, LCP con Fast 3G y CPU 4× | Lighthouse / WebPageTest | RNF02 cumplido con margen | Tabla de métricas |
| **Carga** | 100 usuarios simultáneos, 5 min | k6 o Artillery | p95 <2 s; errores <1 % | Reporte de carga |
| **Usabilidad** | 6 tareas con 5–8 estudiantes + 1 docente + encuesta | Guion + observación + SUS | >8/10; ≥80 % de éxito; sin bloqueos críticos | Informe + encuesta |
| **Regresión** | Suite completa antes de cada tag | Todas | Verde | CI/local |

### 7.3 Accesibilidad: checklist mínimo (WCAG 2.1 AA)

- [ ] Contraste de texto ≥4,5:1 y texto grande ≥3:1 (ya hay auditor; ampliar a las rutas nuevas).
- [ ] Todos los controles alcanzables y operables con teclado; orden de tabulación lógico.
- [ ] Foco visible en todos los elementos interactivos.
- [ ] Formularios con etiqueta, ayuda, error y `aria-describedby`.
- [ ] Imágenes con `alt`; iconos decorativos con `aria-hidden`.
- [ ] Encabezados jerárquicos y landmarks (`main`, `nav`).
- [ ] Contraste de componentes y estados (no solo texto).
- [ ] Zoom 200 % y reflow a 320 px sin pérdida de contenido.
- [ ] Sin dependencia exclusiva del color.
- [ ] `prefers-reduced-motion` respetado.
- [ ] Mensajes de estado anunciados (`role="status"`, `role="alert"`).
- [ ] Lector de pantalla en el flujo crítico (NVDA o VoiceOver).
- [ ] Sin trampas de foco en modales y paneles.
- [ ] Idioma declarado (`lang="es"`).

### 7.4 Usabilidad: protocolo

1. **Participantes:** 5–8 estudiantes del perfil objetivo + 1 docente. Sesión presencial o remota.
2. **Tareas (máximo 40 min):**
   - Registrarse y unirse a un grupo con código.
   - Encontrar el módulo en curso y continuar la lección.
   - Resolver un reto, pedir una pista y corregir el error.
   - Consultar el progreso y las medallas.
   - (Docente) Ver el grupo, asignar un módulo y encontrar el error más frecuente.
3. **Métricas:** éxito por tarea, tiempo, número de errores, ayuda solicitada.
4. **Instrumentos:** observación con notas, escala de satisfacción 1–10 y preguntas abiertas.
5. **Criterio RNF04:** promedio > 8/10 y ninguna tarea crítica bloqueada.
6. **Salida:** `docs/INFORME_PRUEBAS.md` § usabilidad + lista priorizada de correcciones.

> Si no se consiguen participantes, se hace **evaluación heurística con 3 expertos** y se declara
> el RNF04 como **no verificado**. No se inventan resultados.

### 7.5 Matriz de trazabilidad (modelo)

| Requisito | Prueba | Evidencia | Resultado |
|---|---|---|---|
| RF11 | E2E «el progreso persiste» | Video/traza | Pendiente |
| RF15 | Integración + E2E docente | Consulta + captura | Pendiente |
| RNF03 | Matriz RLS de 3 roles | Tabla de casos | Pendiente |
| RNF06 | axe + checklist manual | Reporte | Pendiente |
| RNF08 | k6 100 VUs | Reporte | Pendiente |

---

## 8. Cambios técnicos previstos

### 8.1 Base de datos

| Cambio | Para qué | Migración |
|---|---|---|
| Trigger/función de insignias (`SECURITY DEFINER`) | Otorgar insignias sin abrir la escritura al estudiante | Nueva |
| `perfiles.acepta_privacidad` + `fecha_aceptacion` | RNF09 con evidencia | Nueva |
| Trigger de alta que ignore `rol` | Cerrar F09 | Reemplazo de función |
| Corrección de cálculo de progreso | F02 | Solo código (DAL) |
| (Opcional) `evaluaciones` / `preguntas` | RF05 si no se reutilizan `retos` | Nueva |

> **Recomendación RF05:** reutilizar `retos` de tipo `seleccion_multiple` agrupados por lección o
> módulo, y calcular la nota con `intentos`. Evita una migración grande y mantiene una sola lógica
> de corrección. La alternativa con tablas propias se decide en D1.

### 8.2 Rutas nuevas

| Ruta | Rol | Función |
|---|---|---|
| `/docente` | Docente/admin | Panel D con indicadores |
| `/docente/grupo/[id]` | Docente/admin | Seguimiento del grupo |
| `/docente/estudiante/[id]` | Docente/admin | Detalle del estudiante |
| `/docente/asignar` | Docente/admin | Crear asignación |
| `/docente/grupos` | Docente/admin | Crear/listar grupos |
| `/medallas` | Estudiante | Insignias ganadas |
| `/evaluacion/[modulo]` | Estudiante | Autoevaluación |
| `/evaluacion/final` | Estudiante | Evaluación del módulo 8 |
| `/clase/[modulo]/[leccion]` | Docente/admin | Modo clase (o `?modo=clase`) |
| `/admin/usuarios` | Admin | RF08 (si entra) |
| `/api/docente/reportes/[grupo]/csv` | Docente | RF17 (opcional) |

### 8.3 Componentes y DAL

- `src/components/docente/`: `Indicador`, `TablaSeguimiento`, `FilaEstudiante`, `ErroresFrecuentes`,
  `FormularioAsignacion`, `SelectorGrupo`, `DetalleIntento`.
- `src/components/evaluacion/`: `Cuestionario`, `ResultadoEvaluacion`.
- `src/components/leccion/`: `BotonVista`, `ModoClase`.
- `src/lib/auth/dal.ts`: funciones del docente y guardas `exigirDocente` / `exigirAdmin`.
- `src/lib/progreso/`: cálculo de estados y otorgamiento de insignias.
- `src/lib/analitica/`: agregaciones de intentos y errores frecuentes.

### 8.4 Contenido

- `src/content/lecciones/m05-...mdx`, `m06-...mdx`, `m07-...mdx`, `m08-...mdx`.
- Banco de preguntas de autoevaluación y evaluación final (seed o JSON versionado).
- Retos de los módulos 5–8 con sus reglas y casos.
- Aviso de contenido provisional si el material del propedéutico no llega.

---

## 9. Reparto sugerido y capacidad

| Rol | Foco | Bloques |
|---|---|---|
| **Dev A · datos/backend** | Progreso, insignias, RLS, DAL docente, API, migraciones | B1, B2, B4 |
| **Dev B · frontend** | Panel docente, evaluaciones, modo clase, accesibilidad, navbar | B2, B3, B4 |
| **Contenido · experto + apoyo** | Módulos 5–8, banco de preguntas, revisión pedagógica | B3 |
| **QA · rotativo** | Plan de pruebas, E2E, usabilidad, informes | B4, B5 |
| **Todos** | Sesión de usabilidad, revisión cruzada, deploy y entrega | B0, B4, B5 |

**Capacidad:** 4 personas × 4 h/día × 16 días ≈ 256 h ≈ 32 días-persona. El alcance mínimo
consume 26–30. **No hay margen para el camino feliz.**

---

## 10. Decisiones pendientes

| # | Decisión | Quién decide | Fecha límite | Recomendación |
|---|---|---|---|---|
| D1 | Alcance de la beta: ¿RF08 admin y RF17 CSV entran? | Profesor + equipo | 28 oct | No. RF01–RF16; CSV y admin al piloto |
| D2 | ¿Quiénes participan en la prueba de usabilidad? | Profesor + equipo | 30 oct | 5–8 estudiantes + 1 docente; si no, heurística y RNF04 parcial |
| D3 | ¿Quién es el experto en contenido y ya hay material? | Profesor | 30 oct | Docente del propedéutico; contenido provisional marcado si no llega |
| D4 | Redacción de RNF07 | Profesor | 1 nov | «No se ejecuta código de usuario; se analiza estáticamente» |
| D5 | ¿Se amplía el motor a bucles/arreglos? | Equipo | 1 nov | No en el A4; retos conceptuales y de estructura |
| D6 | ¿Se producen videos? | Equipo | 1 nov | No en el A4; componentes interactivos; video al piloto |
| D7 | Modo clase: ¿exige sesión? | Equipo | 1 nov | Sesión de docente/admin (el mockup lo hacía público) |
| D8 | URL oficial de la beta | Equipo | 28 oct | `https://codestart-fiec.vercel.app` |
| D9 | ¿Se aplica el máximo de intentos? | Profesor | 1 nov | Sí: bloquear tras `intentos_maximos` con opción de práctica sin puntos |
| D10 | Texto del aviso de privacidad | Profesor/legal | 1 nov | Aviso corto + casilla + registro de aceptación |
| D11 | ¿La validación de la beta sustituye la del prototipo del A2? | Profesor | 1 nov | Sí, documentando la correspondencia |
| D12 | ¿Entra la interfaz de administración (RF08)? | Profesor | 28 oct | Mínima: listar usuarios y cambiar rol; si no, declararla pendiente |

---

## 11. Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| 16 días para un alcance de 26–30 días-persona | Alta | Alto | Recortar D1, D5, D6 y D12; no abrir frentes nuevos |
| El contenido 5–8 no llega a tiempo | Alta | Alto | Contenido provisional marcado + revisión del experto; priorizar módulos 5 y 8 |
| No hay participantes para usabilidad | Media | Alto | Agendar el 30 oct; plan B: heurística con expertos y RNF04 parcial declarado |
| El panel docente se come el tiempo de pruebas | Media | Alto | DAL y consultas primero; UI con los componentes del mockup; no inventar diseño |
| Fuga de datos entre grupos | Baja | Muy alto | Pruebas RLS antes de la beta; corregir F09; revisión de políticas |
| Supabase gratuito limita la prueba de carga | Media | Medio | Ejecutar fuera de horario, con datos de prueba; documentar límites del plan |
| RNF02 al límite (1,8 s de 2 s) | Media | Medio | Medir con Fast 3G; optimizar imágenes/fuentes; cachear; presupuesto de peso |
| Regresiones de accesibilidad al añadir pantallas | Media | Medio | axe en cada ruta nueva + checklist en la definición de terminado |
| El equipo tiene exámenes o carga académica | Alta | Alto | Reparto por bloques con responsable único y buffer del 26–30 nov |
| Variables de entorno de producción mal configuradas | Baja | Alto | Smoke test tras cada deploy; verificar Supabase de producción |
| Motor de C insuficiente para módulos 5–6 | Alta | Medio | Decisión D5: no ampliarlo; retos conceptuales/estructura |
| `intentos` sin límite permite farming de puntos | Media | Bajo | Decisión D9; aplicar máximo y modo práctica |
| Documentación desactualizada | Alta | Medio | Actualizar README/informe en cada bloque, no al final |

---

## 12. Checklists de entrega

### A3 · 28 de octubre

- [ ] README e INFORME_A3 con el despliegue real.
- [ ] Cero enlaces rotos en la alpha.
- [ ] Tag `v0.1.0-alpha` publicado.
- [ ] Typecheck, lint, build, Vitest, Playwright y contraste en verde.
- [ ] Informe con las 6 secciones y PDF con fecha/versión.
- [ ] Revisión del experto en contenido registrada.

### A4 · 11 de noviembre

- [ ] Progreso e insignias persisten y el curso se recorre completo.
- [ ] Módulos 5–8 con lección, reto y autoevaluación.
- [ ] Evaluación final del módulo 8 con nota y áreas a reforzar.
- [ ] Panel docente con grupos, indicadores, seguimiento, asignación y errores frecuentes.
- [ ] Modo clase operativo.
- [ ] RNF09: aviso de privacidad y aceptación registrada.
- [ ] F09 corregido y probado.
- [ ] Suite técnica completa (unitarias, integración, E2E, RLS, compatibilidad, carga).
- [ ] Accesibilidad: axe + checklist manual.
- [ ] Usabilidad: sesión realizada y encuesta >8/10 (o declarada parcial).
- [ ] `INFORME_PRUEBAS.md` con las tres secciones y evidencias.
- [ ] `INFORME_A4.md` con las 6 secciones.
- [ ] Tag `v0.2.0-beta` y deploy verificado.
- [ ] Cero P0/P1.

### A5 · 25 de noviembre

- [ ] Hallazgos del A4 corregidos y regresión en verde.
- [ ] Versión 1.0 desplegada y tag `v1.0.0`.
- [ ] Informe de validación con métricas de aprendizaje, usabilidad y uso.
- [ ] Manuales de estudiante, docente, administrador y técnico.
- [ ] Guía de mantenimiento y plan de respaldos.
- [ ] Capacitación realizada (guion, grabación, asistencia).
- [ ] Acta de aceptación firmada.
- [ ] Paquete comprimido con fecha y versión.
- [ ] Informe A5 con las 6 secciones.
- [ ] Sustentación ensayada y material de respaldo.

---

## Anexo A · Comandos de trabajo

```bash
# Desarrollo
npm run dev

# Verificación antes de commitear
npm run typecheck && npm run lint && npm run build

# Pruebas
npm test
npm run test:e2e
npm run auditar:contraste

# Base de datos
npm run db:migrate
npm run db:usuarios
npm run db:seed
npm run db:types

# Entrega
git tag -a v0.2.0-beta -m "Beta del Avance 4"
git push origin main --tags
vercel --prod
```

## Anexo B · Fuentes de este plan

- `documentacion/contexto/Calendario de Avances.pdf` — fechas y contenido de cada avance.
- `CodeStart_FIEC_-_INF_EDUC_v2.odt` — requisitos RF01–RF18, RNF01–RNF09, flujos, modelo de datos,
  plan de validación y cronograma.
- `documentacion/contexto/GUIA MODELO ADDIE.pdf` — fases 3.4–3.5 y 4.1 que cubren el A4.
- `CodeStart_FIEC/docs/INFORME_A3.md` — estado y pendientes del A3.
- `CodeStart_FIEC/docs/ARQUITECTURA.md` y `MODELO_DATOS.md` — arquitectura y esquema.
- Código y migraciones del repositorio `CodeStart_FIEC/` (revisado el 26 oct 2026).
- Mockup del A2 (`index.html`) — pantalla D, modo clase y guía de estilo.

---

**Materia:** Informática Educativa · 2.º Semestre 2026 · Prof. Alvin Blanco
**Equipo:** Francisco González · Eira Arrocha · Yasari Ortiz · Domingo de León

**Última actualización:** 26 de octubre de 2026.
