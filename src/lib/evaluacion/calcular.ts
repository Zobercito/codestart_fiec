/**
 * Cálculo de una evaluación.
 *
 * Es una función pura: recibe las preguntas y las respuestas elegidas y
 * devuelve el puntaje, el detalle por pregunta y el resumen por área.
 * El servidor la usa para calificar; el cliente solo la usa para
 * mostrar el resultado que devolvió el servidor.
 */

import type { PreguntaEvaluacion } from "./tipos";

export type DetallePregunta = {
  id: string;
  enunciado: string;
  area: string;
  elegida: string | null;
  elegidaTexto: string | null;
  correcta: string;
  correctaTexto: string;
  acierto: boolean;
  explicacion?: string;
};

export type ResumenArea = {
  area: string;
  correctas: number;
  total: number;
  porcentaje: number;
};

export type ResultadoEvaluacion = {
  aprobado: boolean;
  puntaje: number;
  total: number;
  porcentaje: number;
  umbral: number;
  areas: ResumenArea[];
  areasAReforzar: string[];
  detalle: DetallePregunta[];
  mensaje: string;
};

export function calcularEvaluacion(
  preguntas: PreguntaEvaluacion[],
  respuestas: Record<string, string>,
  umbral = 60,
): ResultadoEvaluacion {
  const lista = preguntas ?? [];
  const detalle: DetallePregunta[] = [];
  let puntaje = 0;

  for (const pregunta of lista) {
    const elegida = String(respuestas?.[pregunta.id] ?? "").trim();
    const acierto = elegida !== "" && elegida === pregunta.correcta;
    if (acierto) puntaje += 1;
    detalle.push({
      id: pregunta.id,
      enunciado: pregunta.enunciado,
      area: pregunta.area,
      elegida: elegida || null,
      elegidaTexto:
        pregunta.opciones.find((opcion) => opcion.id === elegida)?.texto ?? null,
      correcta: pregunta.correcta,
      correctaTexto:
        pregunta.opciones.find(
          (opcion) => opcion.id === pregunta.correcta,
        )?.texto ?? pregunta.correcta,
      acierto,
      explicacion: pregunta.explicacion,
    });
  }

  const total = lista.length;
  const porcentaje = total > 0 ? Math.round((puntaje / total) * 100) : 0;
  const aprobado = total > 0 && porcentaje >= umbral;

  const porArea = new Map<string, { correctas: number; total: number }>();
  for (const fila of detalle) {
    const actual = porArea.get(fila.area) ?? { correctas: 0, total: 0 };
    actual.total += 1;
    if (fila.acierto) actual.correctas += 1;
    porArea.set(fila.area, actual);
  }

  const areas: ResumenArea[] = [...porArea.entries()].map(([area, datos]) => ({
    area,
    correctas: datos.correctas,
    total: datos.total,
    porcentaje:
      datos.total > 0 ? Math.round((datos.correctas / datos.total) * 100) : 0,
  }));

  const areasAReforzar = areas
    .filter((area) => area.porcentaje < umbral)
    .map((area) => area.area);

  return {
    aprobado,
    puntaje,
    total,
    porcentaje,
    umbral,
    areas,
    areasAReforzar,
    detalle,
    mensaje: aprobado
      ? `Aprobaste con ${porcentaje} %.`
      : total === 0
        ? "La evaluación no tiene preguntas."
        : `Obtuviste ${porcentaje} %. Necesitas ${umbral} % para aprobar.`,
  };
}
