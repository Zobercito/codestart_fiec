import { NextResponse } from "next/server";
import { z } from "zod";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { consumirLimite } from "@/lib/api/limite";

const LIMITE_PETICION = 64 * 1024;
const LIMITE_CODIGO = 20_000;

const esquemaBorrador = z
  .object({ codigo: z.string().max(LIMITE_CODIGO) })
  .strict();

/**
 * Autoguardado del codigo que el estudiante esta escribiendo (RF11).
 *
 * El borrador es suyo y solo suyo: la politica de RLS de la tabla
 * codigos lo garantiza, y el servidor comprueba ademas la sesion.
 *
 * L2: las pistas ya no se aceptan desde aqui; van por POST /pista.
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

  if (!consumirLimite(`borrador:${user.id}`, 120, 60_000)) {
    return NextResponse.json(
      { error: "Demasiados autoguardados seguidos." },
      { status: 429 },
    );
  }

  let cuerpo: z.infer<typeof esquemaBorrador>;
  try {
    const texto = await peticion.text();
    if (texto.length > LIMITE_PETICION) {
      return NextResponse.json(
        { error: "El borrador es demasiado grande." },
        { status: 413 },
      );
    }
    cuerpo = esquemaBorrador.parse(JSON.parse(texto));
  } catch {
    return NextResponse.json({ error: "Peticion invalida." }, { status: 400 });
  }

  const { error } = await supabase.from("codigos").upsert(
    {
      usuario_id: user.id,
      reto_id: id,
      codigo: cuerpo.codigo,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "usuario_id,reto_id" },
  );

  if (error) {
    return NextResponse.json(
      { error: "No se pudo guardar el borrador." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
