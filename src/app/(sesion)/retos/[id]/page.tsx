import { notFound, redirect } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { obtenerMiPerfil, obtenerRutaDeModulos } from "@/lib/auth/dal";
import { puedeModoClase } from "@/lib/auth/roles";
import { calcularEstadosModulos } from "@/lib/progreso/calculo";
import { PantallaReto, type DatosReto } from "@/components/retos/pantalla-reto";
import { PantallaRetoConceptual } from "@/components/retos/pantalla-reto-conceptual";
import { PantallaOrdenamiento } from "@/components/retos/pantalla-ordenamiento";
import { PantallaAutocompletado } from "@/components/retos/pantalla-autocompletado";
import { PantallaEvaluacion } from "@/components/evaluacion/pantalla-evaluacion";
import type { CasoPrueba, Reglas } from "@/lib/validacion/tipos";
import type { ReglasOrdenamiento } from "@/lib/retos/ordenamiento";
import type { ReglasAutocompletado } from "@/lib/retos/autocompletado";
import type { ReglasEvaluacion } from "@/lib/evaluacion/tipos";

/**
 * Vista de un reto.
 *
 * El reto puede ser de codigo (se valida con el motor de analisis) o
 * conceptual (seleccion multiple, se corrige en el servidor).
 */
export default async function PaginaReto({
  params,
}: PageProps<"/retos/[id]">) {
  const { id } = await params;

  const perfil = await obtenerMiPerfil();
  if (!perfil) notFound();

  // El docente siempre ve el reto como demostración: sin entrega ni
  // pistas que gasten puntos. El estudiante nunca entra en ese modo.
  const modoClase = puedeModoClase(perfil.rol);

  const supabase = await crearClienteSupabase();
  const admin = crearClienteAdmin();

  // L3: `reglas` ya no es legible por el cliente. La página las lee con
  // service_role y solo envía al navegador lo que el reto necesita.
  const { data: reto } = await admin
    .from("retos")
    .select("id, leccion_id, tipo, enunciado, enunciado_detalle, reglas, casos, pistas, puntos, intentos_maximos")
    .eq("id", id)
    .maybeSingle();

  if (!reto) notFound();

  // Lección, borrador e intentos solo dependen del reto: se piden juntos
  // para no encadenar viajes a la base (RNF02). La ruta de módulos se pide
  // también para respetar el bloqueo secuencial (L5).
  const [
    { data: leccion },
    { data: borrador },
    { data: intentos },
    rutaBase,
  ] = await Promise.all([
    supabase
      .from("lecciones")
      .select("id, titulo, orden, modulo_id, modulo:modulos(titulo, orden)")
      .eq("id", reto.leccion_id)
      .maybeSingle(),
    supabase
      .from("codigos")
      .select("codigo, pistas_usadas")
      .eq("usuario_id", perfil.id)
      .eq("reto_id", reto.id)
      .maybeSingle(),
    supabase
      .from("intentos")
      .select("id")
      .eq("usuario_id", perfil.id)
      .eq("reto_id", reto.id),
    perfil.rol === "estudiante"
      ? obtenerRutaDeModulos(perfil)
      : Promise.resolve(null),
  ]);

  if (!leccion) notFound();

  const modulo = Array.isArray(leccion.modulo) ? leccion.modulo[0] : leccion.modulo;

  // L5: un reto de un módulo bloqueado no se abre por URL.
  if (perfil.rol === "estudiante" && rutaBase) {
    const { modulos, moduloEnCurso } = calcularEstadosModulos(rutaBase);
    const estado = modulos.find((m) => m.orden === (modulo?.orden ?? 1))?.estado;
    if (estado === "bloqueado") {
      redirect(moduloEnCurso ? `/modulos/${moduloEnCurso.orden}` : "/modulos");
    }
  }

  const datosLeccion = {
    titulo: leccion.titulo,
    orden: leccion.orden,
    moduloTitulo: modulo?.titulo ?? "",
    moduloOrden: modulo?.orden ?? 1,
  };

  /* ── evaluación: autoevaluación o final ───────────────────── */
  const reglasEvaluacion = reto.reglas as ReglasEvaluacion;
  if (
    Array.isArray(reglasEvaluacion?.preguntas) &&
    reglasEvaluacion.preguntas.length > 0 &&
    (reglasEvaluacion.modo === "autoevaluacion" ||
      reglasEvaluacion.modo === "final")
  ) {
    return (
      <PantallaEvaluacion
        datos={{
          evaluacion: {
            id: reto.id,
            titulo: reglasEvaluacion.titulo ?? reto.enunciado,
            descripcion: reto.enunciado_detalle,
            modo: reglasEvaluacion.modo,
            modulo: reglasEvaluacion.modulo ?? null,
            moduloTitulo: modulo?.titulo ?? null,
            umbral: reglasEvaluacion.umbral ?? 60,
            puntos: reto.puntos,
            intentosMaximos: reto.intentos_maximos,
            preguntas: reglasEvaluacion.preguntas.map((pregunta) => ({
              id: pregunta.id,
              enunciado: pregunta.enunciado,
              opciones: pregunta.opciones,
              area: pregunta.area,
            })),
          },
          intentosHechos: intentos?.length ?? 0,
          modoClase,
        }}
      />
    );
  }

  /* ── ordenamiento ─────────────────────────────────────────── */
  if (reto.tipo === "ordenamiento") {
    const reglas = reto.reglas as ReglasOrdenamiento;
    return (
      <PantallaOrdenamiento
        datos={{
          reto: {
            id: reto.id,
            enunciado: reto.enunciado,
            enunciado_detalle: reto.enunciado_detalle,
            elementos: reglas.elementos ?? [],
            pistas: (reto.pistas ?? []) as { nivel: number; texto: string }[],
            puntos: reto.puntos,
            intentos_maximos: reto.intentos_maximos,
          },
          intentosHechos: intentos?.length ?? 0,
          leccion: datosLeccion,
          modoClase,
        }}
      />
    );
  }

  /* ── autocompletado ───────────────────────────────────────── */
  if (reto.tipo === "autocompletado") {
    const reglas = reto.reglas as ReglasAutocompletado;
    // L1: no enviar correcta ni explicacion al cliente.
    const blancosPublicos = (reglas.blancos ?? []).map((b) => ({
      id: b.id,
      etiqueta: b.etiqueta,
      opciones: b.opciones,
    }));
    return (
      <PantallaAutocompletado
        datos={{
          reto: {
            id: reto.id,
            enunciado: reto.enunciado,
            enunciado_detalle: reto.enunciado_detalle,
            plantilla: reglas.plantilla ?? "",
            blancos: blancosPublicos,
            pistas: (reto.pistas ?? []) as { nivel: number; texto: string }[],
            puntos: reto.puntos,
            intentos_maximos: reto.intentos_maximos,
          },
          intentosHechos: intentos?.length ?? 0,
          leccion: datosLeccion,
          modoClase,
        }}
      />
    );
  }

  /* ── reto conceptual ──────────────────────────────────────── */
  if (reto.tipo === "seleccion_multiple") {
    const reglas = reto.reglas as Reglas & {
      opciones?: { id: string; texto: string }[];
      correctas?: string[];
    };
    return (
      <PantallaRetoConceptual
        datos={{
          reto: {
            id: reto.id,
            enunciado: reto.enunciado,
            enunciado_detalle: reto.enunciado_detalle,
            opciones: reglas.opciones ?? [],
            pistas: (reto.pistas ?? []) as { nivel: number; texto: string }[],
            puntos: reto.puntos,
            intentos_maximos: reto.intentos_maximos,
          },
          intentosHechos: intentos?.length ?? 0,
          leccion: {
            titulo: leccion.titulo,
            orden: leccion.orden,
            moduloTitulo: modulo?.titulo ?? "",
            moduloOrden: modulo?.orden ?? 1,
          },
          modoClase,
        }}
      />
    );
  }

  /* ── reto de codigo ───────────────────────────────────────── */
  // L7: el código inicial y el fragmento salen de `reglas`, no del
  // componente. El fallback mantiene los retos antiguos que aún no los
  // tengan migrados.
  const reglasCodigo = reto.reglas as Reglas & {
    codigo_inicial?: string;
    fragmento?: string;
  };

  const codigoInicial =
    reglasCodigo.codigo_inicial ??
    `#include <stdio.h>

int main() {
    int edad = 18;
    if (edad > 18) {
        printf("Mayor de edad\\n");
    } else {
        printf("Menor de edad\\n");
    }
    return 0;
}`;

  const fragmento =
    reglasCodigo.fragmento ??
    `if (condicion) {
    instruccion;
} else {
    instruccion;
}`;

  const datos: DatosReto = {
    reto: {
      id: reto.id,
      tipo: reto.tipo,
      enunciado: reto.enunciado,
      enunciado_detalle: reto.enunciado_detalle,
      pistas: (reto.pistas ?? []) as { nivel: number; texto: string }[],
      casos: (reto.casos ?? []) as CasoPrueba[],
      puntos: reto.puntos,
      intentos_maximos: reto.intentos_maximos,
      codigoInicial,
    },
    borrador: borrador ?? null,
    intentosHechos: intentos?.length ?? 0,
    leccion: {
      titulo: leccion.titulo,
      orden: leccion.orden,
      moduloTitulo: modulo?.titulo ?? "",
      moduloOrden: modulo?.orden ?? 1,
    },
    fragmento,
    modoClase,
  };

  return <PantallaReto datos={datos} />;
}
