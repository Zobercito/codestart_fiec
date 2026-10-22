import { notFound } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { obtenerMiPerfil } from "@/lib/auth/dal";
import { PantallaReto, type DatosReto } from "@/components/retos/pantalla-reto";
import { PantallaRetoConceptual } from "@/components/retos/pantalla-reto-conceptual";
import type { CasoPrueba, Reglas } from "@/lib/validacion/tipos";

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

  const supabase = await crearClienteSupabase();

  const { data: reto } = await supabase
    .from("retos")
    .select("id, leccion_id, tipo, enunciado, enunciado_detalle, reglas, casos, pistas, puntos, intentos_maximos")
    .eq("id", id)
    .maybeSingle();

  if (!reto) notFound();

  const { data: leccion } = await supabase
    .from("lecciones")
    .select("id, titulo, orden, modulo_id, modulo:modulos(titulo, orden)")
    .eq("id", reto.leccion_id)
    .maybeSingle();

  if (!leccion) notFound();

  const { data: borrador } = await supabase
    .from("codigos")
    .select("codigo, pistas_usadas")
    .eq("usuario_id", perfil.id)
    .eq("reto_id", reto.id)
    .maybeSingle();

  const { data: intentos } = await supabase
    .from("intentos")
    .select("id")
    .eq("usuario_id", perfil.id)
    .eq("reto_id", reto.id);

  const modulo = Array.isArray(leccion.modulo) ? leccion.modulo[0] : leccion.modulo;

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
        }}
      />
    );
  }

  /* ── reto de codigo ───────────────────────────────────────── */
  const codigoInicial = `#include <stdio.h>

int main() {
    int edad = 18;
    if (edad > 18) {
        printf("Mayor de edad\\n");
    } else {
        printf("Menor de edad\\n");
    }
    return 0;
}`;

  const fragmento = `if (condicion) {
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
  };

  return <PantallaReto datos={datos} />;
}
