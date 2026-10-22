import { NextResponse } from "next/server";
import { crearClienteSupabase } from "@/lib/supabase/server";

/**
 * Autoguardado del codigo que el estudiante esta escribiendo (RF11).
 *
 * El borrador es suyo y solo suyo: la politica de RLS de la tabla
 * codigos lo garantiza, y el servidor comprueba ademas la sesion.
 */
export async function PUT(
  peticion: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await crearClienteSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  let cuerpo: { codigo?: string; pistasUsadas?: number };
  try {
    cuerpo = await peticion.json();
  } catch {
    return NextResponse.json({ error: "Peticion invalida." }, { status: 400 });
  }

  const codigo = String(cuerpo.codigo ?? "");
  const pistasUsadas = Math.max(0, Math.min(3, Number(cuerpo.pistasUsadas ?? 0)));

  const { error } = await supabase.from("codigos").upsert(
    {
      usuario_id: user.id,
      reto_id: id,
      codigo,
      pistas_usadas: pistasUsadas,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "usuario_id,reto_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
