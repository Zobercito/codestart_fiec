import "server-only";

import { cache } from "react";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { leerContenidoPorRuta } from "@/lib/contenido/leer";
import type { Perfil } from "@/lib/auth/dal";

/**
 * Datos de una leccion para mostrarla.
 *
 * El archivo MDX lo dice la base de datos (columna archivo_contenido);
 * el contenido se lee del repositorio. Asi, cambiar el contenido es un
 * commit, no una fila que actualizar.
 */

export type LeccionConContexto = {
  leccion: {
    id: string;
    titulo: string;
    orden: number;
    duracion_min: number | null;
  };
  modulo: {
    id: string;
    titulo: string;
    orden: number;
  };
  contenido: string;
  anterior: { titulo: string; orden: number } | null;
  siguiente: { titulo: string; orden: number } | null;
  retos: { id: string; enunciado: string; tipo: string }[];
  estado: "pendiente" | "en_progreso" | "completado";
};

export const obtenerLeccion = cache(
  async (
    perfil: Perfil,
    moduloOrden: number,
    leccionOrden: number,
  ): Promise<LeccionConContexto | null> => {
    const supabase = await crearClienteSupabase();

    const { data: modulo } = await supabase
      .from("modulos")
      .select("id, titulo, orden")
      .eq("orden", moduloOrden)
      .maybeSingle();

    if (!modulo) return null;

    const { data: lecciones } = await supabase
      .from("lecciones")
      .select("id, titulo, orden, duracion_min, archivo_contenido")
      .eq("modulo_id", modulo.id)
      .order("orden");

    const lista = lecciones ?? [];
    const leccion = lista.find((l) => l.orden === leccionOrden);
    if (!leccion) return null;

    const contenido = await leerContenidoPorRuta(leccion.archivo_contenido);
    if (!contenido) return null;

    const indice = lista.findIndex((l) => l.orden === leccionOrden);
    const anterior = indice > 0 ? lista[indice - 1] : null;
    const siguiente = indice < lista.length - 1 ? lista[indice + 1] : null;

    const { data: progreso } = await supabase
      .from("progresos")
      .select("estado")
      .eq("usuario_id", perfil.id)
      .eq("leccion_id", leccion.id)
      .maybeSingle();

    // Los retos de la leccion: son el destino del boton «Ir al reto».
    const { data: retos } = await supabase
      .from("retos")
      .select("id, enunciado, tipo")
      .eq("leccion_id", leccion.id)
      .order("orden");

    return {
      leccion: {
        id: leccion.id,
        titulo: leccion.titulo,
        orden: leccion.orden,
        duracion_min: leccion.duracion_min,
      },
      modulo,
      contenido,
      anterior: anterior ? { titulo: anterior.titulo, orden: anterior.orden } : null,
      siguiente: siguiente ? { titulo: siguiente.titulo, orden: siguiente.orden } : null,
      retos: retos ?? [],
      estado: (progreso?.estado ?? "pendiente") as LeccionConContexto["estado"],
    };
  },
);
