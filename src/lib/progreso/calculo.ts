/**
 * Cálculo del estado de los módulos.
 *
 * Es una función pura: no consulta Supabase y se puede probar con
 * Vitest. La usan la ruta de módulos, el dashboard y las acciones de
 * progreso para decidir si una lección se puede abrir.
 */

export type EstadoLeccion = "pendiente" | "en_progreso" | "completado";

export type EstadoModulo = "completado" | "en_progreso" | "pendiente" | "bloqueado";

export type ModuloConProgreso = {
  orden: number;
  total: number;
  completadas: number;
  enProgreso: boolean;
};

export type ModuloConEstado<M extends ModuloConProgreso> = M & {
  estado: EstadoModulo;
};

/**
 * Recorre los módulos en orden y calcula su estado.
 *
 * Reglas:
 *   - Un módulo sin lecciones nunca se marca completado y no bloquea
 *     la cadena: así se puede seguir trabajando mientras se escribe el
 *     contenido de los módulos nuevos.
 *   - Un módulo con lecciones está completado si todas lo están.
 *   - Si hay una lección en progreso o alguna completada, está en
 *     progreso.
 *   - Si no, está pendiente cuando el anterior con contenido está
 *     completo; bloqueado en caso contrario.
 */
export function calcularEstadosModulos<M extends ModuloConProgreso>(
  modulos: M[],
): {
  modulos: ModuloConEstado<M>[];
  moduloEnCurso: ModuloConEstado<M> | null;
} {
  let anteriorCompletado = true;
  const conEstado: ModuloConEstado<M>[] = [];

  for (const modulo of modulos) {
    const { total, completadas, enProgreso } = modulo;

    let estado: EstadoModulo;
    if (total === 0) {
      estado = "pendiente";
    } else if (completadas >= total) {
      estado = "completado";
    } else if (enProgreso || completadas > 0) {
      estado = "en_progreso";
    } else {
      estado = anteriorCompletado ? "pendiente" : "bloqueado";
    }

    // Un módulo vacío no cambia la cadena. Uno con contenido que no
    // está completo sí la corta para los siguientes.
    if (total > 0 && estado !== "completado") {
      anteriorCompletado = false;
    }

    conEstado.push({ ...modulo, estado });
  }

  const enProgreso = conEstado.find((m) => m.estado === "en_progreso") ?? null;
  const primerPendienteConContenido =
    conEstado.find((m) => m.estado === "pendiente" && m.total > 0) ?? null;

  return {
    modulos: conEstado,
    moduloEnCurso: enProgreso ?? primerPendienteConContenido,
  };
}

/** Porcentaje entero de lecciones completadas de un módulo. */
export function porcentajeModulo(modulo: {
  total: number;
  completadas: number;
}): number {
  if (modulo.total <= 0) return 0;
  return Math.round((modulo.completadas / modulo.total) * 100);
}
