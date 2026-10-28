"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { obtenerMiPerfil } from "@/lib/auth/dal";

/**
 * Acciones del panel docente.
 *
 * La autorización no se queda en la acción: el RLS de Postgres vuelve a
 * comprobar que el grupo sea del docente. La acción valida antes para
 * devolver un error legible en lugar de un 403 de PostgREST.
 */

export type EstadoAccionDocente =
  | { ok: true; mensaje: string; id?: string }
  | { ok: false; error: string; campos?: Record<string, string> };

const esquemaGrupo = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre necesita al menos 3 caracteres.")
    .max(80, "El nombre es demasiado largo."),
  codigo: z
    .string()
    .trim()
    .min(4, "El código necesita al menos 4 caracteres.")
    .max(24, "El código es demasiado largo.")
    .regex(
      /^[A-Z0-9-]+$/,
      "Usa solo mayúsculas, números y guiones en el código.",
    ),
  periodo_inicio: z.string().trim(),
  periodo_fin: z.string().trim(),
});

const esquemaAsignacion = z.object({
  grupo_id: z.string().uuid("Elige un grupo válido."),
  destino: z.string().min(3, "Elige un módulo o un reto."),
  fecha_entrega: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha de entrega válida."),
  descripcion: z.string().trim().max(280, "La descripción es demasiado larga."),
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function texto(valor: FormDataEntryValue | null): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function generarCodigo(nombre: string): string {
  const base = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12);

  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || "FIEC"}-${sufijo}`;
}

export async function crearGrupo(
  _estadoAnterior: EstadoAccionDocente | null,
  datos: FormData,
): Promise<EstadoAccionDocente> {
  const perfil = await obtenerMiPerfil();
  if (!perfil) return { ok: false, error: "No hay sesión activa." };
  if (perfil.rol === "estudiante") {
    return { ok: false, error: "Solo un docente puede crear grupos." };
  }

  const nombre = texto(datos.get("nombre"));
  const codigoIngresado = texto(datos.get("codigo"));
  const codigo = codigoIngresado || generarCodigo(nombre);

  const parseo = esquemaGrupo.safeParse({
    nombre,
    codigo,
    periodo_inicio: texto(datos.get("periodo_inicio")),
    periodo_fin: texto(datos.get("periodo_fin")),
  });

  if (!parseo.success) {
    const campos: Record<string, string> = {};
    for (const problema of parseo.error.issues) {
      const clave = String(problema.path[0] ?? "");
      if (clave && !campos[clave]) campos[clave] = problema.message;
    }
    return {
      ok: false,
      error: "Revisa los datos del grupo.",
      campos,
    };
  }

  const { periodo_inicio, periodo_fin } = parseo.data;
  if (periodo_inicio && periodo_fin && periodo_inicio > periodo_fin) {
    return {
      ok: false,
      error: "El período no puede terminar antes de empezar.",
      campos: { periodo_fin: "La fecha final debe ser posterior al inicio." },
    };
  }

  const supabase = await crearClienteSupabase();
  const { data, error } = await supabase
    .from("grupos")
    .insert({
      nombre: parseo.data.nombre,
      codigo_inscripcion: parseo.data.codigo.toUpperCase(),
      docente_id: perfil.id,
      periodo_inicio: periodo_inicio || null,
      periodo_fin: periodo_fin || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Ese código ya está en uso. Prueba con otro.",
        campos: { codigo: "El código debe ser único." },
      };
    }
    return { ok: false, error: "No se pudo crear el grupo. Intenta de nuevo." };
  }

  revalidatePath("/docente");
  revalidatePath("/docente/grupos");
  revalidatePath("/dashboard");

  return {
    ok: true,
    id: data.id,
    mensaje: `Grupo creado. Comparte el código ${parseo.data.codigo.toUpperCase()}.`,
  };
}

export async function crearAsignacion(
  _estadoAnterior: EstadoAccionDocente | null,
  datos: FormData,
): Promise<EstadoAccionDocente> {
  const perfil = await obtenerMiPerfil();
  if (!perfil) return { ok: false, error: "No hay sesión activa." };
  if (perfil.rol === "estudiante") {
    return { ok: false, error: "Solo un docente puede asignar trabajo." };
  }

  const parseo = esquemaAsignacion.safeParse({
    grupo_id: texto(datos.get("grupo_id")),
    destino: texto(datos.get("destino")),
    fecha_entrega: texto(datos.get("fecha_entrega")),
    descripcion: texto(datos.get("descripcion")),
  });

  if (!parseo.success) {
    const campos: Record<string, string> = {};
    for (const problema of parseo.error.issues) {
      const clave = String(problema.path[0] ?? "");
      if (clave && !campos[clave]) campos[clave] = problema.message;
    }
    return { ok: false, error: "Revisa los datos de la asignación.", campos };
  }

  const { grupo_id, destino, fecha_entrega, descripcion } = parseo.data;
  const [tipo, id] = destino.split(":");
  if ((tipo !== "modulo" && tipo !== "reto") || !id || !UUID.test(id)) {
    return { ok: false, error: "Elige un módulo o un reto válido." };
  }

  const supabase = await crearClienteSupabase();

  const { data: grupo } = await supabase
    .from("grupos")
    .select("id, docente_id")
    .eq("id", grupo_id)
    .maybeSingle();

  if (!grupo) {
    return { ok: false, error: "El grupo no existe o no tienes acceso." };
  }
  if (perfil.rol !== "admin" && grupo.docente_id !== perfil.id) {
    return { ok: false, error: "Ese grupo no es tuyo." };
  }

  if (tipo === "modulo") {
    const { data: modulo } = await supabase
      .from("modulos")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (!modulo) return { ok: false, error: "El módulo no existe." };
  } else {
    const { data: reto } = await supabase
      .from("retos")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (!reto) return { ok: false, error: "El reto no existe." };
  }

  const hoy = new Date().toISOString().slice(0, 10);
  if (fecha_entrega < hoy) {
    return {
      ok: false,
      error: "La fecha de entrega no puede ser anterior a hoy.",
      campos: { fecha_entrega: "Elige hoy o una fecha futura." },
    };
  }

  const { error } = await supabase.from("asignaciones").insert({
    grupo_id,
    modulo_id: tipo === "modulo" ? id : null,
    reto_id: tipo === "reto" ? id : null,
    descripcion: descripcion || null,
    fecha_entrega,
    creada_por: perfil.id,
  });

  if (error) {
    return {
      ok: false,
      error: "No se pudo crear la asignación. Intenta de nuevo.",
    };
  }

  revalidatePath("/docente");
  revalidatePath(`/docente/grupo/${grupo_id}`);
  revalidatePath("/docente/asignar");
  revalidatePath("/dashboard");

  return { ok: true, mensaje: "Asignación creada. El estudiante ya la puede ver." };
}
