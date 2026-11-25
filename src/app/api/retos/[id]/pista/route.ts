import { NextResponse } from "next/server";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { consumirLimite } from "@/lib/api/limite";

type Pista = { nivel: number; texto: string };

/**
 * Revelar una pista (L2).
 *
 * El contador lo lleva el servidor y las pistas ya no son legibles por el
 * cliente (`retos.pistas` está revocado). Este endpoint devuelve **solo la
 * pista nueva**: la anterior ya la tiene el navegador y las siguientes no
 * deben salir hasta que se paguen.
 *
 * La escritura va con service_role porque `codigos.pistas_usadas` no es
 * escribible por el estudiante. El `upsert` no incluye `codigo`, así que
 * no borra el borrador que se está guardando en paralelo.
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

  if (!consumirLimite(`pista:${user.id}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "Demasiadas peticiones de pistas seguidas." },
      { status: 429 },
    );
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.rol !== "estudiante") {
    return NextResponse.json(
      { error: "Solo los estudiantes revelan pistas." },
      { status: 403 },
    );
  }

  const admin = crearClienteAdmin();
  const { data: reto } = await admin
    .from("retos")
    .select("id, pistas")
    .eq("id", id)
    .maybeSingle();

  if (!reto) {
    return NextResponse.json({ error: "El reto no existe." }, { status: 404 });
  }

  const pistas = Array.isArray(reto.pistas)
    ? (reto.pistas as unknown as Pista[])
    : [];

  if (pistas.length === 0) {
    return NextResponse.json({ pistasUsadas: 0, pista: null });
  }

  const { data: borrador } = await admin
    .from("codigos")
    .select("pistas_usadas")
    .eq("usuario_id", user.id)
    .eq("reto_id", id)
    .maybeSingle();

  const usadas = Math.min(
    Math.max(0, borrador?.pistas_usadas ?? 0),
    pistas.length,
  );

  if (usadas >= pistas.length) {
    return NextResponse.json({
      pistasUsadas: pistas.length,
      pista: null,
    });
  }

  const nuevas = usadas + 1;

  const { error } = await admin.from("codigos").upsert(
    {
      usuario_id: user.id,
      reto_id: id,
      pistas_usadas: nuevas,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "usuario_id,reto_id" },
  );

  if (error) {
    return NextResponse.json(
      { error: "No se pudo guardar la pista." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    pistasUsadas: nuevas,
    pista: pistas[usadas],
  });
}
