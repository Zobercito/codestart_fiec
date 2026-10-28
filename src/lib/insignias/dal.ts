import "server-only";

import { cache } from "react";
import { crearClienteSupabase } from "@/lib/supabase/server";
import type { Perfil } from "@/lib/auth/dal";

export type InsigniaGanada = {
  tipo: string;
  descripcion: string | null;
  fecha: string;
};

/**
 * Insignias del usuario. La RLS deja ver solo las propias (o las de
 * los estudiantes de un grupo, para el docente).
 */
export const obtenerMisInsignias = cache(
  async (perfil: Perfil): Promise<InsigniaGanada[]> => {
    const supabase = await crearClienteSupabase();
    const { data } = await supabase
      .from("insignias")
      .select("tipo, descripcion, fecha")
      .eq("usuario_id", perfil.id)
      .order("fecha", { ascending: false });

    return data ?? [];
  },
);
