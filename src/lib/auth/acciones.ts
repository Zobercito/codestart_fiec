"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { crearClienteSupabase } from "@/lib/supabase/server";

/**
 * Acciones de acceso de la plataforma.
 *
 * No hay registro publico: las cuentas las crea el docente o el
 * administrador con `scripts/crear-usuarios.mjs`, y el usuario solo
 * inicia sesion con la cuenta institucional que se le asigno.
 */

const esquemaCorreo = z.string().email("Escribe un correo válido.");

const esquemaAcceso = z.object({
  correo: esquemaCorreo,
  contrasena: z.string().min(1, "Escribe tu contraseña."),
});

export type EstadoAcceso =
  | { ok: true }
  | { ok: false; error: string; campos?: Record<string, string> };

export async function entrar(
  _estadoAnterior: EstadoAcceso | null,
  datos: FormData,
): Promise<EstadoAcceso> {
  const parseo = esquemaAcceso.safeParse({
    correo: datos.get("correo"),
    contrasena: datos.get("contrasena"),
  });

  if (!parseo.success) {
    return { ok: false, error: "Escribe el correo y la contraseña." };
  }

  const { correo, contrasena } = parseo.data;
  const supabase = await crearClienteSupabase();

  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    if (/Invalid login credentials/i.test(error.message)) {
      return { ok: false, error: "El correo o la contraseña no son correctos." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function salir() {
  const supabase = await crearClienteSupabase();
  await supabase.auth.signOut();
  revalidatePath("/dashboard");
  redirect("/login");
}
