import { NextResponse } from "next/server";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { analizar } from "@/lib/validacion/motor";
import type { CasoPrueba, Reglas } from "@/lib/validacion/tipos";

/**
 * Verificacion de un reto de codigo.
 *
 * El resultado lo calcula el SERVIDOR, no el cliente: el navegador
 * manda el codigo, pero las reglas y los casos de prueba salen de la
 * base de datos, y el estudiante no puede cambiarlos. Si el analisis se
 * hiciera en el cliente, bastaria con falsear la respuesta para
 * "aprobar" cualquier reto.
 *
 * Ademas, cada verificacion se guarda como intento, con el error
 * detectado. Esa tabla es la base del analisis de errores que ve el
 * docente (RF15).
 */
export async function POST(
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

  // Solo los estudiantes entregan intentos: la tabla alimenta el
  // analisis de errores del grupo, no la actividad del docente.
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.rol !== "estudiante") {
    return NextResponse.json(
      { error: "Solo los estudiantes pueden entregar intentos." },
      { status: 403 },
    );
  }

  const { data: reto } = await supabase
    .from("retos")
    .select("id, tipo, enunciado, reglas, casos, pistas, puntos, intentos_maximos")
    .eq("id", id)
    .maybeSingle();

  if (!reto) {
    return NextResponse.json({ error: "El reto no existe." }, { status: 404 });
  }

  let cuerpo: { codigo?: string; eleccion?: string };
  try {
    cuerpo = await peticion.json();
  } catch {
    return NextResponse.json({ error: "Peticion invalida." }, { status: 400 });
  }

  // Cuantas pistas ha pedido NO lo decide el cliente: sale de su
  // borrador, que es lo unico que el servidor le cree. Si el navegador
  // dijera "0 pistas", el descuento por pistas no aplicaria.
  const { data: borrador } = await supabase
    .from("codigos")
    .select("pistas_usadas")
    .eq("usuario_id", user.id)
    .eq("reto_id", id)
    .maybeSingle();

  const pistasUsadas = Math.max(
    0,
    Math.min(
      borrador?.pistas_usadas ?? 0,
      Array.isArray(reto.pistas) ? reto.pistas.length : 0,
    ),
  );

  // Los intentos que el estudiante ya ha hecho: se avisa cuando se
  // agotan, pero la correccion automatica se queda sin puntos.
  const { data: intentosPrevios } = await supabase
    .from("intentos")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("reto_id", id);

  const intentosHechos = intentosPrevios?.length ?? 0;
  const quedan = Math.max(0, reto.intentos_maximos - intentosHechos);

  /* ── reto conceptual: seleccion multiple ──────────────────── */
  if (reto.tipo === "seleccion_multiple") {
    const reglas = reto.reglas as Reglas & {
      opciones?: { id: string; texto: string }[];
      correctas?: string[];
    };
    const correctas = reglas.correctas ?? [];
    const elegida = String(cuerpo.eleccion ?? "");
    const acierto = elegida !== "" && correctas.includes(elegida);
    const puntos = acierto ? Math.max(0, reto.puntos - pistasUsadas * 10) : 0;

    const mensaje = acierto
      ? null
      : "Esa no es la respuesta correcta. Vuelve a leer la leccion: fíjate en qué se guarda de verdad una variable.";

    await supabase.from("intentos").insert({
      usuario_id: user.id,
      reto_id: id,
      respuesta: elegida,
      resultado: { elegida, correctas },
      error_detectado: mensaje,
      acierto,
      puntos_obtenidos: puntos,
    });

    return NextResponse.json({
      acierto,
      puntos,
      error: mensaje ?? undefined,
      intentos: intentosHechos + 1,
      intentosRestantes: Math.max(0, quedan - 1),
      intentosMaximos: reto.intentos_maximos,
    });
  }

  if (reto.tipo !== "codigo") {
    return NextResponse.json(
      { error: "Este tipo de reto todavia no se puede verificar." },
      { status: 400 },
    );
  }

  const codigo = String(cuerpo.codigo ?? "");

  const resultado = analizar(
    codigo,
    reto.reglas as Reglas,
    (reto.casos ?? []) as CasoPrueba[],
  );

  const acierto = resultado.ok;
  const errorDetectado =
    resultado.errores[0]?.mensaje ??
    resultado.casos.find((c) => !c.coincide)?.error ??
    null;

  // Cada pista revelada cuesta 10 puntos.
  const puntos = acierto ? Math.max(0, reto.puntos - pistasUsadas * 10) : 0;

  await supabase.from("intentos").insert({
    usuario_id: user.id,
    reto_id: id,
    codigo_enviado: codigo,
    resultado: {
      casos: resultado.casos.map((c) => ({
        nombre: c.nombre,
        coincide: c.coincide,
        esperado: c.salida_esperada,
        obtenido: c.salida_obtenida,
      })),
      errores: resultado.errores,
    },
    error_detectado: errorDetectado,
    acierto,
    puntos_obtenidos: puntos,
  });

  return NextResponse.json({
    resultado,
    acierto,
    puntos,
    intentos: intentosHechos + 1,
    intentosRestantes: Math.max(0, quedan - 1),
    intentosMaximos: reto.intentos_maximos,
  });
}
