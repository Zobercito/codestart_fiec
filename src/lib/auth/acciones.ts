"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { crearClienteSupabase } from "@/lib/supabase/server";

/**
 * Acciones de acceso de la plataforma.
 *
 * El rol lo decide el administrador: el registro publico siempre crea
 * estudiantes. Un docente se crea desde el panel o con un script, nunca
 * desde el formulario abierto.
 */

const esquemaCorreo = z.string().email("Escribe un correo válido.");
const esquemaContrasena = z
  .string()
  .min(8, "La contraseña necesita al menos 8 caracteres.");

const esquemaRegistro = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre."),
  correo: esquemaCorreo,
  contrasena: esquemaContrasena,
});

const esquemaAcceso = z.object({
  correo: esquemaCorreo,
  contrasena: z.string().min(1, "Escribe tu contraseña."),
});

export type EstadoAcceso =
  | { ok: true }
  | { ok: false; error: string; campos?: Record<string, string> };

export async function registrarse(
  _estadoAnterior: EstadoAcceso | null,
  datos: FormData,
): Promise<EstadoAcceso> {
  const parseo = esquemaRegistro.safeParse({
    nombre: datos.get("nombre"),
    correo: datos.get("correo"),
    contrasena: datos.get("contrasena"),
  });

  if (!parseo.success) {
    const campos: Record<string, string> = {};
    for (const fallo of parseo.error.issues) {
      campos[String(fallo.path[0])] = fallo.message;
    }
    return { ok: false, error: "Revisa los datos marcados.", campos };
  }

  const { nombre, correo, contrasena } = parseo.data;
  const supabase = await crearClienteSupabase();

  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      // el trigger trg_crear_perfil crea el perfil con este rol
      data: { nombre, rol: "estudiante" },
    },
  });

  if (error) {
    // El trigger crea el perfil a partir de los metadatos; si la sesion
    // no se abre porque el correo necesita confirmacion, el perfil
    // tambien habra que crearlo despues.
    if (/already registered|already been registered/i.test(error.message)) {
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    }
    return { ok: false, error: error.message };
  }

  if (!data.session) {
    // El proyecto exige confirmar el correo: hay que avisar.
    return {
      ok: false,
      error:
        "Te enviamos un correo para confirmar la cuenta. Revisa tu bandeja (y la carpeta de spam) antes de entrar.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

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
