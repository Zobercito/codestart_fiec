import { createServerClient } from "@supabase/ssr";
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
