import { NextResponse } from "next/server";
import { crearClienteSupabase } from "@/lib/supabase/server";

/**
 * Revelar una pista (L2).
 *
 * El descuento de 10 puntos no puede ser evitable: el contador de pistas
 * lo lleva el servidor, no el cliente. Este endpoint incrementa el
 * número en la base de datos y devuelve el nuevo total.
 */
export async function POST(
  _peticion: Request,
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

  // Lee el contador actual.
  const { data: borrador } = await supabase
    .from("codigos")
    .select("pistas_usadas")
    .eq("usuario_id", user.id)
    .eq("reto_id", id)
    .maybeSingle();

  const pistasActuales = borrador?.pistas_usadas ?? 0;
  const nuevasPistas = Math.min(3, pistasActuales + 1);

  // Incrementa en el servidor.
  const { error } = await supabase
    .from("codigos")
    .upsert(
      {
        usuario_id: user.id,
        reto_id: id,
        codigo: "",
        pistas_usadas: nuevasPistas,
      },
      { onConflict: "usuario_id,reto_id" },
    );

  if (error) {
    return NextResponse.json(
      { error: "No se pudo guardar la pista." },
      { status: 500 },
    );
  }

  return NextResponse.json({ pistasUsadas: nuevasPistas });
}
