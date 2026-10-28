# Subplan de ejecución · Avance 4 (beta)

**Proyecto:** CodeStart FIEC — Plataforma web interactiva de apoyo al Curso Propedéutico de la FIEC
**Asignatura:** Informática Educativa · 2.º Semestre 2026
**Entrega:** miércoles 11 de noviembre de 2026
**Fecha de este plan:** lunes 26 de octubre de 2026
**Base:** `docs/PLAN_AVANCES.md` (§6.4, §7, §8, §10, §11 y §12)
**Estado del A3:** cerrado técnicamente, tag `v0.1.0-alpha` publicado.

> **Este documento no reemplaza el plan general.** Lo convierte en una lista de trabajo
> verificable: qué se hace, en qué archivo, en qué orden, cómo se prueba y cuándo se considera
> terminado. Las fechas son reales, no ideales: si una tarea se retrasa, se recorta alcance antes
> de recortar pruebas o seguridad.

---

## 0. Cómo usar este subplan

### 0.1 Convenciones

| Símbolo | Significado |
|---|---|
| `[ ]` | Pendiente |
| `[x]` | Hecho y verificado |
| `B0`–`B5` | Bloque de trabajo |
| `A4-xx` | Identificador de tarea |
| **P0** | Sin esto no hay beta; no se puede recortar |
| **P1** | Necesario para cumplir RF01–RF16; se recorta solo con decisión escrita |
| **P2** | Mejora; se puede mover al A5 o al piloto |
| **DoD** | Definition of Done: código + prueba + evidencia + documentación |

### 0.2 Regla de oro

Una tarea solo se marca `[x]` cuando:

1. El código está en `main` (o en la rama de integración).
2. Pasa `typecheck`, `lint`, `build` y las pruebas que le corresponden.
3. Tiene evidencia reproducible: comando, captura, traza o consulta SQL.
4. Está reflejada en el informe o en el README si cambia el comportamiento visible.
5. No deja un P0/P1 abierto.

### 0.3 Qué no se hace en el A4

- No se amplía el motor de C a bucles, arreglos ni ejecución real (decisión D5).
- No se implementa la interfaz completa de administración (RF08); queda para el piloto.
- No se implementa exportación CSV (RF17) ni editor de contenidos (RF18).
- No se producen videos (D6).
- No se toca la base de datos de producción con datos reales de estudiantes.
- No se inventan resultados de pruebas, usabilidad ni métricas.

---

## 1. Objetivo y definición de beta

### 1.1 Objetivo

Convertir la alpha actual en una **beta completa y demostrable**:

- Un estudiante nuevo puede registrarse, entrar, recorrer los 8 módulos, resolver actividades,
  guardar progreso, ganar insignias y ver su avance.
- Un docente puede crear/gestionar su grupo, ver indicadores, asignar trabajo, revisar el
  seguimiento y detectar errores frecuentes.
- El sistema tiene pruebas técnicas, de seguridad, de accesibilidad, de rendimiento, de carga y de
  usabilidad, con evidencia.

### 1.2 Alcance funcional

| Requisito | Qué debe funcionar al cierre |
|---|---|
| RF01 | Registro, login, roles y sesión |
| RF02 | 8 módulos visibles, con lecciones y desbloqueo secuencial |
| RF03 | Visor interactivo de código y componentes MDX |
| RF04 | Retos de código, selección múltiple, ordenamiento y autocompletado; pistas |
| RF05 | Autoevaluación por módulo y evaluación final del módulo 8 |
| RF06 | Progreso real, insignias y página `/medallas` |
| RF07 | Panel docente con grupos, indicadores, seguimiento, asignación y errores |
| RF08 | Fuera del A4; se declara pendiente o se hace una versión mínima si hay tiempo |
| RF09 | Contenido de los 8 módulos; sin videos |
| RF10 | Editor CodeMirror y verificación en servidor |
| RF11 | Guardado de avance de lección y borrador de reto |
| RF12 | Crear/listar grupos y unirse por código |
| RF13 | Asignar módulo/reto con fecha y verlo como tarea |
| RF14 | Seguimiento de cumplimiento por grupo |
| RF15 | Agregación de errores frecuentes y detalle por estudiante |
| RF16 | Modo clase para docente/admin |
| RF17 | Fuera del A4 |
| RF18 | Fuera del A4 |

### 1.3 Requisitos no funcionales que se deben poder demostrar

| RNF | Evidencia mínima |
|---|---|
| RNF01 | Chromium, Firefox, WebKit y Edge; 390, 834 y 1440 px |
| RNF02 | Lección < 2 s con Fast 3G y CPU 4× |
| RNF03 | Matriz RLS de 3 roles; alta con rol falso queda como estudiante |
| RNF04 | 5–8 estudiantes + 1 docente; satisfacción > 8/10 o declaración de no verificado |
| RNF06 | axe sin violaciones críticas/serias + checklist manual |
| RNF07 | ADR-001 aprobado o decisión escrita; timeout del analizador |
| RNF08 | 100 usuarios, 5 min, p95 < 2 s y errores < 1 % |
| RNF09 | Aviso de privacidad, casilla y fecha de aceptación |

### 1.4 Criterio de cierre

- [ ] Beta desplegada y estable.
- [ ] Los 8 módulos se recorren de principio a fin.
- [ ] Progreso e insignias persisten.
- [ ] Panel docente operativo con datos reales.
- [ ] Evaluaciones y modo clase funcionando.
- [ ] `INFORME_PRUEBAS.md` con técnicas, accesibilidad y usabilidad.
- [ ] `INFORME_A4.md` con las 6 secciones.
- [ ] Cero P0/P1 abiertos.
- [ ] Tag `v0.2.0-beta` publicado.

---

## 2. Punto de partida real (26 de octubre)

### 2.1 Lo que ya existe

| Área | Estado | Evidencia |
|---|---|---|
| Auth, roles y RLS | ✅ | Supabase Auth + 26 políticas; login/registro |
| Dashboard del estudiante | 🟡 | Pantalla A con datos; sin progreso nuevo |
| Módulos 1–4 | ✅ | 5 lecciones MDX; módulo 3 con 2 retos |
| Editor y motor de C | ✅ | CodeMirror + analizador estático; 13 pruebas |
| Borrador de reto | ✅ | `codigos` + autoguardado |
| Inscripción por código | ✅ | `unirse_por_codigo` |
| Deploy | ✅ | <https://codestart-fiec.vercel.app> |
| Pruebas | 🟡 | 13 unitarias + 14 E2E; sin RLS, carga ni accesibilidad completa |

### 2.2 Brechas que ordenan el trabajo

| ID | Prioridad | Brecha | Consecuencia |
|---|---|---|---|
| F01 | **P0** | `progresos` nunca se escribe | Un estudiante nuevo no avanza; el curso queda bloqueado |
| F02 | **P0** | El % cuenta filas de progreso, no lecciones | Indicadores falsos; módulos de 0 lecciones |
| F03 | **P0** | Módulos 5–8 sin lecciones ni retos | No se puede recorrer el curso completo |
| F05 | **P0** | Panel docente ausente | RF07, RF12–RF15 sin cubrir |
| F06 | P1 | Insignias nunca se otorgan | RF06 incompleto |
| F07 | P1 | Sin evaluaciones | RF05 sin cubrir |
| F08 | P1 | Sin modo clase | RF16 sin cubrir |
| F09 | P1 | Escalada de rol en el alta | Riesgo de seguridad |
| F10 | P1 | Sin aviso de privacidad | RNF09 y Ley 81 |
| F16 | P2 | `intentos_maximos` no se aplica | Se puede “farmear” puntos |

### 2.3 Ruta crítica

```
Migraciones (insignias, privacidad, rol)
        │
        ▼
Progreso real ──► Cálculo de % ──► Insignias ──► Dashboard/medallas
        │
        ▼
Panel docente (DAL → KPIs → grupos → seguimiento → asignar → errores)
        │
        ▼
Pruebas de integración/E2E/RLS ──► Informes ──► Tag y deploy

Contenido 5–8 y evaluaciones: en paralelo, pero dependen del API de retos.
```

---

## 3. Decisiones que hay que congelar antes de codificar

### 3.1 Decisiones de alcance

| # | Decisión | Fecha límite | Default propuesto | Si se decide lo contrario |
|---|---|---|---|---|
| D1 | ¿RF08 admin y RF17 CSV entran? | 28 oct | **No.** RF01–RF16 | Se recorta contenido o pruebas; no caben ambos |
| D2 | ¿Quiénes participan en usabilidad? | 30 oct | 5–8 estudiantes + 1 docente | Plan B: heurística con 3 expertos y RNF04 no verificado |
| D3 | ¿Quién es el experto en contenido? | 30 oct | Docente del propedéutico | Contenido provisional marcado; revisión posterior |
| D4 | Redacción de RNF07 | 1 nov | Aprobar ADR-001: no se ejecuta código, se analiza | Reescribir informe y asumir deuda |
| D5 | ¿Motor a bucles/arreglos? | 1 nov | **No** en A4 | Riesgo alto; retos conceptuales y de estructura |
| D6 | ¿Videos? | 1 nov | **No**; componentes interactivos | Se recorta contenido o pruebas |
| D7 | ¿Modo clase exige sesión? | 1 nov | Sí: docente/admin | Abriría contenido sin control |
| D8 | URL oficial de la beta | 28 oct | `https://codestart-fiec.vercel.app` | Cambiar README, Vercel y pruebas |
| D9 | ¿Máximo de intentos? | 1 nov | Sí, con práctica sin puntos | Se permite farming |
| D10 | Texto del aviso de privacidad | 1 nov | Aviso corto + casilla + registro | RNF09 incompleto |
| D11 | ¿Validación A4 sustituye la del A2? | 1 nov | Sí, documentando correspondencia | Duplicar sesión de usabilidad |
| D12 | ¿Interfaz de administración? | 28 oct | **No** en A4; mínima si sobra tiempo | Recorta panel o pruebas |

### 3.2 Decisiones técnicas (ADR)

| # | Decisión | Razón | Consecuencia |
|---|---|---|---|
| T1 | Reutilizar `retos` para evaluaciones con `reglas.modo` y `reglas.preguntas` | Evita tablas nuevas y una migración grande; una sola lógica de corrección | El API y el componente deben distinguir “evaluación” de “reto normal” |
| T2 | Ordenamiento y autocompletado con validación en servidor | Cubre RF04 sin ampliar el motor de C | Nuevos componentes y ramas en `/api/retos/[id]/verificar` |
| T3 | Insignias con función/trigger `SECURITY DEFINER` | El estudiante no puede escribir sus propias insignias | Hay que probar el trigger y el `on conflict` |
| T4 | Progreso con Server Actions y `upsert` | Evita escrituras durante el render y falsificación desde el cliente | El botón “Marcar como vista” es explícito |
| T5 | Panel docente con consultas DAL y agregación en servidor | RLS ya protege; 100 estudiantes es manejable | Si el volumen crece, mover a RPC en el A5 |
| T6 | Modo clase con `?modo=clase` y contexto React | No duplica rutas ni contenido | Hay que ocultar pistas y soluciones en los componentes |

> **Congelar el alcance el 28 de octubre.** Después de esa fecha, solo se aceptan cambios P0/P1
> aprobados por el equipo. Un “ya que estamos” es la forma más rápida de no llegar al 11.

---

## 4. Arquitectura de la beta

### 4.1 Migraciones

| Migración | Contenido | Riesgo | Reversible |
|---|---|---|---|
| `20261029120000_a4_progreso_insignias.sql` | Función y trigger de insignias; insignia del primer reto; índices de progreso/intentos | Medio | Sí: drop trigger/function |
| `20261029121000_a4_privacidad_rol.sql` | Columnas de privacidad; trigger de alta que ignora `rol`; `proteger_campos_perfil` con service role; RPC `cambiar_rol` | Alto | Sí, pero probar en staging |
| `20261029122000_a4_indices.sql` | Índices para panel y evaluaciones | Bajo | Sí |
| Sin migración | Evaluaciones y retos nuevos van en `seed.sql` + MDX | Bajo | Sí: re-ejecutar seed |

**Orden de aplicación:**

```bash
# 1. Respaldo lógico antes de tocar nada
pg_dump "$SUPABASE_DB_URL" --schema=public --no-owner > /tmp/codestart-a4-backup.sql

# 2. Migraciones
npm run db:migrate

# 3. Tipos generados
npm run db:types

# 4. Usuarios y datos de demo
npm run db:usuarios
npm run db:seed

# 5. Verificación
npm run typecheck && npm run lint && npm test
```

**Regla:** nunca ejecutar `db:seed` contra una base con datos reales. El seed borra
`intentos`, `progresos`, `insignias`, `asignaciones`, `retos`, `lecciones`, `inscripciones`,
`grupos` y `modulos`.

### 4.2 Archivos nuevos y modificados

#### Datos y lógica

| Archivo | Cambio |
|---|---|
| `src/lib/auth/dal.ts` | `obtenerRutaDeModulos` corregido; `Perfil` con privacidad; `exigirDocente`; `obtenerMisGrupos` |
| `src/lib/auth/acciones.ts` | Registro con aceptación de privacidad; `aceptarPrivacidad` |
| `src/lib/progreso/acciones.ts` | **Nuevo.** `marcarLeccionEnProgreso`, `marcarLeccionVista` |
| `src/lib/progreso/calculo.ts` | **Nuevo.** Funciones puras de progreso y estados |
| `src/lib/insignias/catalogo.ts` | **Nuevo.** Catálogo de insignias |
| `src/lib/insignias/dal.ts` | **Nuevo.** `obtenerMisInsignias` |
| `src/lib/docente/dal.ts` | **Nuevo.** Grupos, indicadores, seguimiento, errores, detalle |
| `src/lib/docente/acciones.ts` | **Nuevo.** `crearGrupo`, `crearAsignacion` |
| `src/lib/evaluacion/tipos.ts` | **Nuevo.** Tipos de preguntas y reglas |
| `src/lib/evaluacion/calcular.ts` | **Nuevo.** Calificación y áreas |
| `src/lib/retos/ordenamiento.ts` | **Nuevo.** Validación de orden |
| `src/lib/retos/autocompletado.ts` | **Nuevo.** Validación de huecos |
| `src/lib/validacion/*` | Sin cambios de motor; solo timeout del Worker |

#### Rutas

| Ruta | Archivo | Rol |
|---|---|---|
| `/docente` | `src/app/(sesion)/docente/page.tsx` | Docente/admin |
| `/docente/grupo/[id]` | `src/app/(sesion)/docente/grupo/[id]/page.tsx` | Docente/admin |
| `/docente/estudiante/[id]` | `src/app/(sesion)/docente/estudiante/[id]/page.tsx` | Docente/admin |
| `/docente/asignar` | `src/app/(sesion)/docente/asignar/page.tsx` | Docente/admin |
| `/docente/grupos` | `src/app/(sesion)/docente/grupos/page.tsx` | Docente/admin (P2) |
| `/medallas` | `src/app/(sesion)/medallas/page.tsx` | Estudiante |
| `/evaluacion/[modulo]` | `src/app/(sesion)/evaluacion/[modulo]/page.tsx` | Estudiante |
| `/evaluacion/final` | `src/app/(sesion)/evaluacion/final/page.tsx` | Estudiante |
| `/privacidad` | `src/app/privacidad/page.tsx` | Público |
| `/api/retos/[id]/verificar` | ramas para ordenamiento, autocompletado y evaluación | Autenticado |

#### Componentes

| Archivo | Función |
|---|---|
| `src/components/docente/indicador.tsx` | Tarjeta de KPI |
| `src/components/docente/tabla-seguimiento.tsx` | Tabla por estudiante |
| `src/components/docente/errores-frecuentes.tsx` | Top de errores y próxima acción |
| `src/components/docente/formulario-asignacion.tsx` | Asignar módulo/reto |
| `src/components/docente/selector-grupo.tsx` | Cambiar de grupo |
| `src/components/evaluacion/pantalla-evaluacion.tsx` | Cuestionario y resultado |
| `src/components/retos/pantalla-ordenamiento.tsx` | Reto de ordenar bloques |
| `src/components/retos/pantalla-autocompletado.tsx` | Reto de completar huecos |
| `src/components/leccion/boton-vista.tsx` | Marcar lección como vista |
| `src/components/leccion/registrar-apertura.tsx` | Marcar `en_progreso` al abrir |
| `src/components/leccion/modo-clase.tsx` | Banner y contexto de modo clase |
| `src/components/leccion/solucion.tsx` | Bloque de solución que se oculta en modo clase |
| `src/components/insignias/tarjeta-insignia.tsx` | Insignia ganada/bloqueada |

### 4.3 Contratos de datos

#### Progreso

```ts
type EstadoLeccion = "pendiente" | "en_progreso" | "completado";

marcarLeccionEnProgreso(leccionId: string): Promise<{ ok: boolean }>
marcarLeccionVista(leccionId: string): Promise<{ ok: boolean; estado: EstadoLeccion }>
```

Reglas:

- Solo el propio estudiante escribe su fila (`usuario_id = auth.uid()`).
- `upsert` con `onConflict: "usuario_id,leccion_id"`.
- No bajar de `completado` a `en_progreso`.
- Rechazar si la lección no existe o si el módulo está bloqueado.
- Revalidar `/dashboard`, `/modulos`, `/modulos/[modulo]` y la lección.

#### Insignias

| `tipo` | Criterio | Descripción |
|---|---|---|
| `primer_reto` | Primer intento con `acierto = true` | “Primer reto aprobado” |
| `modulo_1` … `modulo_8` | Todas las lecciones del módulo completadas | “Módulo N completado” |
| `curso` | Todos los módulos con lecciones completados | “Curso completado” |

- `unique (usuario_id, tipo)` evita duplicados.
- El trigger se ejecuta al insertar/actualizar `progresos` con `estado = 'completado'`.
- El trigger del primer reto se ejecuta al insertar `intentos` con `acierto = true`.
- La lectura se hace con RLS; el estudiante ve solo las suyas.

#### Evaluación

```json
{
  "modo": "autoevaluacion",
  "umbral": 70,
  "preguntas": [
    {
      "id": "p1",
      "area": "control_de_flujo",
      "enunciado": "¿Qué imprime el programa?",
      "opciones": [
        { "id": "a", "texto": "Mayor de edad" },
        { "id": "b", "texto": "Menor de edad" }
      ],
      "correcta": "a",
      "explicacion": "18 cumple la condición >= 18."
    }
  ]
}
```

- `modo`: `autoevaluacion` | `final`.
- `preguntas`: 5 por módulo (1–7) y 15–20 para el módulo 8.
- `umbral`: 70 % para aprobar la evaluación final; la autoevaluación es formativa.
- El API recibe `{ respuestas: { p1: "a", p2: "b" } }`.
- Guarda `intentos.respuesta` como JSON y `resultado` con `porcentaje`, `areas` y `detalle`.
- No se revela la respuesta correcta antes de enviar.

#### Ordenamiento

```json
{
  "bloques": [
    { "id": "b1", "texto": "if (edad >= 18) {" },
    { "id": "b2", "texto": "printf(\"Mayor de edad\");" },
    { "id": "b3", "texto": "} else {" },
    { "id": "b4", "texto": "printf(\"Menor de edad\");" },
    { "id": "b5", "texto": "}" }
  ],
  "correctas": ["b1", "b2", "b3", "b4", "b5"]
}
```

- El estudiante reordena con botones “subir/bajar” (accesible con teclado).
- El API recibe `{ orden: string[] }` y compara exactamente.
- Guarda `resultado: { orden, correctas }`.

#### Autocompletado

```json
{
  "plantilla": "if (edad {{op}} 18) { ... }",
  "huecos": [
    {
      "id": "op",
      "opciones": [">", ">=", "<", "<="],
      "correcta": ">="
    }
  ]
}
```

- El API recibe `{ respuestas: { op: ">=" } }`.
- Guarda `resultado: { respuestas, correctas }`.
- Admite 1–3 huecos; no se evalúa código libre.

#### Panel docente: definiciones

| Indicador | Fórmula | Nota |
|---|---|---|
| **Cumplimiento** | Estudiantes que completaron el objetivo / estudiantes del grupo | objetivo = módulo o reto asignado; si no hay asignación, avance promedio |
| **Tasa de acierto** | Intentos con `acierto = true` / total de intentos | excluye intentos de práctica |
| **Atrasados** | Estudiantes con asignación vencida y objetivo incompleto | compara `fecha_entrega` con hoy |
| **Punto crítico** | Reto con menor tasa de acierto (mín. 3 intentos) | si no hay, error más frecuente |
| **Errores frecuentes** | Agrupación de `intentos.error_detectado` no nulo | top 5, estudiantes distintos y último caso |

### 4.4 Seguridad

| Regla | Dónde se aplica |
|---|---|
| El estudiante solo escribe su progreso | RLS `progresos_write` + Server Action |
| El docente solo ve sus grupos | RLS + `exigirDocente` + verificación de `docente_id` |
| El estudiante no entra a `/docente` | Proxy + guarda de página + RLS |
| El rol no se cambia desde el cliente | Trigger + RPC `cambiar_rol` con service role/admin |
| La nota se calcula en servidor | `/api/retos/[id]/verificar` |
| Las insignias no las escribe el estudiante | Trigger `SECURITY DEFINER` |
| El modo clase no lo abre un estudiante | `?modo=clase` + guarda de rol |
| No se ejecuta código de usuario | Análisis estático + timeout del Worker |

---

## 5. Bloques de trabajo

## B0 · Cierre del A3 y preparación (26–28 de octubre)

| ID | Tarea | Archivos / evidencia | Depende | Est. | Criterio |
|---|---|---|---|---|---|
| A4-00.1 | Revisión con el experto en contenido y acta breve | `documentacion/entregables/` | — | 0,25 d | Firma o correo de confirmación |
| A4-00.2 | Guardar `INFORME_A3.md` como PDF con fecha y versión | `documentacion/entregables/` | — | 0,1 d | PDF legible y versionado |
| A4-00.3 | Reunión de decisiones D1–D12 | `docs/DECISIONES.md` | — | 0,5 d | Cada decisión con fecha y responsable |
| A4-00.4 | Congelar alcance del A4 | Este documento | A4-00.3 | 0,1 d | Lista “no entra” firmada |
| A4-00.5 | Rama `a4-beta`, respaldo y línea base | Git + `/tmp/codestart-a4-backup.sql` | — | 0,25 d | `typecheck`, `lint`, `test`, `build` en verde |
| A4-00.6 | Agendar usabilidad (6–7 nov) y reclutar 5–8 + 1 | `docs/protocolo-usabilidad.md` | D2 | 0,5 d | Fecha y participantes confirmados |
| A4-00.7 | Confirmar contenido 5–8 y fecha del experto | `src/content/lecciones/` | D3 | 0,25 d | Lista de lecciones y responsable |
| A4-00.8 | Crear usuario docente de prueba para RLS cruzado | `scripts/crear-usuarios.mjs` o script de test | — | 0,25 d | Dos docentes y dos grupos de prueba |

**Salida de B0:** decisiones cerradas, rama creada, respaldo, usabilidad agendada y contenido
confirmado. Si el experto no confirma, se activa el plan de contenido provisional.

---

## B1 · Circuito del estudiante (29 de octubre – 1 de noviembre)

**Objetivo:** que una cuenta nueva recorra el módulo 1, vea su progreso, gane una insignia y
desbloquee el módulo 2.

### B1.1 Corregir el cálculo de estados y porcentajes

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-01.1 | Extraer `calcularEstadosModulos` a `src/lib/progreso/calculo.ts` | `calculo.ts` | 0,25 d | Función pura, sin Supabase |
| A4-01.2 | `total = lecciones reales`; `completadas` = progresos completados | `src/lib/auth/dal.ts` | 0,25 d | 4 lecciones con 0/1/2/4 dan 0/25/50/100 % |
| A4-01.3 | Módulo con 0 lecciones: no se completa y **no bloquea** la cadena | `calculo.ts` | 0,1 d | Módulo 5 vacío no bloquea el 6 |
| A4-01.4 | Pruebas unitarias de estados y porcentaje | `calculo.test.ts` | 0,25 d | Casos 0, 1, 2, 4; módulo vacío; secuencia |

**Diseño de `calcularEstadosModulos`:**

```ts
// Si total === 0: estado "pendiente", pero anteriorCompletado no cambia.
// Si total > 0 y completadas === total: "completado".
// Si enProgreso o completadas > 0: "en_progreso".
// Si no: anteriorCompletado ? "pendiente" : "bloqueado".
```

### B1.2 Guardar progreso real

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-02.1 | Server Action `marcarLeccionEnProgreso` | `src/lib/progreso/acciones.ts` | 0,25 d | Upsert propio; no baja de completado |
| A4-02.2 | Server Action `marcarLeccionVista` | idem | 0,25 d | Estado `completado`; revalida rutas |
| A4-02.3 | Verificar que la lección existe y el módulo no está bloqueado | idem | 0,25 d | Petición directa a módulo bloqueado devuelve error |
| A4-02.4 | Botón “Marcar como vista y continuar” | `boton-vista.tsx` | 0,25 d | Navega a la siguiente lección/reto |
| A4-02.5 | Registrar apertura (`en_progreso`) sin escribir en el render | `registrar-apertura.tsx` | 0,25 d | `useEffect` + `useRef`; una sola llamada por montaje |
| A4-02.6 | Integrar en la página de lección | `lecciones/[leccion]/page.tsx` | 0,25 d | El estado se ve al recargar |
| A4-02.7 | Prueba de integración/E2E de persistencia | `tests/progreso.spec.ts` | 0,5 d | Recarga y el estado sigue |

**Importante:** no hacer `insert` durante el render del Server Component. El botón y el
`useEffect` son los únicos que escriben. El `upsert` debe ser idempotente.

### B1.3 Insignias y página `/medallas`

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-03.1 | Migración: función `otorgar_insignias_progreso` | `20261029120000_...sql` | 0,5 d | Trigger tras insert/update de progreso |
| A4-03.2 | Migración: insignia `primer_reto` | idem | 0,25 d | Trigger tras intento con `acierto` |
| A4-03.3 | Catálogo de insignias | `src/lib/insignias/catalogo.ts` | 0,25 d | 10 tipos con nombre y criterio |
| A4-03.4 | DAL `obtenerMisInsignias` | `src/lib/insignias/dal.ts` | 0,25 d | Devuelve ganadas y fechas |
| A4-03.5 | Página `/medallas` | `src/app/(sesion)/medallas/page.tsx` | 0,5 d | Ganadas y bloqueadas; sin datos falsos |
| A4-03.6 | Enlace en navbar y dashboard | `navbar.tsx`, `dashboard/page.tsx` | 0,25 d | “Mis medallas” vuelve a ser un enlace real |
| A4-03.7 | Pruebas del trigger | `tests/insignias.spec.ts` o SQL | 0,5 d | No duplica; curso completo da `curso` |

**Pseudocódigo del trigger de módulo:**

```sql
-- Al completar una lección:
-- 1. Obtener el módulo de new.leccion_id.
-- 2. Contar lecciones del módulo y progresos completados del usuario.
-- 3. Si total > 0 y completadas = total:
--      insert into insignias (usuario_id, tipo, descripcion)
--      values (new.usuario_id, 'modulo_' || orden, 'Módulo ' || orden || ' completado')
--      on conflict (usuario_id, tipo) do nothing;
-- 4. Si todos los módulos con lecciones están completos:
--      insert ... 'curso' ...
```

### B1.4 Aviso de privacidad (RNF09)

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-04.1 | Migración: `acepta_privacidad`, `fecha_aceptacion` | `20261029121000_...sql` | 0,25 d | Columnas con default seguro |
| A4-04.2 | Trigger de alta guarda la aceptación | idem | 0,25 d | `fecha_aceptacion` solo si aceptó |
| A4-04.3 | Checkbox obligatorio en registro | `formulario-registro.tsx` | 0,25 d | Sin marcar, error de validación |
| A4-04.4 | Página `/privacidad` | `src/app/privacidad/page.tsx` | 0,5 d | Texto claro: datos, fin, derechos, contacto |
| A4-04.5 | Añadir `/privacidad` a rutas públicas | `src/lib/auth/roles.ts` | 0,1 d | Accesible sin sesión |
| A4-04.6 | Aviso para usuarios existentes | `dashboard/page.tsx` + acción | 0,25 d | Si `acepta_privacidad = false`, banner y botón |
| A4-04.7 | Prueba de registro y persistencia | `tests/privacidad.spec.ts` | 0,25 d | Fecha guardada; banner desaparece |

### B1.5 Cerrar la escalada de rol (F09)

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-05.1 | Trigger de alta crea siempre `estudiante` | `20261029121000_...sql` | 0,25 d | Ignora `raw_user_meta_data->>'rol'` |
| A4-05.2 | `proteger_campos_perfil` permite service role | idem | 0,1 d | El script puede asignar rol |
| A4-05.3 | RPC `cambiar_rol(usuario, rol)` | idem | 0,25 d | Solo admin o service role |
| A4-05.4 | Actualizar `scripts/crear-usuarios.mjs` | script | 0,25 d | Crea docente sin depender del metadata |
| A4-05.5 | Prueba de escalada | `scripts/probar-escalada-rol.mjs` | 0,25 d | Alta con `rol: admin` termina en `estudiante` |

**Prueba de aceptación:**

1. Crear un usuario temporal con la clave anónima y `options.data.rol = "admin"`.
2. Leer su perfil con service role.
3. Verificar `rol = "estudiante"`.
4. Borrar el usuario temporal.
5. Verificar que service role sí puede crear un docente con `cambiar_rol`.

### B1.6 Límite de intentos (F16, P2)

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-06.1 | Rechazar intento si se agotó `intentos_maximos` | `verificar/route.ts` | 0,25 d | 403 con `intentosRestantes: 0` |
| A4-06.2 | Modo práctica sin puntos | API + componentes | 0,5 d | Permite practicar, no suma puntos |
| A4-06.3 | Prueba | `tests/intentos.spec.ts` | 0,25 d | El 4.º intento no se registra como puntuado |
| A4-06.4 | Timeout de 5 s en el analizador del Worker | `src/lib/validacion/cliente.ts`, `worker.ts` | 0,25 d | Un bucle infinito se corta y muestra error |

> Si el tiempo aprieta, A4-06.2 se mueve al A5. A4-06.1 es barato y evita el farming.

### B1.7 Pruebas y aceptación de B1

| ID | Tarea | Criterio |
|---|---|---|
| A4-07.1 | Unitarias de progreso/estados | 100 % en verde |
| A4-07.2 | E2E “cuenta nueva completa el módulo 1” | Módulo 1 al 100 %, módulo 2 desbloqueado |
| A4-07.3 | E2E “recargar conserva el progreso” | Estado persistente |
| A4-07.4 | E2E “insignia visible en /medallas” | Insignia del módulo 1 y primer reto |
| A4-07.5 | RLS: estudiante no escribe progreso ajeno | 0 filas afectadas |

**Aceptación de B1:** cuenta nueva → lee lección → botón “Marcar como vista” → módulo 1 al 100 %
→ módulo 2 desbloqueado → insignia visible → el alta con rol `admin` sigue siendo `estudiante`.

---

## B2 · Panel docente (2–5 de noviembre)

**Objetivo:** que el docente vea su grupo, indicadores, seguimiento, errores y pueda asignar.

### B2.1 DAL del docente

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-10.1 | `exigirDocente()` y guardas | `src/lib/docente/dal.ts` | 0,25 d | Estudiante redirigido; admin permitido |
| A4-10.2 | `obtenerMisGrupos` | idem | 0,25 d | Solo grupos del docente |
| A4-10.3 | `obtenerGrupo(id)` con verificación | idem | 0,25 d | 404 si no es suyo |
| A4-10.4 | `obtenerIndicadores(grupoId)` | idem | 0,5 d | KPIs de §4.3 |
| A4-10.5 | `obtenerSeguimiento(grupoId)` | idem | 0,5 d | Una fila por estudiante |
| A4-10.6 | `obtenerErroresFrecuentes(grupoId)` | idem | 0,5 d | Top 5 con estudiantes y fecha |
| A4-10.7 | `obtenerDetalleEstudiante(id)` | idem | 0,5 d | Progreso, intentos, insignias |

**Consultas base:**

```
inscripciones (grupo_id) → perfiles
progresos (usuario_id) → lecciones (modulo_id)
intentos (usuario_id) → retos
asignaciones (grupo_id) → modulos/retos
insignias (usuario_id)
```

Todas con el cliente del usuario; el RLS filtra. Si el grupo tiene más de 200 estudiantes,
mover las agregaciones a RPC en el A5.

### B2.2 Panel `/docente`

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-11.1 | Reemplazar el placeholder | `src/app/(sesion)/docente/page.tsx` | 0,5 d | Sin texto “en construcción” |
| A4-11.2 | Selector de grupo | `selector-grupo.tsx` | 0,25 d | Cambia `?grupo=` |
| A4-11.3 | Cuatro KPI | `indicador.tsx` | 0,5 d | Cumplimiento, acierto, atrasados, crítico |
| A4-11.4 | Top de errores y próxima acción | `errores-frecuentes.tsx` | 0,25 d | Enlaza al grupo/reto |
| A4-11.5 | Estado vacío | página | 0,1 d | “Aún no hay datos” sin inventar |

### B2.3 Grupos

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-12.1 | Server Action `crearGrupo` | `src/lib/docente/acciones.ts` | 0,25 d | Código único; `docente_id` propio |
| A4-12.2 | Página `/docente/grupos` | `grupos/page.tsx` | 0,5 d | Lista + formulario + copiar código |
| A4-12.3 | Validación zod | acciones | 0,1 d | Nombre, fechas, código |
| A4-12.4 | Prueba de creación | `tests/docente.spec.ts` | 0,25 d | El grupo aparece y el código sirve |

### B2.4 Seguimiento del grupo

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-13.1 | Página `/docente/grupo/[id]` | `grupo/[id]/page.tsx` | 0,5 d | Tabla por estudiante |
| A4-13.2 | Columnas: estado, avance, último reto, intentos, acierto, acción | `tabla-seguimiento.tsx` | 0,5 d | Ordenable o al menos legible |
| A4-13.3 | Enlace al detalle | idem | 0,1 d | `/docente/estudiante/[id]` |
| A4-13.4 | Responsive | idem | 0,25 d | Tabla con scroll horizontal en móvil |

### B2.5 Detalle del estudiante

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-14.1 | Página `/docente/estudiante/[id]` | página | 0,5 d | Solo estudiantes de sus grupos |
| A4-14.2 | Progreso por módulo/lección | idem | 0,25 d | Estados reales |
| A4-14.3 | Últimos intentos y errores | idem | 0,25 d | Fecha, reto, error, acierto |
| A4-14.4 | Insignias | idem | 0,1 d | Ganadas y fechas |

### B2.6 Asignar

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-15.1 | Server Action `crearAsignacion` | acciones | 0,25 d | Un módulo **o** un reto; fecha |
| A4-15.2 | Formulario `/docente/asignar` | `formulario-asignacion.tsx` | 0,5 d | Grupo, destino, fecha, descripción |
| A4-15.3 | Validar que el grupo es suyo | acción | 0,1 d | No se puede asignar a otro grupo |
| A4-15.4 | El estudiante ve la tarea | dashboard | 0,25 d | Tarjeta con fecha y destino |
| A4-15.5 | Prueba E2E | `tests/docente.spec.ts` | 0,5 d | Docente asigna; estudiante ve |

### B2.7 Errores frecuentes

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-16.1 | Agregación por `error_detectado` | DAL | 0,25 d | Top 5, estudiantes distintos, último caso |
| A4-16.2 | Normalización por `resultado->>'regla_incumplida'` | DAL | 0,25 d | Evita fragmentar el mismo error |
| A4-16.3 | “Próxima acción” sugerida | componente | 0,25 d | Texto accionable, no genérico |
| A4-16.4 | Enlace al reto y al estudiante | componente | 0,1 d | Navegación útil |

### B2.8 Pruebas y aceptación de B2

| ID | Tarea | Criterio |
|---|---|---|
| A4-17.1 | E2E docente: login → panel → grupo → detalle → asignar | Flujo completo |
| A4-17.2 | RLS: estudiante no entra a `/docente` | Redirección/403 |
| A4-17.3 | RLS: docente B no ve grupo A | 0 filas |
| A4-17.4 | Responsive y accesibilidad básica | Sin desbordes; teclado |
| A4-17.5 | Datos reales, no maqueta | KPIs calculados |

**Aceptación de B2:** el docente entra, ve sus indicadores, asigna el módulo 5 y el estudiante lo ve
como tarea; ningún dato de otro grupo es visible.

---

## B3 · Contenido, evaluaciones y modo clase (3–7 de noviembre)

**Objetivo:** los 8 módulos se recorren completos; hay evaluación formativa y final; el docente
puede proyectar sin respuestas.

### B3.1 Nuevos tipos de reto (RF04)

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-20.1 | Tipos y validadores puros | `src/lib/retos/ordenamiento.ts`, `autocompletado.ts` | 0,25 d | Tests unitarios |
| A4-20.2 | Componente de ordenamiento accesible | `pantalla-ordenamiento.tsx` | 0,5 d | Botones subir/bajar; teclado |
| A4-20.3 | Componente de autocompletado | `pantalla-autocompletado.tsx` | 0,5 d | Selects con etiqueta |
| A4-20.4 | API: ramas de ordenamiento y autocompletado | `verificar/route.ts` | 0,5 d | Corrige en servidor y guarda intento |
| A4-20.5 | Dispatch en `/retos/[id]` | `retos/[id]/page.tsx` | 0,25 d | Cada tipo muestra su pantalla |
| A4-20.6 | Pruebas | `tests/retos.spec.ts` | 0,5 d | Acierto y error |

### B3.2 Motor de evaluaciones (RF05)

**Decisión de implementación:** no se crea una tabla nueva. La evaluación es una fila de `retos`
con `tipo = 'seleccion_multiple'`, `reglas.modo = 'autoevaluacion' | 'final'` y
`reglas.preguntas = [...]`. Así se reutiliza `intentos`, el RLS y el panel de errores. El
componente y el API distinguen una evaluación de un reto normal por la presencia de
`reglas.preguntas`.

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-21.1 | Tipos de evaluación | `src/lib/evaluacion/tipos.ts` | 0,1 d | Preguntas, áreas, umbral |
| A4-21.2 | Calificación pura | `src/lib/evaluacion/calcular.ts` | 0,5 d | Puntaje, porcentaje, áreas |
| A4-21.3 | API de evaluación | `verificar/route.ts` | 0,5 d | Corrige todas las respuestas |
| A4-21.4 | Componente de cuestionario | `pantalla-evaluacion.tsx` | 1 d | Progreso, envío, resultado, reintento |
| A4-21.5 | Rutas `/evaluacion/[modulo]` y `/evaluacion/final` | páginas | 0,5 d | Autoevaluación y final |
| A4-21.6 | CTA en la página del módulo | `modulos/[modulo]/page.tsx` | 0,25 d | “Autoevaluación” si existe |
| A4-21.7 | Pruebas | `tests/evaluacion.spec.ts` | 0,5 d | 5/5, 0/5, áreas, reintento |

### B3.3 Contenido de los módulos 5–8

| ID | Módulo | Lección | Retos | Evaluación | Est. |
|---|---|---|---|---|---|
| A4-22.1 | 5 · Control de flujo | `m05-estructuras-de-control.mdx` | 2 selección, 1 ordenamiento, 1 autocompletado | 5 preguntas | 1 d |
| A4-22.2 | 6 · Estructuras de datos | `m06-estructuras-de-datos.mdx` | 2 selección, 1 ordenamiento, 1 autocompletado | 5 preguntas | 1 d |
| A4-22.3 | 7 · Taller integrador | `m07-taller-de-retos.mdx` | 2 selección, 2 ordenamiento, 2 autocompletado | 5 preguntas | 1 d |
| A4-22.4 | 8 · Evaluación final | `m08-evaluacion-final.mdx` | — | 15–20 preguntas | 1 d |
| A4-22.5 | Portadas 5–8 | `src/content/modulos/05...08.mdx` | — | — | 0,25 d |
| A4-22.6 | Seed: lecciones, retos, evaluaciones | `supabase/seed.sql` | — | — | 0,5 d |
| A4-22.7 | Revisión del experto | — | — | — | 0,5 d |

**Criterios de contenido:**

- Cada lección tiene objetivo, explicación, ejemplo y cierre.
- Cada módulo tiene al menos una actividad corregible.
- Los módulos 5 y 6 no prometen ejecutar bucles/arreglos: se validan con predicción,
  ordenamiento y autocompletado.
- El módulo 8 tiene 15–20 preguntas con área y explicación.
- Si el material del experto no llega, se marca “contenido provisional” en la lección y se
  registra en el informe; no se inventa que fue revisado.

### B3.4 Autoevaluación por módulo

| ID | Tarea | Criterio |
|---|---|---|
| A4-23.1 | 5 preguntas para módulos 1–4 | Cubren el objetivo del módulo |
| A4-23.2 | 5 preguntas para módulos 5–7 | Ídem |
| A4-23.3 | Integración en `seed.sql` | Un reto de evaluación por módulo |
| A4-23.4 | Reintento y retroalimentación | Se puede repetir; explicación por pregunta |

### B3.5 Modo clase (RF16)

| ID | Tarea | Archivos | Est. | Criterio |
|---|---|---|---|---|
| A4-24.1 | `puedeModoClase` y guarda | `roles.ts`, páginas | 0,25 d | Solo docente/admin |
| A4-24.2 | Contexto y banner | `modo-clase.tsx` | 0,25 d | Banner visible |
| A4-24.3 | Ocultar pistas y soluciones | `pantalla-reto*`, `solucion.tsx` | 0,5 d | Estudiante no ve respuestas |
| A4-24.4 | Tipografía ampliada | páginas | 0,25 d | Texto más grande y legible |
| A4-24.5 | Enlace desde el panel docente | panel | 0,1 d | “Abrir en modo clase” |
| A4-24.6 | Prueba | `tests/modo-clase.spec.ts` | 0,25 d | Docente ve; estudiante no |

### B3.6 Pruebas y aceptación de B3

- [ ] Los 8 módulos abren una lección.
- [ ] Cada módulo tiene una actividad corregible.
- [ ] Ordenamiento y autocompletado corrigen en servidor.
- [ ] Autoevaluación da nota y explicación.
- [ ] Evaluación final da nota y áreas a reforzar.
- [ ] Modo clase oculta pistas y soluciones.
- [ ] El contenido está revisado o marcado como provisional.

---

## B4 · Pruebas (6–9 de noviembre)

**Objetivo:** generar la evidencia del A4, no solo “probar un rato”.

### B4.1 Unitarias

| ID | Qué | Archivo | Criterio |
|---|---|---|---|
| A4-30.1 | Progreso y estados | `calculo.test.ts` | 0/1/2/4; módulo vacío; secuencia |
| A4-30.2 | Insignias | `insignias.test.ts` | Módulo, curso, primer reto, no duplicado |
| A4-30.3 | Evaluación | `evaluacion.test.ts` | Puntaje, umbral, áreas |
| A4-30.4 | Ordenamiento/autocompletado | `retos.test.ts` | Acierto/error |
| A4-30.5 | Motor de C | `motor.test.ts` | 13 actuales + timeout |
| A4-30.6 | Cobertura | `vitest --coverage` | ≥80 % en lógica de negocio |

### B4.2 Integración

| ID | Qué | Criterio |
|---|---|---|
| A4-31.1 | Acción de progreso contra Supabase | Fila creada/actualizada |
| A4-31.2 | Trigger de insignias | Insignia creada una sola vez |
| A4-31.3 | Asignación creada por docente | Visible para el estudiante |
| A4-31.4 | Evaluación guarda intento | `resultado` con áreas |
| A4-31.5 | Alta con rol falso | Perfil `estudiante` |

> Usar un proyecto/base de pruebas. Si se usa la demo, ejecutar `npm run db:seed` antes y después,
> y no ejecutar contra producción con datos reales.

### B4.3 E2E

| ID | Flujo | Criterio |
|---|---|---|
| A4-32.1 | Estudiante nuevo: registro → grupo → módulo 1 → progreso | Módulo 2 desbloqueado |
| A4-32.2 | Reto de código: error → pista → corrección | Intento guardado |
| A4-32.3 | Reto conceptual/ordenamiento/autocompletado | Corrección en servidor |
| A4-32.4 | Autoevaluación y evaluación final | Nota y áreas |
| A4-32.5 | Docente: panel → grupo → detalle → asignar | Flujo completo |
| A4-32.6 | Estudiante no entra a `/docente` | Redirección |
| A4-32.7 | Modo clase | Docente ve; estudiante no |
| A4-32.8 | `/medallas` | Insignias reales |
| A4-32.9 | Privacidad | Registro sin aceptar falla |

### B4.4 Seguridad y RLS

| Caso | Criterio | Evidencia |
|---|---|---|
| Estudiante A no lee progreso de B | 0 filas | Matriz |
| Estudiante A no lee intentos de B | 0 filas | Matriz |
| Estudiante A no lee borrador de B | 0 filas | Matriz |
| Docente A no ve grupo de B | 0 filas | Matriz |
| Docente ve solo sus grupos | 0 filas ajenas | Matriz |
| Estudiante no escribe insignias | 0 filas | Matriz |
| Estudiante no cambia su rol | Rol sigue igual | Prueba |
| Alta con `rol: admin` | Perfil estudiante | Prueba |
| API falseada | No aprueba | E2E existente |

Crear `scripts/probar-rls.mjs` y `npm run test:rls`. La matriz completa va en
`INFORME_PRUEBAS.md`.

### B4.5 Accesibilidad

| ID | Tarea | Criterio |
|---|---|---|
| A4-34.1 | Instalar `@axe-core/playwright` | Dev dependency |
| A4-34.2 | `tests/accesibilidad.spec.ts` | 0 críticas/serias en rutas nuevas |
| A4-34.3 | Checklist manual WCAG 2.1 AA | Teclado, foco, zoom, reflow, lector |
| A4-34.4 | Corregir hallazgos | Antes del 10 nov |
| A4-34.5 | Reporte | Adjunto en el informe |

Rutas mínimas: `/`, `/login`, `/registro`, `/privacidad`, `/dashboard`, `/modulos`,
`/modulos/[m]`, `/modulos/[m]/lecciones/[l]`, `/retos/[id]`, `/medallas`, `/evaluacion/[m]`,
`/docente`, `/docente/grupo/[id]`, `/docente/asignar`.

### B4.6 Compatibilidad

| Navegador | Escritorio | Tableta | Móvil |
|---|---|---|---|
| Chromium | 1440 | 834 | 390 |
| Firefox | 1440 | 834 | 390 |
| WebKit | 1440 | 834 | 390 |
| Edge | 1440 | 834 | 390 |

Añadir proyectos a `playwright.config.ts`. Si Edge no está disponible, documentarlo.

### B4.7 Rendimiento y carga

| ID | Tarea | Criterio |
|---|---|---|
| A4-36.1 | Medir TTFB/FCP/LCP con Fast 3G y CPU 4× | Lección < 2 s |
| A4-36.2 | Medir peso de imágenes/fuentes | Presupuesto documentado |
| A4-36.3 | k6/Artillery 100 VUs, 5 min | p95 < 2 s; errores < 1 % |
| A4-36.4 | Documentar límites de Supabase gratuito | Sin conclusiones falsas |

### B4.8 Usabilidad

| ID | Tarea | Criterio |
|---|---|---|
| A4-37.1 | Guion y consentimiento | `docs/protocolo-usabilidad.md` |
| A4-37.2 | Sesión 6–7 nov | 5–8 estudiantes + 1 docente |
| A4-37.3 | Encuesta 1–10 | > 8/10 |
| A4-37.4 | Observación y hallazgos | Lista priorizada |
| A4-37.5 | Si no hay participantes | Heurística con 3 expertos; RNF04 no verificado |

### B4.9 Regresión

Antes de cada tag:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run auditar:contraste
npm run test:e2e
npm run test:rls
```

---

## B5 · Informes, tag y despliegue (9–11 de noviembre)

| ID | Tarea | Archivo | Criterio |
|---|---|---|---|
| A4-40.1 | Completar informe de pruebas | `docs/INFORME_PRUEBAS.md` | Técnicas, accesibilidad, usabilidad, evidencias |
| A4-40.2 | Completar informe A4 | `docs/INFORME_A4.md` | 6 secciones, sin resultados inventados |
| A4-40.3 | Actualizar README | `README.md` | Estado beta, URL, rutas, usuarios |
| A4-40.4 | Actualizar decisiones | `docs/DECISIONES.md` | ADR-001 y ADR-002/003 si aplica |
| A4-40.5 | Actualizar plan general | `docs/PLAN_AVANCES.md` | Checkboxes y estado real |
| A4-40.6 | Tag `v0.2.0-beta` | Git | Tag anotado y push |
| A4-40.7 | Deploy y smoke test | Vercel | `/login`, `/dashboard`, `/docente`, una lección |
| A4-40.8 | Paquete de evidencias | `documentacion/evidencias/a4/` | Capturas, logs, CSV, matriz |
| A4-40.9 | Ensayo de demo | — | 10 min, sin fallos |

### Smoke test de producción

- [ ] `/` responde 200.
- [ ] `/login` responde 200.
- [ ] Docente entra y ve `/docente` con datos.
- [ ] Estudiante entra, ve progreso y una insignia.
- [ ] Una lección de cada módulo abre.
- [ ] Una autoevaluación y la evaluación final corrigen.
- [ ] `/medallas` muestra datos reales.
- [ ] `/docente` redirige a un estudiante.
- [ ] No hay 500 en los logs de Vercel.

---

## 6. Calendario día por día

| Fecha | Día | Foco | Entregable / checkpoint |
|---|---|---|---|
| 26 oct | Lun | B0: decisiones, rama, respaldo, línea base | Alcance congelado; tests en verde |
| 27 oct | Mar | B0: migraciones diseñadas, privacidad, usabilidad | Borrador de migraciones; fecha de sesión |
| 28 oct | Mié | Cierre A3: PDF, revisión, tag ya publicado | A3 entregado; B1 arranca |
| 29 oct | Jue | B1: cálculo de progreso + acciones | Módulo 1 avanza y persiste |
| 30 oct | Vie | B1: insignias + F09 | Insignia y alta segura |
| 31 oct | Sáb | B1: privacidad + navbar + pruebas | RNF09 y `/medallas` |
| 1 nov | Dom | B1: aceptación y buffer | Flujo estudiante completo |
| 2 nov | Lun | B2: DAL docente | Consultas y guardas |
| 3 nov | Mar | B2: panel/KPIs + inicio contenido 5 | Panel con datos; lección 5 |
| 4 nov | Mié | B2: grupo/detalle + módulo 5 | Seguimiento; retos 5 |
| 5 nov | Jue | B2: asignar/errores/pruebas + módulo 6 | Asignación visible; módulo 6 |
| 6 nov | Vie | B3: evaluación + módulo 7; B4 accesibilidad | Cuestionario; axe instalado |
| 7 nov | Sáb | B3: módulo 8 + modo clase; usabilidad | Curso completo; sesión realizada |
| 8 nov | Dom | B4: unitarias, integración, E2E, RLS | Suite verde |
| 9 nov | Lun | B4: rendimiento/carga; B5 informes | Métricas y borradores |
| 10 nov | Mar | B5: informes, README, tag RC | Documentos cerrados |
| 11 nov | Mié | Regresión final, `v0.2.0-beta`, deploy, entrega | Beta publicada |

**Checkpoints obligatorios:**

- **28 oct:** decisiones cerradas y alcance congelado. Si no, se recorta D1/D12.
- **1 nov:** B1 aceptado. Si el progreso no persiste, no se empieza el panel.
- **5 nov:** panel docente con datos reales. Si no, se recorta `/docente/grupos` y el detalle.
- **7 nov:** contenido completo o provisional declarado.
- **9 nov:** suite técnica verde. Si no, se recorta carga/rendimiento antes que RLS/seguridad.
- **10 nov:** informes y tag RC. El 11 solo se corrige P0.

---

## 7. Ruta crítica, paralelismo y recortes

### 7.1 Orden obligatorio

1. Migraciones de insignias/privacidad/rol.
2. Progreso real + cálculo.
3. Insignias + `/medallas`.
4. Panel docente.
5. Pruebas de seguridad/RLS.
6. Informes y tag.

### 7.2 Trabajo en paralelo

| Pista | Puede avanzar mientras… |
|---|---|
| Contenido 5–8 | Se construye el panel docente |
| Evaluaciones | Se termina el panel; solo depende del API de retos |
| Accesibilidad | Se escriben las pantallas nuevas; axe se pasa al final |
| Usabilidad | Se agenda desde el 26; la sesión es el 6–7 |
| Informes | Se llenan con evidencia desde el 8, no el 11 |

### 7.3 Si falta tiempo, recortar en este orden

1. RF08 admin y RF17 CSV (ya fuera).
2. `/docente/grupos` (crear grupos desde seed/UI mínima) y `/docente/estudiante` (dejar tabla).
3. Modo práctica sin puntos (dejar solo bloqueo de intentos).
4. Videos (ya fuera).
5. Módulo 7 más corto (3 retos en vez de 6), nunca dejar el módulo sin actividad.
6. Prueba de carga si Supabase gratuito no la soporta: documentar límite y hacer prueba parcial.
7. Usabilidad: si no hay participantes, heurística y RNF04 no verificado.

**No recortar:** progreso, RLS, alta segura, panel básico, evaluación final, informe de pruebas,
accesibilidad crítica, tag/deploy.

---

## 8. Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación | Señal de activación |
|---|---|---|---|---|
| 16 días para 26–30 días-persona | Alta | Alto | Recortar D1/D12; contenido provisional; no abrir frentes | 1 nov sin B1 cerrado |
| Contenido 5–8 no llega | Alta | Alto | Priorizar 5 y 8; marcar provisional; revisar después | 3 nov sin módulo 5 |
| Panel docente se come las pruebas | Media | Alto | DAL y consultas primero; UI con componentes existentes | 5 nov sin KPIs |
| No hay participantes de usabilidad | Media | Alto | Agendar 30 oct; plan B heurístico | 1 nov sin confirmados |
| Fuga de datos entre grupos | Baja | Muy alto | RLS + pruebas cruzadas + F09 | Cualquier caso falla |
| Supabase gratuito limita carga | Media | Medio | Probar fuera de horario; documentar límites | k6 con errores 5xx |
| RNF02 al límite | Media | Medio | Medir Fast 3G; optimizar fuentes/imágenes | LCP > 2 s |
| Regresión de accesibilidad | Media | Medio | axe en cada ruta nueva; checklist | Crítica/seria en axe |
| Deploy con variables mal | Baja | Alto | Smoke test tras cada deploy | `/login` 500 |
| El equipo tiene exámenes | Alta | Alto | Reparto por bloques; buffer 26–30 nov | — |
| Documentación al final | Alta | Medio | Actualizar README/informe por bloque | 9 nov sin borrador |
| `intentos` sin límite | Media | Bajo | A4-06.1 | 4.º intento puntúa |

---

## 9. Checklist de cierre del A4

### Funcional

- [ ] Progreso de lección persiste y se ve al recargar.
- [ ] El porcentaje por módulo usa lecciones reales.
- [ ] Módulo con 0 lecciones no se marca completo ni bloquea.
- [ ] Insignias de módulo, curso y primer reto se otorgan una sola vez.
- [ ] `/medallas` muestra ganadas y bloqueadas.
- [ ] Los 8 módulos tienen lección y actividad corregible.
- [ ] Ordenamiento y autocompletado funcionan.
- [ ] Autoevaluación por módulo con nota y explicación.
- [ ] Evaluación final del módulo 8 con nota y áreas.
- [ ] Panel docente con grupos, KPIs, seguimiento, detalle, asignación y errores.
- [ ] El estudiante ve la tarea asignada.
- [ ] Modo clase oculta pistas/soluciones.
- [ ] Aviso de privacidad y aceptación registrada.
- [ ] Alta con rol falso queda como estudiante.

### Seguridad

- [ ] Estudiante A no ve datos de B.
- [ ] Docente A no ve el grupo de B.
- [ ] Estudiante no entra a `/docente`.
- [ ] Estudiante no escribe insignias.
- [ ] Estudiante no cambia su rol.
- [ ] API no acepta respuestas falseadas.
- [ ] No se ejecuta código de usuario.

### Calidad

- [ ] Typecheck, lint y build en verde.
- [ ] Unitarias, integración y E2E en verde.
- [ ] RLS en verde.
- [ ] axe sin críticas/serias.
- [ ] Checklist manual WCAG 2.1 AA.
- [ ] Compatibilidad Chromium/Firefox/WebKit/Edge.
- [ ] Rendimiento < 2 s con Fast 3G.
- [ ] Carga 100 VUs documentada.
- [ ] Usabilidad > 8/10 o declarada no verificada.

### Entrega

- [ ] `INFORME_PRUEBAS.md` completo.
- [ ] `INFORME_A4.md` completo.
- [ ] README actualizado.
- [ ] Decisiones actualizadas.
- [ ] Tag `v0.2.0-beta`.
- [ ] Deploy verificado.
- [ ] Paquete de evidencias.
- [ ] Cero P0/P1.

---

## 10. Comandos de trabajo

### 10.1 Preparación

```bash
git switch -c a4-beta
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

### 10.2 Base de datos

```bash
# Respaldo
pg_dump "$SUPABASE_DB_URL" --schema=public --no-owner > /tmp/codestart-a4-backup.sql

# Migraciones y tipos
npm run db:migrate
npm run db:types

# Usuarios y demo
npm run db:usuarios
npm run db:seed
```

### 10.3 Pruebas

```bash
npm test
npm run test:e2e
npm run test:rls
npm run auditar:contraste
npm run build
```

### 10.4 Entrega

```bash
git add -A
git commit -m "feat(a4): beta con progreso, panel docente, evaluaciones y pruebas"
git tag -a v0.2.0-beta -m "Avance 4: beta desplegada"
git push origin main
git push origin v0.2.0-beta
```

### 10.5 Smoke test

```bash
curl -I https://codestart-fiec.vercel.app/login
curl -I https://codestart-fiec.vercel.app/docente
```

---

## 11. Definition of Done de una tarea

Una tarea está hecha cuando:

1. **Código:** cumple el criterio y sigue los patrones del proyecto.
2. **Prueba:** tiene la prueba del nivel que le corresponde (unitaria, integración, E2E o RLS).
3. **Evidencia:** deja salida, captura, traza o consulta reproducible.
4. **Documentación:** actualiza README/informe si cambia el comportamiento.
5. **Revisión:** otra persona (o una segunda pasada) revisa el diff.
6. **Seguridad:** no abre una escritura que el RLS no controle.
7. **Accesibilidad:** teclado, foco, etiquetas y contraste en lo nuevo.
8. **Sin deuda P0/P1:** si queda algo, se registra con dueño y fecha.

---

## 12. Anexos

### Anexo A · Resumen de esfuerzo

| Bloque | Esfuerzo estimado |
|---|---|
| B0 · Cierre y preparación | 2,5 d |
| B1 · Circuito del estudiante | 7,5 d |
| B2 · Panel docente | 6,5 d |
| B3 · Contenido y evaluaciones | 7,5 d |
| B4 · Pruebas | 5,5 d |
| B5 · Informes y entrega | 2,5 d |
| **Total** | **≈32 días-persona** |

Con 4 personas × 4 h/día × 16 días ≈ 256 h ≈ 32 días-persona. **No hay holgura.** Con una sola
persona, el alcance completo no cabe: hay que aplicar los recortes de §7.3 desde el día 1.

### Anexo B · Matriz RLS mínima

| Sujeto | Recurso | Esperado |
|---|---|---|
| Estudiante A | `progresos` de B | 0 filas |
| Estudiante A | `intentos` de B | 0 filas |
| Estudiante A | `codigos` de B | 0 filas |
| Estudiante A | `insignias` de B | 0 filas |
| Estudiante A | `perfiles` de B | 0 filas |
| Docente A | `grupos` de B | 0 filas |
| Docente A | `progresos` de grupo B | 0 filas |
| Docente A | `intentos` de grupo B | 0 filas |
| Estudiante | `insignias` (insert) | 0 filas |
| Estudiante | `perfiles.rol` | Sin cambio |
| Estudiante | `/docente` | Redirección/403 |

### Anexo C · Guion de usabilidad

1. **Bienvenida y consentimiento** (5 min).
2. **Tarea 1:** registrarse y unirse al grupo con el código (5 min).
3. **Tarea 2:** encontrar el módulo en curso y abrir la lección (5 min).
4. **Tarea 3:** resolver un reto, pedir una pista y corregir (10 min).
5. **Tarea 4:** consultar progreso y medallas (5 min).
6. **Tarea 5 (docente):** ver el grupo, asignar un módulo y encontrar el error más frecuente
   (10 min).
7. **Encuesta:** 1–10 y preguntas abiertas (5 min).

Métricas: éxito por tarea, tiempo, errores, ayuda solicitada, satisfacción. Criterio: > 8/10 y
ninguna tarea crítica bloqueada.

### Anexo D · Datos de prueba

| Usuario | Rol | Uso |
|---|---|---|
| `docente@up.ac.pa` | docente | Panel y asignaciones |
| `francisco.gonzalez@up.ac.pa` | estudiante | Flujo principal y datos de grupo |

Contraseña: `Codestart2026!`.

Para RLS cruzado, crear un segundo docente y un segundo grupo solo en el entorno de pruebas, y
borrarlos al terminar.

### Anexo E · Correspondencia con el informe A4

| Sección del informe | Evidencia |
|---|---|
| 1. Porcentaje de avance | Tabla de bloques + checklist |
| 2. Logros y entregables | Rutas, capturas, tag |
| 3. Pendientes | P0/P1 restantes |
| 4. Riesgos | Tabla de §8 |
| 5. Decisiones | `docs/DECISIONES.md` + D1–D12 |
| 6. Plan del A5 | Plan general §6.5 |

---

**Fin del subplan.** Si una tarea no está aquí, no es parte del A4; si es urgente, se agrega con
decisión escrita y se quita otra del mismo tamaño.
