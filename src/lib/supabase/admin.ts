import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types.generados";

/**
 * Cliente con service_role, confinado al servidor (L3/L4).
 *
 * Lo usan solo las rutas y acciones que necesitan leer las reglas de un
 * reto o escribir intentos y progresos: esas columnas y escrituras ya no
 * están abiertas al cliente. `server-only` hace que el build falle si
 * algún componente cliente lo importa.
 *
 * No usa cookies ni sesión: es el rol de servicio, no el del usuario.
 */
export function crearClienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.",
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
