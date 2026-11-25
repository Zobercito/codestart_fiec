# Acta de aceptación — CodeStart FIEC 1.0

**Proyecto:** CodeStart FIEC — plataforma de apoyo al Curso Propedéutico de la FIEC  
**Versión:** `v1.0.0`  
**Fecha:** ____ de noviembre de 2026  
**Acta:** ACEPTACIÓN / ACEPTACIÓN CON RESERVAS / RECHAZO (marcar)

## 1. Participantes

| Rol | Nombre | Firma |
|---|---|---|
| Profesor de la asignatura | | |
| Coordinación FIEC | | |
| Responsable técnico | | |
| Responsable de contenido | | |

## 2. Alcance entregado

- Aplicación web CodeStart FIEC desplegada.
- Código fuente, migraciones y seed.
- Manuales de estudiante, docente, administrador y técnico.
- Guía de mantenimiento y plan de respaldos.
- Informe de pruebas, informe de validación e informe A5.
- Paquete comprimido con fecha y versión.

## 3. Resultados de aceptación

| Requisito | Resultado | Observación |
|---|---|---|
| RF01 Registro y autenticación | Aceptado | Sin registro público |
| RF02 Visualización de módulos | Aceptado | 8 módulos |
| RF03 Visor interactivo | Aceptado | Lección 3 |
| RF04 Retos y pistas | Aceptado con reservas | Pistas corregidas; verificar en producción |
| RF05 Evaluaciones | Aceptado con reservas | Final no obligatoria para la insignia de curso |
| RF06 Progreso e insignias | Aceptado | Persistencia y triggers |
| RF07 Panel docente | Aceptado | Con datos reales |
| RF08 Administración | No incluido | Fuera de alcance; RPC documentada |
| RF09 Lecciones multimedia | Aceptado con reservas | 3 lecciones provisionales; sin videos |
| RF10 Editor de código | Aceptado | CodeMirror + servidor |
| RF11 Progreso y borrador | Aceptado | Persistencia |
| RF12 Grupos | Aceptado | Código único |
| RF13 Asignaciones | Aceptado | Fecha y descripción |
| RF14 Seguimiento | Aceptado | Tabla y detalle |
| RF15 Análisis de errores | Aceptado | Agregación y regla |
| RF16 Modo clase | Aceptado con reservas | Previsualización, no ruta dedicada |
| RNF01 Compatibilidad | Parcial | WebKit/Edge no ejecutados |
| RNF02 Rendimiento | Parcial | Local; producción no medida |
| RNF03 Seguridad | Aceptado | RLS 32/32 |
| RNF04 Usabilidad | No verificado | Sin pilotos/encuesta |
| RNF05 Disponibilidad | Parcial | Sin monitor de 7 días |
| RNF06 Accesibilidad | Parcial | Automática; manual pendiente |
| RNF07 Código aislado | Aceptado con reservas | Análisis estático; timeout real pendiente |
| RNF08 100 usuarios | No cumple | p95 histórico 54,6 s |
| RNF09 Privacidad | Aceptado con reservas | Retención/anonimización no automatizada |

## 4. Reservas y compromisos

1. Desplegar y verificar la versión 1.0 antes de la fecha de entrega.
2. Ejecutar el piloto y la encuesta de usabilidad, o ratificar RNF04 como no verificado.
3. Medir RNF08 o redefinir el escenario por escrito.
4. Completar `m01`, `m02` y `m04` o aceptar su carácter provisional.
5. Probar WebKit/Edge y la accesibilidad manual en el siguiente periodo.
6. Probar la restauración de un respaldo.

## 5. Decisión

- [ ] Aceptado
- [ ] Aceptado con reservas (detallar arriba)
- [ ] Rechazado (motivo): __________________________________________

**Observaciones:**

______________________________________________________________________

______________________________________________________________________

**Firmas:**

_________________________  _________________________

_________________________  _________________________
