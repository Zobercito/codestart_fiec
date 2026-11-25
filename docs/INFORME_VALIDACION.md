# Informe de validación — CodeStart FIEC 1.0

**Fecha:** 24/11/2026  
**Versión:** `v1.0.0` (código local; despliegue pendiente al cierre de este informe)  
**Responsable:** equipo del proyecto

> **Regla de honestidad:** este informe no inventa métricas. Lo que no se ejecutó se declara como **no ejecutado** con su causa. Las pruebas técnicas sí se ejecutaron y se indican con su salida real.

## 1. Alcance de la validación

| Frente | Estado | Evidencia |
|---|---|---|
| Pruebas técnicas | **Ejecutadas** | 38 unitarias, 93 E2E, 32 RLS, seguridad y contraste |
| Aceptación funcional RF01–RF16 | **Parcial** | Matriz de §3; RF17/RF18 fuera de alcance; RF08 sin UI |
| Piloto con estudiantes | **No ejecutado** | Sin participantes/sesión agendada en el periodo |
| Pre/post prueba de aprendizaje | **No ejecutado** | Requiere el piloto |
| Encuesta de usabilidad (RNF04) | **No ejecutado** | `docs/PROTOCOLO_USABILIDAD.md` listo; sin respuestas |
| Entrevista al docente | **No ejecutado** | Requiere sesión |
| Métricas de uso (≥70 % completa un módulo) | **No disponibles** | Dependen del piloto |
| Revisión manual de accesibilidad | **No ejecutado** | Solo axe/contraste automáticos |
| WebKit/Edge | **No ejecutado** | No hay proyectos en la config local; pendiente CI |

## 2. Pruebas técnicas ejecutadas

| Comando | Resultado |
|---|---|
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ 38/38 |
| `npm run build` | ✅ 20 rutas |
| `npx playwright test` | ✅ 93/93 (Chromium escritorio, tableta y Firefox) |
| `npm run test:rls` | ✅ 32/32 |
| `npm run test:seguridad` | ✅ alta pública cerrada |
| `npm run auditar:contraste` | ✅ 0 textos bajo AA en 7 rutas |
| `npm run db:seed` (con `SEED_DRY_RUN=1`) | ✅ SQL validado sin escribir |
| `npm run db:types` | ✅ tipos regenerados |

**No cubierto por estas pruebas:** estados vacíos/pendientes del contraste, pestañas del reto, simulador, revisión con teclado/lector, WebKit/Edge, carga de 100 usuarios, restauración de respaldo.

## 3. Matriz de aceptación RF01–RF16

| ID | Requisito | Resultado | Evidencia / límite |
|---|---|---|---|
| RF01 | Registro y autenticación | ✅ | Login real, sin registro público; E2E de acceso |
| RF02 | Visualización de módulos | ✅ | 8 módulos, lecciones y estados; E2E |
| RF03 | Visor interactivo de código | ✅ | `VisorAnatomia`, `RecorridoInstruccion`; lección 3 |
| RF04 | Retos y pistas | 🟡 | Retos de código, selección, ordenamiento y autocompletado; pistas corregidas en código local, pendiente de deploy |
| RF05 | Evaluaciones | 🟡 | Autoevaluación 1–7 y final; la final no es obligatoria para la insignia de curso |
| RF06 | Progreso e insignias | ✅ | Progreso real, triggers de insignias; E2E |
| RF07 | Panel docente | ✅ | Panel, grupo, estudiante, grupos y asignación; E2E |
| RF08 | Administración de usuarios | ⏭ | Fuera de alcance: sin UI; RPC `cambiar_rol` documentada |
| RF09 | Lecciones multimedia | 🟡 | MDX + componentes; 3 de 9 lecciones son provisionales; sin videos |
| RF10 | Editor de código | ✅ | CodeMirror + verificación en servidor |
| RF11 | Guardado de progreso y borrador | ✅ | E2E de progreso y borrador |
| RF12 | Gestión de grupos | ✅ | Crear grupo y código único; E2E |
| RF13 | Asignación de tareas | ✅ | Formulario y visualización del estudiante; E2E |
| RF14 | Seguimiento | ✅ | Tabla y detalle por estudiante; RLS |
| RF15 | Análisis de errores | ✅ | Agregación de errores y regla incumplida; panel docente |
| RF16 | Modo clase | 🟡 | Previsualización docente; no hay ruta `/clase` dedicada |

## 4. Criterios RNF

| ID | Criterio | Estado real |
|---|---|---|
| RNF01 | Chromium/Firefox/WebKit/Edge | 🟡 Chromium y Firefox; WebKit/Edge no ejecutados |
| RNF02 | Lección < 2 s | 🟡 Medición local histórica 1,1–1,3 s; producción no medida |
| RNF03 | Seguridad por rol | ✅ RLS 32/32; F09 cerrado; rol sincronizado |
| RNF04 | Usabilidad > 8/10 | ❌ No ejecutada; sin datos |
| RNF05 | Disponibilidad ≥ 95 % | 🟡 `/api/salud` responde; sin monitor de 7 días |
| RNF06 | WCAG 2.1 AA | 🟡 axe/contraste automáticos; revisión manual pendiente; fallos en estados no auditados |
| RNF07 | Código de usuario aislado | 🟡 Análisis estático en servidor; timeout real no implementado |
| RNF08 | 100 usuarios simultáneos | ❌ p95 54,6 s / 88,7 % timeouts en la última medición; no cerrado |
| RNF09 | Privacidad | 🟡 Aviso y aceptación; retención/anonimización no automatizada |

## 5. Recomendaciones antes de la entrega

1. Desplegar los Grupos 1–3 y repetir el smoke test en producción.
2. Ejecutar el piloto o declarar formalmente RNF04 como no verificado.
3. Medir RNF08 con el escenario acordado o redefinirlo por escrito.
4. Probar WebKit/Edge en CI o declararlo pendiente.
5. Hacer y **restaurar** un respaldo antes de la demo.
6. Completar `m01`, `m02` y `m04` o declararlos provisionales en el acta.
7. Revisar teclado, foco, zoom 200 % y lector de pantalla en el flujo crítico.

## 6. Conclusión

La versión 1.0 es **técnicamente demostrable** en el flujo principal y tiene una regresión técnica verde. **No está validada con usuarios** ni cumple RNF08; por tanto, la validación se entrega como **parcial y honesta**, no como un aprobado inventado.
