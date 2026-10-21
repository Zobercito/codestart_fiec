import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerMiPerfil } from "@/lib/auth/dal";
import { obtenerRutaDeModulos, calcularEstadosModulos } from "@/lib/auth/dal";
import { crearClienteSupabase } from "@/lib/supabase/server";

/** Lecciones de un modulo, con el estado de cada una. */
export const instant = false;

export default async function PaginaModulo({
  params,
}: PageProps<"/modulos/[modulo]">) {
  const { modulo: ordenModulo } = await params;

  const perfil = await obtenerMiPerfil();
  if (!perfil) notFound();

  const supabase = await crearClienteSupabase();

  const { data: modulo } = await supabase
    .from("modulos")
    .select("id, titulo, orden, descripcion")
    .eq("orden", Number(ordenModulo))
    .maybeSingle();

  if (!modulo) notFound();

  const { data: lecciones } = await supabase
    .from("lecciones")
    .select("id, titulo, orden, duracion_min")
    .eq("modulo_id", modulo.id)
    .order("orden");

  const { data: progresos } = await supabase
    .from("progresos")
    .select("leccion_id, estado")
    .eq("usuario_id", perfil.id);

  const estadoDe = new Map(
    (progresos ?? []).map((p) => [p.leccion_id, p.estado as string]),
  );

  const { modulos: ruta } = calcularEstadosModulos(await obtenerRutaDeModulos(perfil));
  const enCurso = ruta.find((m) => m.estado === "en_progreso");

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-600">
        <Link href="/modulos" className="font-semibold text-fiec-700 hover:underline">
          Ruta de módulos
        </Link>
        <span className="text-slate-400">›</span>
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
