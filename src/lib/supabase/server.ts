import { createServerClient } from "@supabase/ssr";
import { connection } from "next/server";
import { cookies } from "next/headers";
import type { Database } from "./types.generados";

/**
 * Cliente de Supabase para el servidor (Server Components, Route Handlers
 * y Server Actions).
 *
 * En Next.js 16 `cookies()` es asincrono, y escribir cookies falla si
 * la funcion se llamo desde un contexto de solo lectura (por ejemplo,
 * durante el render). Por eso el `setAll` va envuelto en un try: si
 * no se puede renovar la sesion, la peticion sigue igual.
 */
export async function crearClienteSupabase() {
  /*
   * Con Cache Components (Next 16), toda lectura de Supabase es una
   * lectura de la peticion: la sesion vive en una cookie y
   * @supabase/ssr usa Date.now() por dentro. Sin esta llamada, Next
   * intenta prerenderizar rutas que en realidad dependen de quien
   * este conectada, y falla con "unstable value Date.now()".
   *
   * Va aqui, en un solo sitio, porque TODAS las consultas a Supabase
   * de esta app dependen de la sesion.
   */
  await connection();

  const almacenDeCookies = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return almacenDeCookies.getAll();
        },
        setAll(cookiesParaEstablecer) {
          try {
            cookiesParaEstablecer.forEach(({ name, value, options }) => {
              almacenDeCookies.set(name, value, options);
            });
          } catch {
            // Contexto de solo lectura: se ignora. La sesion se renueva
            // en el proxy, que si puede escribir cookies.
          }
        },
      },
    },
  );
}
