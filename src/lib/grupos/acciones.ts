"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { obtenerMiPerfil } from "@/lib/auth/dal";

export type EstadoUnirse =
  | { ok: true; mensaje: string }
  | { ok: false; error: string; campos?: Record<string, string> };

const esquema = z.object({
  codigo: z
    .string()
    .trim()
    .min(4, "Escribe el código que te dio el docente.")
    .max(24, "El código es demasiado largo."),
});

/**
 * Un estudiante se inscribe en un grupo con el código que comparte el
 * docente (RF12). La validación real la hace `unirse_por_codigo` en
 * Postgres: aquí solo se comprueba el rol y se traduce el error.
 */
export async function unirseAGrupo(
  _estadoAnterior: EstadoUnirse | null,
  datos: FormData,
): Promise<EstadoUnirse> {
  const perfil = await obtenerMiPerfil();
  if (!perfil) return { ok: false, error: "No hay sesión activa." };
  if (perfil.rol !== "estudiante") {
    return { ok: false, error: "Solo un estudiante se une a un grupo." };
  }

  const entrada = datos.get("codigo");
  const parseo = esquema.safeParse({
    codigo: typeof entrada === "string" ? entrada : "",
  });

  if (!parseo.success) {
    return {
      ok: false,
      error: "Revisa el código del grupo.",
      campos: { codigo: parseo.error.issues[0]?.message ?? "Código inválido." },
    };
  }

  const supabase = await crearClienteSupabase();
  const { error } = await supabase.rpc("unirse_por_codigo", {
    codigo: parseo.data.codigo,
  });

  if (error) {
    if (error.message.toLowerCase().includes("codigo de inscripcion invalido")) {
      return {
        ok: false,
        error: "Ese código no corresponde a ningún grupo activo.",
        campos: { codigo: "Comprueba el código con tu docente." },
      };
    }
    return { ok: false, error: "No se pudo unir al grupo. Intenta de nuevo." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/modulos");
  revalidatePath("/medallas");

  return { ok: true, mensaje: "Te uniste al grupo. Ya puedes ver sus tareas." };
}
