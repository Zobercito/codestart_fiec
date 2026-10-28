"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { obtenerMiPerfil } from "@/lib/auth/dal";
import { rutaDeInicio, type Rol } from "@/lib/auth/roles";

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

  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    if (/Invalid login credentials/i.test(error.message)) {
      return { ok: false, error: "El correo o la contraseña no son correctos." };
    }
    return { ok: false, error: error.message };
  }

  // El rol se lee del perfil, no del formulario: el destino depende de
  // lo que diga la base de datos, no de lo que envie el cliente.
  const usuario = data.user;
  const perfil = usuario
    ? (
        await supabase
          .from("perfiles")
          .select("rol")
          .eq("id", usuario.id)
          .maybeSingle()
      ).data
    : null;

  revalidatePath("/dashboard");
  revalidatePath("/docente");
  redirect(rutaDeInicio((perfil?.rol as Rol | null) ?? null));
}

export async function salir() {
  const supabase = await crearClienteSupabase();
  await supabase.auth.signOut();
  revalidatePath("/dashboard");
  redirect("/login");
}

/**
 * Aceptación del aviso para usuarios que ya existían antes del A4.
 *
 * RLS permite actualizar el propio perfil; el trigger de protección
 * impide que esta acción cambie el rol.
 */
export async function aceptarPrivacidad(): Promise<void> {
  const perfil = await obtenerMiPerfil();
  if (!perfil) redirect("/login");

  const supabase = await crearClienteSupabase();
  const { error } = await supabase
    .from("perfiles")
    .update({
      acepta_privacidad: true,
      fecha_aceptacion: new Date().toISOString(),
    })
    .eq("id", perfil.id);

  if (error) {
    throw new Error("No se pudo guardar la aceptación del aviso de privacidad.");
  }

  revalidatePath("/dashboard");
}
