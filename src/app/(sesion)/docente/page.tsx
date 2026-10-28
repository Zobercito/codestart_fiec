import Link from "next/link";
import {
  exigirDocente,
  obtenerMisGrupos,
  obtenerPanoramaGrupo,
} from "@/lib/docente/dal";
import { formatearFecha } from "@/lib/fechas";
import { Indicador } from "@/components/docente/indicador";
import { SelectorGrupo } from "@/components/docente/selector-grupo";
import { ErroresFrecuentes } from "@/components/docente/errores-frecuentes";

export const instant = false;

export const metadata = { title: "Panel docente" };

/** Panel del docente: indicadores, errores y asignaciones del grupo. */
export default async function PaginaDocente({
  searchParams,
}: PageProps<"/docente">) {
  const { grupo } = await searchParams;
  const perfil = await exigirDocente();
  const grupos = await obtenerMisGrupos(perfil);

  const solicitado = typeof grupo === "string" ? grupo : undefined;
  const seleccionado =
    grupos.find((g) => g.id === solicitado) ?? grupos[0] ?? null;
  const panorama = seleccionado
    ? await obtenerPanoramaGrupo(perfil, seleccionado.id)
    : null;

  if (!panorama) {
    return (
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
          Panel docente
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          Hola, {perfil.nombre.split(" ")[0]}
        </h1>
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-extrabold text-slate-900">
            Todavía no tienes un grupo
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">
            Crea un grupo, comparte su código de inscripción y asigna el primer
            módulo. Cuando los estudiantes avancen, aquí verás el cumplimiento,
            la tasa de acierto y los errores frecuentes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/docente/grupos"
              className="rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-fiec-700"
            >
              Crear un grupo
            </Link>
            <Link
              href="/modulos"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
            >
              Ver los módulos
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const { indicadores, errores, asignaciones, grupo: datosGrupo } = panorama;
  const critico = indicadores.critico;

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
            Panel docente
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Hola, {perfil.nombre.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Datos reales de {datosGrupo.nombre}. Nada de esta pantalla se
            inventa: sale de progresos e intentos.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          {grupos.length > 1 ? (
            <SelectorGrupo grupos={grupos} actual={datosGrupo.id} />
          ) : null}
          <Link
            href={`/docente/grupo/${datosGrupo.id}`}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Ver seguimiento
          </Link>
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
              ? `De la asignación más reciente (${asignaciones[0].completados} de ${asignaciones[0].total})`
              : "Avance promedio de los estudiantes"
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
          detalle={`${panorama.intentos.length} intentos registrados`}
          tono="coder"
        />
        <Indicador
          etiqueta="Atrasados"
          valor={indicadores.atrasados}
          detalle="Estudiantes con una entrega vencida"
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
              className="mt-2 inline-block text-[11px] font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4 hover:text-fiec-800"
            >
              Abrir el reto
            </Link>
          ) : null}
        </article>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                Errores frecuentes
              </h2>
              <p className="text-[12px] text-slate-600">
                Agrupados por regla incumplida, con el último caso y el
                estudiante para actuar.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Top {errores.length}
            </span>
          </div>
          <div className="mt-3">
            <ErroresFrecuentes errores={errores} />
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold text-slate-900">
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
              <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                Aún no hay asignaciones. Crea una para que el grupo sepa qué
                módulo o reto debe completar.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {asignaciones.slice(0, 4).map((asignacion) => (
                  <li
                    key={asignacion.id}
                    className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"
                  >
                    <p className="text-[12px] font-semibold leading-relaxed text-slate-800">
                      {asignacion.objetivo}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-slate-600">
                      Entrega: {formatearFecha(asignacion.fecha_entrega)}
                      {asignacion.vencida ? " · vencida" : ""}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10.5px] font-bold">
                      <span className="text-slate-700">
                        {asignacion.completados} de {asignacion.total}
                      </span>
                      <span className="text-fiec-700">
                        {asignacion.total > 0
                          ? Math.round(
                              (asignacion.completados / asignacion.total) * 100,
                            )
                          : 0}{" "}
                        %
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-fiec-50 p-5 ring-1 ring-fiec-200">
            <h2 className="text-sm font-extrabold text-fiec-900">
              Próxima acción
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-fiec-900">
              {critico.tipo === "reto"
                ? `Revisa «${critico.etiqueta}» con el grupo: ${critico.detalle.toLowerCase()}.`
                : critico.tipo === "error"
                  ? `Refuerza el error «${critico.etiqueta}»: ${critico.detalle.toLowerCase()}.`
                  : "Asigna una actividad y vuelve cuando haya intentos para analizar."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/docente/grupo/${datosGrupo.id}`}
                className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-fiec-800 ring-1 ring-fiec-200 transition hover:bg-fiec-100"
              >
                Ver el grupo
              </Link>
              <Link
                href="/docente/grupos"
                className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-fiec-800 ring-1 ring-fiec-200 transition hover:bg-fiec-100"
              >
                Gestionar grupos
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
