import Link from "next/link";
import { notFound } from "next/navigation";
import { ContenidoMDX } from "@/lib/contenido/mdx";
import { obtenerLeccion } from "@/lib/contenido/leccion";
import { obtenerMiPerfil } from "@/lib/auth/dal";

/**
 * Vista de una leccion.
 *
 * El contenido sale del MDX versionado en el repositorio; el titulo,
 * el orden y el progreso salen de la base de datos.
 */
export const instant = false;

export default async function PaginaLeccion({
  params,
}: PageProps<"/modulos/[modulo]/lecciones/[leccion]">) {
  const { modulo, leccion } = await params;

  const perfil = await obtenerMiPerfil();
  if (!perfil) notFound();

  const datos = await obtenerLeccion(perfil, Number(modulo), Number(leccion));
  if (!datos) notFound();

  const { leccion: l, modulo: m, contenido, anterior, siguiente, estado, retos } = datos;

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      {/* Migas de pan */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-600">
        <Link href="/modulos" className="font-semibold text-fiec-700 hover:underline">
          Ruta de módulos
        </Link>
        <span className="text-slate-600">›</span>
        <Link href={`/modulos/${m.orden}`} className="font-semibold text-fiec-700 hover:underline">
          Módulo {m.orden} · {m.titulo}
        </Link>
        <span className="text-slate-600">›</span>
        <span className="font-semibold text-slate-800">Lección {l.orden}</span>
      </nav>

      <div className="mt-2 grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{l.titulo}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-fiec-600"
                style={{ width: `${estado === "completado" ? 100 : estado === "en_progreso" ? 50 : 0}%` }}
              />
            </div>
            <span className="text-[12.5px] text-slate-600">
              Lección {l.orden}
              {l.duracion_min ? ` · ${l.duracion_min} min` : ""}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                estado === "completado"
                  ? "bg-coder-100 text-coder-700"
                  : estado === "en_progreso"
                    ? "bg-fiec-50 text-fiec-700"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {estado === "completado" ? "✓ Vista" : estado === "en_progreso" ? "● A medias" : "○ Sin ver"}
            </span>

            <div className="ml-auto flex items-center gap-2">
              {anterior ? (
                <Link
                  href={`/modulos/${m.orden}/lecciones/${anterior.orden}`}
                  className="rounded-xl bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
                >
                  ← Anterior
                </Link>
              ) : null}
              {siguiente ? (
                <Link
                  href={`/modulos/${m.orden}/lecciones/${siguiente.orden}`}
                  className="rounded-xl bg-fiec-600 px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-fiec-700"
                >
                  Ir a la lección {siguiente.orden} →
                </Link>
              ) : retos.length > 0 ? (
                <Link
                  href={`/retos/${retos[0].id}`}
                  className="rounded-xl bg-fiec-600 px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-fiec-700"
                >
                  Ir al reto →
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-fiec-600 px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-fiec-700"
                >
                  Ir al panel →
                </Link>
              )}
            </div>
          </div>

          {/* Contenido de la leccion */}
          <article className="mt-6">
            <ContenidoMDX fuente={contenido} />
          </article>
        </div>

        {/* Panel lateral: el temario del modulo */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              En este módulo
            </div>
            <ul className="mt-3 space-y-1.5">
              <li>
                <Link
                  href={`/modulos/${m.orden}`}
                  className="block rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Ver el módulo completo
                </Link>
              </li>
            </ul>

            {retos.length > 0 ? (
              <>
                <div className="mt-4 border-t border-slate-200 pt-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Retos de esta lección
                </div>
                <ul className="mt-2 space-y-1.5">
                  {retos.map((reto) => (
                    <li key={reto.id}>
                      <Link
                        href={`/retos/${reto.id}`}
                        className="flex items-start gap-2 rounded-lg px-2.5 py-2 text-[12.5px] font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <span aria-hidden="true" className="mt-0.5 text-[11px]">
                          {reto.tipo === "codigo" ? "⌨" : "◉"}
                        </span>
                        <span>
                          {reto.enunciado}
                          <span className="mt-0.5 block text-[10.5px] font-normal text-slate-500">
                            {reto.tipo === "codigo" ? "Reto de código" : "Reto conceptual"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <p className="mt-4 border-t border-slate-200 pt-3 text-[11.5px] leading-relaxed text-slate-500">
              El contenido de esta lección está versionado en el repositorio, junto al código.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
