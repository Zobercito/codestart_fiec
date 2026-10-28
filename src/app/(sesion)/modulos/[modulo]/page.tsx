import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerMiPerfil, obtenerRutaDeModulos } from "@/lib/auth/dal";
import { calcularEstadosModulos } from "@/lib/progreso/calculo";
import { crearClienteSupabase } from "@/lib/supabase/server";
import {
  obtenerEvaluacionDeModulo,
  obtenerEvaluacionFinal,
} from "@/lib/evaluacion/dal";

/** Lecciones de un modulo, con el estado de cada una. */
export const instant = false;

export default async function PaginaModulo({
  params,
}: PageProps<"/modulos/[modulo]">) {
  const { modulo: ordenModulo } = await params;

  const perfil = await obtenerMiPerfil();
  if (!perfil) notFound();

  const supabase = await crearClienteSupabase();

  // La ruta de módulos no depende del módulo pedido: se consultan a la
  // vez para no encadenar viajes a la base (RNF02).
  const [{ data: modulo }, rutaBase] = await Promise.all([
    supabase
      .from("modulos")
      .select("id, titulo, orden, descripcion")
      .eq("orden", Number(ordenModulo))
      .maybeSingle(),
    obtenerRutaDeModulos(perfil),
  ]);

  if (!modulo) notFound();

  const [{ data: lecciones }, { data: progresos }, evaluacion] = await Promise.all([
    supabase
      .from("lecciones")
      .select("id, titulo, orden, duracion_min")
      .eq("modulo_id", modulo.id)
      .order("orden"),
    supabase
      .from("progresos")
      .select("leccion_id, estado")
      .eq("usuario_id", perfil.id),
    modulo.orden <= 7
      ? obtenerEvaluacionDeModulo(modulo.orden)
      : obtenerEvaluacionFinal(),
  ]);

  const estadoDe = new Map(
    (progresos ?? []).map((p) => [p.leccion_id, p.estado as string]),
  );

  const { modulos: ruta, moduloEnCurso } = calcularEstadosModulos(rutaBase);
  const estadoModulo = ruta.find((m) => m.id === modulo.id)?.estado;

  if (perfil.rol === "estudiante" && estadoModulo === "bloqueado") {
    redirect(moduloEnCurso ? `/modulos/${moduloEnCurso.orden}` : "/modulos");
  }

  const enCurso = moduloEnCurso;
  const rutaEvaluacion =
    modulo.orden <= 7 ? `/evaluacion/${modulo.orden}` : "/evaluacion/final";

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-600">
        <Link href="/modulos" className="font-semibold text-fiec-700 hover:underline">
          Ruta de módulos
        </Link>
        <span className="text-slate-600">›</span>
        <span className="font-semibold text-slate-800">Módulo {modulo.orden}</span>
      </nav>

      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
        {modulo.titulo}
      </h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{modulo.descripcion}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(lecciones ?? []).map((l) => {
          const estado = estadoDe.get(l.id) ?? "pendiente";
          return (
            <Link
              key={l.id}
              href={`/modulos/${modulo.orden}/lecciones/${l.orden}`}
              className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-fiec-50 text-sm font-extrabold text-fiec-700">
                  {l.orden}
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold leading-snug text-slate-900">{l.titulo}</h2>
                  <p className="mt-1 text-[11.5px] text-slate-500">
                    {l.duracion_min ? `${l.duracion_min} min` : "—"}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                    estado === "completado"
                      ? "bg-coder-100 text-coder-700"
                      : estado === "en_progreso"
                        ? "bg-fiec-50 text-fiec-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {estado === "completado"
                    ? "✓ Vista"
                    : estado === "en_progreso"
                      ? "● A medias"
                      : "○ Sin ver"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {evaluacion ? (
        <section className="mt-6 rounded-2xl border border-fiec-200 bg-fiec-50/70 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fiec-600 text-lg text-white">
              <span aria-hidden="true">📝</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-fiec-700">
                {modulo.orden <= 7 ? "Autoevaluación" : "Evaluación final"}
              </div>
              <h2 className="mt-0.5 text-sm font-extrabold text-slate-900">
                {evaluacion.titulo}
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-700">
                {evaluacion.preguntas.length} preguntas ·{" "}
                {evaluacion.umbral} % para aprobar
              </p>
            </div>
            <Link
              href={rutaEvaluacion}
              className="rounded-xl bg-fiec-600 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-fiec-700"
            >
              {modulo.orden <= 7 ? "Empezar autoevaluación" : "Empezar evaluación final"}
            </Link>
          </div>
        </section>
      ) : null}

      {enCurso && enCurso.orden !== modulo.orden ? (
        <p className="mt-6 rounded-2xl bg-fiec-50 p-4 text-[12.5px] text-fiec-900 ring-1 ring-fiec-200">
          Sigues en el{" "}
          <Link
            href={`/modulos/${enCurso.orden}`}
            className="font-bold underline decoration-fiec-300 underline-offset-4"
          >
            módulo {enCurso.orden}
          </Link>
          .
        </p>
      ) : null}
    </main>
  );
}
