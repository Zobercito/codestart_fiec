import { notFound } from "next/navigation";
import { obtenerMiPerfil } from "@/lib/auth/dal";
import { puedeModoClase } from "@/lib/auth/roles";
import {
  contarIntentosEvaluacion,
  obtenerEvaluacionFinal,
} from "@/lib/evaluacion/dal";
import { PantallaEvaluacion } from "@/components/evaluacion/pantalla-evaluacion";

export const instant = false;

export const metadata = { title: "Evaluación final · CodeStart FIEC" };

/** Evaluación formativa final del curso. */
export default async function PaginaEvaluacionFinal() {
  const perfil = await obtenerMiPerfil();
  if (!perfil) notFound();

  const evaluacion = await obtenerEvaluacionFinal();
  if (!evaluacion) notFound();

  // El docente siempre ve la evaluación como demostración, sin entregar.
  const modoClase = puedeModoClase(perfil.rol);
  const intentosHechos = await contarIntentosEvaluacion(evaluacion.id);

  return (
    <PantallaEvaluacion
      datos={{ evaluacion, intentosHechos, modoClase }}
    />
  );
}
