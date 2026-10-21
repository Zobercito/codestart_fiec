import "server-only";

import { cache } from "react";
import { crearClienteSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types.generados";
import type { Rol } from "./roles";

/** Las tablas del esquema public, tal como las genero supabase gen types. */
export type Tablas = Database["public"]["Tables"];

/**
 * Data Access Layer.
 *
 * Todo el acceso a datos pasa por aqui, y es el unico sitio donde se
 * comprueba la sesion y el rol. Los componentes nunca deciden que puede
 * ver el usuario: lo preguntan a la DAL, que consulta con el cliente
 * del usuario (con su JWT) y deja que el RLS de Postgres decida.
 *
 * Si esta comprobacion se hiciera en un componente, un cliente podria
 * saltarsela. Y el proxy no sirve como frontera: su comprobacion del
 * rol es optimista.
 */

export type Perfil = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
};

/** El perfil del usuario de la sesion, o null si no hay sesion. */
export const obtenerMiPerfil = cache(async (): Promise<Perfil | null> => {
  const supabase = await crearClienteSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("perfiles")
    .select("id, nombre, correo, rol")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;

  return { ...data, rol: data.rol as Rol };
});

/** Igual que obtenerMiPerfil, pero falla si no hay sesion. */
export async function exigirMiPerfil(): Promise<Perfil> {
  const perfil = await obtenerMiPerfil();
  if (!perfil) {
    // Si se llega aqui desde un Server Component, el proxy ya habria
    // redirigido. Es la red de seguridad.
    throw new Error("No hay sesion activa.");
  }
  return perfil;
}

/** El grupo al que pertenece el usuario (docente: el que dirige). */
export async function obtenerMiGrupo(perfil: Perfil) {
  const supabase = await crearClienteSupabase();

  if (perfil.rol === "docente" || perfil.rol === "admin") {
    const { data } = await supabase
      .from("grupos")
      .select("*")
      .eq("docente_id", perfil.id)
      .limit(1)
      .maybeSingle();
    return data;
  }

  const { data } = await supabase
    .from("inscripciones")
    .select("grupo:grupos(*)")
    .eq("usuario_id", perfil.id)
    .limit(1)
    .maybeSingle();

  return data?.grupo ?? null;
}

/** Los 8 modulos del curso con el estado de progreso del usuario. */
export async function obtenerRutaDeModulos(perfil: Perfil) {
  const supabase = await crearClienteSupabase();

  const [{ data: modulos }, { data: progresos }] = await Promise.all([
    supabase.from("modulos").select("*").order("orden"),
    supabase
      .from("progresos")
      .select("estado, leccion:lecciones(modulo_id, orden)")
      .eq("usuario_id", perfil.id),
  ]);

  // Un modulo esta completado si todas sus lecciones lo estan.
  const porModulo = new Map<
    string,
    { total: number; completadas: number; enProgreso: boolean }
  >();
  for (const p of progresos ?? []) {
    const leccion = Array.isArray(p.leccion) ? p.leccion[0] : p.leccion;
    if (!leccion) continue;
    const actual = porModulo.get(leccion.modulo_id) ?? {
      total: 0,
      completadas: 0,
      enProgreso: false,
    };
    actual.total += 1;
    if (p.estado === "completado") actual.completadas += 1;
    if (p.estado === "en_progreso") actual.enProgreso = true;
    porModulo.set(leccion.modulo_id, actual);
  }

  return (modulos ?? []).map((m) => {
    const conteo = porModulo.get(m.id) ?? { total: 0, completadas: 0, enProgreso: false };
    return { ...m, ...conteo };
  });
}

/**
 * Calcula el estado de cada modulo en la secuencia del curso.
 *
 * Los modulos se abren de uno en uno: un modulo esta bloqueado si el
 * anterior no esta completo. El estado sale del progreso real, no de
 * un campo guardado, para que no pueda quedar desincronizado.
 */
export function calcularEstadosModulos<
  M extends { orden: number; total: number; completadas: number; enProgreso: boolean },
>(modulos: M[]) {
  let anteriorCompletado = true;
  const conEstado: (M & {
    estado: "completado" | "en_progreso" | "pendiente" | "bloqueado";
  })[] = [];

  for (const m of modulos) {
    const completadas = m.completadas;
    const total = m.total;

    let estado: "completado" | "en_progreso" | "pendiente" | "bloqueado";
    if (total > 0 && completadas === total) {
      estado = "completado";
    } else if (m.enProgreso || completadas > 0) {
      estado = "en_progreso";
    } else {
      estado = anteriorCompletado ? "pendiente" : "bloqueado";
    }

    if (estado !== "completado") anteriorCompletado = false;
    conEstado.push({ ...m, estado });
  }

  return {
    modulos: conEstado,
    moduloEnCurso: conEstado.find((m) => m.estado === "en_progreso") ?? null,
  };
}

/** La asignacion vigente del grupo, con su fecha de entrega. */
export async function obtenerMiTarea(perfil: Perfil) {
  const supabase = await crearClienteSupabase();
  const grupo = await obtenerMiGrupo(perfil);
  if (!grupo) return null;

  const { data } = await supabase
    .from("asignaciones")
    .select("id, descripcion, fecha_entrega, modulo:modulos(titulo, orden)")
    .eq("grupo_id", grupo.id)
    .order("fecha_entrega", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
