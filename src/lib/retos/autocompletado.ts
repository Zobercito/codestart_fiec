/**
 * Corrección de un reto de autocompletado.
 *
 * Cada blanco tiene una etiqueta, una lista de opciones y la respuesta
 * correcta. El cliente manda un mapa `id → opción`; el servidor decide.
 */

export type BlancoAutocompletado = {
  id: string;
  etiqueta: string;
  opciones: string[];
  correcta: string;
  explicacion?: string;
};

export type ReglasAutocompletado = {
  plantilla: string;
  blancos: BlancoAutocompletado[];
  explicacion?: string;
};

export type DetalleBlanco = {
  id: string;
  etiqueta: string;
  respuesta: string | null;
  correcta: string;
  correcto: boolean;
  explicacion?: string;
};

export type ResultadoAutocompletado = {
  acierto: boolean;
  correctas: number;
  total: number;
  detalle: DetalleBlanco[];
  mensaje: string | null;
};

export function corregirAutocompletado(
  respuestas: Record<string, string>,
  reglas: ReglasAutocompletado,
): ResultadoAutocompletado {
  const blancos = reglas.blancos ?? [];
  const detalle: DetalleBlanco[] = [];
  let correctas = 0;

  for (const blanco of blancos) {
    const respuesta = (respuestas?.[blanco.id] ?? "").trim();
    const correcto = respuesta !== "" && respuesta === blanco.correcta;
    if (correcto) correctas += 1;
    detalle.push({
      id: blanco.id,
      etiqueta: blanco.etiqueta,
      respuesta: respuesta || null,
      correcta: blanco.correcta,
      correcto,
      explicacion: blanco.explicacion,
    });
  }

  const acierto = blancos.length > 0 && correctas === blancos.length;

  return {
    acierto,
    correctas,
    total: blancos.length,
    detalle,
    mensaje: acierto
      ? null
      : `Completaste ${correctas} de ${blancos.length} espacios correctamente.`,
  };
}
