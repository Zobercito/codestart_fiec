"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types.generados";

/**
 * Cliente de Supabase para el navegador.
 *
 * Solo lleva la clave anonima: es publica por diseño y lo que protege
 * los datos es el RLS de Postgres, no esta clave.
 */
export function crearClienteSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
