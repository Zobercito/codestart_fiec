"use server";

import { revalidatePath } from "next/cache";
import { crearClienteSupabase } from "@/lib/supabase/server";
import {
  obtenerMiPerfil,
  obtenerRutaDeModulos,
  type Perfil,
} from "@/lib/auth/dal";
import { calcularEstadosModulos, type EstadoLeccion } from "./calculo";

/**
 * Acciones de progreso.
 *
 * El estudiante solo puede escribir su propia fila (RLS), pero además
 * la acción comprueba que la lección exista y que el módulo esté
 * desbloqueado. Así, una petición directa a una lección futura no
 * salta la secuencia del curso.
 */

type ResultadoProgreso =
  | { ok: true; estado: EstadoLeccion }
  | { ok: false; error: string };

async function contextoDeLeccion(perfil: Perfil, leccionId: string) {
  const supabase = await crearClienteSupabase();

  const { data: leccion } = await supabase
    .from("lecciones")
    .select("id, orden, modulo:modulos(id, orden)")
    .eq("id", leccionId)
    .maybeSingle();

  if (!leccion) return null;

  const modulo = Array.isArray(leccion.modulo) ? leccion.modulo[0] : leccion.modulo;
  if (!modulo) return null;

  const ruta = await obtenerRutaDeModulos(perfil);
  const { modulos } = calcularEstadosModulos(ruta);
  const estadoModulo = modulos.find((m) => m.id === modulo.id)?.estado ?? null;

  return { supabase, leccion, modulo, estadoModulo };
}

function revalidarProgreso() {
  revalidatePath("/dashboard");
  revalidatePath("/modulos");
  revalidatePath("/modulos/[modulo]", "page");
  revalidatePath("/modulos/[modulo]/lecciones/[leccion]", "page");
  revalidatePath("/medallas");
  revalidatePath("/docente");
}

async function guardarEstado(
  perfil: Perfil,
  leccionId: string,
  estado: EstadoLeccion,
): Promise<ResultadoProgreso> {
  if (perfil.rol !== "estudiante") {
    return {
      ok: false,
      error: "Solo las cuentas de estudiante registran progreso.",
    };
  }

  const contexto = await contextoDeLeccion(perfil, leccionId);
  if (!contexto) {
    return { ok: false, error: "La lección no existe." };
  }

  const { supabase, estadoModulo } = contexto;
  if (estadoModulo === "bloqueado") {
    return {
      ok: false,
      error: "Ese módulo todavía está bloqueado. Termina el anterior primero.",
    };
  }

  const { data: actual } = await supabase
    .from("progresos")
    .select("estado")
    .eq("usuario_id", perfil.id)
    .eq("leccion_id", leccionId)
    .maybeSingle();

  // No se retrocede: una lección completada sigue completada.
  if (actual?.estado === "completado") {
    return { ok: true, estado: "completado" };
  }

  const { error } = await supabase.from("progresos").upsert(
    {
      usuario_id: perfil.id,
      leccion_id: leccionId,
      estado,
      fecha: new Date().toISOString(),
    },
    { onConflict: "usuario_id,leccion_id" },
  );

  if (error) {
    return { ok: false, error: "No se pudo guardar el progreso. Intenta de nuevo." };
  }

  revalidarProgreso();
  return { ok: true, estado };
}

export async function marcarLeccionEnProgreso(
  leccionId: string,
): Promise<ResultadoProgreso> {
  const perfil = await obtenerMiPerfil();
  if (!perfil) return { ok: false, error: "No hay sesión activa." };
  return guardarEstado(perfil, leccionId, "en_progreso");
}

export async function marcarLeccionVista(
  leccionId: string,
): Promise<ResultadoProgreso> {
  const perfil = await obtenerMiPerfil();
  if (!perfil) return { ok: false, error: "No hay sesión activa." };
  return guardarEstado(perfil, leccionId, "completado");
}
