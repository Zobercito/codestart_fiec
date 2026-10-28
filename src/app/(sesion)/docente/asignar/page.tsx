import Link from "next/link";
import {
  exigirDocente,
  obtenerFechaActual,
  obtenerMisGrupos,
  obtenerOpcionesAsignacion,
} from "@/lib/docente/dal";
import { FormularioAsignacion } from "@/components/docente/formulario-asignacion";

export const instant = false;

export const metadata = { title: "Asignar trabajo · Panel docente" };

/** Formulario para asignar un módulo o un reto a un grupo (RF13). */
export default async function PaginaAsignar() {
  const perfil = await exigirDocente();
  const [grupos, opciones, hoy] = await Promise.all([
    obtenerMisGrupos(perfil),
    obtenerOpcionesAsignacion(),
    obtenerFechaActual(),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      <Link
        href="/docente"
        className="text-[11px] font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4"
      >
        ← Volver al panel
      </Link>
      <div className="mt-1">
        <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
          Panel docente
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          Asignar trabajo
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          Elige un grupo y un objetivo: un módulo completo o un reto concreto.
          El estudiante verá la fecha de entrega en su panel.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <FormularioAsignacion
              grupos={grupos}
              opciones={opciones}
              hoy={hoy}
            />
          </div>
        </section>

        <aside className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl bg-fiec-50 p-5 ring-1 ring-fiec-200">
            <h2 className="text-sm font-extrabold text-fiec-900">
              Cómo se calcula el cumplimiento
            </h2>
            <ul className="mt-2 space-y-2 text-[12px] leading-relaxed text-fiec-900">
              <li>
                <strong className="font-bold">Módulo:</strong> se considera
                cumplido cuando el estudiante completa todas sus lecciones.
              </li>
              <li>
                <strong className="font-bold">Reto:</strong> se considera
                cumplido cuando el estudiante lo aprueba al menos una vez.
              </li>
              <li>
                La fecha de entrega se compara con la fecha del servidor, no con
                la del navegador.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900">
              Antes de asignar
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
              El grupo debe tener estudiantes inscritos y compartir el código.
              Si aún no has creado el grupo, puedes hacerlo ahora.
            </p>
            <Link
              href="/docente/grupos"
              className="mt-3 inline-block rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-slate-800"
            >
              Gestionar grupos
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
