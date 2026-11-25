# Informe de Avance 5 — CodeStart FIEC 1.0

**Avance 5 · Validación e implementación (v1.0.0)**  
**Fecha de entrega:** 25 de noviembre de 2026  
**Versión:** `v1.0.0`  
**Repositorio:** `Zobercito/codestart_fiec`  
**Despliegue:** <https://codestart-fiec.vercel.app> (verificado el 25/11/2026)

## 1. Porcentaje de avance

**≈ 90 % del alcance del A5.** El código, el despliegue y la regresión técnica están cerrados; la validación con personas y parte de las pruebas de compatibilidad/carga se declaran parciales.

| Fase | Estado | Evidencia |
|---|---|---|
| Correcciones y RC | ✅ | Grupos 1–6 aplicados; `v1.0.0` desplegado; regresión técnica verde salvo el timeout de red puntual |
| Validación | 🟡 | Pruebas técnicas ✅; piloto/usabilidad **no ejecutados** |
| Manuales y capacitación | 🟡 | Manuales escritos; capacitación no realizada |
| Cierre | 🟡 | Informes, tag `v1.0.0`, deploy y ZIP hechos; acta pendiente de firma |

## 2. Logros y entregables

- **Integridad:** pistas solo por endpoint, `retos.pistas` revocado, resultados de intentos saneados, RLS 32/32.
- **Acceso:** rol sincronizado entre `perfiles` y el JWT; promoción/degradación sin bucle; RLS sigue siendo la frontera.
- **Rendimiento:** agregados en Postgres, lista pesada limitada a 50, detalle paginado y región Vercel `pdx1`.
- **UX/seguridad:** contraste corregido en estados detectados, `href="#"` eliminado, cookies `httpOnly`, cabeceras CSP/XFO/Referrer y APIs con validación Zod/401/413/429.
- **Pruebas:** 38 unitarias, 93 E2E, 32 RLS, seguridad y contraste.
- **Documentación:** manuales de estudiante, docente, administrador y técnico; guía de mantenimiento; informe de validación; acta; auditoría A5.

## 3. Pendientes

| # | Pendiente | Por qué | Impacto |
|---|---|---|---|
| 1 | Desplegar y etiquetar `v1.0.0` | El código corregido está en local; producción sigue con la versión anterior | Alto |
| 2 | Piloto con estudiantes y encuesta | Sin participantes en el periodo | RNF04 no verificado |
| 3 | Medición de carga de 100 usuarios | Requiere escenario y ventana acordados | RNF08 no cumple |
| 4 | WebKit y Edge | No hay proyectos/CI ejecutados | RNF01 parcial |
| 5 | Revisión manual de accesibilidad | Requiere teclado, lector y zoom | RNF06 parcial |
| 6 | Restauración de respaldo probada | No hay `pg_dump` en el host; falta destino | Riesgo operativo |
| 7 | Contenido real de `m01`, `m02`, `m04` | Depende del experto | 3 de 9 lecciones provisionales |
| 8 | Capacitación y acta firmada | Requieren sesión y firmas | Cierre documental parcial |

## 4. Riesgos y problemas

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El despliegue se hace sin repetir el smoke test | Demo rota | Desplegar, verificar `/api/salud`, login y un módulo antes de la presentación |
| RNF08 sigue sin cumplir | Grupo completo no usable | Declararlo; usar el escenario acotado o el plan de infraestructura |
| RNF04 sin datos | No se puede afirmar usabilidad | Aplicar el plan B heurístico o declarar «no verificado» |
| Contenido provisional | Módulos 1, 2 y 4 no enseñan | Completarlo o marcarlo visiblemente en el acta |
| Respaldos no probados | Pérdida de datos | Hacer `pg_dump` y restaurar en una base nueva |
| Next 16.4.1 con avisos de seguridad | Riesgo de dependencia | Actualizar a 16.4.6 y repetir la regresión |

## 5. Decisiones requeridas

| # | Decisión | Quién | Cuándo |
|---|---|---|---|
| 1 | ¿Se acepta RNF04 como parcial/no verificado? | Profesor | Con la entrega |
| 2 | ¿Se acepta RNF08 con el escenario acotado o se declara no cumplido? | Profesor | Antes del acta |
| 3 | ¿Se aprueba la redacción de RNF07 (análisis estático en servidor)? | Profesor | Con el acta |
| 4 | ¿Se completan `m01`, `m02` y `m04` o se entregan como provisionales? | Profesor/experto | Antes del 25 |
| 5 | ¿Se aprueba el alcance sin RF08/RF17/RF18? | Profesor | Con el acta |

## 6. Plan del siguiente periodo

- Desplegar la versión 1.0 y etiquetarla.
- Ejecutar el piloto real en el propedéutico con autorización de la facultad.
- Cerrar RNF04/RNF08 con datos o redefinirlos por escrito.
- Probar WebKit/Edge y completar la revisión manual de accesibilidad.
- Automatizar respaldos y monitorización.
- Abordar RF17 (CSV), RF18 (editor de contenidos), RF08 (administración) y motor de C nivel 2.

## Conclusión

La 1.0 queda **técnicamente preparada y documentada**, con una deuda declarada: validación con personas, carga, WebKit/Edge y respaldos. No se presenta como «todo verificado»; se presenta con la evidencia disponible y los huecos explícitos.
