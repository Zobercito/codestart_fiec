import Link from "next/link";
import { exigirDocente, obtenerMisGrupos } from "@/lib/docente/dal";
import { formatearFecha } from "@/lib/fechas";
import { FormularioGrupo } from "@/components/docente/formulario-grupo";
import { BotonCopiar } from "@/components/docente/boton-copiar";

export const instant = false;

export const metadata = { title: "Grupos · Panel docente" };

/** Lista y creación de grupos del docente (RF12). */
export default async function PaginaGruposDocente() {
  const perfil = await exigirDocente();
  const grupos = await obtenerMisGrupos(perfil);

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
        Panel docente
      </p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Grupos
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            Crea un grupo, comparte su código y revisa cuántos estudiantes se
            han inscrito. El código se valida en la base de datos.
          </p>
        </div>
        <Link
          href="/docente"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
        >
          Volver al panel
        </Link>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Mis grupos
          </h2>

          {grupos.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-5 text-[13px] leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-200">
              Todavía no tienes grupos. Usa el formulario para crear el primero.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {grupos.map((grupo) => (
                <li
                  key={grupo.id}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {grupo.nombre}
                      </h3>
                      <p className="mt-0.5 text-[11.5px] text-slate-600">
                        {grupo.estudiantes}{" "}
                        {grupo.estudiantes === 1
                          ? "estudiante inscrito"
                          : "estudiantes inscritos"}
                      </p>
                    </div>
                    <Link
                      href={`/docente/grupo/${grupo.id}`}
                      className="rounded-lg bg-fiec-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-fiec-700"
                    >
                      Ver seguimiento
                    </Link>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Código
                    </span>
                    <code className="text-sm font-bold tracking-wider text-slate-900">
                      {grupo.codigo_inscripcion}
                    </code>
                    <BotonCopiar codigo={grupo.codigo_inscripcion} />
                  </div>

                  <p className="mt-2 text-[11.5px] text-slate-600">
                    {grupo.periodo_inicio || grupo.periodo_fin
                      ? `Período: ${
                          grupo.periodo_inicio
                            ? formatearFecha(grupo.periodo_inicio)
                            : "sin inicio"
                        } — ${
                          grupo.periodo_fin
                            ? formatearFecha(grupo.periodo_fin)
                            : "sin fin"
                        }`
                      : "Sin período definido."}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Crear grupo
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
              El código debe ser único. Si no escribes uno, se genera
              automáticamente.
            </p>
            <div className="mt-4">
              <FormularioGrupo />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
