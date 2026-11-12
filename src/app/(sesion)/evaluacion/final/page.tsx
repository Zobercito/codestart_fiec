import { notFound, redirect } from "next/navigation";
import { obtenerMiPerfil, obtenerRutaDeModulos } from "@/lib/auth/dal";
import { puedeModoClase } from "@/lib/auth/roles";
import { calcularEstadosModulos } from "@/lib/progreso/calculo";
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

  // L6: la evaluación final exige haber completado los módulos 1–7.
  // El docente entra siempre como demostración.
  if (perfil.rol === "estudiante") {
    const ruta = await obtenerRutaDeModulos(perfil);
    const { modulos, moduloEnCurso } = calcularEstadosModulos(ruta);
    const pendientes = modulos.filter(
      (m) => m.orden <= 7 && m.total > 0 && m.estado !== "completado",
    );
    if (pendientes.length > 0) {
      redirect(moduloEnCurso ? `/modulos/${moduloEnCurso.orden}` : "/modulos");
    }
  }

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
