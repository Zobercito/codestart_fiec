import { connection, NextResponse } from "next/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";

/**
 * Comprobación de salud para el monitor externo (RNF05).
 *
 * No expone datos: solo confirma que la aplicación y la base responden.
 * Si la consulta falla o falta la service_role, devuelve 503.
 */
export async function GET() {
  // El monitor necesita el estado real en cada petición, no una foto
  // del build (Cache Components).
  await connection();

  try {
    const admin = crearClienteAdmin();
    const { error } = await admin
      .from("modulos")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    return NextResponse.json({ ok: true, servicio: "codestart-fiec" });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
