# Registro de decisiones — CodeStart FIEC

Las decisiones de alcance y de proyecto (D1–D12) se llevan en el plan de trabajo interno del
equipo. Este archivo guarda las decisiones **técnicas** que afectan a la arquitectura y que
conviene poder explicar en la entrega y en la sustentación.

---

## ADR-001 · RNF07: el análisis estático corre en el servidor

- **Fecha:** 26 de octubre de 2026
- **Estado:** propuesta, pendiente de visto bueno del profesor.
- **Requisito afectado:** RNF07 (seguridad del editor de código).

### Contexto

El RNF07 del Avance 1 dice:

> «El código escrito por el estudiante se ejecuta o valida únicamente en el navegador, en un
> entorno aislado y con límite de tiempo; nunca se ejecuta en el servidor.»

La implementación actual **no ejecuta código de usuario**: analiza estáticamente el programa
(`fuente → tokens → parser → AST → tipos → reglas`) y lo hace en `POST /api/retos/[id]/verificar`,
en el servidor. El navegador solo envía el código y muestra el veredicto.

La razón es de integridad: si la corrección ocurriera en el cliente, bastaría con falsear la
respuesta para aprobar cualquier reto, y la tabla `intentos` —que alimenta el análisis de errores
del docente (RF15)— dejaría de ser confiable.

### Decisión

1. **Mantener la corrección en el servidor.**
2. Interpretar el RNF07 en su intención de seguridad: **no se ejecuta código de usuario en el
   servidor**; se analiza estáticamente. El análisis no tiene efectos, no compila, no enlaza y no
   ejecuta el programa del estudiante.
3. Añadir un **límite de tiempo de 5 s** al analizador del navegador (Web Worker) para cumplir la
   parte literal del requisito sobre bucles infinitos.
4. Dejar el Web Worker como análisis local mientras se escribe; la verificación autoritativa sigue
   siendo la del servidor.
5. Proponer al profesor la redacción corregida del RNF07:

   > «El código escrito por el estudiante nunca se ejecuta en el servidor. La validación es un
   > análisis estático con límite de tiempo; el veredicto se emite en el servidor para que no pueda
   > falsificarse.»

### Consecuencias

- **Positivas:** corrección no falsificable, `intentos` confiable, diagnóstico mejor que la
  ejecución y ningún código de usuario ejecutado.
- **Negativas:** el requisito literal no se cumple palabra por palabra; hay que documentar la
  interpretación y obtener aprobación.
- **Pendiente:** implementar el timeout de 5 s (§8.1 del plan del A4).

### Evidencia en el código

| Archivo | Qué demuestra |
|---|---|
| `src/app/api/retos/[id]/verificar/route.ts` | La verificación ocurre en el servidor |
| `src/lib/validacion/motor.ts` | El análisis es estático (AST + tipos) |
| `src/lib/validacion/cliente.ts` | El Worker es opcional y local |
| `docs/ARQUITECTURA.md` | Explica el diseño y por qué |

---

## Plantilla para nuevas decisiones

```markdown
## ADR-00X · Título

- **Fecha:**
- **Estado:** propuesta / aceptada / reemplazada
- **Requisito afectado:**

### Contexto

### Decisión

### Consecuencias

### Evidencia
```
