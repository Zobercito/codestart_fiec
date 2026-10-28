import { notFound, redirect } from "next/navigation";
import { obtenerMiPerfil, obtenerRutaDeModulos } from "@/lib/auth/dal";
import { puedeModoClase } from "@/lib/auth/roles";
import { calcularEstadosModulos } from "@/lib/progreso/calculo";
import {
  contarIntentosEvaluacion,
  obtenerEvaluacionDeModulo,
} from "@/lib/evaluacion/dal";
import { PantallaEvaluacion } from "@/components/evaluacion/pantalla-evaluacion";

export const instant = false;

export const metadata = { title: "Autoevaluación · CodeStart FIEC" };

/** Autoevaluación de un módulo (1–7). */
export default async function PaginaEvaluacionModulo({
  params,
}: PageProps<"/evaluacion/[modulo]">) {
  const { modulo: moduloParam } = await params;
  const modulo = Number(moduloParam);
  if (!Number.isInteger(modulo) || modulo < 1 || modulo > 7) notFound();

  const perfil = await obtenerMiPerfil();
  if (!perfil) notFound();

  // La evaluación y la ruta del estudiante se piden a la vez (RNF02).
  const [evaluacion, rutaBase] = await Promise.all([
    obtenerEvaluacionDeModulo(modulo),
    perfil.rol === "estudiante"
      ? obtenerRutaDeModulos(perfil)
      : Promise.resolve(null),
  ]);
  if (!evaluacion) notFound();

  if (perfil.rol === "estudiante" && rutaBase) {
    const { modulos, moduloEnCurso } = calcularEstadosModulos(rutaBase);
    const estado = modulos.find((m) => m.orden === modulo)?.estado;
    if (estado === "bloqueado") {
      redirect(moduloEnCurso ? `/modulos/${moduloEnCurso.orden}` : "/modulos");
    }
  }

  // El docente siempre ve la evaluación como demostración, sin entregar.
  const modoClase = puedeModoClase(perfil.rol);
  const intentosHechos = await contarIntentosEvaluacion(evaluacion.id);

  return (
    <PantallaEvaluacion
      datos={{ evaluacion, intentosHechos, modoClase }}
    />
  );
}
