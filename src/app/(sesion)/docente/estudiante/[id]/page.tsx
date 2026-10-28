import Link from "next/link";
import { notFound } from "next/navigation";
import {
  exigirDocente,
  obtenerGrupoDelEstudiante,
  obtenerPanoramaGrupo,
} from "@/lib/docente/dal";
import { formatearFecha } from "@/lib/fechas";
import { obtenerInsignia } from "@/lib/insignias/catalogo";

export const instant = false;

export const metadata = { title: "Estudiante · Panel docente" };

/** Detalle de un estudiante de uno de los grupos del docente (RF15). */
export default async function PaginaEstudianteDocente({
  params,
}: PageProps<"/docente/estudiante/[id]">) {
  const { id } = await params;
  const perfil = await exigirDocente();
  const grupo = await obtenerGrupoDelEstudiante(perfil, id);
  if (!grupo) notFound();

  const panorama = await obtenerPanoramaGrupo(perfil, grupo.id);
  if (!panorama) notFound();

  const estudiante = panorama.estudiantes.find((e) => e.id === id);
  if (!estudiante) notFound();

  const fila = panorama.seguimiento.find((f) => f.id === id);
  const intentos = panorama.intentos.filter((i) => i.usuario_id === id);
  const insignias = panorama.insignias.filter((i) => i.usuario_id === id);

  const estadoPorLeccion = new Map(
    panorama.progresos
      .filter((p) => p.usuario_id === id)
      .map((p) => [p.leccion_id, p.estado]),
  );

  const errores = intentos.filter((intento) => intento.error_detectado);

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      <Link
        href={`/docente/grupo/${grupo.id}`}
        className="text-[11px] font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4"
      >
        ← Volver a {grupo.nombre}
      </Link>

      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
            Detalle del estudiante
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            {estudiante.nombre}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{estudiante.correo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-800 ring-1 ring-slate-200">
            {fila?.avance ?? 0} % del curso
          </span>
          <span className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-800 ring-1 ring-slate-200">
            {fila?.intentos ?? 0} intentos
          </span>
          <span className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-800 ring-1 ring-slate-200">
            {fila?.acierto === null || fila?.acierto === undefined
              ? "—"
              : `${fila.acierto} %`}{" "}
            de acierto
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Progreso por módulo
          </h2>
          <div className="mt-3 space-y-3">
            {panorama.modulos.map((modulo) => {
              if (modulo.lecciones.length === 0) return null;
              const completadas = modulo.lecciones.filter(
                (leccion) => estadoPorLeccion.get(leccion.id) === "completado",
              ).length;
              const porcentaje = Math.round(
                (completadas / modulo.lecciones.length) * 100,
              );

              return (
                <article
                  key={modulo.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-[13px] font-extrabold text-slate-900">
                      Módulo {modulo.orden}: {modulo.titulo}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-700">
                      {completadas} de {modulo.lecciones.length} · {porcentaje} %
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-fiec-600"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {modulo.lecciones.map((leccion) => {
                      const estado = estadoPorLeccion.get(leccion.id) ?? "pendiente";
                      const texto =
                        estado === "completado"
                          ? "Completada"
                          : estado === "en_progreso"
                            ? "En progreso"
                            : "Pendiente";
                      const clases =
                        estado === "completado"
                          ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                          : estado === "en_progreso"
                            ? "bg-amber-50 text-amber-900 ring-amber-200"
                            : "bg-slate-100 text-slate-700 ring-slate-200";
                      return (
                        <li
                          key={leccion.id}
                          className="flex items-center justify-between gap-3 text-[12px] text-slate-700"
                        >
                          <span>
                            {leccion.orden}. {leccion.titulo}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${clases}`}
                          >
                            {texto}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900">Insignias</h2>
            {insignias.length === 0 ? (
              <p className="mt-2 text-[12px] text-slate-600">
                Aún no tiene insignias.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {insignias.map((insignia) => {
                  const datos = obtenerInsignia(insignia.tipo);
                  return (
                    <li
                      key={insignia.tipo}
                      className="flex items-center gap-2 rounded-xl bg-fiec-50 p-2.5 ring-1 ring-fiec-200"
                    >
                      <span aria-hidden="true" className="text-lg">
                        {datos.icono}
                      </span>
                      <div>
                        <p className="text-[12px] font-bold text-fiec-900">
                          {datos.nombre}
                        </p>
                        <p className="text-[10.5px] text-fiec-900">
                          {formatearFecha(insignia.fecha.slice(0, 10))}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900">
              Errores recientes
            </h2>
            {errores.length === 0 ? (
              <p className="mt-2 text-[12px] text-slate-600">
                Sin errores registrados.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {errores.slice(0, 4).map((intento) => (
                  <li
                    key={intento.id}
                    className="rounded-xl bg-slate-50 p-2.5 text-[11.5px] leading-relaxed text-slate-700 ring-1 ring-slate-200"
                  >
                    <p className="font-semibold text-slate-800">
                      {intento.reto_titulo}
                    </p>
                    <p className="mt-0.5">{intento.error_detectado}</p>
                    <p className="mt-0.5 text-[10.5px] text-slate-600">
                      {formatearFecha(intento.fecha.slice(0, 10))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
          Últimos intentos
        </h2>
        {intentos.length === 0 ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-4 text-[12.5px] text-slate-600 ring-1 ring-slate-200">
            Todavía no hay intentos de este estudiante.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-[12px]">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Fecha</th>
                  <th scope="col" className="px-3 py-2.5">Reto</th>
                  <th scope="col" className="px-3 py-2.5">Resultado</th>
                  <th scope="col" className="px-3 py-2.5">Error detectado</th>
                  <th scope="col" className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {intentos.map((intento) => (
                  <tr key={intento.id} className="align-top">
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                      {formatearFecha(intento.fecha.slice(0, 10))}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-800">
                        {intento.reto_titulo}
                      </div>
                      <div className="text-[10.5px] text-slate-600">
                        {intento.modulo_titulo}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
                          intento.acierto
                            ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                            : "bg-red-50 text-red-800 ring-red-200"
                        }`}
                      >
                        {intento.acierto ? "Aprobado" : "No aprobado"}
                      </span>
                    </td>
                    <td className="max-w-[300px] px-3 py-2.5 text-slate-700">
                      {intento.error_detectado ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/retos/${intento.reto_id}`}
                        className="whitespace-nowrap text-[11px] font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4"
                      >
                        Ver reto
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
