# Manual del docente — CodeStart FIEC

**Versión:** 1.0.0 · **Última actualización:** 24/11/2026

Este manual cubre el panel del docente: grupos, asignaciones, seguimiento, errores frecuentes y modo clase.

## 1. Acceso

1. Entra en <https://codestart-fiec.vercel.app/login> con tu cuenta de docente.
2. La plataforma te lleva directamente a **/docente**.
3. Si entras a una ruta de estudiante, el sistema te devuelve a tu panel.

Las cuentas de docente las prepara la coordinación con `npm run db:usuarios` o con el panel de Supabase. No hay registro público.

## 2. Panel

El panel muestra, del grupo seleccionado:

- **Cumplimiento:** porcentaje de la asignación más reciente o avance medio.
- **Tasa de acierto:** intentos aprobados sobre intentos totales.
- **Atrasados:** estudiantes con una entrega vencida.
- **Punto crítico:** el reto con peor tasa o el error más frecuente.
- **Errores frecuentes:** hasta cinco patrones, con el último caso y el estudiante.
- **Asignaciones:** últimas tareas y su cumplimiento.

Si tienes varios grupos, usa el selector. El panel solo consulta tus grupos; el RLS impide ver los ajenos.

## 3. Crear un grupo

1. Abre **Grupos**.
2. Escribe el nombre, el código de inscripción y, si quieres, el período.
3. Pulsa **Crear grupo**.
4. Comparte el código con los estudiantes; también puedes copiarlo con **Copiar código**.

El código debe ser único, de 4 a 24 caracteres, en mayúsculas, números y guiones. Si no escribes uno, se genera automáticamente.

## 4. Asignar trabajo

1. Abre **Asignar**.
2. Elige el grupo, el módulo o reto y la fecha de entrega.
3. Añade una descripción breve.
4. Pulsa **Crear asignación**.

El estudiante ve la asignación en su dashboard. La fecha se compara con la fecha del servidor en `America/Panama`; no se permiten fechas anteriores a hoy.

## 5. Seguimiento

1. En el panel, pulsa **Ver seguimiento** o abre **Grupos → Ver seguimiento**.
2. Verás una fila por estudiante: estado, avance, módulo actual, último reto, intentos, acierto y medallas.
3. Pulsa **Ver detalle** para abrir el progreso por módulo, las insignias, los errores recientes y los últimos intentos.
4. Los intentos se paginan de 50 en 50; usa **Anteriores/Siguientes**.

Los estados son:

- **Al día:** avance ≥ 50 % y sin entregas vencidas.
- **En riesgo:** avance < 50 %.
- **Atrasado:** tiene una asignación vencida sin completar.
- **Sin actividad:** no ha completado lecciones ni tiene intentos.

## 6. Errores frecuentes

La sección **Errores frecuentes** agrupa los intentos recientes por regla incumplida o mensaje de error. Cada tarjeta enlaza al reto y al último estudiante que lo cometió. El **punto crítico** usa los últimos 50 intentos del grupo; si no hay datos suficientes, lo indica.

## 7. Modo clase

Un docente o administrador puede abrir un reto o una evaluación y verlo en **modo clase**:

- No se entregan intentos ni se suman puntos.
- Se ocultan pistas y explicaciones.
- En las evaluaciones no aparece el botón de entrega.

Es una vista de proyección, no una sesión de estudiante. Un estudiante no puede activarlo por URL.

## 8. Evaluaciones

- Cada módulo 1–7 tiene una autoevaluación de cinco preguntas.
- El módulo 8 tiene la evaluación final de quince preguntas, con umbral del 70 %.
- Como docente puedes previsualizarlas sin entregar.

## 9. Privacidad y límites

- Solo ves datos de estudiantes inscritos en tus grupos.
- No puedes cambiar roles ni ver grupos ajenos desde la interfaz.
- Los datos de demostración no deben mezclarse con estudiantes reales.
- Para altas, bajas o cambios de rol, contacta con la administración.

## 10. Problemas frecuentes

| Problema | Qué hacer |
|---|---|
| No aparece un grupo | Comprueba que el grupo es tuyo; el panel filtra por docente. |
| Un estudiante no aparece | Debe unirse con el código o estar inscrito por el script de cuentas. |
| El código está en uso | Elige otro; el sistema lo rechaza por único. |
| No puedes asignar una fecha pasada | La fecha de entrega no puede ser anterior a hoy (Panamá). |
| El panel tarda | La primera carga consulta varios agregados; si persiste, avisa al equipo técnico. |
