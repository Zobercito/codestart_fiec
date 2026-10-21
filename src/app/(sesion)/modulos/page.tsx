import Link from "next/link";
import { notFound } from "next/navigation";
import {
  calcularEstadosModulos,
  obtenerMiPerfil,
  obtenerRutaDeModulos,
} from "@/lib/auth/dal";
import { IconoModulo } from "@/components/modulos/icono-modulo";

/** La ruta de los 8 modulos del curso. */
export default async function PaginaModulos() {
  const perfil = await obtenerMiPerfil();
  if (!perfil) notFound();

  const { modulos } = calcularEstadosModulos(await obtenerRutaDeModulos(perfil));

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
        Curso Propedéutico
      </p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
        Ruta de módulos
      </h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
        El curso está organizado en ocho módulos que se abren en orden. Cada uno combina una
        explicación, una actividad interactiva y una autoevaluación.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modulos.map((m) => {
          const completado = m.estado === "completado";
          const enCurso = m.estado === "en_progreso";
          const bloqueado = m.estado === "bloqueado";

          return (
            <Link
              key={m.id}
              href={bloqueado ? "#" : `/modulos/${m.orden}`}
              aria-disabled={bloqueado}
              className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition ${
                enCurso
                  ? "ring-2 ring-fiec-500"
                  : bloqueado
                    ? "ring-slate-200"
                    : "ring-slate-200 hover:shadow-md"
              } ${bloqueado ? "pointer-events-none opacity-70" : ""}`}
            >
              <div
                className={`relative h-24 overflow-hidden ${
                  enCurso
                    ? "bg-linear-to-br from-fiec-600 to-fiec-800"
                    : completado
                      ? "bg-linear-to-br from-fiec-700 to-fiec-500"
                      : "bg-linear-to-br from-slate-500 to-slate-700"
                }`}
              >
                <div className="dotgrid absolute inset-0" aria-hidden="true" />
                <div className="absolute inset-0 grid place-items-center">
                  <IconoModulo orden={m.orden} />
                </div>
                <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2 py-0.5 text-[11px] font-extrabold text-fiec-700">
                  Módulo {m.orden}
                </span>
                {completado ? (
                  <span className="absolute right-3 top-3 rounded-full bg-coder-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-900">
                    ✓ Completado
                  </span>
                ) : enCurso ? (
                  <span className="absolute right-3 top-3 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-fiec-700">
                    ● En progreso
                  </span>
                ) : bloqueado ? (
                  <span className="absolute right-3 top-3 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    🔒 Bloqueado
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-sm font-bold leading-snug text-slate-800">{m.titulo}</h2>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{m.descripcion}</p>

                <div className="mt-auto pt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>
                      {m.total === 0
                        ? "Sin lecciones todavía"
                        : `${m.completadas} de ${m.total} ${m.total === 1 ? "lección" : "lecciones"}`}
                    </span>
                    <span className={completado ? "text-coder-700" : "text-fiec-700"}>
                      {completado
                        ? "100%"
                        : m.total
                          ? `${Math.round((m.completadas / m.total) * 100)}%`
                          : "0%"}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${completado ? "bg-coder-500" : "bg-fiec-600"}`}
                      style={{ width: `${m.total ? (m.completadas / m.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
