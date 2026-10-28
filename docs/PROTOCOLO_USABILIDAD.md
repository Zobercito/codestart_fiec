# Protocolo de prueba de usabilidad — CodeStart FIEC (RNF04)

> **Documento ejecutable.** Se escribe antes de la sesión, no después. Ninguna métrica de este
> protocolo se rellena sin observación real: si no hay participantes, `docs/INFORME_PRUEBAS.md` §5
> declara el RNF04 como **no verificado** (así lo exige el plan de avances §7.4).

**Versión probada:** beta `v0.2.0-beta` · **URL:** <https://codestart-fiec.vercel.app>
**Rol del moderador:** QA · **Observador:** contenido · **Duración máxima por sesión:** 40 min

---

## 1. Participantes y reclutamiento

| Rol | Cuántos | Cómo se reclutan | Consentimiento |
|---|---|---|---|
| Estudiante del perfil objetivo (propedéutico FIEC) | 5–8 | Lista del curso o compañeros de clase voluntarios | Lectura de 2 líneas + marca en la hoja |
| Docente | 1 | Docente del curso (o quien haga de tal) | Ídem |

- **No se usan datos personales reales.** Cada participante trabaja con la cuenta de demostración
  que entrega el moderador; la base de la beta no contiene información de estudiantes reales.
- Si un participante ya conoce la herramienta, se anota: no sustituye a un participante nuevo.
- Grabación de pantalla **solo** con permiso explícito; si no lo da, se toman notas a mano.

## 2. Preparación ( checklist del moderador, 15 min antes)

- [ ] Servidor beta arriba y verificado con un recorrido propio.
- [ ] Cuenta nueva lista por participante (el docente la crea con `scripts/crear-usuarios.mjs` o
      desde Supabase; el script deja al estudiante inscrito en el grupo).
- [ ] Código de inscripción del grupo apuntado en una tarjeta.
- [ ] Dispositivo real del curso (tableta) cargado + un portátil con Chrome actualizado.
- [ ] Hoja de registro (§5) impresa o en pantalla para el observador.

## 3. Tareas (orden fijo)

| # | Tarea | Consigna exacta al participante | Éxito significa |
|---|---|---|---|
| T1 | Entrar con la cuenta asignada | «Entra con el correo y la contraseña que te di.» | Ve el dashboard con su nombre |
| T2 | Unirse al grupo del curso | «Únete al grupo con este código.» | El dashboard muestra el grupo y sus tareas |
| T3 | Continuar el curso | «Abre lo que el curso te pide continuar.» | Entra a la lección en curso, sin adivinar la URL |
| T4 | Resolver un reto con ayuda | «Este reto falla. Averigua por qué y arréglalo. Puedes pedir pistas.» | Corrige y ve «reto aprobado»; la pista no revela la solución de golpe |
| T5 | Ver su avance y sus medallas | «¿Cómo vas? ¿Qué has ganado?» | Encuentra progreso y `/medallas` desde la navegación |
| T6 (docente) | Grupo, asignación y error | «Muestra quién va atrasado, asigna un módulo y dime el error que más se repite.» | Lee los indicadores, crea la asignación y señala el error frecuente |

**No se explica cómo se hace.** El moderador solo lee la consigna y responde con «no te preocupes,
sigue» si piden ayuda; si abandonan, se anota como fallo y se pasa a la siguiente.

## 4. Qué se registra de cada tarea

- **Éxito** (completo / con ayuda / no completado).
- **Tiempo** en segundos desde la consigna.
- **Errores** (clics en el sitio equivocado, URL tecleada a mano, abandonar).
- **Ayuda solicitada** (sí/no y en qué punto).
- **Frase literal** de lo que diga al dudar (es la evidencia más útil).

## 5. Hoja de registro (una fila por tarea y participante)

| Participante | Tarea | Éxito | Tiempo (s) | Errores | Ayuda | Nota cualitativa |
|---|---|---|---|---|---|---|
| P1 | T1 | | | | | |
| P1 | T2 | | | | | |
| P1 | T3 | | | | | |
| P1 | T4 | | | | | |
| P1 | T5 | | | | | |
| P2…P8 | idem | | | | | |
| D1 | T6 | | | | | |

### Cierre de la sesión (mismo participante)

1. Satisfacción global: **1 a 10** (marca en grande).
2. ¿Qué fue lo más difícil? (respuesta abierta)
3. ¿Dónde habrías esperado algo distinto? (respuesta abierta)
4. ¿Recomendarías esta herramienta para el curso? (sí / no / con cambios + por qué)

## 6. Cuestionario SUS

Escala 1 (muy en desacuerdo) a 5 (muy de acuerdo). Í 5 pares impares redos: la puntuación se
normaliza a 0–100 como pide el método original de Brooke.

| # | Enunciado | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Debería usar esta frecuencia | | | | | |
| 2 | La encontré innecesariamente compleja | | | | | |
| 3 | Era fácil de usar | | | | | |
| 4 | Necesitaría a alguien técnico para usarla | | | | | |
| 5 | Las funciones estaban bien integradas | | | | | |
| 6 | Había demasiado que no tenía sentido | | | | | |
| 7 | Me sentí confiado/a usándola | | | | | |
| 8 | Fue lento en algunos pasos | | | | | |
| 9 | Me resultó muy fácil aprenderla | | | | | |
| 10 | Tenía que pensar demasiado para usarla | | | | | |

## 7. Criterios de aceptación

| Criterio | Umbral | Fuente |
|---|---|---|
| Tasa de éxito en tareas críticas (T1, T3, T4) | ≥ 80 % | §5 |
| Ninguna tarea crítica bloqueada | 0 bloqueos | observación |
| Satisfacción media | > 8/10 (RNF04) | §5 cierre |
| SUS | > 68 (media de referencia) y sin ítems sistemáticos | §6 |
| Tiempo de la T4 (reto con pista) | < 4 min con una sola pista | §5 |

## 8. Si no se consiguen participantes

Se hace **evaluación heurística** (Nielsen, 10 principios + checklist WCAG del §4.2 del informe de
pruebas) sobre las seis tareas, con **al menos 3 revisores**, y se documenta así:

- Los hallazgos entran en `INFORME_PRUEBAS.md` §6 marcados como *heurístico*, no como resultados
  de usabilidad.
- El **RNF04 se declara «no verificado»** en el informe de avance. No se inventa una media.
- La prueba con personas se planifica para el A5 (piloto), donde sí hay grupo real.

## 9. Salida de la sesión

1. Hoja de registro escaneada o copiada a `INFORME_PRUEBAS.md` §5.2.
2. Lista priorizada de correcciones (severidad: bloquea / frena / molesta) con requisito afectado.
3. Capturas de los puntos de fricción, en `docs/` o en el ZIP de evidencias.
