import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { obtenerMiPerfil } from "@/lib/auth/dal";
import { obtenerMisInsignias } from "@/lib/insignias/dal";
import {
  CATALOGO_INSIGNIAS,
  obtenerInsignia,
  type InsigniaCatalogo,
} from "@/lib/insignias/catalogo";
import { formatearFecha } from "@/lib/fechas";

export const metadata = {
  title: "Mis medallas",
};

/** Muro de insignias del estudiante. */
export default async function PaginaMedallas() {
  const perfil = await obtenerMiPerfil();
  if (!perfil) notFound();
  if (perfil.rol !== "estudiante") redirect("/docente");

  const ganadas = await obtenerMisInsignias(perfil);
  const porTipo = new Map(ganadas.map((insignia) => [insignia.tipo, insignia]));

  const tiposDelCatalogo = new Set(CATALOGO_INSIGNIAS.map((i) => i.tipo));
  const extras: InsigniaCatalogo[] = ganadas
    .filter((insignia) => !tiposDelCatalogo.has(insignia.tipo))
    .map((insignia) => obtenerInsignia(insignia.tipo));

  const todas = [...CATALOGO_INSIGNIAS, ...extras];
  const totalGanadas = ganadas.length;

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
            Tu recorrido
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Mis medallas
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            Las insignias se otorgan automáticamente al completar módulos, aprobar tu primer reto
            y terminar el curso. No se pueden comprar ni canjear.
          </p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-right shadow-sm ring-1 ring-slate-200">
          <div className="text-lg font-extrabold text-slate-900">{totalGanadas}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            ganadas
          </div>
        </div>
      </div>

      {totalGanadas === 0 ? (
        <p className="mt-6 rounded-2xl bg-fiec-50 p-4 text-[12.5px] leading-relaxed text-fiec-900 ring-1 ring-fiec-200">
          Todavía no tienes insignias. Completa una lección y marca el módulo como visto para
          empezar. Tu primera insignia aparecerá aquí.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {todas.map((insignia) => {
          const ganada = porTipo.get(insignia.tipo);
          return (
            <article
              key={insignia.tipo}
              className={`flex gap-3 rounded-2xl p-4 ring-1 ${
                ganada
                  ? "bg-white shadow-sm ring-fiec-200"
                  : "bg-slate-50 ring-slate-200"
              }`}
            >
              <div
                aria-hidden="true"
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl ${
                  ganada ? "bg-fiec-50" : "bg-slate-200 grayscale"
                }`}
              >
                {insignia.icono}
              </div>
              <div className="min-w-0">
                <h2
                  className={`text-sm font-extrabold ${
                    ganada ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  {insignia.nombre}
                </h2>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-600">
                  {insignia.descripcion}
                </p>
                {ganada ? (
                  <p className="mt-2 text-[10.5px] font-bold uppercase tracking-wider text-coder-700">
                    Ganada el {formatearFecha(ganada.fecha.slice(0, 10))}
                  </p>
                ) : (
                  <p className="mt-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Aún bloqueada
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/modulos"
          className="rounded-xl bg-fiec-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-fiec-700"
        >
          Ir a los módulos
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
        >
          Volver al panel
        </Link>
      </div>
    </main>
  );
}
