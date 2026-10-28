# Informe de Avance 4 — CodeStart FIEC

**Avance 4 · Desarrollo (parte 2) y Pruebas**
**Fecha de entrega:** 11 de noviembre de 2026
**Proyecto:** CodeStart FIEC — Plataforma web interactiva de apoyo al Curso Propedéutico de la
Facultad de Informática, Electrónica y Comunicación (FIEC), Universidad de Panamá
**Asignatura:** Informática Educativa · 2.º Semestre 2026
**Versión:** `v0.2.0-beta`

> **Estado:** las seis fases del avance están implementadas y la batería técnica ejecutada. El
> detalle reproducible de cada prueba vive en `INFORME_PRUEBAS.md`; lo que no se pudo ejecutar
> (usabilidad con estudiantes, WebKit y Edge) se declara como no verificado.

---

## 1. Porcentaje de avance

**Avance real frente al planificado: ≈ 85 %** (estimación sobre el alcance del A4; la fase de
pruebas está ejecutada salvo la validación con usuarios).

| Fase del plan | Estado | Evidencia |
|---|---|---|
| Progreso, insignias y circuito del estudiante | ✅ Completo | `src/lib/progreso/`, `src/lib/insignias/`, `/dashboard`, `/medallas` |
| Panel docente (RF07, RF12–RF15) | ✅ Completo | `/docente`, `/docente/grupo/[id]`, `/docente/estudiante/[id]`, `/docente/grupos`, `/docente/asignar` |
| Contenido de los módulos 5–8 | ✅ Completo | `src/content/modulos/05…08`, migración `20261030120000_a4_contenido_beta.sql` |
| Evaluaciones (RF05) y modo clase (RF16) | ✅ Completo | `/evaluacion/[modulo]`, `/evaluacion/final`, `calcularEvaluacion`, prop `modoClase` |
| Pruebas técnicas, de accesibilidad y de usabilidad | 🟡 Parcial | Técnicas y accesibilidad automática ✅; usabilidad **no ejecutada** |
| Documentación y despliegue de la beta | 🟡 Parcial | Informes y README ✅; tag `v0.2.0-beta` ✅; despliegue pendiente de publicación |

---

## 2. Logros y entregables

| Entregable | Dónde |
|---|---|
| Circuito completo del estudiante: lección → reto → progreso → insignia | `/dashboard`, `/modulos`, `/retos/[id]`, `/medallas` |
| Panel docente con indicadores, detalle por estudiante y patrón de error dominante | `/docente` y subrutas; RLS que limita cada docente a sus grupos |
| Contenido de los módulos 5 a 8 y evaluación final | `src/content/modulos/07-taller-de-retos.mdx`, `08-evaluacion-final.mdx` |
| Evaluaciones por módulo con umbral y áreas a reforzar | `src/lib/evaluacion/`, `/evaluacion/[modulo]` |
| Modo clase sin puntaje y límite de intentos aplicado en el servidor | `api/retos/[id]/verificar/route.ts` |
| Suite de pruebas: unitarias, E2E, RLS, escalada de rol, contraste, rendimiento y carga | `tests/`, `scripts/` |
| Informe de pruebas | `docs/INFORME_PRUEBAS.md` |
| Protocolo de usabilidad | `docs/PROTOCOLO_USABILIDAD.md` |
| Código y migraciones | Repositorio `Zobercito/codestart_fiec`, seis migraciones nuevas del A4 |

---

## 3. Pendientes

| # | Pendiente | Por qué | Impacto |
|---|---|---|---|
| 1 | Sesión de usabilidad con 5–8 estudiantes y 1 docente | Requiere convocar participantes reales | RNF04 queda **no verificado** hasta entonces |
| 2 | Revisión manual de accesibilidad (teclado, lector de pantalla, zoom 200 %) | Necesita una sesión guiada con lector de pantalla | RNF06 verificado solo en su parte automática |
| 3 | Compatibilidad en WebKit (Safari) y Edge | No hay dependencias de WebKit ni Edge en el host de desarrollo | RNF01 parcial: Chromium y Firefox sí están cubiertos |
| 4 | Publicación de la beta en Vercel | Depende del push al repositorio | La URL de demo sigue mostrando la alfa hasta publicar |
| 5 | RNF08 no cumple: p95 de 54,6 s y 88,7 % de timeouts con 100 usuarios concurrentes | Bloquea el uso con un grupo completo en clase sobre esta arquitectura | Medido y documentado en `INFORME_PRUEBAS.md` §3.7; mitigación en el A5 |

---

## 4. Riesgos y problemas

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **La carga no cumple RNF08**: con 100 usuarios concurrentes el p95 es de 54,6 s | Un grupo completo en clase no puede usarlo a la vez con esta arquitectura | Se midió, se documentó y se diagnosticó: el costo es la latencia por consulta a la base remota encadenada por pantalla. Plan del A5: caché de datos de referencia, lecturas en lote y región más cercana |
| La base está en Supabase remoto y cada pantalla encadena varias consultas | Latencia alta en red lenta | Consultas independientes agrupadas con `Promise.all`; con red limitada el LCP queda en 1,1–1,3 s |
| La usabilidad no se puede sustituir por una prueba automática | RNF04 sin verificar en la entrega del A4 | Protocolo listo; se ejecuta en la primera semana del A5 |
| WebKit y Edge no se prueban en el host | Riesgo de regresión específica de Safari | Se declara y se prueba en la validación del A5 |
| Un solo entorno de base de datos para pruebas y demo | Datos de prueba mezclados con la demo | Los datos son ficticios; los scripts crean y limpian sus escenarios (la matriz RLS elimina sus usuarios al terminar) |

---

## 5. Decisiones requeridas

| # | Decisión | Quién | Para cuándo |
|---|---|---|---|
| 1 | Fecha y grupo para la sesión de usabilidad | Profesor del curso | Antes del 18 de noviembre |
| 2 | ¿Se acepta RNF04 como «no verificado» en el A4 y se cierra en el A5? | Profesor del curso | Con la entrega del A4 |
| 3 | Para RNF08: ¿se mitiga antes de la 1.0 o se reduce el escenario de aceptación a un número realista de usuarios simultáneos? | Profesor del curso | Antes del 18 de noviembre |

---

## 6. Plan del siguiente periodo

**Del 11 al 25 de noviembre de 2026 (Avance 5):**

| Actividad | Responsable | Entregable |
|---|---|---|
| Correcciones de los hallazgos del A4 | Equipo | Release candidate |
| Validación con estudiantes y docente | Equipo / profesor | Informe de validación |
| Manuales y capacitación | Equipo | Manuales + sesión |
| Acta de aceptación y plan de mantenimiento | Equipo / profesor | Documentos firmados |
| Versión 1.0 y sustentación | Equipo | Tag `v1.0.0` + presentación |

**Criterio de cierre del A5:** versión 1.0 desplegada, validación documentada, manuales,
capacitación, acta de aceptación, plan de mantenimiento y sustentación.
