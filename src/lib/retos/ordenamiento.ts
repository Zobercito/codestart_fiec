/**
 * Corrección de un reto de ordenamiento.
 *
 * El cliente manda el orden que armó; el servidor lo compara con el
 * orden correcto de las reglas. Es una función pura para poder probarla
 * sin Supabase ni navegador.
 */

export type ElementoOrdenamiento = {
  id: string;
  texto: string;
};

export type ReglasOrdenamiento = {
  elementos: ElementoOrdenamiento[];
  correctas: string[];
  explicacion?: string;
};

export type DetalleOrdenamiento = {
  posicion: number;
  elementoId: string | null;
  correcto: boolean;
};

export type ResultadoOrdenamiento = {
  acierto: boolean;
  correctas: number;
  total: number;
  detalle: DetalleOrdenamiento[];
  mensaje: string | null;
};

export function corregirOrdenamiento(
  orden: string[],
  reglas: ReglasOrdenamiento,
): ResultadoOrdenamiento {
  const esperado = reglas.correctas ?? [];
  const recibido = Array.isArray(orden) ? orden.map(String) : [];
  const idsValidos = new Set((reglas.elementos ?? []).map((e) => e.id));

  const detalle: DetalleOrdenamiento[] = [];
  let correctas = 0;

  for (let i = 0; i < Math.max(esperado.length, recibido.length); i += 1) {
    const elementoId = recibido[i] ?? null;
    const correcto =
      elementoId !== null &&
      idsValidos.has(elementoId) &&
      elementoId === esperado[i];
    if (correcto) correctas += 1;
    detalle.push({ posicion: i + 1, elementoId, correcto });
  }

  const completo =
    recibido.length === esperado.length &&
    recibido.every((id, i) => idsValidos.has(id) && id === esperado[i]);

  return {
    acierto: completo,
    correctas,
    total: esperado.length,
    detalle,
    mensaje: completo
      ? null
      : correctas === 0
        ? "Ningún paso está en la posición correcta. Revisa el orden lógico."
        : `Hay ${correctas} de ${esperado.length} pasos en la posición correcta.`,
  };
}
