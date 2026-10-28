import "server-only";

import { crearClienteSupabase } from "@/lib/supabase/server";
import type {
  PreguntaPublica,
  ReglasEvaluacion,
} from "@/lib/evaluacion/tipos";

/**
 * Acceso a las evaluaciones.
 *
 * No hay tabla de evaluaciones: son retos de selección múltiple con
 * `reglas.preguntas`. Se buscan en la base y se filtran en memoria
 * porque el número de retos es pequeño y el filtro sobre JSONB no
 * aporta nada aquí. La respuesta correcta NO sale de esta capa hacia el
 * navegador: `preguntasPublicas` la elimina.
 */

export type EvaluacionVista = {
  id: string;
  titulo: string;
  descripcion: string | null;
  modo: "autoevaluacion" | "final";
  modulo: number | null;
  moduloTitulo: string | null;
  umbral: number;
  puntos: number;
  intentosMaximos: number;
  preguntas: PreguntaPublica[];
};

type RetoFila = {
  id: string;
  enunciado: string;
  enunciado_detalle: string | null;
  reglas: unknown;
  puntos: number;
  intentos_maximos: number;
};

function esReglasEvaluacion(valor: unknown): valor is ReglasEvaluacion {
  if (!valor || typeof valor !== "object") return false;
  const reglas = valor as Partial<ReglasEvaluacion>;
  return (
    (reglas.modo === "autoevaluacion" || reglas.modo === "final") &&
    Array.isArray(reglas.preguntas) &&
    reglas.preguntas.length > 0
  );
}

function aVista(
  reto: RetoFila,
  reglas: ReglasEvaluacion,
  moduloTitulo: string | null,
): EvaluacionVista {
  return {
    id: reto.id,
    titulo: reglas.titulo ?? reto.enunciado,
    descripcion: reto.enunciado_detalle,
    modo: reglas.modo,
    modulo: reglas.modulo ?? null,
    moduloTitulo,
    umbral: reglas.umbral ?? 60,
    puntos: reto.puntos,
    intentosMaximos: reto.intentos_maximos,
    preguntas: reglas.preguntas.map((pregunta) => ({
      id: pregunta.id,
      enunciado: pregunta.enunciado,
      opciones: pregunta.opciones,
      area: pregunta.area,
    })),
  };
}

async function buscar(
  modo: "autoevaluacion" | "final",
  modulo?: number,
): Promise<EvaluacionVista | null> {
  const supabase = await crearClienteSupabase();

  const { data: retos } = await supabase
    .from("retos")
    .select("id, enunciado, enunciado_detalle, reglas, puntos, intentos_maximos")
    .eq("tipo", "seleccion_multiple")
    .order("creado_en", { ascending: true });

  const candidato = (retos ?? []).find((reto) => {
    if (!esReglasEvaluacion(reto.reglas)) return false;
    if (reto.reglas.modo !== modo) return false;
    if (modo === "autoevaluacion") return reto.reglas.modulo === modulo;
    return true;
  });

  if (!candidato || !esReglasEvaluacion(candidato.reglas)) return null;

  let moduloTitulo: string | null = null;
  const orden = candidato.reglas.modulo;
  if (typeof orden === "number") {
    const { data: modulo } = await supabase
      .from("modulos")
      .select("titulo")
      .eq("orden", orden)
      .maybeSingle();
    moduloTitulo = modulo?.titulo ?? null;
  }

  return aVista(candidato, candidato.reglas, moduloTitulo);
}

/** Autoevaluación de un módulo (1–7). */
export function obtenerEvaluacionDeModulo(
  modulo: number,
): Promise<EvaluacionVista | null> {
  return buscar("autoevaluacion", modulo);
}

/** Evaluación formativa final (módulo 8). */
export function obtenerEvaluacionFinal(): Promise<EvaluacionVista | null> {
  return buscar("final");
}

/** Cuántas veces el usuario actual ha entregado esta evaluación. */
export async function contarIntentosEvaluacion(retoId: string): Promise<number> {
  const supabase = await crearClienteSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("intentos")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", user.id)
    .eq("reto_id", retoId);

  return count ?? 0;
}