import { NextResponse } from "next/server";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { obtenerMiPerfil, obtenerRutaDeModulos } from "@/lib/auth/dal";
import { calcularEstadosModulos } from "@/lib/progreso/calculo";
import { analizar } from "@/lib/validacion/motor";
import type { CasoPrueba, Reglas } from "@/lib/validacion/tipos";
import {
  corregirOrdenamiento,
  type ReglasOrdenamiento,
} from "@/lib/retos/ordenamiento";
import {
  corregirAutocompletado,
  type ReglasAutocompletado,
} from "@/lib/retos/autocompletado";
import { calcularEvaluacion } from "@/lib/evaluacion/calcular";
import type { ReglasEvaluacion } from "@/lib/evaluacion/tipos";

/** L8: límites de la verificación (RNF07). */
const LIMITE_PETICION = 64 * 1024; // 64 KB de cuerpo
const LIMITE_CODIGO = 20_000; // 20 KB de código
const TIEMPO_MAXIMO_MS = 5_000;

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
  const admin = crearClienteAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  // Solo los estudiantes entregan intentos. El docente puede abrir el
  // reto en modo demostración, pero no alimentar el análisis del grupo.
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

  const { data: reto } = await admin
    .from("retos")
    .select("id, leccion_id, tipo, enunciado, reglas, casos, pistas, puntos, intentos_maximos")
    .eq("id", id)
    .maybeSingle();

  if (!reto) {
    return NextResponse.json({ error: "El reto no existe." }, { status: 404 });
  }

  // L5 también en la API: un reto de un módulo bloqueado no se puede
  // entregar aunque se llame directamente, sin pasar por la página.
  const perfilCompleto = await obtenerMiPerfil();
  if (perfilCompleto) {
    const [{ data: leccionReto }, ruta] = await Promise.all([
      supabase
        .from("lecciones")
        .select("modulo:modulos(orden)")
        .eq("id", reto.leccion_id)
        .maybeSingle(),
      obtenerRutaDeModulos(perfilCompleto),
    ]);

    const moduloReto = Array.isArray(leccionReto?.modulo)
      ? leccionReto.modulo[0]
      : leccionReto?.modulo;
    const { modulos } = calcularEstadosModulos(ruta);
    const estado = modulos.find(
      (m) => m.orden === (moduloReto?.orden ?? 0),
    )?.estado;

    if (estado === "bloqueado") {
      return NextResponse.json(
        { error: "Ese módulo todavía está bloqueado. Termina el anterior primero." },
        { status: 403 },
      );
    }
  }

  let cuerpo: {
    codigo?: string;
    eleccion?: string;
    orden?: string[];
    respuestas?: Record<string, string>;
  };
  try {
    // L8: límite de tamaño antes de parsear (RNF07).
    const longitud = Number(peticion.headers.get("content-length") ?? 0);
    if (longitud > LIMITE_PETICION) {
      return NextResponse.json(
        { error: "La entrega es demasiado grande." },
        { status: 413 },
      );
    }
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

  // A4-06.1 y A4-06.2 (F16): agotados los intentos oficiales el
  // estudiante puede seguir practicando, pero el intento no suma puntos.
  const puntuable = quedan > 0;

  /* ── evaluación: autoevaluación o final ───────────────────── */
  const reglasEvaluacion = reto.reglas as ReglasEvaluacion;
  if (
    Array.isArray(reglasEvaluacion?.preguntas) &&
    reglasEvaluacion.preguntas.length > 0 &&
    (reglasEvaluacion.modo === "autoevaluacion" ||
      reglasEvaluacion.modo === "final")
  ) {
    const respuestas = cuerpo.respuestas ?? {};
    const resultado = calcularEvaluacion(
      reglasEvaluacion.preguntas,
      respuestas,
      reglasEvaluacion.umbral ?? 60,
    );
    const puntos =
      resultado.aprobado && puntuable
        ? Math.max(0, reto.puntos - pistasUsadas * 10)
        : 0;

    await admin.from("intentos").insert({
      usuario_id: user.id,
      reto_id: id,
      respuesta: JSON.stringify({ respuestas }),
      resultado,
      error_detectado: resultado.aprobado
        ? null
        : resultado.areasAReforzar.length > 0
          ? `Reforzar: ${resultado.areasAReforzar.join(", ")}`
          : resultado.mensaje,
      acierto: resultado.aprobado,
      puntos_obtenidos: puntos,
    });

    return NextResponse.json({
      evaluacion: resultado,
      resultado,
      acierto: resultado.aprobado,
      puntos,
      error: resultado.aprobado ? undefined : resultado.mensaje,
      intentos: intentosHechos + 1,
      intentosRestantes: Math.max(0, quedan - 1),
      intentosMaximos: reto.intentos_maximos,
      puntuable,
    });
  }

  /* ── reto conceptual: seleccion multiple ──────────────────── */
  if (reto.tipo === "seleccion_multiple") {
    const reglas = reto.reglas as Reglas & {
      opciones?: { id: string; texto: string }[];
      correctas?: string[];
    };
    const correctas = reglas.correctas ?? [];
    const elegida = String(cuerpo.eleccion ?? "");
    const acierto = elegida !== "" && correctas.includes(elegida);
    const puntos =
      acierto && puntuable ? Math.max(0, reto.puntos - pistasUsadas * 10) : 0;

    const mensaje = acierto
      ? null
      : "Esa no es la respuesta correcta. Vuelve a leer la leccion: fíjate en qué se guarda de verdad una variable.";

    await admin.from("intentos").insert({
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
      puntuable,
    });
  }

  /* ── ordenamiento ─────────────────────────────────────────── */
  if (reto.tipo === "ordenamiento") {
    const reglas = reto.reglas as ReglasOrdenamiento;
    const orden = Array.isArray(cuerpo.orden) ? cuerpo.orden.map(String) : [];
    const resultado = corregirOrdenamiento(orden, reglas);
    const puntos =
      resultado.acierto && puntuable
        ? Math.max(0, reto.puntos - pistasUsadas * 10)
        : 0;

    await admin.from("intentos").insert({
      usuario_id: user.id,
      reto_id: id,
      respuesta: JSON.stringify({ orden }),
      resultado,
      error_detectado: resultado.mensaje,
      acierto: resultado.acierto,
      puntos_obtenidos: puntos,
    });

    return NextResponse.json({
      resultado,
      acierto: resultado.acierto,
      puntos,
      error: resultado.mensaje ?? undefined,
      intentos: intentosHechos + 1,
      intentosRestantes: Math.max(0, quedan - 1),
      intentosMaximos: reto.intentos_maximos,
      puntuable,
    });
  }

  /* ── autocompletado ───────────────────────────────────────── */
  if (reto.tipo === "autocompletado") {
    const reglas = reto.reglas as ReglasAutocompletado;
    const respuestas = cuerpo.respuestas ?? {};
    const resultado = corregirAutocompletado(respuestas, reglas);
    const puntos =
      resultado.acierto && puntuable
        ? Math.max(0, reto.puntos - pistasUsadas * 10)
        : 0;

    await admin.from("intentos").insert({
      usuario_id: user.id,
      reto_id: id,
      respuesta: JSON.stringify({ respuestas }),
      resultado,
      error_detectado: resultado.mensaje,
      acierto: resultado.acierto,
      puntos_obtenidos: puntos,
    });

    return NextResponse.json({
      resultado,
      acierto: resultado.acierto,
      puntos,
      error: resultado.mensaje ?? undefined,
      intentos: intentosHechos + 1,
      intentosRestantes: Math.max(0, quedan - 1),
      intentosMaximos: reto.intentos_maximos,
      puntuable,
    });
  }

  if (reto.tipo !== "codigo") {
    return NextResponse.json(
      { error: "Este tipo de reto todavia no se puede verificar." },
      { status: 400 },
    );
  }

  const codigo = String(cuerpo.codigo ?? "");

  // L8: el código también tiene su propio límite.
  if (codigo.length > LIMITE_CODIGO) {
    return NextResponse.json(
      { error: `El código supera el límite de ${LIMITE_CODIGO} caracteres.` },
      { status: 413 },
    );
  }

  const inicio = performance.now();
  const resultado = analizar(
    codigo,
    reto.reglas as Reglas,
    (reto.casos ?? []) as CasoPrueba[],
  );

  // RNF07: el análisis no debe tardar más de 5 s.
  if (performance.now() - inicio > TIEMPO_MAXIMO_MS) {
    return NextResponse.json(
      { error: "El análisis tardó demasiado. Simplifica el programa." },
      { status: 422 },
    );
  }

  const acierto = resultado.ok;
  const errorDetectado =
    resultado.errores[0]?.mensaje ??
    resultado.casos.find((c) => !c.coincide)?.error ??
    null;

  // Cada pista revelada cuesta 10 puntos.
  const puntos =
    acierto && puntuable ? Math.max(0, reto.puntos - pistasUsadas * 10) : 0;

  await admin.from("intentos").insert({
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
    puntuable,
  });
}
