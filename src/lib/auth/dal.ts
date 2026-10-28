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
  acepta_privacidad: boolean;
  fecha_aceptacion: string | null;
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
    .select("id, nombre, correo, rol, acepta_privacidad, fecha_aceptacion")
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

  const [{ data: modulos }, { data: lecciones }, { data: progresos }] =
    await Promise.all([
      supabase.from("modulos").select("*").order("orden"),
      supabase.from("lecciones").select("id, modulo_id"),
      supabase
        .from("progresos")
        .select("leccion_id, estado")
        .eq("usuario_id", perfil.id),
    ]);

  // El total sale de las lecciones reales, no de las filas de progreso:
  // un módulo con dos lecciones y una vista debe dar 50 %, no 100 %.
  const totalPorModulo = new Map<string, number>();
  for (const leccion of lecciones ?? []) {
    totalPorModulo.set(
      leccion.modulo_id,
      (totalPorModulo.get(leccion.modulo_id) ?? 0) + 1,
    );
  }

  const progresoPorLeccion = new Map(
    (progresos ?? []).map((p) => [p.leccion_id, p.estado as string]),
  );

  const completadasPorModulo = new Map<string, number>();
  const enProgresoPorModulo = new Map<string, boolean>();

  for (const leccion of lecciones ?? []) {
    const estado = progresoPorLeccion.get(leccion.id);
    if (estado === "completado") {
      completadasPorModulo.set(
        leccion.modulo_id,
        (completadasPorModulo.get(leccion.modulo_id) ?? 0) + 1,
      );
    }
    if (estado === "en_progreso") {
      enProgresoPorModulo.set(leccion.modulo_id, true);
    }
  }

  return (modulos ?? []).map((m) => ({
    ...m,
    total: totalPorModulo.get(m.id) ?? 0,
    completadas: completadasPorModulo.get(m.id) ?? 0,
    enProgreso: enProgresoPorModulo.get(m.id) ?? false,
  }));
}

/** La asignacion vigente del grupo, con su fecha de entrega. */
export async function obtenerMiTarea(perfil: Perfil) {
  const supabase = await crearClienteSupabase();
  const grupo = await obtenerMiGrupo(perfil);
  if (!grupo) return null;

  const { data } = await supabase
    .from("asignaciones")
    .select(
      "id, descripcion, fecha_entrega, creado_en, modulo:modulos(titulo, orden), reto:retos(id, enunciado)",
    )
    .eq("grupo_id", grupo.id)
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
