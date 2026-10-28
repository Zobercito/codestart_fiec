import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirDocente, obtenerPanoramaGrupo } from "@/lib/docente/dal";
import { formatearFecha } from "@/lib/fechas";
import { Indicador } from "@/components/docente/indicador";
import { ErroresFrecuentes } from "@/components/docente/errores-frecuentes";
import { TablaSeguimiento } from "@/components/docente/tabla-seguimiento";
import { BotonCopiar } from "@/components/docente/boton-copiar";

export const instant = false;

export const metadata = { title: "Grupo · Panel docente" };

/** Seguimiento de un grupo: una fila por estudiante (RF14). */
export default async function PaginaGrupoDocente({
  params,
}: PageProps<"/docente/grupo/[id]">) {
  const { id } = await params;
  const perfil = await exigirDocente();
  const panorama = await obtenerPanoramaGrupo(perfil, id);

  if (!panorama) notFound();

  const { grupo, indicadores, errores, asignaciones } = panorama;
  const critico = indicadores.critico;

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/docente"
            className="text-[11px] font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4"
          >
            ← Volver al panel
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            {grupo.nombre}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {grupo.estudiantes}{" "}
            {grupo.estudiantes === 1 ? "estudiante" : "estudiantes"} ·{" "}
            {grupo.periodo_inicio
              ? formatearFecha(grupo.periodo_inicio)
              : "sin inicio"}{" "}
            —{" "}
            {grupo.periodo_fin
              ? formatearFecha(grupo.periodo_fin)
              : "sin fin"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Código
            </span>
            <code className="text-sm font-bold tracking-wider text-slate-900">
              {grupo.codigo_inscripcion}
            </code>
            <BotonCopiar codigo={grupo.codigo_inscripcion} />
          </div>
          <Link
            href="/docente/asignar"
            className="rounded-xl bg-fiec-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-fiec-700"
          >
            Asignar trabajo
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          etiqueta="Cumplimiento"
          valor={
            indicadores.cumplimiento === null
              ? null
              : `${indicadores.cumplimiento} %`
          }
          detalle={
            asignaciones[0]
              ? `Asignación más reciente: ${asignaciones[0].completados} de ${asignaciones[0].total}`
              : "Avance promedio del grupo"
          }
          tono="fiec"
        />
        <Indicador
          etiqueta="Tasa de acierto"
          valor={
            indicadores.tasaAcierto === null
              ? null
              : `${indicadores.tasaAcierto} %`
          }
          detalle={`${panorama.intentos.length} intentos en total`}
          tono="coder"
        />
        <Indicador
          etiqueta="Atrasados"
          valor={indicadores.atrasados}
          detalle="Con una entrega vencida"
          tono="up"
        />
        <article className="rounded-2xl bg-slate-100 p-4 ring-1 ring-slate-200">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">
            Punto crítico
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-extrabold leading-tight text-slate-900">
            {critico.etiqueta}
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-slate-700">
            {critico.detalle}
          </p>
          {critico.retoId ? (
            <Link
              href={`/retos/${critico.retoId}`}
              className="mt-2 inline-block text-[11px] font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4"
            >
              Abrir el reto
            </Link>
          ) : null}
        </article>
      </div>

      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Seguimiento
            </h2>
            <p className="text-[12px] text-slate-600">
              Avance, último reto, intentos y acierto por estudiante.
            </p>
          </div>
        </div>
        <div className="mt-3">
          <TablaSeguimiento filas={panorama.seguimiento} />
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Errores frecuentes
          </h2>
          <div className="mt-3">
            <ErroresFrecuentes errores={errores} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Asignaciones
            </h2>
            <Link
              href="/docente/asignar"
              className="text-[11px] font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4"
            >
              Nueva
            </Link>
          </div>

          {asignaciones.length === 0 ? (
            <p className="mt-3 rounded-xl bg-slate-50 p-4 text-[12.5px] text-slate-600 ring-1 ring-slate-200">
              Este grupo no tiene asignaciones todavía.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {asignaciones.map((asignacion) => (
                <li
                  key={asignacion.id}
                  className="rounded-xl bg-white p-4 ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-[12.5px] font-semibold leading-relaxed text-slate-800">
                      {asignacion.objetivo}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
                        asignacion.vencida
                          ? "bg-red-50 text-red-800 ring-red-200"
                          : "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      }`}
                    >
                      {asignacion.vencida ? "Vencida" : "Vigente"}
                    </span>
                  </div>
                  {asignacion.descripcion ? (
                    <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">
                      {asignacion.descripcion}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-slate-600">
                    Entrega: {formatearFecha(asignacion.fecha_entrega)}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-fiec-600"
                      style={{
                        width: `${
                          asignacion.total > 0
                            ? Math.round(
                                (asignacion.completados / asignacion.total) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[10.5px] font-semibold text-slate-700">
                    {asignacion.completados} de {asignacion.total} estudiantes
                    completaron el objetivo
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
