import type { ResultadoEvaluacion } from "@/lib/evaluacion/calcular";
import type { Json } from "@/lib/supabase/types.generados";
import type { ResultadoAnalisis } from "@/lib/validacion/tipos";
import type { ResultadoAutocompletado } from "./autocompletado";
import type { ResultadoOrdenamiento } from "./ordenamiento";

/**
 * Saneo de lo que se guarda en `intentos.resultado`.
 *
 * El estudiante puede leer sus propios intentos con su JWT (RLS), así que
 * la fila no debe contener la respuesta correcta. El detalle completo se
 * devuelve en la respuesta HTTP para la retroalimentación inmediata, pero
 * se guarda sin `correctas`, sin `detalle.correcta` y sin la explicación.
 *
 * El docente solo necesita el diagnóstico (`error_detectado` y, en los
 * retos de código, `regla_incumplida`), no las respuestas.
 */

export function resultadoSeleccionParaGuardar(elegida: string): NonNullable<Json> {
  return { elegida };
}

export function resultadoEvaluacionParaGuardar(
  resultado: ResultadoEvaluacion,
): NonNullable<Json> {
  const { detalle, ...publico } = resultado;
  void detalle;
  return publico as unknown as NonNullable<Json>;
}

export function resultadoAutocompletadoParaGuardar(
  resultado: ResultadoAutocompletado,
): NonNullable<Json> {
  const { detalle, ...publico } = resultado;
  void detalle;
  return publico as unknown as NonNullable<Json>;
}

export function resultadoOrdenamientoParaGuardar(
  resultado: ResultadoOrdenamiento,
): NonNullable<Json> {
  const { detalle, ...publico } = resultado;
  void detalle;
  return publico as unknown as NonNullable<Json>;
}

export function resultadoCodigoParaGuardar(
  resultado: ResultadoAnalisis,
): NonNullable<Json> {
  const reglaIncumplida =
    resultado.casos.find((caso) => !caso.coincide)?.reglaIncumplida ?? null;

  return {
    casos: resultado.casos.map((caso) => ({
      nombre: caso.nombre,
      coincide: caso.coincide,
      esperado: caso.salida_esperada,
      obtenido: caso.salida_obtenida,
    })),
    errores: resultado.errores,
    regla_incumplida: reglaIncumplida,
  };
}
